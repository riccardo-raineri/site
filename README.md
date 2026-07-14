# Riccardo Raineri — Il Mio Sito 🎬

Benvenuto nella repository del mio portfolio personale. Questo sito[^1] è stato progettato e sviluppato per presentare i miei lavori come **Filmmaker, Camera Operator, Drone Operator e Video Editor**. 

🔗 **Sito Live:** [riccardo-raineri.github.io/site/](https://riccardo-raineri.github.io/site/)

[^1]: Realizzato con [Claude.ai](https://claude.ai) e [Google Gemini](https://gemini.google.com). Gestione del sito e modifiche al codice tramite [Adobe Dreamweaver](https://www.adobe.com/it/products/dreamweaver.html) e [Github Desktop](https://github.com/apps/desktop).

---

## 🎥 Caratteristiche Principali del Sito

- **Timecode Digitale in Tempo Reale:** Un counter generato via JavaScript simula il timecode di montaggio a 24fps.
<img width="150" height="38" alt="TIMECODE" src="https://github.com/user-attachments/assets/07237f87-3700-45f0-bb08-b46e26bab4ba" />

- **Transizioni Fluide ad "Otturatore":** I cambi pagina simulano la chiusura e riapertura dell'otturatore di una macchina da presa, evitando il cambio istantaneo della pagina senza animazione.
<img width="3023" height="1395" alt="TRANSITION" src="https://github.com/user-attachments/assets/cc1e6fde-ffbb-4b89-b128-9182d4bcad6f" />

- **Portfolio Dinamico con Animazioni FLIP:** I progetti possono essere filtrati per categoria con transizioni fluide che riposizionano le cards.
<img width="557" height="65" alt="FILTERS" src="https://github.com/user-attachments/assets/4f5c1d4e-29ff-4fd3-bc77-adc3ea2374de" />

- **Custom Cursor Contextual Label:** Su dispositivi desktop, muovendo il mouse sulle cards dei lavori compare un'etichetta fluttuante "VIEW" (con effetto Lerp).
<img width="414" height="237" alt="VIEW" src="https://github.com/user-attachments/assets/1fa65378-0b2c-4596-a3b9-fc67ccff267e" />

- **Sistema Multilingua:** Supporto nativo per Italiano ed Inglese, con salvataggio della preferenza dell'utente nella memoria locale (`localStorage`).
<img width="100" height="49" alt="IT_EN" src="https://github.com/user-attachments/assets/d7928165-7ec4-41ab-966b-f29c5e56f900" />

- **Interfaccia Interattiva "Cinema Mode":** Un interruttore consente di spegnere le luci della pagina (oscurando header e dettagli) per concentrare l'attenzione sulla visione dei video.
<img width="181" height="40" alt="CINEMA" src="https://github.com/user-attachments/assets/54b7a10d-1714-4c5c-b054-90b5fa750592" />

- **Bot-Protection per Email:** Protezione contro gli scraper di spam tramite l'offuscamento dell'indirizzo email nel DOM con attributi di dati dinamici.

- **Click:** Implementato un click tramite le API *Web Audio* quando l'utente clicca su pulsanti ed immagini.

- **Analytics:** Cloudflare Web Analytics (Privacy-first, conforme al GDPR, senza l'uso di cookie traccianti)

---

## 🥚 Easter Eggs

### 1. Messaggio Segreto in Console
Apri i *Developer Tools* (F12 o Cmd+Option+I) per trovare una schermata dei crediti firmata.
<img width="554" height="169" alt="CONSOLE" src="https://github.com/user-attachments/assets/d6bece59-294f-46df-ac88-db8694c341de" />


### 2. Modalità VHS overlay (Codice Segreto "REC")
Premendo in sequenza i tasti **`R`** **`E`** **`C`** sulla tastiera in qualsiasi punto del sito, si attiverà un overlay in stile VHS con linee di scansione e indicatori di formato per 3 secondi.
<img width="3024" height="1517" alt="REC" src="https://github.com/user-attachments/assets/fcbc4562-9f80-4c2f-b4af-95980adab4e4" />


### 3. Doppio Clic sul Timecode (Ciak & Tally)
Facendo doppio clic sul timecode digitale in alto a destra:
*   Verrà generato (tramite le API *Web Audio*) il classico **suono acuto di un Ciak cinematografico**.
*   Il contatore si illuminerà di rosso attivando una modalità **Tally lampo** (segnalatore di registrazione attiva).
<img width="187" height="72" alt="TIMECODE_RED" src="https://github.com/user-attachments/assets/3dd47229-af71-4644-84cd-dada34fb060e" />


---

## 📂 Struttura del Progetto

```text
├── index.html          # Pagina principale (Home, Lavori e Contatti)
├── project.html        # Singoli progetti
├── style.css           # Foglio di stile
└── script.js           # JavaScript (Timecode, filtri, transizioni, menu mobile)
```