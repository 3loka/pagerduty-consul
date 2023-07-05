# Dockerfile
FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENV POSTGRES_PASSWORD=your-password  # Replace with your actual Postgres password
CMD [ "node", "backend/app.js" ]
EXPOSE 3000
