FROM node:12

WORKDIR /app/

COPY . .

RUN yarn

CMD yarn sync-db synchronize && yarn start
