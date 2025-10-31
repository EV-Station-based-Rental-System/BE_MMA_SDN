FROM docker.io/node:lts-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]

ENV NODE_ENV=production
EXPOSE 3000

# Bring runtime deps + built app
COPY ./node_modules ./node_modules
COPY ./dist/src ./

COPY .env ./

USER node
CMD ["node", "main.js"]
