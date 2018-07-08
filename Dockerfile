FROM node:10.4.0

RUN mkdir -p /tracker
WORKDIR /tracker

COPY . .

RUN npm install --production

CMD node src/index.js
