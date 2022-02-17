FROM node:16.13.1

WORKDIR /usr/src/app

COPY api ./

RUN npm i
RUN ls -al
ENV PORT 3000
ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "npm", "start" ]
