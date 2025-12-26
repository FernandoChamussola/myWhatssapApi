import express from 'express';
import cors from 'cors';
import { enviarMensagem, inicializarSocket, obterStatus, obterQr } from './bot.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Rota teste
app.get('/', (req, res) => res.send('✅ API Multiusuário do WhatsApp online'));

// Conectar número
app.post('/connect', async (req, res) => {
  const { numero } = req.body;
  if (!numero) return res.status(400).json({ erro: 'Número é obrigatório' });

  try {
    await inicializarSocket(numero);
    res.json({ qr: obterQr(numero), status: obterStatus(numero) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Falha ao conectar número' });
  }
});

// Consultar status
app.get('/status', (req, res) => {
  const { numero } = req.query;
  if (!numero) return res.status(400).json({ erro: 'Número é obrigatório' });

  res.json({ status: obterStatus(numero), qr: obterQr(numero) });
});

// Enviar mensagem
app.post('/enviar', async (req, res) => {
  const { origem, destino, mensagem } = req.body;
  if (!origem || !destino || !mensagem) {
    return res.status(400).json({ erro: 'origem, destino e mensagem obrigatórios' });
  }

  try {
    const resultado = await enviarMensagem(origem, destino, mensagem);
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro inesperado ao enviar mensagem' });
  }
});

// Iniciar servidor
app.listen(PORT, () => console.log(`🌐 Servidor rodando na porta ${PORT}`));
