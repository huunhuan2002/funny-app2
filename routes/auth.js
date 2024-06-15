var express = require('express');
var router = express.Router();
var googleSheet = require('../service/GoogleSheet');

async function login(userName, password) {
  const userList = await googleSheet.loadUserList();
  if (userList) {
    const userInfor = userList.find((data) => {
      if (Array.isArray(data) && data[0] && data[1]) {
        return userName === data[0] && password === data[1];
      }

      return false;
    });

    if (userInfor) {
      return {
        userName: userName,
        price: userInfor[2]
      }
    } else {
      const isUserNameExisted = userList.some((data) => {
        if (Array.isArray(data) && data[0]) {
          return userName === data[0];
        }
        return false;
      });

      if (!isUserNameExisted) {
        const newDatas = [[userName, password, 0, '', formatDateTime(), formatDateTime(), 'Đăng nhập']];
        await googleSheet.writeNewData(newDatas);

        return {
          userName,
          price: 0
        }
      }
    }
  }

  return null;
}

function formatDateTime() {
  const date = new Date();
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const year = date.getFullYear();
  const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`
}

router.post('/login', async function(req, res, next) {
  const payload = req.body;

  try {
    const userLoggedIn = await login(payload.UserName?.toLowerCase() || '', payload.Password);

    if (userLoggedIn) {
      req.session.isLoggedIn = true;
      req.session.username = userLoggedIn.userName;
      req.session.price = userLoggedIn.price;
      res.status(200).json({ success: true });
    } else {
      res.status(200).json(
        {
          "Data": null,
          "ResourceKey": null,
          "StatusCode": 200,
          "ErrorState": {
              "Type": 0,
              "ErrorCode": "login_failed",
              "ErrorMessages": [
                  "Invalid username or password"
              ],
              "ModelValidationErrors": {
                  "Errors": []
              }
          }
        }
      )
    }

  } catch (error) {
    res.status(200).json(
      {
        "Data": null,
        "ResourceKey": null,
        "StatusCode": 200,
        "ErrorState": {
            "Type": 0,
            "ErrorCode": "login_failed",
            "ErrorMessages": [
                "Invalid username or password"
            ],
            "ModelValidationErrors": {
                "Errors": []
            }
        }
      }
    )
  }
});

router.post('/login-web', async function(req, res, next) {
  const payload = req.body;

  try {
    const userLoggedIn = await login(payload.AccountID?.toLowerCase() || '', payload.AccountPWD);

    if (userLoggedIn) {
      req.session.isLoggedIn = true;
      req.session.username = userLoggedIn.userName;
      req.session.price = userLoggedIn.price;
      res.status(200).json({ success: true });
    } else {
      const Error = {
        "Code": 1002,
        "Message": "Tài khoản hoặc mật khẩu sai"
      };
      res.status(400).json({Error})
    }
  } catch (error) {
    const Error = {
      "Code": 1002,
      "Message": "Tài khoản hoặc mật khẩu sai"
    };
    res.status(400).json({Error})
  }
});

router.post('/register', async function(req, res, next) {
  const payload = req.body;

  try {
    const userList = await googleSheet.loadUserList();
    const userInfor = userList.find((data) => {
      if (Array.isArray(data) && data[0] && data[1]) {
        return payload.UserName === data[0];
      }

      return false;
    });
    if (userInfor) {
      res.status(200).json({
        "Data": null,
        "ResourceKey": null,
        "StatusCode": 200,
        "ErrorState": {
            "Type": 0,
            "ErrorCode": "register_name_taken_error",
            "ErrorMessages": [
                "Name already taken."
            ],
            "ModelValidationErrors": {
                "Errors": []
            }
        }
      })
    } else {
      const newDatas = [[payload.UserName, payload.Password, 0, payload.Contact, new Date().toString(), new Date().toString(), 'Đăng ký']];
      await googleSheet.writeNewData(newDatas);
      req.session.isLoggedIn = true;
      req.session.username = payload.UserName;
      req.session.price = 0;
      res.status(200).json({
        Data: 'success'
      })
    }
  } catch (error) {
    res.status(200).json({
      "Data": null,
      "ResourceKey": null,
      "StatusCode": 200,
      "ErrorState": {
          "Type": 0,
          "ErrorCode": "register_name_taken_error",
          "ErrorMessages": [
              "Name already taken."
          ],
          "ModelValidationErrors": {
              "Errors": []
          }
      }
    })
  }
});

router.post('/web-register', async function(req, res, next) {
  const payload = req.body;

  try {
    const userList = await googleSheet.loadUserList();
    const userInfor = userList.find((data) => {
      if (Array.isArray(data) && data[0] && data[1]) {
        return payload.AccountID?.toLowerCase() === data[0];
      }

      return false;
    });
    if (userInfor) {
      const Error = {
        "Code": 1002,
        "Message": "Tài khoản đã tồn tại"
      };
      res.status(400).json({Error})
    } else {
      const date = new Date();
      const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
      const month = date.getMonth() + 1
      const newDatas = [[payload.AccountID?.toLowerCase(), payload.PWD, 0, payload.CellPhone, formatDateTime(), formatDateTime(), 'Đăng ký']];
      await googleSheet.writeNewData(newDatas);
      req.session.isLoggedIn = true;
      req.session.username = payload.AccountID?.toLowerCase();
      req.session.price = 0;
      res.status(200).json({ success: true });
    }
  } catch (error) {
    const Error = {
      "Code": 1002,
      "Message": "Tài khoản đã tồn tại"
    };
    res.status(400).json({Error})
  }
});

router.get('/logout', function (req, res) {
  req.session.isLoggedIn = false;
  req.session.username = undefined;

  res.redirect('/');
})

module.exports = router;
