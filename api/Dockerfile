FROM node:18.12.1-alpine

WORKDIR /usr/src/app

COPY api ./

RUN npm ci

ARG BUILD
ENV BUILD=$BUILD

CMD [ "node", "app.js" ]

