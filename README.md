# Riccardo Raineri — Il Mio Sito 🎬

Benvenuto nella repository del mio portfolio personale. Questo sito è stato progettato e sviluppato per presentare i miei lavori come **Filmmaker, Camera Operator, Drone Operator e Video Editor**. 

🔗 **Sito Live:** [riccardo-raineri.github.io/site/](https://riccardo-raineri.github.io/site/)

---

## 🎥 Caratteristiche Principali del Sito

- **Timecode Digitale in Tempo Reale:** Un counter generato via JavaScript simula il timecode di montaggio a 24fps.

- **Transizioni Fluide ad "Otturatore":** I cambi pagina simulano la chiusura e riapertura dell'otturatore di una macchina da presa, evitando il cambio istantaneo della pagina senza animazione.

- **Portfolio Dinamico con Animazioni FLIP:** I progetti possono essere filtrati per categoria con transizioni fluide che riposizionano le cards.

- **Custom Cursor Contextual Label:** Su dispositivi desktop, muovendo il mouse sulle cards dei lavori compare un'etichetta fluttuante "VIEW" (con effetto Lerp).

- **Sistema Multilingua:** Supporto nativo per Italiano ed Inglese, con salvataggio della preferenza dell'utente nella memoria locale (`localStorage`).

- **Interfaccia Interattiva "Cinema Mode":** Un interruttore consente di spegnere le luci della pagina (oscurando header e dettagli) per concentrare l'attenzione sulla visione dei video.

- **Bot-Protection per Email:** Protezione contro gli scraper di spam tramite l'offuscamento dell'indirizzo email nel DOM con attributi di dati dinamici.

- **Analytics:** Cloudflare Web Analytics (Privacy-first, conforme al GDPR, senza l'uso di cookie traccianti)

---

## 🥚 Easter Eggs

### 1. Messaggio Segreto in Console
Apri i *Developer Tools* (F12 o Cmd+Option+I) per trovare una schermata dei crediti firmata.

### 2. Modalità VHS overlay (Codice Segreto "REC")
Premendo in sequenza i tasti **`R`** **`E`** **`C`** sulla tastiera in qualsiasi punto del sito, si attiverà un overlay in stile VHS con linee di scansione e indicatori di formato per 3 secondi.

### 3. Doppio Clic sul Timecode (Ciak & Tally)
Facendo doppio clic sul timecode digitale in alto a destra:
*   Verrà generato (tramite le API *Web Audio*) il classico **suono acuto di un Ciak cinematografico**.
*   Il contatore si illuminerà di rosso attivando una modalità **Tally lampo** (segnalatore di registrazione attiva).

---

## 📂 Struttura del Progetto

```text
├── index.html          # Pagina principale (Home, Lavori e Contatti)
├── project.html        # Singoli progetti
├── style.css           # Foglio di stile
└── script.js           # JavaScript (Timecode, filtri, transizioni, menu mobile)
