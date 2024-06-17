(function (n) {
  typeof define == "function" && define.amd ? define(["jquery"], n) : n(jQuery);
})(function (n) {
  function i(n) {
      return t.raw ? n : encodeURIComponent(n);
  }
  function f(n) {
      return t.raw ? n : decodeURIComponent(n);
  }
  function e(n) {
      return i(t.json ? JSON.stringify(n) : String(n));
  }
  function o(n) {
      n.indexOf('"') === 0 && (n = n.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
      try {
          return (n = decodeURIComponent(n.replace(u, " "))), t.json ? JSON.parse(n) : n;
      } catch (i) {}
  }
  function r(i, r) {
      var u = t.raw ? i : o(i);
      return n.isFunction(r) ? r(u) : u;
  }
  var u = /\+/g,
      t = (n.cookie = function (u, o, s) {
          var y, a, h, v, c, p;
          if (o !== undefined && !n.isFunction(o))
              return (
                  (s = n.extend({}, t.defaults, s)),
                  typeof s.expires == "number" && ((y = s.expires), (a = s.expires = new Date()), a.setTime(+a + y * 864e5)),
                  (document.cookie = [i(u), "=", e(o), s.expires ? "; expires=" + s.expires.toUTCString() : "", s.path ? "; path=" + s.path : "", s.domain ? "; domain=" + s.domain : "", s.secure ? "; secure" : ""].join(""))
              );
          for (h = u ? undefined : {}, v = document.cookie ? document.cookie.split("; ") : [], c = 0, p = v.length; c < p; c++) {
              var w = v[c].split("="),
                  b = f(w.shift()),
                  l = w.join("=");
              if (u && u === b) {
                  h = r(l, o);
                  break;
              }
              u || (l = r(l)) === undefined || (h[b] = l);
          }
          return h;
      });
  t.defaults = {};
  n.removeCookie = function (t, i) {
      return n.cookie(t) === undefined ? !1 : (n.cookie(t, "", n.extend({}, i, { expires: -1 })), !n.cookie(t));
  };
});
Register = (function (n) {
  function e(r) {
      var u, e, o, s;
      return (
          r.preventDefault(),
          (u = n(this)),
          (e = validate(t, i)),
          e
              ? (showErrors(t, e || {}), n(".errorMsg").slideDown(), setTimeout("$('.errorMsg').slideUp('fast')", "2500"))
              : ((o = t.serialize()),
                spinner(u, !0),
                DoRequest({
                  method: "POST",
                  url: "/auth/register",
                  body: o,
                  onload: function (n) {
                      var t = JSON.parse(n.responseText);
                      spinner(u, !1);
                      t && t.Data ? (window.location.href = "/") : t.ErrorState && getMessage({ data: t.ErrorState.ErrorCode, type: ModalType.Danger });
                  },
              })),
          !1
      );
  }
  function o() {
      t = n("form#registerForm");
      r = n("#btnRegister");
      u = n("#Contact");
      f = n("#hidUseCaptcha").val();
      DoValidate(t, i);
      r.on("click", e);
      n("#imgCaptcha").on("click", function () {
          n("#imgCaptcha").attr("src", "/Captcha/GetCaptchaImage?" + Math.random());
      });
      u.keypress(function (n) {
          if (n.which != 8 && n.which != 0 && (n.which < 48 || n.which > 57)) return !1;
      });
      n("#Captcha").on("keypress", function (n) {
          if (n.which != 8 && n.which != 0 && (n.which < 48 || n.which > 57)) return !1;
      });
      var o = getIpCookie();
      o == ""
          ? getIPAddress().then(function (t) {
                setIpCookie(t.ip);
                n(".IpAddress").val(t.ip);
            })
          : n(".IpAddress").val(o);
  }
  var r, u, t, f, i;
  validate.extend(validate.validators.datetime, {
      parse: function (n) {
          return +moment.utc(n);
      },
      format: function (n, t) {
          var i = t.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss";
          return moment.utc(n).format(i);
      },
  });
  i = {
      FullName: { presence: !0 },
      Month: { presence: !0 },
      Day: { presence: !0 },
      Year: { presence: !0 },
      Email: { presence: !0 },
      AreaCode: { presence: !0 },
      Contact: { presence: !0, numericality: !0, length: { minimum: 6 } },
      CurrencyCode: { presence: !0 },
      UserName: { presence: !0, length: { minimum: 6 }, format: { pattern: "[A-Za-z0-9]+" } },
      Password: { presence: !0, length: { minimum: 6 } },
      ConfirmPassword: { presence: !0, equality: { attribute: "Password" } },
      Captcha: { presence: !0 },
  };
  n(o);
})(jQuery);
