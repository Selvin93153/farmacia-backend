FROM node:24-alpine

WORKDIR /app

# Instala la información de zonas horarias.
RUN apk add --no-cache tzdata

ENV TZ=America/Guatemala

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000