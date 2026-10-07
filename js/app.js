// Hero canvas and quote builder. Progressive: the page is complete without this file.
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero: wireframe perimeter with a patrol point orbiting it. */
  function heroCanvas() {
    var canvas = document.querySelector('[data-hero3d]');
    if (!canvas || reduced || !window.THREE) { return; }

    var THREE = window.THREE;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (err) {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 1.6, 7.2);
    camera.lookAt(0, 0, 0);

    var accent = new THREE.Color('#976C01');
    var rule = new THREE.Color('#C9BFA4');

    var group = new THREE.Group();
    scene.add(group);

    var ring = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.TorusGeometry(2.6, 0.5, 6, 44)),
      new THREE.LineBasicMaterial({ color: rule, transparent: true, opacity: 0.55 })
    );
    ring.rotation.x = Math.PI / 2.35;
    group.add(ring);

    var inner = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.TorusGeometry(1.5, 0.02, 3, 60)),
      new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.5 })
    );
    inner.rotation.x = Math.PI / 2.35;
    group.add(inner);

    var patrol = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 12),
      new THREE.MeshBasicMaterial({ color: accent })
    );
    group.add(patrol);

    function resize() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      if (!w || !h) { return false; }
      if (canvas.width !== w || canvas.height !== h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      return true;
    }

    var running = true;
    var t = 0;
    function frame() {
      if (!running) { return; }
      window.requestAnimationFrame(frame);
      if (!resize()) { return; }
      t += 0.004;
      group.rotation.y = t;
      group.rotation.x = Math.sin(t * 0.6) * 0.06;
      patrol.position.set(Math.cos(t * 2.4) * 2.6, Math.sin(t * 1.3) * 0.18, Math.sin(t * 2.4) * 2.6);
      renderer.render(scene, camera);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !running) { running = true; frame(); }
          else if (!entry.isIntersecting) { running = false; }
        });
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; frame(); }
    });

    canvas.setAttribute('data-ready', 'true');
    frame();
  }

  /* Quote builder: selects compose a briefing and a WhatsApp link. */
  function quoteBuilder() {
    var form = document.querySelector('[data-quote]');
    if (!form) { return; }
    var preview = form.querySelector('[data-quote-preview]');
    var send = form.querySelector('[data-quote-send]');
    if (!preview || !send) { return; }

    var base = send.getAttribute('href').split('?')[0];

    function value(name) {
      var el = form.elements[name];
      return el ? el.value : '';
    }

    function update() {
      var lines = [
        'Olá! Gostaria de um orçamento de segurança patrimonial.',
        'Local: ' + value('tipo'),
        'Cobertura: ' + value('cobertura'),
        'Postos: ' + value('postos'),
        'Período: ' + value('periodo')
      ];
      var text = lines.join('\n');
      preview.textContent = text;
      send.setAttribute('href', base + '?text=' + encodeURIComponent(text));
    }

    form.addEventListener('change', update);
    form.addEventListener('submit', function (event) { event.preventDefault(); });
    update();
  }

  /* Reveal on scroll. Without script the page stays visible, so this is additive. */
  function reveal() {
    if (reduced || !('IntersectionObserver' in window)) { return; }

    var targets = [].slice.call(document.querySelectorAll('.hero__inner > *, .section > .container'));
    if (!targets.length) { return; }

    document.documentElement.classList.add('js-reveal');

    targets.forEach(function (target, index) {
      target.setAttribute('data-reveal', '');
      if (target.parentNode && target.parentNode.classList.contains('hero__inner') && index === 1) {
        target.setAttribute('data-reveal-delay', '1');
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    targets.forEach(function (target) { observer.observe(target); });
  }

  /* Carrossel de imagens, acessível por teclado e por toque. */
  function imageSlider() {
    var root = document.querySelector('[data-slider]');
    if (!root) { return; }
    var track = root.querySelector('[data-slider-track]');
    var dots = root.querySelector('[data-slider-dots]');
    var prev = root.querySelector('[data-slider-prev]');
    var next = root.querySelector('[data-slider-next]');
    if (!track || !dots || !prev || !next) { return; }

    var slides = [].slice.call(track.children);
    if (slides.length < 2) { return; }

    var index = 0;
    var buttons = slides.map(function (slide, i) {
      var li = document.createElement('li');
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'slider__dot';
      var label = document.createElement('span');
      label.className = 'visually-hidden';
      label.textContent = 'Imagem ' + (i + 1);
      button.appendChild(label);
      button.addEventListener('click', function () { go(i); });
      li.appendChild(button);
      dots.appendChild(li);
      return button;
    });

    function go(target) {
      index = (target + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (index * -100) + '%)';
      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      buttons.forEach(function (button, i) {
        button.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }

    prev.addEventListener('click', function () { go(index - 1); });
    next.addEventListener('click', function () { go(index + 1); });

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    });

    var startX = null;
    root.addEventListener('touchstart', function (event) {
      startX = event.touches[0].clientX;
    }, { passive: true });
    root.addEventListener('touchend', function (event) {
      if (startX === null) { return; }
      var delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 45) { go(index + (delta < 0 ? 1 : -1)); }
      startX = null;
    });

    go(0);
  }

  reveal();
  heroCanvas();
  quoteBuilder();
  imageSlider();
})();
