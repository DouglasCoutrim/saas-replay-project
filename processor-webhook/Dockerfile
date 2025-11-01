# Dockerfile para o Serviço Processador (Webhook)
FROM node:20-alpine
WORKDIR /usr/src/app

# Copia e instala dependências
COPY package.json ./
RUN npm install

# Copia o código-fonte
COPY . .

# Expõe a porta do servidor Express
EXPOSE 3001

# Comando de inicialização
CMD [ "npm", "start" ]
