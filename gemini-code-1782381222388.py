index_content = """<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Riccardo Raineri — Regista, Montatore Video &amp; Drone Operator</title>
<meta name="description" content="Portfolio di Riccardo Raineri, specializzato in produzione video cinematografica, regia, post-produzione e riprese aeree con drone.">

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@400;500;600;700;800&family=Work+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">

<!-- Foglio di Stile Esterno Globale -->
<link rel="stylesheet" href="style.css">
</head>
<body>

<!-- ============ NAVBAR (CON TIMECODE E EFFETTO REC) ============ -->
<nav class="nav" id="mainNav">
  <div class="nav__brand">Riccardo Raineri</div>
  <div class="nav__links">
    <a href="#intro">Info</a>
    <a href="#lavori">Lavori</a>
    <a href="#servizi">Servizi</a>
    <a href="#contatti">Contatti</a>
  </div>
  <div class="nav__rec">
    <span class="rec-dot" aria-hidden="true"></span>
    <span>REC</span>
    <span id="timecode" class="nav__tc">00:00:00:00</span>
  </div>
  <button class="nav__burger" id="burgerBtn" aria-label="Apri menu">
    <span></span>
    <span></span>
  </button>
</nav>

<!-- MOBILE MENU -->
<div class="mobile-menu" id="mobileMenu">
  <button class="mobile-menu__close" id="closeBtn">CHIUDI ×</button>
  <a href="#intro" class="m-link">Info</a>
  <a href="#lavori" class="m-link">Lavori</a>
  <a href="#servizi" class="m-link">Servizi</a>
  <a href="#contatti" class="m-link">Contatti</a>
</div>

<!-- ============ HERO PRINCIPALE (STILE MIRINO FOTOCAMERA) ============ -->
<header class="hero">
  <!-- Barre orizzontali stile interfaccia video -->
  <div class="hero__bars hero__bars--top"></div>
  <div class="hero__bars hero__bars--bottom">
    <span>F2.8 | ISO 400</span>
    <span>4K 23.98 FPS</span>
  </div>
  
  <!-- Angoli del mirino -->
  <div class="hero__frame">
    <div class="hero__corner hero__corner--tl" id="c1"></div>
    <div class="hero__corner hero__corner--tr" id="c2"></div>
    <div class="hero__corner hero__corner--bl" id="c3"></div>
    <div class="hero__corner hero__corner--br" id="c4"></div>
  </div>

  <div class="hero__media">
    <!-- Sostituisci questo placeholder con un tuo fermo immagine o copertina del reel -->
    <img src="https://riccardo-raineri.github.io/site/images/lost_in_bo.png" alt="Riccardo Raineri Cinematography">
    <div class="hero__scrim"></div>
  </div>

  <div class="hero__content">
    <div class="hero__eyebrow" id="hEyebrow"><span class="dot">●</span> Showreel 2026</div>
    <h1 class="hero__title" id="hTitle">Catturo visioni.<br>Plasmo storie.</h1>
    <p class="hero__sub" id="hSub">Regista, Editor e Pilota FPV certificato. Trasformo concetti astratti in sequenze visive dal taglio cinematografico e moderno.</p>
    <div class="hero__cta" id="hCta">
      <a href="#lavori" class="btn btn--solid">Guarda i Progetti</a>
      <a href="#contatti" class="btn btn--ghost">Lavoriamo Insieme</a>
    </div>
  </div>

  <div class="hero__scrollcue">
    <span>SCROLL</span>
    <div class="line"></div>
  </div>
</header>

<!-- ============ SEZIONE INTRO / FILOSOFIA ============ -->
<section id="intro" class="intro section-pad hairline">
  <div class="wrap intro__grid reveal">
    <div class="intro__sidebar">
      <div class="eyebrow"><span class="dot">●</span> Profilo</div>
    </div>
    <div>
      <h2 class="intro__heading">Il montaggio non è solo tecnica. È ritmo, intenzione e manipolazione del tempo.</h2>
      <div class="intro__text" style="margin-top: 24px;">
        <p>Mi occupo della catena produttiva video a 360 gradi: dalla <strong>direzione creativa sul set</strong> fino alla cura millimetrica del <strong>sound design</strong> e della <strong>color correction</strong> in post-produzione.</p>
        <p style="margin-top: 16px;">Ogni inquadratura, che sia catturata a terra o sospesa in aria con un drone da corsa, ha un unico obiettivo: agganciare lo sguardo dello spettatore e non mollarlo più.</p>
      </div>
    </div>
  </div>

  <!-- Marquee Scorrevole Simulato -->
  <div class="marquee">
    <div class="marquee__track">
      <div class="marquee__item">DIRECTION <span class="sep">/</span> EDITING <span class="sep">/</span> DRONE CINEMATOGRAPHY <span class="sep">/</span> COLOR GRADING <span class="sep">/</span> FPV FLIGHT</div>
      <div class="marquee__item">DIRECTION <span class="sep">/</span> EDITING <span class="sep">/</span> DRONE CINEMATOGRAPHY <span class="sep">/</span> COLOR GRADING <span class="sep">/</span> FPV FLIGHT</div>
    </div>
  </div>
</section>

<!-- ============ SEZIONE PORTFOLIO GRID (16:9 ORIZZONTALE) ============ -->
<section id="lavori" class="works section-pad hairline">
  <div class="wrap">
    <div class="section-head reveal">
      <div>
        <div class="eyebrow"><span class="dot">●</span> Progetti Selezionati</div>
        <h2>Lavori Recenti</h2>
      </div>
      <!-- Filtri di Categoria -->
      <div class="filters">
        <button class="filter-btn is-active" data-filter="all">Tutti</button>
        <button class="filter-btn" data-filter="regia">Regia</button>
        <button class="filter-btn" data-filter="drone">Drone</button>
        <button class="filter-btn" data-filter="editing">Montaggio</button>
      </div>
    </div>

    <div class="works__grid">
      <!-- Progetto 1 -->
      <a href="lost-in-bo.html" class="work-card reveal reveal-d1" data-cat="regia drone">
        <div class="work-card__media">
          <img src="https://riccardo-raineri.github.io/site/images/lost_in_bo.png" alt="Lost in Bo" loading="lazy">
          <div class="work-card__scrim"></div>
        </div>
        <div class="work-card__info">
          <h3 class="work-card__title">Lost in Bo</h3>
          <div class="work-card__meta">
            <span class="tag">Spot / Drone</span>
            <span>2026</span>
          </div>
        </div>
      </a>

      <!-- Progetto 2 -->
      <a href="sicilia-fpv.html" class="work-card reveal reveal-d2" data-cat="drone">
        <div class="work-card__media">
          <img src="https://riccardo-raineri.github.io/site/images/drone/macari.jpg" alt="Sicilia FPV Fly" loading="lazy">
          <div class="work-card__scrim"></div>
        </div>
        <div class="work-card__info">
          <h3 class="work-card__title">Sicilia FPV Fly</h3>
          <div class="work-card__meta">
            <span class="tag">Drone Cinematography</span>
            <span>2025</span>
          </div>
        </div>
      </a>

      <!-- Progetto 3 -->
      <a href="urban-vibes.html" class="work-card reveal reveal-d3" data-cat="regia editing">
        <div class="work-card__media">
          <!-- Sostituisci questo placeholder con una copertina reale -->
          <img src="https://riccardo-raineri.github.io/site/images/lost_in_bo.png" alt="Urban Vibes Commercial" loading="lazy">
          <div class="work-card__scrim"></div>
        </div>
        <div class="work-card__info">
          <h3 class="work-card__title">Urban Vibes</h3>
          <div class="work-card__meta">
            <span class="tag">Commercial / Editing</span>
            <span>2025</span>
          </div>
        </div>
      </a>
    </div>

    <div class="works__more reveal">
      <a href="https://www.youtube.com" target="_blank" rel="noopener">Vedi Canale YouTube Completo ↗</a>
    </div>
  </div>
</section>

<!-- ============ SEZIONE SERVIZI / COMPETENZE ============ -->
<section id="servizi" class="servizi section-pad hairline">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow"><span class="dot">●</span> Competenze</div>
      <h2>Servizi Offerti</h2>
    </div>

    <div class="servizi__grid reveal">
      <div class="servizi__card">
        <span class="servizi__tag">01 / CREATIVE</span>
        <h3 class="servizi__title">Regia &amp;<br>Direzione</h3>
        <p class="servizi__desc">Sviluppo del concept creativo, stesura dello storyboard e gestione del set, convertendo le idee di brand in video narrativi d'impatto.</p>
      </div>

      <div class="servizi__card">
        <span class="servizi__tag">02 / POST-PROD</span>
        <h3 class="servizi__title">Montaggio &amp;<br>Color</h3>
        <p class="servizi__desc">Editing video serrato e dinamico, sound design immersivo e color grading professionale per dare il giusto mood e look alla pellicola.</p>
      </div>

      <div class="servizi__card">
        <span class="servizi__tag">03 / AERIAL</span>
        <h3 class="servizi__title">Riprese Aeree<br>FPV &amp; Drone</h3>
        <p class="servizi__desc">Pilota certificato ENAC. Riprese aeree ad alta velocità con droni FPV o stabili per punti di vista spettacolari, acrobatici o istituzionali.</p>
      </div>

      <div class="servizi__card">
        <span class="servizi__tag">04 / COMPACT</span>
        <h3 class="servizi__title">Social Content<br>Advertising</h3>
        <p class="servizi__desc">Adattamento e ottimizzazione dei contenuti video per campagne adv nei formati verticali (9:16), mantenendo intatta la qualità cinematografica.</p>
      </div>
    </div>
  </div>
</section>

<!-- ============ SEZIONE CONTATTI & CALL TO ACTION ============ -->
<section id="contatti" class="contatti section-pad hairline">
  <div class="wrap contatti__inner reveal">
    <div class="eyebrow"><span class="dot">●</span> Booking / Info</div>
    <h2 class="contatti__heading">Hai un progetto in mente?</h2>
    <p class="contatti__sub">Disponibile per produzioni in tutta Italia ed estero.</p>
    <a href="mailto:info@riccardoraineri.com" class="contatti__email">info@riccardoraineri.com</a>
  </div>
</section>

<!-- ============ FOOTER GLOBALE ============ -->
<footer class="footer">
  <div class="wrap footer__inner">
    <div class="footer__loc">Bologna, Italia — Disponibile ovunque</div>
    <div class="footer__social">
      <a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a>
      <a href="https://youtube.com" target="_blank" rel="noopener">YouTube</a>
      <a href="https://linkedin.com" target="_blank" rel="noopener">LinkedIn</a>
    </div>
    <div class="footer__copy">© 2026 Riccardo Raineri. P.IVA 01234567890</div>
  </div>
</footer>

<!-- ============ COMPORTAMENTI INTERATTIVI (JAVASCRIPT) ============ -->
<script>
// 1. TIMECODE DIGITALE A 24FPS DIRETTO
(function(){
  var timecodeEl = document.getElementById('timecode');
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

// 2. EFFETTO CAMBIAMENTO NAVBAR ALLO SCROLL
window.addEventListener('scroll', function() {
  var nav = document.getElementById('mainNav');
  if (window.scrollY > 50) {
    nav.classList.add('is-scrolled');
  } else {
    nav.classList.remove('is-scrolled');
  }
});

// 3. SELEZIONE E APPARIZIONE ANGOLI HERO DEL MIRINO
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function(){ document.getElementById('c1').classList.add('is-on'); }, 200);
  setTimeout(function(){ document.getElementById('c2').classList.add('is-on'); }, 350);
  setTimeout(function(){ document.getElementById('c3').classList.add('is-on'); }, 500);
  setTimeout(function(){ document.getElementById('c4').classList.add('is-on'); }, 650);
  
  setTimeout(function(){ document.getElementById('hEyebrow').classList.add('is-on'); }, 500);
  setTimeout(function(){ document.getElementById('hTitle').classList.add('is-on'); }, 700);
  setTimeout(function(){ document.getElementById('hSub').classList.add('is-on'); }, 900);
  setTimeout(function(){ document.getElementById('hCta').classList.add('is-on'); }, 1100);
});

// 4. ANIMAZIONI SCROLL REVEAL AD INTERSEZIONE
(function(){
  var revealElements = document.querySelectorAll('.reveal');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // esegui l'animazione una volta sola
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach(function(el) { observer.observe(el); });
})();

// 5. GESTIONE FILTRI PORTFOLIO DINAMICI
(function(){
  var buttons = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.work-card');
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      buttons.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var filter = btn.getAttribute('data-filter');
      cards.forEach(function(card) {
        var cats = card.getAttribute('data-cat').split(' ');
        if (filter === 'all' || cats.includes(filter)) {
          card.classList.remove('is-hidden');
          card.style.display = 'block';
        } else {
          card.classList.add('is-hidden');
          setTimeout(function(){ if(card.classList.includes('is-hidden')) card.style.display = 'none'; }, 350);
        }
      });
    });
  });
})();

// 6. MENU DA SMARTPHONE (BURGER)
(function(){
  var burger = document.getElementById('burgerBtn');
  var menu = document.getElementById('mobileMenu');
  var close = document.getElementById('closeBtn');
  var links = document.querySelectorAll('.m-link');
  
  burger.addEventListener('click', function() { menu.classList.add('is-open'); });
  close.addEventListener('click', function() { menu.classList.remove('is-open'); });
  links.forEach(function(l) { l.addEventListener('click', function() { menu.classList.remove('is-open'); }); });
})();
</script>

</body>
</html>
"""

with open("index.html", "w", encoding="utf-8") as f:
    f.write(index_content.strip())

print("index.html generated successfully")