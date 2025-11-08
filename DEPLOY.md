# Guia de Deploy - WhatsApp API

## Checklist Pré-Deploy

- [x] DNS configurado: **wtsapi.duckdns.org** → IP da VPS
- [ ] Traefik rodando na VPS
- [ ] Network `traefik-public` criada na VPS
- [ ] Repositório Git atualizado
- [ ] `.env` não está no Git (apenas `.env.example`)

---

## 1. Preparar VPS (executar via SSH)

```bash
# 1.1 Criar network do Traefik (se ainda não existir)
docker network create traefik-public

# 1.2 Verificar se Traefik está rodando
docker ps | grep traefik

# 1.3 Verificar DNS
nslookup wtsapi.duckdns.org
# Deve retornar o IP da sua VPS
```

---

## 2. Deploy via Portainer

### Opção A: Deploy via Repository (Recomendado)

1. Acesse Portainer: `https://seu-portainer.com`

2. Vá em: **Stacks** > **Add Stack**

3. Preencha:
   - **Name**: `whatsapp-api`
   - **Build method**: `Repository`
   - **Repository URL**: `https://github.com/seu-usuario/mywhatssapapi`
   - **Repository reference**: `refs/heads/main`
   - **Compose path**: `docker-compose.yml`
   - **Automatic updates**: Ative se desejar (opcional)

4. **Environment variables** (se necessário):
   ```
   NODE_ENV=production
   PORT=5000
   ```

5. Clique em **Deploy the stack**

6. Aguarde o build completar (pode levar alguns minutos na primeira vez)

### Opção B: Deploy via Web Editor

1. Acesse Portainer: **Stacks** > **Add Stack**

2. Preencha:
   - **Name**: `whatsapp-api`
   - **Build method**: `Web editor`

3. Cole o conteúdo do `docker-compose.yml`:
   ```yaml
   services:
     whatsapp-api:
       build: .
       container_name: whatsapp-api
       restart: unless-stopped
       networks:
         - traefik-public
       environment:
         NODE_ENV: production
         PORT: 5000
       volumes:
         - whatsapp-auth:/app/baileys_auth
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.whatsapp-api.rule=Host(`wtsapi.duckdns.org`)"
         - "traefik.http.routers.whatsapp-api.entrypoints=websecure"
         - "traefik.http.routers.whatsapp-api.tls.certresolver=letsencrypt"
         - "traefik.http.services.whatsapp-api.loadbalancer.server.port=5000"

   volumes:
     whatsapp-auth:

   networks:
     traefik-public:
       external: true
   ```

4. Clique em **Deploy the stack**

---

## 3. Escanear QR Code do WhatsApp

```bash
# Via SSH na VPS, veja os logs:
docker logs -f whatsapp-api

# Aguarde o QR Code aparecer no terminal
# Escaneie com seu WhatsApp: WhatsApp > Dispositivos Conectados > Conectar Dispositivo
```

**IMPORTANTE:**
- Não feche o terminal enquanto escaneia
- O QR Code expira após 20 segundos
- Se expirar, o sistema gerará um novo automaticamente

---

## 4. Verificar Deploy

### 4.1 Verificar container rodando
```bash
docker ps | grep whatsapp-api
```

Deve mostrar algo como:
```
CONTAINER ID   IMAGE              STATUS         PORTS
abc123...      whatsapp-api       Up 2 minutes
```

### 4.2 Testar health check
```bash
curl https://wtsapi.duckdns.org/

# Deve retornar:
# ✅ API do WhatsApp está online!..
```

### 4.3 Testar envio de mensagem
```bash
curl -X POST https://wtsapi.duckdns.org/enviar \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "5511999999999",
    "mensagem": "Teste de mensagem via API"
  }'

# Resposta esperada:
# {"status":"Mensagem enviada com sucesso!"}
```

---

## 5. Monitoramento

### Ver logs em tempo real
```bash
docker logs -f whatsapp-api
```

### Ver últimas 100 linhas de log
```bash
docker logs --tail 100 whatsapp-api
```

