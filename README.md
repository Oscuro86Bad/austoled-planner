# AUSTOLED PLANNER — Mobile

**App online:** https://oscuro86bad.github.io/austoled-planner/

Planner per **LED wall** in versione mobile: calcola in pochi secondi cabinet, risoluzione,
peso, consumi, bauli, struttura, appendimento, prospetto tecnico e posizionamento sul canvas.
È una **PWA** statica: si installa sulla schermata Home e funziona anche **offline**.

- Interfaccia in italiano, pensata per il telefono.
- Nessuna build, nessun server, nessun tracciamento.
- I dati restano sul dispositivo.
- Configurazioni condivisibili con un link.

---

## Come si usa

1. Apri l'app dal link qui sopra.
2. In **Setup** scegli modello LED, larghezza, altezza, altezza da terra e consumo per tile.
3. Controlla **Sintesi** per tile, risoluzione, peso, consumi e avvisi tecnici.
4. In **Vista** trovi il prospetto frontale in scala e il mapping sul canvas.
5. In **Materiali** gestisci scorte, bauli, alimentazione, scaler e struttura.
6. In **Export** condividi il riepilogo, copia il link, salva il `.txt`, esporta il prospetto JPEG o stampa in PDF.

### Installazione sul telefono

**Android (Chrome / Edge)**
1. Apri il link.
2. Menu ⋮ → **Installa app** oppure **Aggiungi alla schermata Home**.

**iPhone / iPad (Safari)**
1. Apri il link.
2. Tocca **Condividi** → **Aggiungi alla schermata Home**.
3. Conferma con **Aggiungi**.

Dopo il primo avvio l'app resta disponibile anche senza connessione.

---

## Condivisione

- **Condividi riepilogo** apre il menu di condivisione del telefono (WhatsApp, email, ecc.).
- **Copia link** copia un URL che contiene **tutti i parametri** della configurazione.
  Chi lo apre vede esattamente lo stesso progetto.
- **Lista .txt** scarica un riepilogo tecnico pronto da inviare.
- **Prospetto JPEG** genera un'immagine con intestazione, disegno e dati principali.
- **Stampa / PDF** usa la stampa del browser: su telefono permette anche “Salva come PDF”.

La configurazione viene salvata automaticamente nel browser (`localStorage`).
Il link condiviso ha priorità sui dati salvati: aprendo un link si carica quella configurazione.

---

## Calcoli e dati tecnici

Il motore parte dai dati reali dei cabinet (dimensioni, risoluzione, peso, pezzi per cassa)
e calcola:

- colonne e righe di moduli necessarie per coprire la misura richiesta;
- dimensioni reali del wall (multiple del cabinet);
- risoluzione totale in pixel e rapporto d'aspetto;
- tile attive, scorte, totale, bauli e spazi vuoti;
- peso totale e peso per m²;
- consumo, assorbimento a 230 V e a 400 V trifase;
- linee CEE 16A consigliate e porte di uscita video (max 40 tile/porta a 8 bit – 60 Hz);
- altezza da terra, quota totale e avvisi di sicurezza.

**Esempio di verifica (default):** 4 × 3 m con P3.9 → 8 × 6 moduli = **48 tile**,
**1024 × 768 px**, **360 kg**, **7,2 kW**, **8 bauli** da 6 pezzi.

### Modelli disponibili

Sono inclusi i cabinet AUSTOLED/NOVA/Linsn/DAHUA/Colorlight con passo 4.8, 3.9, 2.9, 2.8,
2.6, 2.3 e 1.9, oltre alle configurazioni **miste 50×50 + 50×100**, ai modelli **Cube**
e al cabinet **personalizzato**.

> ⚠️ **P2.6:** usare partenze **PowerCON TRUE1 CEE/Civili**. I PowerCON standard non sono compatibili.

### Canvas

Il mapping è **1:1**: la risoluzione LED non viene riscalata.
Il rettangolo LED parte centrato e può essere trascinato sul canvas; offset e ritagli
sono mostrati in tempo reale. Se il canvas è più piccolo del LED viene segnalato il crop.

---

## Sviluppo locale

Non serve Node.js: l'app è composta da file statici.

```powershell
cd "ledplanner 2.0"
python -m http.server 8080
```

Poi apri `http://localhost:8080`.

In alternativa usa l'estensione **Live Server** di VS Code.
Aprendo `index.html` con doppio clic l'app funziona, ma il service worker non viene registrato
(quindi niente offline e niente installazione).

Se Python non è installato, c'è un mini-server incluso:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/serve.ps1
```

Apri `http://localhost:8080` (per cambiare porta: `-Port 8081`).

### Rigenerare le icone

```powershell
powershell -ExecutionPolicy Bypass -File scripts/make-icons.ps1
```

Lo script usa `System.Drawing` e genera `icon-192.png`, `icon-512.png`,
`maskable-512.png` e `apple-touch-icon.png` a partire dallo stesso disegno di `icons/icon.svg`.

---

## Pubblicazione su GitHub Pages

L'app è completamente statica: GitHub Pages può pubblicarla così com'è.

1. Crea un repository GitHub chiamato `austoled-planner`.
2. Carica il progetto sul branch `main`.
3. Su GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
4. Scegli **Branch: `main`** e cartella **`/ (root)`**, poi **Save**.
5. Dopo il primo deploy l'app sarà disponibile su:

```
https://<utente>.github.io/austoled-planner/
```

Ogni push su `main` aggiorna automaticamente il sito. Il service worker scarica
la nuova versione alla prima apertura online.

---

## Struttura del progetto

```
index.html                  guscio dell'app
manifest.webmanifest        manifest PWA
sw.js                       service worker (offline)
css/base.css                design system e componenti
css/app.css                 responsive, tema scuro e stampa
js/data.js                  database modelli e preset
js/calc.js                  stato, calcoli, riepilogo testuale
js/draw.js                  prospetto SVG e griglia moduli
js/ui.js                    icone, persistenza, Setup e Sintesi
js/views.js                 Vista, Materiali, Export e azioni
js/app.js                   eventi, rendering, undo/redo, PWA
icons/                      icone SVG e PNG
scripts/make-icons.ps1      generatore delle icone PNG
scripts/serve.ps1           mini-server locale per provare la PWA
```

---

## Privacy

L'app non invia dati a server: calcoli, note e configurazioni restano nel browser.
La condivisione avviene solo quando l'utente sceglie esplicitamente di condividere
un link o un file.

---

## Note

- Verificare sempre portata, struttura, fly bar, spanset e grillette prima del montaggio.
- I calcoli elettrici sono indicativi: rispettare le norme e i dati dei costruttori.
- Le configurazioni condivise possono diventare URL lunghi: usarle con i progetti importanti,
  non come archivio permanente.

Versione **2.0.0** — AUSTOLED PLANNER Mobile.
