var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('not found');
});

router.get('/qrcode', function(req, res, next) {
  res.render('payment_qrcode');
});

router.get('/select-bank', function(req, res, next) {
  res.render('select_bank');
});

router.get('/view-qr', function(req, res, next) {
  const username = req.session.username;
  const money = (req.session.money || 0) * 1000;
  const moneyFormatted = new Intl.NumberFormat('vi-VN').format(money);
  const QRURL = `https://img.vietqr.io/image/${process.env.BANKID}-${process.env.ACCOUNT_NO}-qr_only.png?amount=${money}&addInfo=${username}`
  res.render('view_qr', { username, money: moneyFormatted, QRURL });
});

router.post('/update-payment', function(req, res) {
  const body = req.body;
  if (!body.money || Number.isNaN(body.money)) {
    res.redirect('/payment');
  } else {
    req.session.money = body.money.replace(/\,/, '');
    res.redirect('/payment/view-qr'); 
  }
})

module.exports = router;
