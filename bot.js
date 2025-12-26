import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

const SESSIONS_DIR = './auth';
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

let sockets = {};        // { numero: sock }
let connecting = {};     // evitar múltiplas tentativas

// Inicializar ou reconectar um número
export async function inicializarSocket(numero) {
  if (connecting[numero]) return;
  connecting[numero] = true;

  const authPath = path.join(SESSIONS_DIR, numero);
  if (!fs.existsSync(authPath)) fs.mkdirSync(authPath);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
      auth: state,
      browser: ['WhatsApp Bot', 'Chrome', '1.0.0'],
      printQRInTerminal: false
    });

    sockets[numero] = sock;

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        const qrBase64 = await qrcode.toDataURL(qr);
        sock.qrBase64 = qrBase64; // salvar QR temporário
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        if (statusCode === DisconnectReason.loggedOut) {
          console.log(`🚪 ${numero} deslogado. Apagando auth...`);
          delete sockets[numero];
          fs.rmSync(authPath, { recursive: true, force: true });
        } else if (shouldReconnect) {
          console.log(`🔄 Reconectando ${numero} em 5s...`);
          setTimeout(() => inicializarSocket(numero), 5000);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

  } catch (err) {
    console.error(`❌ Erro ao inicializar ${numero}:`, err.message);
    delete sockets[numero];
  } finally {
    connecting[numero] = false;
  }
}

// Enviar mensagem
export async function enviarMensagem(origem, destino, mensagem) {
  const sock = sockets[origem];

  if (!sock || !sock.user?.id) {
    await inicializarSocket(origem);
    return { qrRequired: true, qr: sock?.qrBase64 || null, message: 'Escaneie o QR Code para conectar' };
  }

  try {
    const numeroLimpo = destino.replace(/\D/g, '');
    const jid = `${numeroLimpo}@s.whatsapp.net`;
    const result = await sock.sendMessage(jid, { text: mensagem });
    return { success: true, messageId: result.key.id };
  } catch (err) {
    console.error(`❌ Falha ao enviar de ${origem}:`, err.message);
    // apagar auth e reiniciar sessão
    const authPath = path.join(SESSIONS_DIR, origem);
    fs.rmSync(authPath, { recursive: true, force: true });
    delete sockets[origem];
    return { qrRequired: true, qr: sock?.qrBase64 || null, message: 'Erro na conexão. Escaneie QR novamente.' };
  }
}

// Obter status de um número
export function obterStatus(numero) {
  const sock = sockets[numero];
  if (!sock) return 'desconectado';
  if (!sock.user?.id) return 'aguardando_qr';
  return 'conectado';
}

// Obter QR Base64 para front-end
export function obterQr(numero) {
  const sock = sockets[numero];
  return sock?.qrBase64 || null;
}
