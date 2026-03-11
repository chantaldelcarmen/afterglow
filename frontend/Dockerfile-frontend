# base image
FROM node:20-alpine

# sets working dir for all following commands
WORKDIR /app

COPY package*.json .

# install dependencies locally in node modules
RUN npm ci

COPY . .

EXPOSE 3000 

CMD ["npm", "start"]