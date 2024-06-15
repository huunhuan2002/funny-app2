var express = require('express');
var router = express.Router();

router.get('/login_failed', function (req, res) {
  res.status(200).json({
    "title": "Thông báo",
    "message": "Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.",
    "actions": [
        {
            "label": "OK",
            "href": "",
            "classname": "Continue"
        }
    ]
  })
})

router.get('/register_name_taken_error', function (req, res) {
  res.status(200).json({
    "title": "Thông báo",
    "message": "Tài khoản đăng nhập đã được sử dụng.",
    "actions": [
        {
            "label": "OK",
            "href": "",
            "classname": "Continue"
        }
    ]
  })
})

module.exports = router;
