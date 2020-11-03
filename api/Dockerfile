FROM node:14

WORKDIR /usr/src/app
RUN ls -al
COPY api/package*.json ./

RUN npm i

COPY api ./

ENV PORT 3000
ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "npm", "start" ]
