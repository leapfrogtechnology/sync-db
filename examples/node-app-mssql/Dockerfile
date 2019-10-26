FROM node:10

WORKDIR /app/

COPY . .

RUN yarn && yarn sync-db

CMD ["yarn", "start"]
