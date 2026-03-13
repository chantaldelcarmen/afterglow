FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG PORT
EXPOSE ${PORT}

CMD ["npm", "run", "start:dev"]
