FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g firebase-tools && npm install
COPY . .
