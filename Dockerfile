FROM node:alpine

WORKDIR '/app'

COPY . .
RUN yarn install -W
RUN npm install tsc -g
RUN tsc

CMD ["node", "./dist/server.js"]