# Trouv

Premium London chauffeur service based in Mayfair. This repository contains the marketing and legal pages for **Trouv**: a static website for airport transfers, corporate travel, fashion and luxury movement, and fleet information.

## Tech stack

- **HTML** — page structure and content  
- **CSS** — styling (`css/style.css`)  
- **JavaScript** — header, mobile nav, scroll reveal, contact form UX (`js/main.js`)  

No build step or framework: deploy the folder as-is.

## Fleet

- **Mercedes-Benz S-Class**  
- **Mercedes-Benz V-Class**  
- **Range Rover Autobiography**  

## Key pages and files

| Page / area | File | Notes |
|-------------|------|--------|
| Home | `index.html` | Hero, services overview, trust signals, fleet preview |
| Fleet | `fleet.html` | Vehicle detail |
| About | `about.html` | Company, values, team |
| Airport transfers | `airport-transfers.html` | |
| Corporate services | `corporate-services.html` | |
| Fashion & luxury | `fashion-luxury.html` | |
| Contact / quotes | `contact.html` | Form and contact details |
| Terms & conditions | `terms.html` | Booking, fares, **cancellation & refund policy** (Section 6), liability, complaints |
| Privacy policy | `privacy.html` | UK GDPR, data use, cookies |

**Hourly hire** and **VIP travel** do not have separate HTML files in this project; they are offered as services and linked from navigation/footer to **`contact.html`** (and described on the homepage services grid).  

**Cancellation policy** is not a standalone page; it is included in **`terms.html`** (Section 6: Cancellation & Refund Policy).

If you add dedicated routes later (e.g. `hourly-hire.html`, `cancellation-policy.html`), link them from the footer next to Terms / Privacy for consistency.

## How to run locally

1. **Open in a browser**  
   Double-click `index.html`, or from the project root:  
   `open index.html` (macOS) / open the file in your browser of choice.

2. **Local HTTP server (recommended)**  
   Avoids some browsers restricting `file://` behaviour for scripts or paths:  
   ```bash
   cd /path/to/AntiG
   python3 -m http.server 8080
   ```  
   Then visit `http://127.0.0.1:8080`.

3. **VS Code / Cursor Live Server**  
   Install the Live Server extension, right-click `index.html` → “Open with Live Server”.

## Deployment (push updates live)

Exact steps depend on your host. Typical patterns:

1. **Upload static files**  
   Copy the project (at minimum: all `.html` files, `css/`, `js/`, `images/`) to the host’s web root via FTP/SFTP, S3 sync, or your panel’s file manager.

2. **Git-based hosting (Netlify, Vercel, Cloudflare Pages, GitHub Pages)**  
   - Connect the repository to the platform.  
   - Set **publish directory** to the repo root (or the folder containing `index.html`).  
   - **Build command**: leave empty (static site).  
   - Push to the connected branch; the host redeploys automatically.

3. **Traditional server**  
   Ensure the web server serves `index.html` as the directory index and that asset paths remain relative (`css/style.css`, etc.).

After deploy, clear CDN or browser cache if updates do not appear immediately.

## Contact (operational)

- **Email:** [info@trouvchauffeurs.co.uk](mailto:info@trouvchauffeurs.co.uk)  
- **Phone:** [+44 20 3835 5338](tel:+442038355338) (dialled as +44 203 835 5338)  
- **Address:** 45 Albemarle Street, Mayfair, London, W1S 4JL  

Registered company and legal correspondence for **Trouv Chauffeurs Limited** appear on **`terms.html`** and **`privacy.html`** (separate registered office).

## Brand

- In customer-facing copy and the trading name, use **Trouv** only.  
- Do **not** use **“Trouv Chauffeurs”** as the public brand name.  
- **“Trouv Chauffeurs Limited”** is the legal entity name and is appropriate on Terms, Privacy, and formal documents.

## Project layout

```
AntiG/
├── index.html
├── about.html
├── airport-transfers.html
├── corporate-services.html
├── contact.html
├── fashion-luxury.html
├── fleet.html
├── terms.html
├── privacy.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
└── README.md
```

---

© Documentation for the Trouv website project.
