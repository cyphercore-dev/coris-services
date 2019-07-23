FROM node:12-alpine

WORKDIR /usr

COPY package.json ./

RUN npm i

COPY *.js ./

CMD [ "node", "main.js" ]