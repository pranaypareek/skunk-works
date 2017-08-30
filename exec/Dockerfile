FROM pranay/exec:latest

WORKDIR /usr/src/app

COPY package.json .

RUN npm install
RUN npm install -g request
RUN npm install -g forever

COPY . .

CMD [ "npm", "start" ]
