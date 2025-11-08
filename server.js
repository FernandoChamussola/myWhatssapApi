import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // precisa instalar: npm install node-fetch
import { inicializarSocket, enviarMensagem } from './bot.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Rota principal
app.get('/', (req, res) => {
  res.send('✅ API do WhatsApp está online!..');
});

// Enviar mensagem
app.post('/enviar', async (req, res) => {
  const { numero, mensagem } = req.body;

  if (!numero || !mensagem) {
    return res.status(400).json({ erro: 'Número e mensagem são obrigatórios.' });
  }

  try {
    await enviarMensagem(numero, mensagem);
    res.status(200).json({ status: 'Mensagem enviada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao enviar mensagem.' });
  }
});

// Inicializar bot e servidor
async function start() {
  await inicializarSocket();

  app.listen(PORT, () => {
    console.log(`🌐 Servidor rodando na porta ${PORT}`);
    console.log(`✅ Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();
