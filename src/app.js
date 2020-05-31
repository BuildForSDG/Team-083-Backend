
const mongoose = require('mongoose');
const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const { logger } = require('./utility/logging');
const adminRoute = require('./routes/adminRoute');
const smeRoute = require('./routes/smeRoute');
const funderRoute = require('./routes/funderRoute');
const mixRoute = require('./routes/mixRoute');
const ErrorHandler = require('./utility/error');

const apiBasePath = '/api/v1';

/* Connect to Mongodb */

mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false
})
  .then(() => logger.info(`Connected to ${process.env.NODE_ENV} database...`));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public'))); // Expose public directory

/* Allow cross origin */

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, token');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  next();
});

/* Cross Origin options request */

app.options('*', (req, res, next) => res.status(200).json());

/* Defined Api Routes */

app.use(apiBasePath, adminRoute); // Admin user only
app.use(apiBasePath, smeRoute); // SME user only
app.use(apiBasePath, funderRoute); // FUNDER user only
app.use(apiBasePath, mixRoute); // More than one user type endpoints

/* Error Handling */

app.use((err, req, res, next) => {
  const response = {
    status: 'error',
    message: err.message,
    hint: err.hint
  };
  if (process.env.NODE_ENV === 'development' && !(err instanceof ErrorHandler)) {
  // Unknown server error. Response with stack trace for easier debugging

    response.stack = err.stack;
  }
  return res.status(err.status || 500).json(response);
});

/* Error 404 handler */

app.use((req, res, next) => res.status(404).json({
  status: 'error',

  message: 'Invalid api endpoint or Method'
}));

module.exports = app;
