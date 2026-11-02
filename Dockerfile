FROM node:24-slim

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
ENV DCN_DATA_DIR=/data

COPY . .

RUN mkdir -p /data
VOLUME ["/data"]
EXPOSE 8080

CMD ["node", "server.mjs"]
