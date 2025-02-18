FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# check
EXPOSE 3000

CMD ["npm", "start"]

