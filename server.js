import express from 'express';
import cors from 'cors';
import { inicializarSocket, enviarMensagem } from './bot.js';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000 || process.env.PORT;

// Inicializa conexão com o WhatsApp
await inicializarSocket();

// Rota principal
app.get('/', (req, res) => {
  res.send('✅ API do WhatsApp está online!');
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



// Start do servidor
app.listen(PORT, () => {
  console.log('🌐 Servidor rodando em http://localhost:5000');
});
