(function ($) {
    "use strict";
    /*-----------------------------------------------------------------------------------
        Template Name: Solvatech - IT Solution & Technology HTML Template
        Author: WebCodeMania
        Description: Solvatech - IT Solution & Technology HTML Template.
        Version: 1.2
    -----------------------------------------------------------------------------------*/

    $.exists = function (selector) {
        return $(selector).length > 0;
    };

    $(window).on('load', function () {
        preloader();
        wow_animation();
    });

    $(function () {
        headerSticky();
        search();
        mobile_menu();
        offcanvas_info();
        slick_activation();
        skill_progress();
        magnific_popup();
        fancybox_popup();
        images_loaded();
    });

    /*--------------------------------------------------------------
    preloader
    --------------------------------------------------------------*/
    function preloader() {
        $('#wnr-preloader').delay(500).fadeOut(200);
    }

    /*--------------------------------------------------------------
    wow animation
    --------------------------------------------------------------*/
    function wow_animation() {
        var wow = new WOW({
            boxClass: 'wow',
            animateClass: 'animated',
            offset: 0,
            mobile: false,
            live: true
        });
        wow.init();
    }

    /*--------------------------------------------------------------
    sticky header
    --------------------------------------------------------------*/
    function headerSticky() {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 10) {
                $("#header-sticky").addClass("wnr-sticky");
            } else {
                $("#header-sticky").removeClass("wnr-sticky");
            }
        });
    }

    /*--------------------------------------------------------------
    header search
    --------------------------------------------------------------*/
    function search() {
        $(".search-open-btn").on("click", function () {
            $(".search__popup").addClass("search-opened");
            $(".search-popup-overlay").addClass("search-popup-overlay-open");
        });
        $(".search-close-btn").on("click", function () {
            $(".search__popup").removeClass("search-opened");
            $(".search-popup-overlay").removeClass("search-popup-overlay-open");
        });
    }

    /*--------------------------------------------------------------
    mobile menu
    --------------------------------------------------------------*/
    function mobile_menu() {
        $(".offcanvas-btn").on("click", function () {
            $(".main-menu-wrap").addClass("offcanvas-visible");
        });

        $(".menu-close-btn").on("click", function () {
            $(".main-menu-wrap").removeClass("offcanvas-visible");
        });

        $(".dropdown-icon").on("click", function () {
            $(this).toggleClass("active").next("ul").slideToggle();
            $(this).parent().siblings().children("ul").slideUp();
            $(this).parent().siblings().children(".active").removeClass("active");
        });

        $(".main-menu-wrap").on("click", function (e) {
            e.target === this && $(".main-menu-wrap").removeClass("offcanvas-visible");
        });
    }

    /*--------------------------------------------------------------
    offcanvas info
    --------------------------------------------------------------*/
    function offcanvas_info() {
        $(".sidebar_toggle").on("click", function () {
            $(".offcanvas-info").addClass("show-offcanvas");
            $(".offcanvas-overlay").addClass("show-overlay");
        });
        // close offcanvas
        $(".close-btn,.offcanvas-overlay").on("click", function () {
            $(".offcanvas-info").removeClass("show-offcanvas");
            $(".offcanvas-overlay").removeClass("show-overlay");
        });
    }

    /*--------------------------------------------------------------
    document ready function
    --------------------------------------------------------------*/
    $(document).ready(function () {
    });

    /*--------------------------------------------------------------
    page scroll percentage
    --------------------------------------------------------------*/
    function scrollUpPercentage() {
        const scrollPercentage = () => {
            const scrollUpPos = document.documentElement.scrollTop;
            const calcHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollValue = Math.round((scrollUpPos / calcHeight) * 100);
            const scrollElementWrap = $("#percentage-scroll");

            scrollElementWrap.css("background", `conic-gradient( var(--clr-bg-primary) ${scrollValue}%, var(--clr-bg-secondary) ${scrollValue}%)`);
            // ScrollProgress
            if (scrollUpPos > 100) {
                scrollElementWrap.addClass("active");
            } else {
                scrollElementWrap.removeClass("active");
            }

            if (scrollValue < 96) {
                $("#percentage-scroll-value").text(`${scrollValue}%`);
            } else {
                $("#percentage-scroll-value").html('<i class="unicon-arrow-up"></i>');
            }
        }
        window.onscroll = scrollPercentage;
        window.onload = scrollPercentage;

        // Back to Top
        function scrollUp() {
            document.documentElement.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        $("#percentage-scroll").on("click", scrollUp);
    }
    scrollUpPercentage();

    /*--------------------------------------------------------------
    slick slider
    --------------------------------------------------------------*/
    function slick_activation() {
    
        if ($.exists('.banner-slider')) {
            $('.banner-slider').slick({
                slidesToShow: 1,
                autoplay: true,
                arrows: true,
                dots: true,
                speed: 700,
                fade: true,
                cssEase: 'linear',
                prevArrow: '<button class="wnr-slide-arrow prev-arrow"><i class="unicon-chevron-left"></i></button>',
                nextArrow: '<button class="wnr-slide-arrow next-arrow"><i class="unicon-chevron-right"></i></button>',
                responsive: [{
                    breakpoint: 1199,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 576,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
                ]
            });
        }

        if ($.exists('.service-activation')) {
            $('.service-activation').slick({
                infinite: true,
                slidesToShow: 4,
                slidesToScroll: 1,
                arrows: true,
                dots: true,
                prevArrow: '<button class="wnr-slide-arrow prev-arrow"><i class="unicon-chevron-left"></i></button>',
                nextArrow: '<button class="wnr-slide-arrow next-arrow"><i class="unicon-chevron-right"></i></button>',
                responsive: [{
                    breakpoint: 1199,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
                {
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 576,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
                ]
            });
        }

        if ($.exists('.team-activation')) {
            $('.team-activation').slick({
                infinite: true,
                slidesToShow: 4,
                slidesToScroll: 1,
                arrows: true,
                dots: true,
                prevArrow: '<button class="wnr-slide-arrow prev-arrow"><i class="unicon-chevron-left"></i></button>',
                nextArrow: '<button class="wnr-slide-arrow next-arrow"><i class="unicon-chevron-right"></i></button>',
                responsive: [{
                    breakpoint: 1199,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
                {
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 576,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
                ]
            });
        }

        if ($.exists('.testi-activation')) {
            $('.testi-activation').slick({
                infinite: true,
                slidesToShow: 3,
                slidesToScroll: 1,
                arrows: true,
                dots: true,
                prevArrow: '<button class="wnr-slide-arrow prev-arrow"><i class="unicon-chevron-left"></i></button>',
                nextArrow: '<button class="wnr-slide-arrow next-arrow"><i class="unicon-chevron-right"></i></button>',
                responsive: [{
                    breakpoint: 1199,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
                {
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 576,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
                ]
            });
        }

        if ($.exists('.blog-activation')) {
            $('.blog-activation').slick({
                infinite: true,
                slidesToShow: 3,
                slidesToScroll: 1,
                arrows: true,
                dots: true,
                prevArrow: '<button class="wnr-slide-arrow prev-arrow"><i class="unicon-chevron-left"></i></button>',
                nextArrow: '<button class="wnr-slide-arrow next-arrow"><i class="unicon-chevron-right"></i></button>',
                responsive: [{
                    breakpoint: 1199,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
                {
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 576,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
                ]
            });
        }
    }

    /*--------------------------------------------------------------
    skill progress
    --------------------------------------------------------------*/
    function skill_progress() {
        if ($(".count-bar").length) {
            $(".count-bar").appear(
                function () {
                    var el = $(this);
                    var percent = el.data("percent");
                    $(el).css("width", percent).addClass("counted");
                }, {
                accY: -50
            }
            );
        }
    }

    /*--------------------------------------------------------------
    count number
    --------------------------------------------------------------*/
    function counter_num() {
        $(".count").counterUp({
            delay: 100,
            time: 2000,
        });
    }
    $(document).ready(function () {
        counter_num();
    });

    /*--------------------------------------------------------------
    magnificPopup image view
    --------------------------------------------------------------*/
    function magnific_popup() {
        $(".popup-image").magnificPopup({
            type: "image",
            gallery: {
                enabled: true,
            },
        });
        $(".popup-video").magnificPopup({
            type: "iframe",
        });
    }

    /*--------------------------------------------------------------
    fancybox popup view
    --------------------------------------------------------------*/
    function fancybox_popup() {
        $('.lightbox-image').fancybox({
            openEffect: 'fade',
            closeEffect: 'fade',
            helpers: {
                media: {}
            }
        });
    }

    /*--------------------------------------------------------------
    data css background
    --------------------------------------------------------------*/
    $("[data-background").each(function () {
        $(this).css("background-image", "url( " + $(this).attr("data-background") + "  )");
    });

    $("[data-width]").each(function () {
        $(this).css("width", $(this).attr("data-width"));
    });

    $("[data-bg-color]").each(function () {
        $(this).css("background-color", $(this).attr("data-bg-color"));
    });

    /*--------------------------------------------------------------
    jarallax js
    --------------------------------------------------------------*/
    if ($('.jarallax').length > 0) {
        $('.jarallax').jarallax({
            speed: 0.2,
            imgWidth: 1366,
            imgHeight: 768
        });
    };

    /*--------------------------------------------------------------
    parallaxie js
    --------------------------------------------------------------*/
    var $parallaxie = $('.parallaxie');
    if ($parallaxie.length && ($window.width() > 991)) {
        if ($window.width() > 768) {
            $parallaxie.parallaxie({
                speed: 0.55,
                offset: 0,
            });
        }
    }

    /*--------------------------------------------------------------
    images loaded
    --------------------------------------------------------------*/
    function images_loaded() {
        $('.grid').imagesLoaded(function () {
            var $grid = $('.grid').isotope({
                itemSelector: '.grid-item',
                layoutMode: 'fitRows'
            });

            $('.masonary-menu').on('click', 'button', function () {
                var filterValue = $(this).attr('data-filter');
                $grid.isotope({ filter: filterValue });
            });
            $('.masonary-menu button').on('click', function (event) {
                $(this).siblings('.active').removeClass('active');
                $(this).addClass('active');
                event.preventDefault();
            });
        });
    }

    /*--------------------------------------------------------------
    background img to section
    --------------------------------------------------------------*/
    $('.bg-img').each(function () {
        var imgSrc = $(this).children('img').attr('src');
        $(this).parent().css({
            'background-image': 'url(' + imgSrc + ')',
            'background-size': 'cover',
            'background-position': 'center',
        });
        $(this).parent().addClass('bg-img');
        if ($(this).hasClass('background-size-auto')) {
            $(this).parent().addClass('background-size-auto');
        }
        $(this).remove();
    });

    /*--------------------------------------------------------------
    nice select
    --------------------------------------------------------------*/
    $('select').niceSelect();

})(jQuery);