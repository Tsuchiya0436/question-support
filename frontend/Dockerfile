FROM node:18

WORKDIR /app

COPY package*.json ./

# NODE_ENV を development にして、devDependencies も含めてインストール
ENV NODE_ENV=development
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
