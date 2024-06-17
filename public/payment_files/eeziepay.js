EeziePayGateway = (function (n) {
  function f(i) {
      var r, f, e;
      return (
          i.preventDefault(),
          (r = n(this)),
          (f = validate(t, u)),
          f
              ? showErrors(t, f || {})
              : ((e = t.serialize()),
                spinner(r, !0),
                DoRequest({
                    method: "POST",
                    url: "/api/Deposit/CreatePaymentDepositEZP",
                    body: e,
                    onload: function (n) {
                        var t;
                        if ((spinner(r, !1), (t = JSON.parse(n.responseText)), t && t.Data)) {
                            var i = document.createElement("form"),
                                u = document.createElement("input"),
                                f = document.createElement("input"),
                                e = document.createElement("input"),
                                o = document.createElement("input"),
                                s = document.createElement("input"),
                                h = document.createElement("input"),
                                c = document.createElement("input"),
                                l = document.createElement("input"),
                                a = document.createElement("input"),
                                v = document.createElement("input"),
                                y = document.createElement("input"),
                                p = document.createElement("input"),
                                w = document.createElement("input");
                            i.method = "POST";
                            i.action = t.Data.apiUrl;
                            u.name = "service_version";
                            u.value = t.Data.service_version;
                            i.appendChild(u);
                            f.name = "sign";
                            f.value = t.Data.sign;
                            i.appendChild(f);
                            e.name = "partner_code";
                            e.value = t.Data.partner_code;
                            i.appendChild(e);
                            o.name = "partner_orderid";
                            o.value = t.Data.partner_orderid;
                            i.appendChild(o);
                            s.name = "member_id";
                            s.value = t.Data.member_id;
                            i.appendChild(s);
                            h.name = "member_ip";
                            h.value = t.Data.member_ip;
                            i.appendChild(h);
                            c.name = "currency";
                            c.value = t.Data.currency;
                            i.appendChild(c);
                            l.name = "amount";
                            l.value = t.Data.amount;
                            i.appendChild(l);
                            a.name = "backend_url";
                            a.value = t.Data.backend_url;
                            i.appendChild(a);
                            v.name = "redirect_url";
                            v.value = t.Data.redirect_url;
                            i.appendChild(v);
                            y.name = "bank_code";
                            y.value = t.Data.bank_code;
                            i.appendChild(y);
                            p.name = "trans_time";
                            p.value = t.Data.trans_time;
                            i.appendChild(p);
                            w.name = "remarks";
                            w.value = t.Data.remarks;
                            i.appendChild(w);
                            document.body.appendChild(i);
                            i.submit();
                        } else t.ErrorState && getMessage({ data: t.ErrorState.ErrorCode, type: ModalType.Danger });
                    },
                })),
          !1
      );
  }
  function e() {
      t = n("#frmEeziePay");
      r = n("#Amount");
      i = n("#btnSubmit");
      btnAmount = n(".btn-depamt");
      btnAmount.click(function (t) {
          t.preventDefault();
          var i = n(this).attr("data-value");
          n("#DepositAmount").val(i);
          btnAmount.removeClass("active");
          n(this).addClass("active");
      });
      i.on("click", f);
  }
  var t,
      r,
      i,
      u = { BankCode: { presence: !0 }, DepositAmount: { presence: !0 } };
  n(e);
})(jQuery);
