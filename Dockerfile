
FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache tzdata

ENV TZ=America/Guatemala

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --omit=dev

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
