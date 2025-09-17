FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm i -g serve
EXPOSE 5173
CMD ["serve","-s","dist","-l","5173"]