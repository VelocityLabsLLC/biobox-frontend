# stage1 as builder
FROM node:15-alpine as builder

RUN apk add --no-cache --virtual .gyp python make g++

# make the folder
RUN mkdir /react-ui 

WORKDIR /react-ui

# copy the package.json to install dependencies
COPY package.json .
COPY package-lock.json .

# Install the dependencies 
RUN npm i --quiet

COPY . .

# Build the project and copy the files
RUN npm run build-local


FROM nginx:alpine

#!/bin/sh

COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stahg 1
COPY --from=builder /react-ui/build /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]