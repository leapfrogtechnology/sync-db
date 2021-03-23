From node:14-slim
WORKDIR /app/
COPY . .
RUN yarn
CMD yarn sync-db synchronize && yarn start
