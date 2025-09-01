import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';

let sock = null;
let isConnecting = false;

export async function inicializarSocket() {
  if (isConnecting) {
    console.log('⚠️  Já está tentando conectar, aguarde...');
    return;
  }
  
  isConnecting = true;
  
  try {
    console.log('🔄 Iniciando conexão WhatsApp...');
    
    // Usar pasta diferente para evitar conflitos
    const { state, saveCreds } = await useMultiFileAuthState('./baileys_auth');
    
    sock = makeWASocket({
      auth: state,
      // Configuração compatível com 6.4.0
      browser: ['WhatsApp Bot', 'Chrome', '1.0.0'],
      printQRInTerminal: false,
      // Remove configurações problemáticas
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('\n📱 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:');
        console.log('═'.repeat(60));
        qrcode.generate(qr, { small: true });
        console.log('═'.repeat(60));
        console.log('⏳ Aguardando escaneamento... (não feche esta janela)\n');
      }
      
      if (connection === 'close') {
        isConnecting = false;
        
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.log('❌ Conexão encerrada');
        console.log('🔍 Status code:', statusCode);
        
        if (statusCode === DisconnectReason.loggedOut) {
          console.log('🚪 Você foi deslogado do WhatsApp');
          console.log('💡 Solução: Delete a pasta "baileys_auth" e execute novamente');
        } else if (shouldReconnect) {
          console.log('🔄 Tentando reconectar em 5 segundos...');
          setTimeout(() => inicializarSocket(), 5000);
        }
        
      } else if (connection === 'open') {
        isConnecting = false;
        console.log('\n🎉 CONECTADO COM SUCESSO AO WHATSAPP!');
        console.log('📞 Número conectado:', sock.user?.id?.split('@')[0] || 'N/A');
        console.log('📱 Nome:', sock.user?.name || 'Não definido');
        console.log('✅ Bot pronto para enviar mensagens!\n');
        
      } else if (connection === 'connecting') {
        console.log('🔄 Conectando ao WhatsApp...');
      }
    });

    sock.ev.on('creds.update', saveCreds);
    
    // Log de mensagens recebidas (opcional)
    sock.ev.on('messages.upsert', ({ messages, type }) => {
      if (type === 'notify') {
        for (const message of messages) {
          if (!message.key.fromMe && message.message) {
            const numero = message.key.remoteJid?.replace('@s.whatsapp.net', '');
            console.log(`📩 Nova mensagem de ${numero}`);
          }
        }
      }
    });
    
  } catch (error) {
    isConnecting = false;
    console.error('❌ ERRO AO INICIALIZAR:', error.message);
    
    // Diagnóstico específico
    if (error.message.includes('child')) {
      console.log('\n🔧 ERRO DE DEPENDÊNCIA DETECTADO!');
      console.log('💡 Execute estes comandos para corrigir:');
      console.log('   rmdir /s /q node_modules');
      console.log('   npm cache clean --force');
      console.log('   npm install @whiskeysockets/baileys@6.4.0');
      console.log('   npm install qrcode-terminal@0.12.0\n');
    } else {
      console.log('⏳ Tentando novamente em 8 segundos...');
      setTimeout(() => inicializarSocket(), 8000);
    }
  }
}

export async function enviarMensagem(numero, mensagem) {
  if (!sock?.user?.id) {
    throw new Error('WhatsApp não está conectado');
  }

  try {
    // Formata o número corretamente
    const numeroLimpo = numero.replace(/\D/g, '');
    const jid = `${numeroLimpo}@s.whatsapp.net`;
    
    const resultado = await sock.sendMessage(jid, { text: mensagem });
    console.log(`📤 ✅ Mensagem enviada para +${numeroLimpo}`);
    
    return { 
      success: true, 
      numero: numeroLimpo,
      messageId: resultado.key.id 
    };
    
  } catch (error) {
    console.error(`❌ Falha ao enviar para ${numero}:`, error.message);
    throw new Error(`Falha no envio: ${error.message}`);
  }
}

export function obterStatusConexao() {
  if (!sock) return 'desconectado';
  if (isConnecting) return 'conectando';
  if (!sock.user?.id) return 'aguardando_qr';
  return 'conectado';
}

export function obterInfoUsuario() {
  if (!sock?.user) return null;
  return {
    id: sock.user.id,
    nome: sock.user.name,
    numero: sock.user.id.split('@')[0]
  };
}

// Auto-inicialização
if (process.argv[1] && import.meta.url.includes(process.argv[1].replace(/\\/g, '/'))) {
  console.log('🚀 INICIANDO WHATSAPP BOT...');
  console.log('📋 Versão: Baileys 6.4.0');
  console.log('⚡ Status: Inicializando...\n');
  
  inicializarSocket();
  
  // Shutdown graceful
  process.on('SIGINT', () => {
    console.log('\n\n👋 Encerrando WhatsApp Bot...');
    if (sock) sock.end();
    process.exit(0);
  });
}