FROM node:16.17.0-alpine

RUN apk update && apk add curl git tar jq make bash libc6-compat && rm -rf /var/cache/apk/*

WORKDIR /usr/app

RUN npm i -g netlify-cli