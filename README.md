# 💬 ChatFlow — WhatsApp Chat Export Visualizer

A lightweight, client-side web application that transforms exported WhatsApp `.txt` logs into a clean, interactive, and authentic chat experience.

---

## 📌 Overview

Exported WhatsApp conversations are stored as flat, difficult-to-read text files. **ChatFlow** parses raw export logs directly in your browser and renders them as an authentic messaging thread—complete with sender identification, message alignment, date dividers, and search functionality.

Everything runs **100% on the client side**. No conversations, media placeholders, or logs are uploaded to any server, ensuring complete data privacy[cite: 3].

---

## ✨ Features

- **Multi-Format Parsing:** Accurately processes both iOS (`[DD/MM/YYYY, HH:mm:ss]`) and Android (12h/24h standard formats) export structures[cite: 3].
- **Noise & Ghost Message Stripping:** Automatically removes empty call records, blank lines, and invisible Unicode whitespace (`\u200B`, `\u202F`, `\u00A0`), ensuring only valid messages and active dates appear.
- **Perspective Switcher ("Who are you?"):** Automatically discovers chat participants and lets you choose who you are, flipping sent bubbles to the right with checkmarks and incoming bubbles to the left[cite: 3].
- **Instant In-Chat Search:** Search across the entire conversation with real-time text highlighting and match counters[cite: 3].
- **Dark & Light Modes:** Tailored WhatsApp-style color palettes and background patterns with instant theme toggling[cite: 3].
- **Export & Archival:** Export formatted chat history to structured JSON or trigger clean print-to-PDF formatting[cite: 3].
- **Zero Dependencies:** Pure vanilla JavaScript, HTML5, and Tailwind CSS—no build tools, bundlers, or frameworks required[cite: 3].

---

## 🚀 Live Demo & Quick Start

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/chatflow.git](https://github.com/your-username/chatflow.git)
cd chatflow