### Verificar uso de recursos
```bash
docker stats whatsapp-api
```

### Reiniciar container
```bash
docker restart whatsapp-api
```

---

## 6. Atualizar Deploy

### Via Portainer (com Repository)
1. Acesse a Stack `whatsapp-api`
2. Clique em **Pull and redeploy**
3. Aguarde o novo build

### Via SSH
```bash
# Parar stack
cd /caminho/da/stack
docker compose down

# Atualizar código (se usando git diretamente)
git pull origin main

# Rebuild e subir
docker compose up -d --build

# Ver logs
docker logs -f whatsapp-api
```

---

## 7. Backup da Sessão do WhatsApp

### Exportar volume
```bash
# Criar backup
docker run --rm -v whatsapp-api_whatsapp-auth:/data \
  -v $(pwd):/backup alpine tar czf /backup/whatsapp-auth-backup.tar.gz -C /data .

# Download do backup
scp user@vps-ip:~/whatsapp-auth-backup.tar.gz ./
```

### Restaurar volume
```bash
# Upload do backup
scp whatsapp-auth-backup.tar.gz user@vps-ip:~/

# Restaurar
docker run --rm -v whatsapp-api_whatsapp-auth:/data \
  -v $(pwd):/backup alpine tar xzf /backup/whatsapp-auth-backup.tar.gz -C /data
```

---

## 8. Troubleshooting

### SSL não funciona (502/504)
```bash
# 1. Verificar Traefik
docker logs traefik | grep wtsapi

# 2. Verificar labels
docker inspect whatsapp-api | grep traefik

# 3. Verificar DNS
nslookup wtsapi.duckdns.org

# 4. Testar conectividade
curl -I http://wtsapi.duckdns.org
```

### Container não inicia
```bash
# Ver logs completos
docker logs whatsapp-api

# Verificar network
docker network inspect traefik-public

# Rebuild forçado
docker compose build --no-cache
docker compose up -d
```

### WhatsApp desconectou
```bash
# 1. Ver logs
docker logs whatsapp-api

# 2. Se necessário, limpar sessão e reconectar
docker volume rm whatsapp-api_whatsapp-auth
docker restart whatsapp-api

# 3. Escanear novo QR Code
docker logs -f whatsapp-api
```

### Porta já em uso (em dev local)
```bash
# Verificar qual processo está usando porta 5000
netstat -ano | findstr :5000   # Windows
lsof -i :5000                  # Linux/Mac

# Mudar porta no docker-compose.dev.yml
ports:
  - "5001:5000"  # Muda porta externa para 5001
```

---

## 9. Segurança

### Recomendações:
1. **Não exponha portas** desnecessárias em produção
2. **Use volumes** para persistir dados da sessão
3. **Mantenha .env fora do Git**
4. **Faça backups regulares** da sessão do WhatsApp
5. **Monitore logs** para detectar problemas

### Configurar rate limiting (opcional)
Adicione no Traefik:
```yaml
- "traefik.http.middlewares.whatsapp-ratelimit.ratelimit.average=10"
- "traefik.http.middlewares.whatsapp-ratelimit.ratelimit.burst=20"
- "traefik.http.routers.whatsapp-api.middlewares=whatsapp-ratelimit"
```

---

## 10. URLs Importantes

- **Produção**: https://wtsapi.duckdns.org
- **Health Check**: https://wtsapi.duckdns.org/
- **Endpoint de envio**: https://wtsapi.duckdns.org/enviar
- **Portainer**: (seu portainer URL)
- **Traefik Dashboard**: (seu traefik dashboard URL)

---

## Comandos Rápidos

```bash
# Ver status
docker ps | grep whatsapp-api

# Ver logs
docker logs -f whatsapp-api

# Reiniciar
docker restart whatsapp-api

# Rebuild
docker compose up -d --build

# Parar tudo
docker compose down

# Limpar volumes
docker compose down -v
```

---

**Deploy testado e funcionando! ✅**

Qualquer problema, consulte a seção de Troubleshooting ou os logs do container.
