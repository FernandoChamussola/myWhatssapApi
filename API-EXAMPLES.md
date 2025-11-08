# Exemplos de Uso da API WhatsApp

Base URL: `https://wtsapi.duckdns.org`

---

## 1. Health Check

### cURL
```bash
curl https://wtsapi.duckdns.org/
```

### JavaScript (Fetch)
```javascript
fetch('https://wtsapi.duckdns.org/')
  .then(response => response.text())
  .then(data => console.log(data));
```

### Python
```python
import requests

response = requests.get('https://wtsapi.duckdns.org/')
print(response.text)
```

**Resposta esperada:**
```
✅ API do WhatsApp está online!..
```

---

## 2. Enviar Mensagem

### cURL
```bash
curl -X POST https://wtsapi.duckdns.org/enviar \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "5511999999999",
    "mensagem": "Olá! Esta é uma mensagem de teste."
  }'
```

### JavaScript (Fetch)
```javascript
async function enviarMensagem(numero, mensagem) {
  try {
    const response = await fetch('https://wtsapi.duckdns.org/enviar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        numero: numero,
        mensagem: mensagem
      })
    });

    const data = await response.json();
    console.log('Sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}

// Uso
enviarMensagem('5511999999999', 'Olá! Mensagem de teste.');
```

### JavaScript (Axios)
```javascript
const axios = require('axios');

async function enviarMensagem(numero, mensagem) {
  try {
    const response = await axios.post('https://wtsapi.duckdns.org/enviar', {
      numero: numero,
      mensagem: mensagem
    });

    console.log('Mensagem enviada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar:', error.response?.data || error.message);
    throw error;
  }
}

// Uso
enviarMensagem('5511999999999', 'Teste via Axios');
```

### Python (requests)
```python
import requests
import json

def enviar_mensagem(numero, mensagem):
    url = 'https://wtsapi.duckdns.org/enviar'
    headers = {'Content-Type': 'application/json'}
    payload = {
        'numero': numero,
        'mensagem': mensagem
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        print('Sucesso:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print('Erro:', e)
        raise

# Uso
enviar_mensagem('5511999999999', 'Teste via Python')
```

### PHP
```php
<?php
function enviarMensagem($numero, $mensagem) {
    $url = 'https://wtsapi.duckdns.org/enviar';
    $data = array(
        'numero' => $numero,
        'mensagem' => $mensagem
    );

    $options = array(
        'http' => array(
            'header'  => "Content-Type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data)
        )
    );

    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);

    if ($result === FALSE) {
        throw new Exception('Erro ao enviar mensagem');
    }

    return json_decode($result, true);
}

// Uso
try {
    $resultado = enviarMensagem('5511999999999', 'Teste via PHP');
    print_r($resultado);
} catch (Exception $e) {
    echo 'Erro: ' . $e->getMessage();
}
?>
```

### C# (.NET)
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class WhatsAppAPI
{
    private static readonly HttpClient client = new HttpClient();
    private const string baseUrl = "https://wtsapi.duckdns.org";

    public static async Task<string> EnviarMensagem(string numero, string mensagem)
    {
        var payload = new
        {
            numero = numero,
            mensagem = mensagem
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await client.PostAsync($"{baseUrl}/enviar", content);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Sucesso: {result}");
            return result;
        }
        catch (HttpRequestException e)
        {
            Console.WriteLine($"Erro: {e.Message}");
            throw;
        }
    }

    // Uso
    public static async Task Main()
    {
        await EnviarMensagem("5511999999999", "Teste via C#");
    }
}
```

---

## 3. Respostas da API

### Sucesso (200)
```json
{
  "status": "Mensagem enviada com sucesso!"
}
```

### Erro - Campos obrigatórios (400)
```json
{
  "erro": "Número e mensagem são obrigatórios."
}
```

### Erro - WhatsApp não conectado (500)
```json
{
  "erro": "Erro ao enviar mensagem."
}
```

---

## 4. Formato do Número

### Aceitos:
- `5511999999999` (recomendado)
- `+5511999999999`
- `11999999999`
- `(11) 99999-9999` (será limpo automaticamente)

### Formato:
- **Código do país** (55 para Brasil)
- **DDD** (11, 21, etc.)
- **Número** (9 dígitos para celular)

**Exemplo:** `5511999999999`
- `55` = Brasil
- `11` = São Paulo
- `999999999` = Número do celular

---

## 5. Integração com Frontend

### React
```jsx
import { useState } from 'react';

