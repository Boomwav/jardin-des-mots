FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY server.js .
# On ne copie PAS le db.json ici, car il viendra du volume externe
EXPOSE 3000
CMD ["npm", "start"]