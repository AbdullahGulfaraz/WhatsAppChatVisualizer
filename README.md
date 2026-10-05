# 💬 ChatFlow — WhatsApp Chat Export Visualizer

A lightweight, high-performance, client-side web application that transforms exported WhatsApp `.txt` logs and `.zip` archives into an authentic, interactive messaging experience[cite: 1, 2].

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-00a884?style=for-the-badge&logo=vercel)](https://whatsappchatvisualizer.vercel.app/)

---

## 🌐 Live Application

Try it directly in your browser:  
👉 **[https://whatsappchatvisualizer.vercel.app/](https://whatsappchatvisualizer.vercel.app/)**[cite: 1]

---

## 📌 Overview

Exported WhatsApp conversations are saved as flat plain-text files or compressed `.zip` archives cluttered with timestamps, missed call entries, and raw attachment tags[cite: 1, 2].

**ChatFlow** processes these logs entirely in-memory and reconstructs them into an authentic, interactive conversation interface—complete with participant alignment, instant keyword search, and dark/light themes[cite: 2, 4].

🔒 **100% Client-Side Privacy:** Everything runs entirely in your browser session[cite: 2]. No chats, logs, media, or archives are ever uploaded or transmitted to an external server[cite: 2].

---

## ✨ Features

- **`.zip` & `.txt` Dual Ingestion:** Automatically unzips and locates chat logs (`_chat.txt` on iOS or named export text files on Android) directly in-browser using JSZip.
- **Modern Interactive Landing Page:**
  - **Split 2-Column Hero:** Clear value proposition paired with a floating, dimension-locked smartphone mockup[cite: 2].
  - **Live Typing Simulation:** Auto-scrolling interactive chat preview demonstrating message flows, attachment previews, and dynamic read receipts (`✓✓`)[cite: 2, 4].
  - **Auto-Hiding Header:** Sticky navigation bar that smoothly hides on scroll-down and reappears on scroll-up to maximize viewport real estate.
  - **Dynamic Full-Screen Sections:** Clean `min-h-[100dvh]` sections covering workflow guides, bento feature highlights, and privacy specifications.
- **Universal Multi-Format Parser:** Accurately processes both iOS bracket timestamps (`[DD/MM/YYYY, HH:mm:ss]`) and Android standard (12h AM/PM and 24h) logs[cite: 2, 4].
- **Noise & Unicode Filtering:** Strips phantom call records, empty lines, and invisible Unicode whitespace (`\u200B`, `\u202F`, `\u00A0`) so only genuine conversation bubbles appear[cite: 4].
- **Dynamic Perspective Switcher:** Detects all active participants and lets you pick who you are, correctly aligning your outgoing messages to the right and incoming messages to the left[cite: 2, 4].
- **Live In-Chat Search:** Instant full-text search across messages and senders with keyword highlights and match counters[cite: 2, 4].
- **Responsive Drawer Navigation:** Slide-over controls and touch targets optimized for mobile, tablet, and desktop viewports[cite: 2].
- **Data Export & Print:** Export parsed chat records to structured JSON or trigger clean print-to-PDF formatting[cite: 2, 4].

---

## 🛠️ How to Use

1. **Export a Chat:** Open WhatsApp on your device > select a chat > tap **Export Chat** > choose **Without Media** (produces a `.zip` or `.txt` file)[cite: 2].
2. **Open ChatFlow:** Visit [https://whatsappchatvisualizer.vercel.app/](https://whatsappchatvisualizer.vercel.app/)[cite: 1].
3. **Drop or Browse:** Drag and drop your `.txt` or `.zip` file into the hero, footer, or app workspace dropzone (or click **Try Interactive Demo** to load sample data)[cite: 2].
4. **Select Perspective:** Pick your name from the participant menu to configure incoming vs. outgoing speech bubbles[cite: 2, 4].
5. **Search & Relive:** Filter conversations, review participant metrics, or print records[cite: 2].

---

## 📁 Project Structure

```text
├── index.html        # Unified SPA architecture (Landing page + Workspace view)
├── styles.css        # Wallpaper patterns, 3D float keyframes, and scrollbar styles
├── script.js         # Parsing engine, JSZip extractor, simulation runner & DOM manager
├── logo.svg          # Brand icon & browser favicon
└── README.md         # Project documentation
