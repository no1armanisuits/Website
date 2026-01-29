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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
