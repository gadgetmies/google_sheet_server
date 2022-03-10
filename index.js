require('dotenv').config({path: './.env'})

const express = require('express')
const app = express()
const winston = require('winston')
const expressWinston = require('express-winston')
const logger = require('./logger')(__filename)
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy;
const cors = require('cors');

passport.use(new BasicStrategy(
  function (userid, password, done) {
    if (userid === process.env.USERNAME && password === process.env.PASSWORD) {
      return done(null, {})
    } else {
      return done(null, false)
    }
  }
));

app.use(passport.initialize());

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function (req, res) {
    return false;
  } // optional: allows to skip some log messages based on request and/or response
}));

app.use('/api', cors(), passport.authenticate('basic', {session: false}), require('./routes/index'))

const port = process.env.PORT
app.listen(port)
logger.info(`Listening on port: ${port}`)
