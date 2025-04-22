import * as baileys from '@whiskeysockets/baileys';

let sock = null;

export async function inicializarSocket() {
  const { state, saveCreds } = await baileys.useMultiFileAuthState('auth_info_baileys');
  sock = baileys.makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys.DisconnectReason.loggedOut;
      console.log('Conexão encerrada, reconectando:', shouldReconnect);
      if (shouldReconnect) {
        inicializarSocket();
      }
    } else if (connection === 'open') {
      console.log('✅ Conectado com sucesso!');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

export async function enviarMensagem(numero, mensagem) {
  if (!sock) {
    console.log('❌ Socket ainda não está pronto.');
    return;
  }

  const jid = `${numero}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text: mensagem });
  console.log(`📤 Mensagem enviada para ${numero}`);
}
