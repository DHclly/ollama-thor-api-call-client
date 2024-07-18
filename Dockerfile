FROM nginx:stable-alpine3.19-slim as base
WORKDIR /app
COPY dist .
COPY nginx-conf /etc/nginx/conf.d