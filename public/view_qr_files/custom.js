const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, idx) => {
        if (idx === index) {
            if(idx == 1) {
                $('#swiper-wrapper-3a0776ca11fd22de').attr('onclick', "goToPath('/promotion')")
            } else {
                $('#swiper-wrapper-3a0776ca11fd22de').attr('onclick', "")
            }
            slide.style.display = 'block';
        } else {
                $('#swiper-wrapper-3a0776ca11fd22de').attr('onclick', "")
            slide.style.display = 'none';
        }
    });
}

function nextSlide() {
    currentSlide++;
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    showSlide(currentSlide);
}

// Initial slide
showSlide(currentSlide);

// Auto slide
setInterval(nextSlide, 2500); // Change slide every 3 seconds


/**
 * Start loading with sweet alert
 *
 * @param message
 */
function startLoadingIndicator(message = '') {
    swal.fire({
        title: message,
        allowEscapeKey: true,
        allowOutsideClick: false,
        background: "none",
        imageHeight: 80,
        imageWidth: 80,
        imageUrl: `${window.location.origin}/images/loading.gif`,
        showConfirmButton: false,
    });

    $('.sweet-alert').css('background-color', 'transparent');
}

/**
 * End loading with sweet alert
 */
function endLoading() {
    swal.close();
}

$('.notLoggedIn').on('click', function(e) {
    $('.notLoggedIn .check-login').addClass('d-none')
    $('.notLoggedIn .check-login').removeClass('d-block')
    $(this).find('.check-login').addClass('d-block')
});

function showNapRut() {
    if ($('.check-login.isLoggedIn').length <= 0) {
        $('.check-login')[0].style.display = 'block';
        return
    }

    let check = $('#menuNapRutTien.off')
    if (check.length) {
        $('#menuNapRutTien')[0].classList.remove('off')
        $('#menuNapRutTien')[0].classList.add('on')
        $('#MemberDepositImage').parent().attr('href', '/mobile/recharge')
    } else {
        $('#menuNapRutTien')[0].classList.remove('on')
        $('#menuNapRutTien')[0].classList.add('off')
    }
}

function showInfoUser() {
    let styleNow = $('#inforMDropOUT')[0].style.display;
    if (styleNow == 'block') {
        $('.icon_inforMoney')[0].classList.remove('on')
    } else {
        $('.icon_inforMoney')[0].classList.add('on')
    }
    $('#inforMDropOUT')[0].style.display = styleNow == 'none' ? 'block' : 'none';
}


function goToPath(path) {
    window.open(path, '_self')
}

function showLogin() {
    $('#popup_login')[0].style.display = 'block';
}

function closePopupLogin() {
    $('#popup_login')[0].style.display = 'none';
}

function closePopUpGift() {
    $('#giftNewMember')[0].style.display = 'none';
}

function sendRequestLogin() {
    $('#login-btn').attr('disabled', true)
    let params = {
        username: $('#taiKhoan').val(),
        password: $('#matKhau').val(),
    }

    if (!validate(params)) {
        setTimeout(() => {
            startLoadingIndicator()
        }, 1)
        $('#login-btn').val('Đang đăng nhập')
        setTimeout(() => {
            $.ajax({
                type: 'POST',
                url: urlLogin,
                data: params,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: "json",
                success: function (data) {
                    window.location.href = '/'
                },
                error: function () {
                    $('#login-btn').attr('disabled', false)
                    $('#notyMess')[0].style.display = 'block';
                    $('#contentMess')[0].innerHTML = validate(params);
                }
            });
        }, 1000)
    } else {
        $('#login-btn').attr('disabled', false)
        $('#notyMess')[0].style.display = 'block';
        $('#contentMess')[0].innerHTML = validate(params);
    }
}
$(document).on('click', function (e) {

    if ($('.swal2-shown').length > 0) {
        let arrClass = e.target.classList.value
        if (!arrClass.includes('open-loading'))
            endLoading()
    }

    if(e.target.id == 'menuNapRutTien') {
        $('#menuNapRutTien').removeClass('on')
        $('#menuNapRutTien').addClass('off')
    }
})

$('.open-loading').on('click', function () {
    setTimeout(() => {
        startLoadingIndicator()
    }, 1)
})

$('#taiKhoan, #matKhau').on('input', function() {
    if($('#taiKhoan').val().trim() != '') {
        $('#taiKhoan').addClass('text-transform')
    }else {
        $('#taiKhoan').removeClass('text-transform')
    }
    if ($('#taiKhoan').val().trim() != '' && $('#matKhau').val().trim() != '') {
        $('#login-btn').attr('disabled', false)
    }
})

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function closeNoty() {
    $('#notyMess')[0].style.display = 'none';
}

function validate(params) {
    let lengtUsename = params.username.length
    let lengtPass = params.password.length

    if (lengtUsename <= 0) {
        return "Vui lòng nhập tài khoản";
    } else if (lengtPass <= 0) {
        return "Vui lòng nhập mật khẩu";
    } else if (lengtPass < 6) {
        return "Tên tài khoản hoặc mật khẩu không chính xác"
    } else if (lengtUsename < 4) {
        return "Tên tài khoản hoặc mật khẩu không chính xác"
    }

    return false
}