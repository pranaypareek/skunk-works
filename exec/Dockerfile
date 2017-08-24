FROM node:boron

WORKDIR /usr/src/app

COPY package.json .

RUN apt-get update
RUN apt-get install -y ruby-full
RUN apt-get install -y golang-go
RUN npm install
RUN npm install -g forever

COPY . .

CMD [ "npm", "start" ]
