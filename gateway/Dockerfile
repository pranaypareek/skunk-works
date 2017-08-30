FROM pranay/gateway:latest

WORKDIR /usr/src/app

COPY package.json .

RUN npm install -g forever
RUN npm install

COPY . .

CMD [ "npm", "start" ]
