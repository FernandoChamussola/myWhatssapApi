# WhatsApp API usando Baileys

API REST para enviar mensagens via WhatsApp usando a biblioteca Baileys.

## Domínio de Produção
**wtsapi.duckdns.org**

---

## Desenvolvimento Local

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (se quiser rodar sem Docker)

### Iniciar em modo desenvolvimento

```bash
# 1. Clone o repositório
git clone <seu-repo>
cd mywhatssapapi

# 2. Configure variáveis de ambiente (opcional)
cp .env.example .env

# 3. Suba o container
docker compose -f docker-compose.dev.yml up -d --build

# 4. Ver logs (para escanear QR Code)
docker compose -f docker-compose.dev.yml logs -f
```

### Acessar a API em desenvolvimento
- URL: `http://localhost:5000`
- Health check: `http://localhost:5000/`

### Parar desenvolvimento
```bash
# Parar containers
docker compose -f docker-compose.dev.yml down

# Parar e remover volumes (limpa dados do WhatsApp)
docker compose -f docker-compose.dev.yml down -v
```

---

## Deploy em Produção (via Portainer)

### Pré-requisitos na VPS
1. Traefik rodando e configurado
2. Network `traefik-public` criada:
   ```bash
   docker network create traefik-public
   ```
3. DNS **wtsapi.duckdns.org** apontando para o IP da VPS

### Passos para Deploy

1. **No Portainer:**
   - Acesse: Stacks > Add Stack
   - Nome: `whatsapp-api`
   - Build method: **Repository**
   - Repository URL: `https://github.com/seu-usuario/mywhatssapapi`
   - Repository reference: `refs/heads/main`
   - Compose path: `docker-compose.yml`

2. **Configurar variáveis de ambiente (se necessário):**
   - Adicione as variáveis necessárias na seção "Environment variables"

3. **Deploy:**
   - Clique em "Deploy the stack"
   - Aguarde o build completar

4. **Verificar logs e escanear QR Code:**
   ```bash
   docker logs -f whatsapp-api
   ```
   - Escaneie o QR Code que aparece nos logs com seu WhatsApp

5. **Acessar a API:**
   - URL: `https://wtsapi.duckdns.org`
   - SSL automático via Traefik/Let's Encrypt

---

## Uso da API

### Health Check
```bash
GET https://wtsapi.duckdns.org/
```

### Enviar Mensagem
```bash
POST https://wtsapi.duckdns.org/enviar
Content-Type: application/json

{
  "numero": "5511999999999",
  "mensagem": "Olá! Mensagem de teste."
}
```

**Resposta de sucesso:**
```json
{
  "status": "Mensagem enviada com sucesso!"
}
```

---

## Estrutura de Arquivos

```
mywhatssapapi/
├── bot.js                      # Lógica do WhatsApp (Baileys)
├── server.js                   # Servidor Express
├── package.json                # Dependências
├── Dockerfile                  # Build da imagem Docker
├── docker-compose.yml          # Produção (Traefik + Portainer)
├── docker-compose.dev.yml      # Desenvolvimento local
├── .env.example                # Template de variáveis
├── .dockerignore               # Arquivos ignorados no build
├── .gitignore                  # Arquivos ignorados no Git
└── baileys_auth/               # Sessão do WhatsApp (não commitada)
```

---

## Comandos Úteis

### Desenvolvimento
```bash
# Build e iniciar
docker compose -f docker-compose.dev.yml up -d --build

# Ver logs em tempo real
docker compose -f docker-compose.dev.yml logs -f

# Reiniciar apenas o container
docker compose -f docker-compose.dev.yml restart

# Parar tudo
docker compose -f docker-compose.dev.yml down
```

### Produção (via SSH na VPS)
```bash
# Ver logs
docker logs -f whatsapp-api

# Reiniciar container
docker restart whatsapp-api

# Ver status
docker ps | grep whatsapp-api

# Verificar network
docker network inspect traefik-public
```

---

## Troubleshooting

### "Network traefik-public not found"
```bash
docker network create traefik-public
```

### QR Code não aparece
```bash
# Ver logs do container
docker logs -f whatsapp-api

# Se necessário, limpar sessão e reiniciar
docker compose down -v
docker compose up -d
```

### Conexão perdida com WhatsApp
- O bot reconectará automaticamente
- Se não reconectar, delete o volume `whatsapp-auth` e escaneie o QR novamente

### SSL não funciona (504 Gateway Timeout)
- Verifique se Traefik está rodando: `docker ps | grep traefik`
- Verifique labels do Traefik no `docker-compose.yml`
- Verifique DNS: `nslookup wtsapi.duckdns.org`
- Veja logs do Traefik: `docker logs traefik`

---

## Segurança

- Sessão do WhatsApp é armazenada em volume Docker persistente
- Arquivos de autenticação não são commitados no Git
- Em produção, portas não são expostas publicamente (apenas via Traefik)
- SSL/TLS automático via Let's Encrypt

---

## Tecnologias

- **Node.js 18+**
- **Express** - Framework web
- **Baileys** - Biblioteca WhatsApp Web API
- **Docker** - Containerização
- **Traefik** - Reverse proxy e SSL

---

## Licença

MIT
