FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar código da aplicação
COPY . .


# Expor porta da API
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
