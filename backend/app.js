

const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const webhookRoutes = require('./routes/webhooks');

const session = require('express-session');


const sequelize = new Sequelize(`postgresql://3loka:${process.env.POSTGRES_PASSWORD}@tripod-saiga-2485.7s5.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full`);

const app = express();
app.use(express.static('./frontend'));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
  }));
  
app.use(bodyParser.json());
app.use('/api', webhookRoutes(sequelize));  // pass the sequelize instance to your routes

app.listen(3000, () => console.log('Server started on port 3000'));
