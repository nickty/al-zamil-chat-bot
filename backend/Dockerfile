FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# check
EXPOSE 3002

CMD ["npm", "start"]

