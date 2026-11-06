/**
 * Generic marquee: horizontal auto-scroll, pause on hover.
 * Targets any element with data-marquee. Speed controlled by data-marquee-speed (number, default 0.5).
 */

(function () {
  'use strict';

  var DEFAULT_SPEED = 0.5;

  function parseSpeed(value) {
    if (value === null || value === undefined || value === '') {
      return DEFAULT_SPEED;
    }
    var n = parseFloat(value, 10);
    return isNaN(n) || n <= 0 ? DEFAULT_SPEED : n;
  }

  function initMarquee(el) {
    var speed = parseSpeed(el.getAttribute('data-marquee-speed'));
    var paused = false;
    var rafId = null;
    var position = 0;

    function tick() {
      if (paused) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      var maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      position += speed;
      el.scrollLeft = position;
      if (position >= maxScroll) {
        position = 0;
        el.scrollLeft = 0;
      }
      rafId = requestAnimationFrame(tick);
    }

    function onEnter() {
      paused = true;
    }

    function onLeave() {
      paused = false;
    }

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(tick);
  }

  function init() {
    var marquees = document.querySelectorAll('[data-marquee]');
    for (var i = 0; i < marquees.length; i++) {
      initMarquee(marquees[i]);
    }
  }

  function initGalleryLazy() {
    var gallery = document.querySelector('.gallery');
    if (!gallery) return;
    var images = gallery.querySelectorAll('img[data-src]');
    if (images.length === 0) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var section = entry.target;
          section.querySelectorAll('img[data-src]').forEach(function (img) {
            var src = img.getAttribute('data-src');
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
          });
          observer.unobserve(section);
        });
      },
      { rootMargin: '200px', threshold: 0 }
    );
    observer.observe(gallery);
  }

  /**
   * Scroll-triggered Animate.css: when elements with data-scroll-animate enter view,
   * add animate__animated + animate__{animationName}. Animation names: fadeInUp, fadeInLeft,
   * fadeInRight, zoomIn, bounceInUp, etc. (see https://animate.style/)
   */
  function initScrollAnimate() {
    var selector = '[data-scroll-animate]';
    var elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var animation = (el.getAttribute('data-scroll-animate') || 'fadeInUp').trim();
          var prefix = 'animate__';
          el.classList.add(prefix + 'animated', prefix + animation);
          observer.unobserve(el);
        });
      },
      { rootMargin: '0px 0px 120px 0px', threshold: 0 }
    );
    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /**
   * Google Ads click conversions. Labels are set in _config.yml (google_ads.conversions)
   * and exposed as window.adsConversions in head.html. Empty label = not tracked.
   */
  function classifyContactLink(href) {
    if (!href) return null;
    if (href.indexOf('wa.me/') !== -1 || href.indexOf('api.whatsapp.com') !== -1) return 'whatsapp';
    if (href.indexOf('tel:') === 0) return 'phone';
    if (href.indexOf('google.com/maps') !== -1 || href.indexOf('maps.app.goo.gl') !== -1) return 'directions';
    return null;
  }

  function initConversionTracking() {
    var cfg = window.adsConversions;
    if (!cfg || typeof window.gtag !== 'function') return;
    document.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('a[href]') : null;
      if (!link) return;
      var type = classifyContactLink(link.getAttribute('href'));
      if (!type || !cfg[type]) return;
      window.gtag('event', 'conversion', { send_to: cfg.id + '/' + cfg[type] });
    });
  }

  function onReady() {
    init();
    initGalleryLazy();
    initScrollAnimate();
    initConversionTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
