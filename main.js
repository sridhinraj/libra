// ============================================================
// LIBRA GROUP UAE — AAA Creative Engine & Performance Controller
// ============================================================

// Initialize Lenis for smooth scrolling (disabled for reduced motion)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;

if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      if (lenis) lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } catch (e) {
    console.warn('Lenis smooth scroll initialization skipped:', e);
  }
}

// Initialize Custom Cursor with null-checks & touch exclusion
const cursor = document.getElementById('custom-cursor');
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

if (cursor && !isTouchDevice && !prefersReducedMotion) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }, { passive: true });

  document.querySelectorAll('a, button, .glass-card, .srv-card-3d, .int-pillar-card, .blog-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });
} else if (cursor) {
  cursor.style.display = 'none';
}

// ============================================================
//  PREMIUM GLASS BUTTON SYSTEM — Micro-Interactions
// ============================================================
(function initGlassButtons() {
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  if (prefersReducedMotion) return;

  document.querySelectorAll('.btn, .glass-btn').forEach(btn => {
    // 1. Inject mouse-glow layer if not present
    if (!btn.querySelector('.btn-mouse-glow')) {
      const glow = document.createElement('span');
      glow.className = 'btn-mouse-glow';
      glow.setAttribute('aria-hidden', 'true');
      btn.appendChild(glow);
    }

    // 2. Wrap text nodes in <span> for z-index stacking
    btn.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const s = document.createElement('span');
        s.textContent = node.textContent;
        btn.replaceChild(s, node);
      }
    });

    if (isMobile()) return;

    // 3. Mouse-follow radial highlight
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%';
      const y = ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
      btn.style.setProperty('--mx', x);
      btn.style.setProperty('--my', y);
    }, { passive: true });

    // 4. Subtle 3D tilt on hover
    const MAX_TILT = 3.5;
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const rx = ((e.clientY - cy) / (r.height / 2)) * -MAX_TILT;
      const ry = ((e.clientX - cx) / (r.width / 2)) * MAX_TILT;
      btn.style.transform = `translateY(-2px) scale(1.015) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });

    // 5. Press feedback
    btn.addEventListener('pointerdown', () => {
      btn.style.transform = 'scale(0.97)';
      btn.style.transitionDuration = '120ms';
    });
    btn.addEventListener('pointerup', () => {
      btn.style.transitionDuration = '';
      btn.style.transform = '';
    });
  });
})();

// GSAP ScrollTrigger Animations
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
  try {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.srv-card-3d').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        y: 60,
        opacity: 0,
        rotationX: -8,
        duration: 0.85,
        ease: 'power3.out',
        delay: (i % 3) * 0.08
      });
    });
  } catch (err) {
    console.warn('GSAP ScrollTrigger setup failed:', err);
  }
}

// Three.js Hero Sphere setup with Performance & Fallback Guards
(function initThreeHero() {
  const container = document.getElementById('canvas-container');
  if (!container || prefersReducedMotion || typeof THREE === 'undefined') return;

  try {
    const CRIMSON = 0xdc143c, WHITE = 0xffffff;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.1, 9.5);

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xffffff);
    function panel(w, h, x, y, z, color, power) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
    }
    panel(12, 3, 0, 8, 2, WHITE, 3);
    panel(3, 10, -8, 0, 3, CRIMSON, 4);
    panel(3, 10, 8, 0, -3, WHITE, 2.5);
    panel(8, 2, 0, -7, 4, CRIMSON, 3);
    panel(6, 6, 0, 2, -9, WHITE, 1.5);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(envScene, 0.02).texture;
    scene.environment = envMap;

    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const key = new THREE.PointLight(WHITE, 1.2, 30); key.position.set(5, 6, 6); scene.add(key);
    const rim = new THREE.PointLight(CRIMSON, 2.2, 30); rim.position.set(-6, -2, -4); scene.add(rim);

    const root = new THREE.Group();
    scene.add(root);

    const glass = new THREE.Mesh(new THREE.SphereGeometry(1.25, 48, 48), new THREE.MeshPhysicalMaterial({
      color: 0x1a0308, metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.5, clearcoat: 1, side: THREE.DoubleSide
    }));
    root.add(glass);

    const lattice = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.78, 2)), new THREE.LineBasicMaterial({ color: CRIMSON, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
    root.add(lattice);

    // Orbital rings
    const specs = [
      { r: 1.65, tilt: [0.25, 0, 0.1], spd: 0.30, col: WHITE },
      { r: 1.88, tilt: [1.0, 0.3, 0.2], spd: -0.24, col: CRIMSON },
      { r: 2.11, tilt: [-0.7, 0.5, 0.9], spd: 0.20, col: WHITE },
    ];
    const rings = [];
    specs.forEach((s, i) => {
      const g = new THREE.Group();
      g.rotation.set(s.tilt[0], s.tilt[1], s.tilt[2]);
      const spin = new THREE.Group();
      g.add(spin);
      const band = new THREE.Mesh(new THREE.TorusGeometry(s.r, 0.018, 20, 48), new THREE.MeshStandardMaterial({ color: s.col, metalness: 1, roughness: 0.3 }));
      spin.add(band);
      const pivot = new THREE.Group();
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), new THREE.MeshStandardMaterial({ color: s.col, emissive: s.col, metalness: 0.4 }));
      bead.position.x = s.r;
      pivot.add(bead);
      pivot.rotation.z = i * 1.05;
      g.add(pivot);
      root.add(g);
      rings.push({ spin, pivot, spd: s.spd });
    });

    function updateSphereLayout() {
      const w = window.innerWidth;
      if (w > 1100) {
        root.position.set(2.35, 0.1, 0);
        root.scale.setScalar(1.0);
      } else if (w > 820) {
        root.position.set(1.6, 0.1, 0);
        root.scale.setScalar(0.85);
      } else {
        root.position.set(0.4, 0.2, -1.0);
        root.scale.setScalar(0.65);
      }
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
      updateSphereLayout();
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5);
      ty = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    // Use IntersectionObserver to pause rendering when hero is off-screen
    let isVisible = true;
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      const heroSec = document.getElementById('hero') || container;
      heroObserver.observe(heroSec);
    }

    const clock = new THREE.Clock();
    let animId = null;

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return; // Save CPU/GPU battery when scrolled away

      const t = clock.getElapsedTime();
      cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
      root.rotation.y = cx + t * 0.06;
      root.rotation.x = cy * 0.8 + Math.sin(t * 0.4) * 0.05;
      rings.forEach((r, i) => {
        r.spin.rotation.z = t * r.spd;
        r.pivot.rotation.z = t * r.spd * 1.8 + i;
      });
      lattice.rotation.y = t * 0.15;
      const flagEl = document.querySelector('.hero-uae-flag');
      if (flagEl) {
        flagEl.style.transform = `translate3d(${cx * -22}px, ${cy * -14}px, 0)`;
      }
      renderer.render(scene, camera);
    }
    animate();
  } catch (err) {
    console.warn('Three.js canvas setup failed or WebGL not available:', err);
  }
})();

// ============================================================
//  3D GLASSMORPHISM SHOWCASE GALLERY (Scroll-Controlled Sequence)
// ============================================================
(function init3DGlassShowcase() {
  const container = document.getElementById('heroGlassBox');
  const stage = document.getElementById('glassStage');
  const counter = document.getElementById('glassCounter');
  const progressFill = document.getElementById('glassProgressFill');
  const prevBtn = document.getElementById('glassPrevBtn');
  const nextBtn = document.getElementById('glassNextBtn');

  if (!container || !stage) return;

  const SHOWCASE_IMAGES = [
    'ref image/ezgif-frame-001.jpg',
    'ref image/ezgif-frame-014.jpg',
    'ref image/ezgif-frame-027.jpg',
    'ref image/ezgif-frame-040.jpg',
    'ref image/ezgif-frame-053.jpg',
    'ref image/ezgif-frame-066.jpg',
    'ref image/ezgif-frame-079.jpg',
    'ref image/ezgif-frame-092.jpg',
    'ref image/ezgif-frame-105.jpg',
    'ref image/ezgif-frame-118.jpg',
    'ref image/ezgif-frame-132.jpg',
    'ref image/ezgif-frame-145.jpg',
    'ref image/ezgif-frame-158.jpg',
    'ref image/ezgif-frame-171.jpg',
    'ref image/ezgif-frame-184.jpg',
    'ref image/ezgif-frame-197.jpg',
    'ref image/ezgif-frame-210.jpg',
    'ref image/ezgif-frame-223.jpg',
    'ref image/ezgif-frame-236.jpg',
    'ref image/ezgif-frame-249.jpg'
  ];

  const total = SHOWCASE_IMAGES.length;
  const cards = [];
  const progressBar = document.getElementById('glassProgressBar');
  const playBtn = document.getElementById('glassPlayBtn');
  const glaze = container.querySelector('.glass-reflection-glaze');

  let currentProgress = 0;
  let targetProgress = 0;
  let cardPulse = 0;

  // Auto-play state
  let isPlaying = false;
  let autoplayTimer = null;

  function updatePlayButton() {
    if (!playBtn) return;
    playBtn.innerHTML = isPlaying ? '&#x23F8;' : '&#x25B6;';
    playBtn.setAttribute('title', isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play');
    playBtn.classList.toggle('playing', isPlaying);
  }

  function pauseAutoplay() {
    if (isPlaying) {
      isPlaying = false;
      clearTimeout(autoplayTimer);
      updatePlayButton();
    }
  }

  function runAutoplayCycle() {
    clearTimeout(autoplayTimer);
    if (!isPlaying) return;
    autoplayTimer = setTimeout(() => {
      if (!isPlaying) return;
      targetProgress = (Math.round(targetProgress) + 1) % total;
      runAutoplayCycle();
    }, 2400);
  }

  function toggleAutoplay() {
    isPlaying = !isPlaying;
    updatePlayButton();
    if (isPlaying) {
      runAutoplayCycle();
    } else {
      clearTimeout(autoplayTimer);
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAutoplay();
    });
  }

  // Generate 20 pure visual 3D cards with interactive click navigation
  SHOWCASE_IMAGES.forEach((src, idx) => {
    const card = document.createElement('div');
    card.className = 'glass-slide-card';
    card.setAttribute('data-index', idx);
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Jump to showcase slide ${idx + 1}`);
    card.innerHTML = `
      <div class="glass-slide-img-wrap">
        <img src="${src}" alt="Showcase frame ${idx + 1}" loading="${idx < 3 ? 'eager' : 'lazy'}" decoding="async" />
      </div>
    `;

    // Click card to jump or trigger pulse
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      pauseAutoplay();
      if (idx !== Math.round(targetProgress)) {
        targetProgress = idx;
      } else {
        cardPulse = 1.0;
      }
    });

    stage.appendChild(card);
    cards.push(card);
  });

  // 3D Glass Box Mouse Tilt / Parallax + Specular Glaze Tracking
  let mouseTiltX = 0, mouseTiltY = 0;
  let targetTiltX = 0, targetTiltY = 0;

  window.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (Math.abs(x) < 2.0 && Math.abs(y) < 2.0) {
      targetTiltX = y * -12; // tilt X degrees
      targetTiltY = x * 15;  // tilt Y degrees
    } else {
      targetTiltX = 0;
      targetTiltY = 0;
    }
  }, { passive: true });

  // Mouse wheel interaction inside showcase box
  container.addEventListener('wheel', (e) => {
    pauseAutoplay();
    const delta = e.deltaY;
    if (delta > 0) {
      if (targetProgress < total - 1) {
        e.preventDefault();
        targetProgress = Math.min(total - 1, targetProgress + 1);
      }
    } else if (delta < 0) {
      if (targetProgress > 0) {
        e.preventDefault();
        targetProgress = Math.max(0, targetProgress - 1);
      }
    }
  }, { passive: false });

  // Arrow controls
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pauseAutoplay();
      targetProgress = Math.max(0, targetProgress - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pauseAutoplay();
      targetProgress = Math.min(total - 1, targetProgress + 1);
    });
  }

  // Interactive Timeline Scrubber (Click or Drag on Progress Bar)
  function scrubProgress(e) {
    if (!progressBar) return;
    const rect = progressBar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    targetProgress = ratio * (total - 1);
    pauseAutoplay();
  }

  let isScrubbing = false;
  if (progressBar) {
    progressBar.addEventListener('pointerdown', (e) => {
      isScrubbing = true;
      progressBar.setPointerCapture(e.pointerId);
      scrubProgress(e);
    });

    progressBar.addEventListener('pointermove', (e) => {
      if (isScrubbing) scrubProgress(e);
    });

    const endScrub = (e) => {
      if (!isScrubbing) return;
      isScrubbing = false;
      targetProgress = Math.round(targetProgress);
      try { progressBar.releasePointerCapture(e.pointerId); } catch (_) {}
    };

    progressBar.addEventListener('pointerup', endScrub);
    progressBar.addEventListener('pointercancel', endScrub);
  }

  // Dual-Axis Drag / Swipe Gestures (Horizontal + Vertical with Fling Velocity)
  let isDragging = false;
  let startX = 0, startY = 0;
  let lastX = 0, lastY = 0;
  let startProgress = 0;
  let velocity = 0;
  let lastTime = 0;

  container.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || e.target.closest('#glassProgressBar')) return;
    pauseAutoplay();
    isDragging = true;
    startX = lastX = e.clientX;
    startY = lastY = e.clientY;
    startProgress = targetProgress;
    lastTime = performance.now();
    velocity = 0;
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTime);
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    
    // Support intuitive horizontal swipe (left = next, right = prev) and vertical drag
    const effectiveDiff = (startY - e.clientY) + (startX - e.clientX) * 1.35;
    targetProgress = Math.max(0, Math.min(total - 1, startProgress + effectiveDiff / 80));
    
    velocity = ((-dx * 1.35 - dy) / dt) * 14;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;
  });

  const endDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    // Fling momentum
    if (Math.abs(velocity) > 0.45) {
      targetProgress = Math.max(0, Math.min(total - 1, targetProgress + Math.sign(velocity)));
    }
    targetProgress = Math.round(targetProgress);
    try { container.releasePointerCapture(e.pointerId); } catch (_) {}
  };

  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);

  // Double Click anywhere inside glass box to reset to first frame
  container.addEventListener('dblclick', (e) => {
    if (e.target.closest('button')) return;
    pauseAutoplay();
    targetProgress = 0;
  });

  // Keyboard navigation when focusing glass box
  container.setAttribute('tabindex', '0');
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      pauseAutoplay();
      targetProgress = Math.min(total - 1, targetProgress + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      pauseAutoplay();
      targetProgress = Math.max(0, targetProgress - 1);
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      toggleAutoplay();
    }
  });

  // 3D Animation Render Loop with Inertia, Glare & Depth of Field
  function render3DShowcase() {
    requestAnimationFrame(render3DShowcase);

    // Smooth Lerp easing
    currentProgress += (targetProgress - currentProgress) * 0.12;
    mouseTiltX += (targetTiltX - mouseTiltX) * 0.08;
    mouseTiltY += (targetTiltY - mouseTiltY) * 0.08;

    // Decay tactile pulse
    if (cardPulse > 0.001) {
      cardPulse *= 0.88;
    } else {
      cardPulse = 0;
    }

    // Apply 3D perspective tilt to the glass box
    container.style.transform = `rotateX(${mouseTiltX.toFixed(2)}deg) rotateY(${mouseTiltY.toFixed(2)}deg)`;

    // Dynamic specular glaze refraction tracking
    if (glaze) {
      const angle = 135 + mouseTiltY * 1.8;
      const glarePos = Math.round(45 + mouseTiltY * 2.5);
      glaze.style.background = `linear-gradient(${angle.toFixed(1)}deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.18) ${glarePos}%, transparent 80%)`;
    }

    // Update Counter
    const activeIdx = Math.round(currentProgress);
    if (counter) {
      counter.textContent = `${String(activeIdx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }

    // Update Progress bar fill
    if (progressFill) {
      progressFill.style.width = `${((currentProgress + 1) / total) * 100}%`;
    }

    // Position each card in 3D camera space
    cards.forEach((card, idx) => {
      const delta = idx - currentProgress;
      const absDelta = Math.abs(delta);

      // Performance culling: hide cards far from focal plane
      if (absDelta > 3.2) {
        card.style.display = 'none';
        return;
      }
      card.style.display = 'flex';

      let z, scale, opacity, blur, y, rotX;

      if (delta >= 0) {
        // Active card and upcoming cards waiting behind in 3D depth
        z = -delta * 145;
        scale = Math.max(0.70, 1 - delta * 0.095);
        y = delta * 12;
        opacity = Math.max(0, 1 - delta * 0.38);
        blur = Math.min(12, delta * 3.4);
        rotX = delta * 2.2;
      } else {
        // Previous card moving backward/away
        z = delta * 165;
        scale = Math.max(0.62, 1 + delta * 0.14);
        y = delta * 18;
        opacity = Math.max(0, 1 + delta * 0.72);
        blur = Math.min(12, absDelta * 4.4);
        rotX = delta * 3.2;
      }

      // Add click pulse scaling to the active card
      if (absDelta < 0.35 && cardPulse > 0.01) {
        scale += Math.sin(cardPulse * Math.PI) * 0.045;
      }

      const zIndex = Math.round(100 - absDelta * 10);
      card.style.zIndex = zIndex;
      card.style.transform = `translate3d(0, ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale(${scale.toFixed(3)}) rotateX(${rotX.toFixed(2)}deg)`;
      card.style.opacity = Math.min(1, Math.max(0, opacity)).toFixed(3);
      card.style.filter = `blur(${blur.toFixed(1)}px)`;

      // Specular highlight on active card
      if (absDelta < 0.35) {
        card.style.boxShadow = `0 32px 64px -12px rgba(15, 23, 42, 0.24), 0 12px 24px -8px rgba(196, 18, 23, 0.18), inset 0 0 0 1.5px rgba(255, 255, 255, 0.95)`;
      } else {
        card.style.boxShadow = `0 16px 32px -10px rgba(15, 23, 42, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.35)`;
      }
    });
  }

  render3DShowcase();
})();

