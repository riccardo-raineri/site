/* ==========================================
   1. TIMECODE DIGITALE CINEMATOGRAFICO (24fps)
   ========================================== */
(function(){
  var timecodeEl = document.getElementById('timecode');
  if (!timecodeEl) return; // Se l'elemento non c'è nella pagina, lo script non va in errore
  
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

  // Recupera la lingua salvata, altrimenti usa l'italiano
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
   4. COMPORTAMENTI SPECIFICI DELLA HOME PAGE
   ========================================== */
// Cambio stile Navbar allo Scroll
window.addEventListener('scroll', function() {
  var nav = document.getElementById('mainNav');
  if (!nav) return;
  if (window.scrollY > 50) {
    nav.classList.add('is-scrolled');
  } else {
    nav.classList.remove('is-scrolled');
  }
});

// Accensione Mirino Hero (solo se gli elementi esistono)
window.addEventListener('DOMContentLoaded', function() {
  var c1 = document.getElementById('c1');
  if (!c1) return; // Se non siamo nella Home, si ferma qui
  
  setTimeout(function(){ document.getElementById('c1').classList.add('is-on'); }, 200);
  setTimeout(function(){ document.getElementById('c2').classList.add('is-on'); }, 350);
  setTimeout(function(){ document.getElementById('c3').classList.add('is-on'); }, 500);
  setTimeout(function(){ document.getElementById('c4').classList.add('is-on'); }, 650);
  
  setTimeout(function(){ document.getElementById('hEyebrow').classList.add('is-on'); }, 500);
  setTimeout(function(){ document.getElementById('hTitle').classList.add('is-on'); }, 700);
  setTimeout(function(){ document.getElementById('hSub').classList.add('is-on'); }, 900);
  setTimeout(function(){ document.getElementById('hCta').classList.add('is-on'); }, 1100);
});

// Gestione Filtri Portfolio (Solo Home)
(function(){
  var buttons = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.work-card');
  if (buttons.length === 0) return;

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      buttons.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var filter = btn.getAttribute('data-filter');
      cards.forEach(function(card) {
        var cats = card.getAttribute('data-cat') ? card.getAttribute('data-cat').split(' ') : [];
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('is-hidden');
          card.style.display = 'block';
        } else {
          card.classList.add('is-hidden');
          setTimeout(function(){ if(card.classList.contains('is-hidden')) card.style.display = 'none'; }, 350);
        }
      });
    });
  });
})();

// Mobile Menu Burger (Solo Home)
(function(){
  var burger = document.getElementById('burgerBtn');
  var menu = document.getElementById('mobileMenu');
  var close = document.getElementById('closeBtn');
  var links = document.querySelectorAll('.m-link');
  if (!burger || !menu) return;
  
  burger.addEventListener('click', function() { menu.classList.add('is-open'); });
  if(close) close.addEventListener('click', function() { menu.classList.remove('is-open'); });
  links.forEach(function(l) { l.addEventListener('click', function() { menu.classList.remove('is-open'); }); });
})();

// ============ MARQUEE DUPLICATE ============
(function(){
  var track = document.getElementById('marqueeTrack');
  track.innerHTML += track.innerHTML;
})();
</script>