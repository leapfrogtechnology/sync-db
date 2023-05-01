FROM node:16-slim

WORKDIR /app/

COPY . .

RUN yarn

CMD yarn sync-db synchronize && yarn start
