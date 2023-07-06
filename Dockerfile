FROM node:14
WORKDIR /usr/src/app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
ENV POSTGRES_PASSWORD=your-password 
CMD [ "node", "backend/app.js" ]
EXPOSE 3000
