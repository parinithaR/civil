# Civil Engineering Code Book

A searchable offline digital library of Civil Engineering standards — IS, IRC, NBC, SP, ACI, ASTM, Eurocode, BS, ISO and more.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `style.css` | Glassmorphism design, dark/light mode, animations |
| `script.js` | Search engine, filters, modal, bookmarks, history |
| `codes.json` | Dataset of 150+ civil engineering codes |

## How to run

Open `index.html` in any modern browser. No server needed — works completely offline.

> **Tip:** If your browser blocks `fetch()` for local files, run a simple local server:
> ```
> python3 -m http.server 8000
> ```
> Then open `http://localhost:8000`

## Features

- **Instant search** by code number, title, keywords, category or department
- **150+ codes** — IS, IRC, NBC, SP, ACI, ASTM, Eurocode, BS, ISO
- **Category & department filters** with relevance-based sorting
- **Dark / Light mode** toggle (persisted)
- **Bookmarks** — save favourites, export to printable PDF
- **Search history** — click any past query to re-run it
- **Detail modal** — description, applications, notes, related codes
- **Print** individual code details
- **Copy** code number to clipboard
- **Keyboard shortcuts** — press `?` to see them

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search bar |
| `Esc` | Close modal or panel |
| `B` | Toggle bookmarks panel |
| `H` | Toggle history panel |
| `T` | Toggle dark / light mode |
| `?` | Show shortcut help |

## Adding more codes

Edit `codes.json`. Each entry follows this structure:

```json
{
  "id": "unique-id",
  "number": "IS 456",
  "title": "Full title of the code",
  "category": "Concrete",
  "description": "Brief description.",
  "keywords": ["concrete", "rcc", "beam"],
  "revision": 2000,
  "department": "BIS",
  "applications": ["Buildings", "Bridges"],
  "relatedCodes": ["IS 10262", "IS 383"],
  "notes": "Any important note."
}
```

## Categories

Concrete · Steel · Foundation & Geotechnical · Transportation & Highway · Bridge · Water Supply · Wastewater · Building Planning · Construction Materials · Earthquake · Wind · Timber · Masonry · Structural Engineering · Prestressed Concrete · Fire Safety · Construction Management · Quality Control · Green Building · BIM · Tunnel · Environmental
