var express = require('express');
var router = express.Router();

const authMid = function (req, res, next) {
  if (!req.session.isLoggedIn) {
    res.redirect('/');
  } else {
    next();
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  const isLoggedIn = req.session.isLoggedIn;
  const username = req.session.username;

  const linkGame = isLoggedIn ? `https://www.vb9553v.net/` : '#';
  const profileLink = isLoggedIn ? '/mobile/profile' : '#';
  const transactionLink = isLoggedIn ? '/mobile/transaction' : '#';
  const loggedClass = isLoggedIn ? 'isLoggedIn' : 'notLoggedIn';
  res.render('mobile-home', { title: 'Express', isLoggedIn, username, linkGame, loggedClass, profileLink, transactionLink });
});

router.get('/login', function(req, res, next) {
  res.render('mobile-login', { title: 'Express' });
});

router.get('/register', function(req, res, next) {
  res.render('mobile-register', { title: 'Express' });
});

module.exports = router;
