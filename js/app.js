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

  heroCanvas();
  quoteBuilder();
})();
