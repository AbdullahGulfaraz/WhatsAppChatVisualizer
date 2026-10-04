# 💬 ChatFlow — WhatsApp Chat Export Visualizer

A lightweight, fully responsive, client-side web application that transforms exported WhatsApp `.txt` logs into an authentic, interactive chat interface[cite: 3].

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-00a884?style=for-the-badge&logo=vercel)](https://whatsappchatvisualizer.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live Application

Try it directly in your browser:  
👉 **[https://whatsappchatvisualizer.vercel.app/](https://whatsappchatvisualizer.vercel.app/)**

---

## 📌 Overview

Exported WhatsApp conversations are saved as flat, unformatted plain-text files filled with timestamps, missed call entries, and raw attachment placeholders[cite: 3]. 

**ChatFlow** parses raw export logs directly inside your browser and reconstructs them into an authentic messaging UI—complete with sender identification, message alignment, date dividers, search functionality, and mobile drawer navigation[cite: 3].

🔒 **100% Privacy Focused:** Everything runs entirely client-side[cite: 3]. No conversations, logs, or personal data are ever sent to an external server[cite: 3].

---

## ✨ Features

- **Multi-Format Parsing:** Seamlessly processes both iOS bracket timestamps (`[DD/MM/YYYY, HH:mm:ss]`) and Android standard (12-hour AM/PM and 24-hour) logs[cite: 3].
- **Noise & Unicode Filtering:** Strips phantom call records, empty lines, and invisible Unicode whitespace characters (`\u200B`, `\u202F`, `\u00A0`), ensuring only valid messages appear.
- **Dynamic Perspective Switcher:** Detects all participants in the thread and lets you choose who you are, correctly aligning your messages to the right with read receipts and recipients to the left[cite: 3].
- **Live In-Chat Search:** Full-text keyword search across messages and senders with instant highlighting and counter badges[cite: 3].
- **Fully Responsive & Touch-Optimized:** Built with slide-over drawer navigation, touch-friendly tap targets, and dynamic viewport sizing (`100dvh`) for flawless behavior across mobile phones, tablets, and desktops.
- **Dark & Light Themes:** Signature WhatsApp-inspired color themes and wallpaper patterns with persistent local storage saving[cite: 3].
- **Export & Archival:** Save parsed chats to structured JSON or trigger clean print-to-PDF formatting[cite: 3].
- **Zero Build Dependencies:** Pure HTML5, modern vanilla JavaScript (ES6+), and Tailwind CSS—no bundlers or complex setups required[cite: 3].

---

## 🛠️ How to Use

1. **Export a Chat:** Open WhatsApp on your phone > select a conversation > tap **Export Chat** > choose **Without Media**.
2. **Open ChatFlow:** Visit [https://whatsappchatvisualizer.vercel.app/](https://whatsappchatvisualizer.vercel.app/)[cite: 3].
3. **Load the File:** Drag and drop your `.txt` export into the upload zone (or click **Sample** to preview a demo)[cite: 3].
4. **Choose Your Perspective:** Select your name from the participant menu on the left to set incoming vs. outgoing message bubbles[cite: 3].
5. **Search & Read:** Browse through threads, jump to the top or bottom, or search specific terms[cite: 3].

---

## 📁 Project Structure

```text
├── index.html        # App semantic structure, modals, headers, and layouts
├── styles.css        # Custom scrollbars, wallpaper dot patterns, and highlights
├── script.js         # Parsing engine, state management, and DOM renderers
├── logo.svg          # Custom signature logo and favicon
└── README.md         # Project documentation
