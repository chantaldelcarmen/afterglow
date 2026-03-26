# base image
FROM node:22-alpine

# sets working dir for all following commands
WORKDIR /app

COPY package*.json .

# install dependencies locally in node modules
RUN npm ci

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=$VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

EXPOSE 3000 

CMD ["npm", "run", "dev", "--", "--host"]