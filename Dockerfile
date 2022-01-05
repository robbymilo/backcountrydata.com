FROM node:16.13-alpine

RUN apk update && apk add curl git tar jq make bash libc6-compat && rm -rf /var/cache/apk/*

ENV HUGO_VERSION=0.91.2

WORKDIR /usr/app

RUN npm i -g netlify-cli