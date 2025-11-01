# Dockerfile para o Serviço Ingestor (SFTP)
FROM node:20-alpine
WORKDIR /usr/src/app

# Copia e instala dependências
COPY package.json ./
RUN npm install

# Copia o código-fonte
COPY . .

# Expõe a porta SFTP
EXPOSE 2222

# Comando de inicialização
CMD [ "npm", "start" ]
