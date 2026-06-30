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
// ============ GESTIONE MOBILE MENU ============
document.addEventListener("DOMContentLoaded", () => {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');
  
  // Verifica che gli elementi esistano nella pagina corrente
  if (burgerBtn && mobileMenu) {
    
    // Apri il menu al click sull'hamburger
    burgerBtn.addEventListener('click', () => {
      mobileMenu.classList.add('is-open'); // Assicurati che nel CSS usi 'is-active' o cambia la classe con quella che usi per mostrarlo
    });

    // Chiudi il menu al click sul tasto CHIUDI
    if (closeMenu) {
      closeMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
      });
    }

    // CHIUDI IL MENU QUANDO SI CLICCA UN LINK
    // Questo risolve il blocco su smartphone una volta selezionata la voce
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
      });
    });
    
  }
});

// ============ MARQUEE DUPLICATE ============
(function() {
  const track = document.getElementById('marqueeTrack');
  if (track) {
    // Clona il contenuto interno per garantire il loop infinito senza scatti
    track.innerHTML += track.innerHTML;
  }
})();


// ============ GESTIONE LIGHTBOX (ZOOM IMMAGINI) ============
document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (lightbox && lightboxImg) {
    galleryItems.forEach(item => {
      const img = item.querySelector('img');
      const btn = item.querySelector('.zoom-btn');

      // Funzione per aprire la modale
      const openLightbox = (e) => {
        e.stopPropagation(); // Evita conflitti di click
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('is-active');
        document.body.style.overflow = 'hidden'; // Blocca lo scroll del sito sotto
      };

      // Apri sia cliccando sul tastino sia cliccando direttamente sull'immagine (ottimo per smartphone)
      if(btn) btn.addEventListener('click', openLightbox);
      img.addEventListener('click', openLightbox);
    });

    // Chiudi cliccando sulla "✕"
    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('is-active');
        document.body.style.overflow = ''; // Riattiva lo scroll
      });
    }

    // Chiudi cliccando in un punto qualsiasi dello sfondo nero fuori dall'immagine
    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg && e.target !== lightboxClose) {
        lightbox.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    });

    // Chiudi premendo il tasto ESC sulla tastiera
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
        lightbox.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    });
  }
});


// ============ GESTIONE EMAIL PROTETTA DA SPAM ============
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