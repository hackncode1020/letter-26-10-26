# 💌 Open this letter — a love letter website

A tiny love-letter website. A pink envelope with a glowing wax-heart seal floats on a dreamy rose background. **Tap the seal** → it cracks, the flap opens, the letter rises out, unfolds, and the message **writes itself line by line** — ending with a heart signature and a burst of hearts 💖

**Live:** https://letter-hackncode.sites.tab.bot/

## Make it yours

Add their name and your own message to the link:

```
https://letter-hackncode.sites.tab.bot/?name=Your%20Love
https://letter-hackncode.sites.tab.bot/?name=Your%20Love&msg=You%20make%20every%20day%20better%20%F0%9F%92%96
```

- `?name=` → the letter starts with "Dear <name>,"  (default: "Dear you,")
- `?msg=` → your own message (up to 320 characters; use `%0A` for a new line)

Or just open the site, read the letter, and use the **Make your own letter** box at the bottom to create and share your link.

## Files

- `index.html` — the page
- `style.css` — envelope, wax seal, paper and layout (pure CSS, no images)
- `script.js` — the opening timeline, typing effect, drifting petals and heart burst (vanilla JS + canvas)

No frameworks, no images, no libraries. Just HTML, CSS & JavaScript.

## Run locally

Open `index.html` in a browser, or:

```
python3 -m http.server
```

---

Made with 💖 by [@hack.n.code](https://instagram.com/hack.n.code)