function EnviarMensagemWhatsApp() {
  const [numero, setNumero] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState('');

  const enviarMensagem = async (e) => {
    e.preventDefault();
    setStatus('Enviando...');

    try {
      const response = await fetch('https://wtsapi.duckdns.org/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero, mensagem })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('✅ Mensagem enviada!');
      } else {
        setStatus(`❌ Erro: ${data.erro}`);
      }
    } catch (error) {
      setStatus(`❌ Erro de conexão: ${error.message}`);
    }
  };

  return (
    <form onSubmit={enviarMensagem}>
      <input
        type="text"
        placeholder="Número (ex: 5511999999999)"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        required
      />
      <textarea
        placeholder="Digite sua mensagem"
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        required
      />
      <button type="submit">Enviar</button>
      {status && <p>{status}</p>}
    </form>
  );
}

export default EnviarMensagemWhatsApp;
```

### Vue.js
```vue
<template>
  <form @submit.prevent="enviarMensagem">
    <input
      v-model="numero"
      type="text"
      placeholder="Número (ex: 5511999999999)"
      required
    />
    <textarea
      v-model="mensagem"
      placeholder="Digite sua mensagem"
      required
    />
    <button type="submit">Enviar</button>
    <p v-if="status">{{ status }}</p>
  </form>
</template>

<script>
export default {
  data() {
    return {
      numero: '',
      mensagem: '',
      status: ''
    };
  },
  methods: {
    async enviarMensagem() {
      this.status = 'Enviando...';

      try {
        const response = await fetch('https://wtsapi.duckdns.org/enviar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            numero: this.numero,
            mensagem: this.mensagem
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.status = '✅ Mensagem enviada!';
          this.numero = '';
          this.mensagem = '';
        } else {
          this.status = `❌ Erro: ${data.erro}`;
        }
      } catch (error) {
        this.status = `❌ Erro: ${error.message}`;
      }
    }
  }
};
</script>
```

---

## 6. Tratamento de Erros Avançado

### JavaScript com retry automático
```javascript
async function enviarMensagemComRetry(numero, mensagem, maxRetries = 3) {
  let tentativa = 0;

  while (tentativa < maxRetries) {
    try {
      const response = await fetch('https://wtsapi.duckdns.org/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero, mensagem })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Mensagem enviada com sucesso:', data);
        return data;
      }

      // Se erro 4xx, não retry (erro do cliente)
      if (response.status >= 400 && response.status < 500) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro no formato da requisição');
      }

      // Se erro 5xx, tentar novamente
      tentativa++;
      if (tentativa < maxRetries) {
        console.log(`Tentativa ${tentativa} falhou, tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * tentativa)); // backoff
      }

    } catch (error) {
      if (tentativa >= maxRetries - 1) {
        throw error;
      }
      tentativa++;
    }
  }

  throw new Error('Máximo de tentativas excedido');
}

// Uso
enviarMensagemComRetry('5511999999999', 'Teste com retry')
  .then(result => console.log('Sucesso:', result))
  .catch(error => console.error('Falha total:', error));
```

---

## 7. Webhook de Exemplo (Node.js + Express)

```javascript
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Endpoint que recebe dados e envia via WhatsApp
app.post('/webhook/pedido-criado', async (req, res) => {
  const { clienteNome, clienteTelefone, pedidoId } = req.body;

  const mensagem = `Olá ${clienteNome}! Seu pedido #${pedidoId} foi recebido e está sendo processado. Obrigado!`;

  try {
    await axios.post('https://wtsapi.duckdns.org/enviar', {
      numero: clienteTelefone,
      mensagem: mensagem
    });

    res.json({ success: true, message: 'Notificação enviada' });
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    res.status(500).json({ success: false, error: 'Falha ao enviar' });
  }
});

app.listen(3000, () => {
  console.log('Webhook rodando na porta 3000');
});
```

---

## 8. Limitações e Boas Práticas

### Limitações:
- Limite de requisições: Configure rate limiting se necessário
- Tamanho da mensagem: Até 4096 caracteres (limite do WhatsApp)
- Apenas mensagens de texto no momento

### Boas Práticas:
1. **Valide o número** antes de enviar
2. **Implemente retry** para falhas temporárias
3. **Adicione timeout** nas requisições (30s recomendado)
4. **Log de envios** para auditoria
5. **Não envie spam** - respeite os limites do WhatsApp
6. **Trate erros** adequadamente

---

**Documentação atualizada em:** 2025-11-08
**Versão da API:** 1.0.0
