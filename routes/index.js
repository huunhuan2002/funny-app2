var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  const isLoggedIn = req.session.isLoggedIn;
  const username = req.session.username?.toUpperCase();
  const price = req.session.price || 0;
  res.render('home', { isLoggedIn, username, price });
});

router.get('/register', async function(req, res, next) {
  res.render('register');
});

module.exports = router;
