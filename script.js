/* ==========================================
   1. TIMECODE DIGITALE CINEMATOGRAFICO (24fps)
   ========================================== */
(function(){
  var timecodeEl = document.getElementById('timecode');
  if (!timecodeEl) return; 
  
  var startTime = performance.now();
  function pad(n) { return n.toString().padStart(2, '0'); }
  function updateTimecode() {
    var elapsed = performance.now() - startTime;
    var totalFrames = Math.floor(elapsed / 1000 * 24);
    var ff = totalFrames % 24;
    var totalSeconds = Math.floor(totalFrames / 24);
    var ss = totalSeconds % 60;
    var mm = Math.floor(totalSeconds / 60) % 60;
    var hh = Math.floor(totalSeconds / 3600);
    timecodeEl.textContent = pad(hh) + ':' + pad(mm) + ':' + pad(ss) + ':' + pad(ff);
  }
  setInterval(updateTimecode, 1000 / 24);
})();

/* ==========================================
   2. GESTIONE MULTILINGUA (IT / EN) CON MEMORIA
   ========================================== */
(function(){
  var buttons = document.querySelectorAll('.lang-btn');
  var translateElements = document.querySelectorAll('.translate');
  if (buttons.length === 0) return;

  function setLanguage(lang) {
    buttons.forEach(function(btn) {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    translateElements.forEach(function(el) {
      var text = el.getAttribute('data-' + lang);
      if (text) { el.innerHTML = text; }
    });

    localStorage.setItem('selectedLanguage', lang);
    document.documentElement.setAttribute('lang', lang);
  }

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  var savedLang = localStorage.getItem('selectedLanguage') || 'it';
  setLanguage(savedLang);
})();

/* ==========================================
   3. ANIMAZIONI ALLA COMPARSA (SCROLL REVEAL)
   ========================================== */
(function(){
  var revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length === 0) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach(function(el) { observer.observe(el); });
})();

/* ==========================================
   4. NAVBAR & MIRINO HERO INTERFACCIA
   ========================================== */
window.addEventListener('scroll', function() {
  var nav = document.getElementById('mainNav');
  if (!nav) return;
  if (window.scrollY > 50) {
    nav.classList.add('is-scrolled');
  } else {
    nav.classList.remove('is-scrolled');
  }
});

window.addEventListener('DOMContentLoaded', function() {
  var c1 = document.getElementById('c1');
  if (!c1) return; 
  
  setTimeout(function(){ document.getElementById('c1').classList.add('is-on'); }, 200);
  setTimeout(function(){ document.getElementById('c2').classList.add('is-on'); }, 350);
  setTimeout(function(){ document.getElementById('c3').classList.add('is-on'); }, 500);
  setTimeout(function(){ document.getElementById('c4').classList.add('is-on'); }, 650);
  
  setTimeout(function(){ document.getElementById('hEyebrow').classList.add('is-on'); }, 500);
  setTimeout(function(){ document.getElementById('hTitle').classList.add('is-on'); }, 700);
  setTimeout(function(){ document.getElementById('hSub').classList.add('is-on'); }, 900);
  setTimeout(function(){ document.getElementById('hCta').classList.add('is-on'); }, 1100);
});

/* ==========================================
   5. FILTRI PORTFOLIO FLUIDI (FLIP ANIMATION)
   ========================================== */
(function(){
  var buttons = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.work-card');
  if (buttons.length === 0) return;

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      buttons.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      
      var filter = btn.getAttribute('data-filter');

      var firstPositions = [];
      cards.forEach(function(card) {
        var rect = card.getBoundingClientRect();
        firstPositions.push({
          element: card,
          top: rect.top,
          left: rect.left,
          wasVisible: rect.width > 0 && rect.height > 0
        });
      });

      cards.forEach(function(card) {
        var cats = card.getAttribute('data-cat') ? card.getAttribute('data-cat').split(' ') : [];
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('is-hidden');
          card.style.display = 'block';
        } else {
          card.classList.add('is-hidden');
          card.style.display = 'none'; 
        }
      });

      firstPositions.forEach(function(item) {
        if (item.element.classList.contains('is-hidden') || !item.wasVisible) return;

        var rect = item.element.getBoundingClientRect();
        var deltaX = item.left - rect.left;
        var deltaY = item.top - rect.top;

        if (deltaX !== 0 || deltaY !== 0) {
          item.element.style.transform = 'translate(' + deltaX + 'px, ' + deltaY + 'px)';
          item.element.style.transition = 'none';

          requestAnimationFrame(function() {
            item.element.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            item.element.style.transform = 'none';
          });
        }
      });
    });
  });
})();

/* ==========================================
   6. INTERFACCIA UTENTE MOBILE (MENU BURGER)
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');
  
  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      mobileMenu.classList.add('is-open'); 
    });

    if (closeMenu) {
      closeMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
      });
    }

    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
      });
    });
  }
});

/* ==========================================
   7. CREATIVE ELEMENTS (MARQUEE INFINITO)
   ========================================== */
(function() {
  const track = document.getElementById('marqueeTrack');
  if (track) {
    track.innerHTML += track.innerHTML;
  }
})();

