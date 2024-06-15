var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');
var cookieSession = require('cookie-session')
var MobileDetect = require('mobile-detect')

var indexRouter = require('./routes/index');
var authsRouter = require('./routes/auth');
var paymentRouter = require('./routes/payment');
var mobileRouter = require('./routes/mobile');
var messageRouter = require('./routes/message')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use(cookieSession({
  name: 'session',
  keys: ['secretKey', 'testKey'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const authMid = function (req, res, next) {
  if (!req.session.username) {
    res.redirect('/');
  } else {
    next();
  }
}

const osDetectMid = function (req, res, next) {
  const md = new MobileDetect(req.headers['user-agent']);
  if (req.path === '/') {
    res.redirect('/mobile');
  } else {
    next();
  }
}

app.use('/', osDetectMid, indexRouter);
app.use('/auth', authsRouter);
app.use('/payment', authMid, paymentRouter);
app.use('/mobile', mobileRouter)
app.use('/message', messageRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  if (err) {
    throw err;
  }
});

module.exports = app;
