$(document).ready(function () {

  document.querySelectorAll(".indexSwiper video").forEach(video => {
    video.addEventListener("loadedmetadata", () => {
      const slide = video.closest(".swiper-slide");
      if (!slide) return;
      const durationMs = Math.ceil(video.duration * 1000) + 300;
      slide.setAttribute("data-swiper-autoplay", durationMs);
    });
  });
  setTimeout(function () {
    $(".msgNotice").fadeOut();
  }, 5000);
  // $(window).on("scroll", function () {
  //   if ($(this).scrollTop() > 10) {
  //     $("#mainNav")
  //       .addClass("sticky")
  //       .stop()
  //       .animate({ height: "40px", opacity: 1 }, 100);
  //   } else {
  //     $("#mainNav")
  //       .removeClass("sticky")
  //       .stop()
  //       .animate({ height: "60px", opacity: 0.95 }, 100);
  //   }
  // });
});
var sliderSwiper = new Swiper(".indexSwiper", {
  slidesPerView: 1,
  loop: true,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

var blogSwiper = new Swiper(".blogSwiperIndex", {
  slidesPerView: 2,
  spaceBetween: 60,
  loop: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  autoplay: {
    delay: 8000,
    disableOnInteraction: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    320: {
      slidesPerView: 1,
      spaceBetween: 20,
    },
    640: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 40,
    },
    1024: {
      slidesPerView: 2,
      spaceBetween: 50,
    },
  },
});
$("#showBottomMenu").click(function (event) {
  event.preventDefault();
  if ($("#bottomSheet").hasClass("active"))
    $("#bottomSheet").removeClass("active");
  else $("#bottomSheet").addClass("active");
  if ($("#overlay-custom-bottom-sheet").hasClass("active"))
    $("#overlay-custom-bottom-sheet").addClass("active");
  else $("#overlay-custom-bottom-sheet").removeClass("active");
});
$("#closeBtn, #soverlay-custom-bottom-sheet").click(function () {
  $("#bottomSheet").removeClass("active");
  $("#overlay-custom-bottom-sheet").removeClass("active");
});
$(document.body).on("input", ".numbersOnly", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});
$(".showPasword").click(function () {
  if ($(this).hasClass("fa-eye")) {
    $("#password,#confirm_password").attr("type", "text");
    $(this).removeClass("fa-eye").addClass("fa-eye-slash");
  } else if ($(this).hasClass("fa-eye-slash")) {
    $("#password,#confirm_password").attr("type", "password");
    $(this).removeClass("fa-eye-slash").addClass("fa-eye");
  }
});


// $('input[name="package_selection"]').on('change', function () {
//   if ($(this).is(':checked')) {
//     const target = $('#buy-now');
//     const offset = $(window).height() - target.outerHeight();
//     const navbarHeight = -80; // Adjust this value
//     $('html, body').animate({
//       scrollTop: target.offset().top - offset - navbarHeight
//     }, 400);
//   }
// });

$('input[name="package_selection"]').on('change', function () {
  if ($(this).is(':checked')) {
    const target = $('#payment-gateway-buttons');

    $('.amount-to-be-paid').html("&#8377;" + " " + $(this).data('price'));
    $('html, body').animate({
      scrollTop: target.offset().top - 120
    }, 400);
  }
});

$("#searchPagination").keyup(function (e) {
  if (e.keyCode == 13)
    window.location.href = $(this).data("url") + "/1/" + $(this).val();
});
$("#searchBlogs").click(function (e) {
  window.location.href = $("#searchPagination").data("url") + "/1/" + $("#searchPagination").val();
});
$("#clearBlogs").click(function (e) {
  window.location.href = $("#searchPagination").data("url") + "/1";
});

$(document).on('click', '#toggle-password-all', function () {
  const $btn = $(this);
  const selectors = String($btn.data('targets') || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!selectors.length) return;
  const $inputs = $(selectors.join(','));
  const isHidden = $inputs.first().attr('type') === 'password';

  $inputs.attr('type', isHidden ? 'text' : 'password');
  $btn.html(isHidden ? '<i class="fas fa-eye  text-light"></i>' : '<i class="fas fa-eye-slash text-light"></i>').attr('aria-label', isHidden ? 'Hide passwords' : 'Show passwords').attr('aria-pressed', isHidden ? 'true' : 'false');
});

let isOpen = false;
$(".showSearch").on("click", function () {
  const navHeight = $("#mobileBottomNav").outerHeight();
  if (!isOpen) {
    $("#mobileBottomSearch")
      .css("bottom", navHeight + "px")
      .addClass("active");
  } else {
    $("#mobileBottomSearch").removeClass("active");
  }

  isOpen = !isOpen;
});

$(document).on("click", ".avatar-option", function () {
  const $img = $(this);
  const avatarId = $img.data("id");
  const avatarSrc = $img.data("src");
  $(".avatar-card").removeClass("active");
  $img.closest(".avatar-card").addClass("active");
  $(".currentUserAvatar").attr("src", avatarSrc);
  $(".avatar-option").removeClass("pulse");
  $img.addClass("pulse");
  $.post(
    "required/gamison",
    { avatar_id: avatarId },
    function (res) {
      if (res.type !== "success") {
        $(".avatar-card").removeClass("active");
      }
    },
    "json"
  );
});


document.addEventListener("DOMContentLoaded", function () {
  const el = document.querySelector('.gameBannerSwiper');
  if (!el || typeof Swiper === "undefined") return;
  const slideCount = document.querySelectorAll('.swiper-slide').length;
  const swiper = new Swiper(el, {
    slidesPerView: 1,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    }
  });
  let timer;
  function scheduleNext(delay) {
    clearTimeout(timer);
    timer = setTimeout(() => swiper.slideNext(), delay);
  }
  function handleSlide() {
    const slide = swiper.slides[swiper.activeIndex];
    const video = slide.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
      const playVideo = () => {
        video.play().catch(() => { });
        scheduleNext((video.duration * 1000) + 2000);
      };
      if (video.readyState >= 1) playVideo();
      else video.onloadedmetadata = playVideo;
    } else {
      scheduleNext(4000);
    }
  }
  swiper.on('slideChange', handleSlide);
  handleSlide();
});
