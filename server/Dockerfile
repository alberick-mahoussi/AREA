FROM node:20.9

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["./migrate-and-start.sh"]

# CMD [ "npm", "start" ]