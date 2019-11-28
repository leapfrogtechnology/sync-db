FROM node:10

WORKDIR /app/

COPY . .

RUN yarn

CMD yarn sync-db && yarn start
