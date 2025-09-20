FROM node:22.14.0-slim

WORKDIR /index

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5021

CMD [ "npm", "run", "dev" ]