/* ==========================================
   8. GESTIONE LIGHTBOX (ZOOM STILL FRAMES)
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (lightbox && lightboxImg) {
    galleryItems.forEach(item => {
      const img = item.querySelector('img');
      const btn = item.querySelector('.zoom-btn');

      const openLightbox = (e) => {
        e.stopPropagation(); 
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('is-active');
        document.body.style.overflow = 'hidden'; 
      };

      if(btn) btn.addEventListener('click', openLightbox);
      img.addEventListener('click', openLightbox);
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('is-active');
        document.body.style.overflow = ''; 
      });
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg && e.target !== lightboxClose) {
        lightbox.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
        lightbox.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    });
  }
});

/* ==========================================
   9. SICUREZZA & PRIVACY (EMAIL BOT-PROTECTION)
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
  const contactEmail = document.getElementById('contactEmail');
  
  if (contactEmail) {
    contactEmail.addEventListener('click', (e) => {
      e.preventDefault();
      
      const user = contactEmail.getAttribute('data-u');
      const domain = contactEmail.getAttribute('data-d');
      
      if (user && domain) {
        const fullEmail = `${user}@${domain}`;
        window.location.href = `mailto:${fullEmail}`;
      }
    });
  }
});

/* ==========================================
   TRANSIZIONE PAGINE (SHUTTER)
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Crea l'otturatore cinematico nel DOM se non esiste già
  if (!document.getElementById('pageShutter')) {
    const shutter = document.createElement('div');
    shutter.id = 'pageShutter';
    shutter.className = 'page-shutter';
    document.body.appendChild(shutter);
  }

  // Riapre l'otturatore all'avvio della pagina
  setTimeout(() => {
    document.body.classList.add('shutter-ready');
  }, 50);

  // Intercetta i click sui link interni per fare il fade-out cinematico
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    const target = link.getAttribute('target');

    // Salta i link esterni, le ancore interne (#), i mailto e i target blank
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || target === '_blank' || link.id === 'contactEmail') {
      return;
    }

    e.preventDefault();
    document.body.classList.remove('shutter-ready');

    setTimeout(() => {
      window.location.href = href;
    }, 450); // Tempo allineato alla transizione CSS
  });
});

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    document.body.classList.add('shutter-ready');
  }
});

/* ==========================================
   CUSTOM FLOATING LABEL SUI PROGETTI (VIEW)
   ========================================== */
(function(){
  // Disattiva il tracciamento del mouse su interfacce touch/mobile
  if (window.matchMedia("(pointer: coarse)").matches) return;

  document.addEventListener("DOMContentLoaded", () => {
    // Genera la struttura contenitore per il testo fluttuante
    const floatingLabel = document.createElement('div');
    floatingLabel.id = 'projectFloatingLabel';
    floatingLabel.className = 'custom-cursor-label';
    floatingLabel.innerHTML = '<span class="cursor-label"></span>';
    document.body.appendChild(floatingLabel);

    const textInner = floatingLabel.querySelector('.cursor-label');

    let mouseX = 0, mouseY = 0;
    let labelX = 0, labelY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Effetto Lerp (ammortizzamento) per rendere lo scorrimento del testo felpato e cinematico
    function animateLabel() {
      const lerpFactor = 0.18;
      labelX += (mouseX - labelX) * lerpFactor;
      labelY += (mouseY - labelY) * lerpFactor;
      
      floatingLabel.style.transform = `translate3d(${labelX}px, ${labelY}px, 0)`;
      requestAnimationFrame(animateLabel);
    }
    requestAnimationFrame(animateLabel);

    // Attiva la comparsa della targhetta ESCLUSIVAMENTE sulle card dei progetti o elementi della galleria
    const targets = document.querySelectorAll('.work-card, .gallery-item');
    
    targets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        textInner.textContent = "VIEW";
        floatingLabel.classList.add('is-visible');
      });

      el.addEventListener('mouseleave', () => {
        floatingLabel.classList.remove('is-visible');
        textInner.textContent = "";
      });
    });

    document.addEventListener('mouseleave', () => floatingLabel.classList.remove('is-visible'));
  });
})();

/* ==========================================
   CINEMA MODE (LIGHTS OFF)
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
  const videoWrapper = document.querySelector('.video-wrapper');
  if (!videoWrapper) return;

  // Crea l'interruttore e lo posiziona sopra il video box
  const cinemaBtn = document.createElement('button');
  cinemaBtn.className = 'cinema-toggle-btn';
  cinemaBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
    <span class="translate" data-it="MODALITÀ CINEMA" data-en="CINEMA MODE">MODALITÀ CINEMA</span>
  `;
  
  videoWrapper.parentNode.insertBefore(cinemaBtn, videoWrapper);

  cinemaBtn.addEventListener('click', () => {
    document.body.classList.toggle('cinema-mode-active');
    
    // Aggiorna lo stato del testo
    const isCinema = document.body.classList.contains('cinema-mode-active');
    const currentLang = document.documentElement.getAttribute('lang') || 'it';
    
    if (isCinema) {
      cinemaBtn.querySelector('span').textContent = currentLang === 'en' ? 'LIGHTS ON' : 'ACCENDI LUCI';
    } else {
      cinemaBtn.querySelector('span').textContent = currentLang === 'en' ? 'CINEMA MODE' : 'MODALITÀ CINEMA';
    }
  });
});