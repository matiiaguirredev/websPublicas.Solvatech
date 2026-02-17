(function() {
  "use strict";


      // Menu JS
    /*==============================================================*/
    $('nav a').on('click', function (e) {
      var anchor = $(this);
      $('html, body').stop().animate({
          scrollTop: $(anchor.attr('href')).offset().top - 50
      }, 50);
      e.preventDefault();
  });

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();

// showalert para la web  NO ES NECESARIO, solo se uso para ver como funcionaba el error.
// function showAlert(type, message) {
//   let errorMessagePrefix = message.split(":")[0];
//   let content = `
//   <div class="text-light alert bg-${type} alert-dismissible fade show" role="alert">
//       <strong>${errorMessagePrefix}</strong>:${message.substring(errorMessagePrefix.length + 1)}
//       <button type="button" class="btn-close close" data-bs-dismiss="alert" aria-label="Close"></button>
//   </div>
//   `;
//   $(".alert-content").html(content);
//   setTimeout(() => {
//       $(".alert-content .close").click();
//   }, 3000);
// }

function showAlert(type, message) {
  let errorMessagePrefix = message.split(':')[0];
  let originalTitle = document.title;
  let alertTitle = errorMessagePrefix;
  let alertMessage = message.substring(errorMessagePrefix.length + 1);
  let iconType = (type === 'success') ? 'success' : (type === 'warning') ? 'warning' : 'error';

  // Cambiar el título de la página
  document.title = '🔔 ' + alertTitle;

  // // Reproducir un sonido
  // let audio = new Audio('notification.mp3');
  // audio.play();

  Swal.fire({
      title: alertTitle,
      text: alertMessage,
      icon: iconType,
      timer: 3000,
      showConfirmButton: false
  }).then(() => {
      // Restaurar el título de la página
      document.title = originalTitle;
  });

  // Restaurar el título de la página después de 5 segundos si el usuario no interactúa con la alerta
  setTimeout(() => {
      document.title = originalTitle;
  }, 3000);
}

const $form = $('#contactForm2');
let $exist = true;
function onSubmit(token) {
    // console.log("TOKEN: ",  token);
    // console.log("exist: ",  $exist);

    if ($exist) {
        // Comprobamos si el formulario es válido
        if ($form[0].checkValidity()) {
            // Deshabilitamos los campos del formulario
            // $form.find('input, select, textarea, button').prop("disabled", true);
            $form.find('button').prop("disabled", true);

            $exist = false;
            // Enviamos el formulario
            $form.trigger('submit'); // Activamos el evento submit para capturarlo con jQuery
            // console.log("entramos al if");
            
          } else {
            // Si no es válido, mostramos los mensajes de error del navegador
            $form[0].reportValidity();
            // console.log("entramos al else");
        }
        
    }
}

function showAlert(type, message) {
  let errorMessagePrefix = message.split(':')[0];
  let originalTitle = document.title;
  let alertTitle = errorMessagePrefix;
  let alertMessage = message.substring(errorMessagePrefix.length + 1);
  let iconType = (type === 'success') ? 'success' : (type === 'warning') ? 'warning' : 'error';

  // Cambiar el título de la página
  document.title = '🔔 ' + alertTitle;

  // // Reproducir un sonido
  // let audio = new Audio('notification.mp3');
  // audio.play();

  Swal.fire({
      title: alertTitle,
      text: alertMessage,
      icon: iconType,
      timer: 3000,
      showConfirmButton: false
  }).then(() => {
      // Restaurar el título de la página
      document.title = originalTitle;
  });

  // Restaurar el título de la página después de 5 segundos si el usuario no interactúa con la alerta
  setTimeout(() => {
      document.title = originalTitle;
  }, 3000);
}

// animated-text

new TypeIt("#myElement", {
  strings: "This will be typed!",
}).go(); // <!-- This will make it `go`.

// Or!

const myTypeItInstance = new TypeIt("#myElement", {
  strings: "This will be typed!",
});

myTypeItInstance.go();

