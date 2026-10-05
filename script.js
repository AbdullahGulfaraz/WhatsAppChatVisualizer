// State storage
const state = {
  messages: [],
  participants: new Set(),
  currentUser: null,
  chatTitle: 'WhatsApp Chat',
  searchQuery: '',
  colorPalette: [
    '#e11d48', '#2563eb', '#7c3aed', '#059669',
    '#d97706', '#db2777', '#0891b2', '#4f46e5'
  ],
  userColorMap: new Map()
};

// Sample export conversation
const SAMPLE_CHAT = `14/03/2024, 09:30 - Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
14/03/2024, 09:31 - Alex Johnson created group "Product Design Sprint 🚀"
14/03/2024, 09:32 - Alex Johnson: Good morning team! Today we start wireframing the new dashboard.
14/03/2024, 09:33 - Sophia Chen: Morning Alex! I've prepared the research metrics we gathered from the last customer feedback cycle.
14/03/2024, 09:34 - Sophia Chen: <Media omitted>
14/03/2024, 09:35 - Marcus Vance: Awesome. Quick question: are we keeping the dark mode toggle on the top navigation bar or moving it to user profile settings?
14/03/2024, 09:36 - Alex Johnson: Top nav for quick access. 
Here are the three criteria we need to meet:
1. Fast response time
2. Clean aesthetic
3. Mobile friendly layout
14/03/2024, 09:38 - Sophia Chen: Agreed! Check this Figma prototype reference: https://figma.com/@sprint-design
14/03/2024, 09:40 - Marcus Vance: Looks solid. Let's do a quick sync at 2 PM to review the components.
14/03/2024, 09:41 - Alex Johnson: Perfect. See you all then!
15/03/2024, 14:02 - Sophia Chen: Hey guys, meeting starts in 5 minutes!
15/03/2024, 14:03 - Marcus Vance: Jumping in right now.
15/03/2024, 14:04 - Alex Johnson: On my way!`;

// --- VIEW SWITCHER ROUTING (Landing vs App) ---
const landingView = document.getElementById('landing-view');
const appView = document.getElementById('app-view');

function showAppView() {
  landingView.classList.add('hidden');
  appView.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function showLandingView() {
  appView.classList.add('hidden');
  landingView.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

document.getElementById('btn-hero-launch').addEventListener('click', showAppView);
document.getElementById('btn-back-home').addEventListener('click', showLandingView);

// Hero CTAs
document.getElementById('btn-hero-upload').addEventListener('click', () => {
  showAppView();
  document.getElementById('file-input').click();
});

document.getElementById('btn-hero-sample').addEventListener('click', () => {
  processChatData(SAMPLE_CHAT, 'Product Design Sprint 🚀');
  showAppView();
});

// Footer Launchers
const footerBtnDemo = document.getElementById('footer-btn-demo');
if (footerBtnDemo) {
  footerBtnDemo.addEventListener('click', () => {
    processChatData(SAMPLE_CHAT, 'Product Design Sprint 🚀');
    showAppView();
  });
}

// --- DYNAMIC AUTO-HIDE NAVBAR ON SCROLL ---
const landingHeader = document.getElementById('landing-header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  // Only apply when landing page is visible
  if (landingView.classList.contains('hidden')) return;

  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 80) {
    // Scrolling down -> hide navbar
    landingHeader.classList.add('header-hidden');
  } else {
    // Scrolling up or at top -> show navbar
    landingHeader.classList.remove('header-hidden');
  }

  lastScrollY = currentScrollY;
}, { passive: true });

// Helper: check if message contains visible text (ignoring zero-width unicode spaces)
function hasVisibleText(text) {
  if (!text) return false;
  return text.replace(/[\s\u200B-\u200D\uFEFF\u00A0\u202F\u200E\u200F]/g, '').length > 0;
}

/**
 * Universal WhatsApp chat parser
 */
function parseWhatsAppText(rawText) {
  if (!rawText) return [];

  const lines = rawText.split(/\r?\n/);
  const parsed = [];
  let currentMsg = null;

  const androidRegex = /^(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:[\s\u202F\u00A0]*[AaPp][Mm])?)\s+-\s+(?:([^:]+?):\s*)?(.*)$/;
  const iosRegex = /^\[(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:[\s\u202F\u00A0]*[AaPp][Mm])?)\]\s+(?:([^:]+?):\s*)?(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    if (!line) continue;

    let match = line.match(iosRegex);
    if (!match) {
      match = line.match(androidRegex);
    }

    if (match) {
      if (currentMsg && hasVisibleText(currentMsg.content)) {
        parsed.push(currentMsg);
      }

      const dateStr = match[1];
      const timeStr = match[2];
      const sender = match[3] ? match[3].trim() : null;
      const content = match[4] || '';

      const isSystem = !sender ||
        content.includes('Messages and calls are end-to-end encrypted') ||
        content.includes('created group') ||
        content.includes('added') ||
        content.includes('left') ||
        content.includes('removed');

      currentMsg = {
        id: 'msg-' + parsed.length + '-' + Date.now(),
        date: dateStr,
        time: timeStr,
        sender: sender || (isSystem ? 'System' : 'Unknown'),
        content: content,
        isSystem: isSystem
      };
    } else {
      if (currentMsg) {
        currentMsg.content += '\n' + line;
      }
    }
  }

  if (currentMsg && hasVisibleText(currentMsg.content)) {
    parsed.push(currentMsg);
  }

  return parsed;
}

function assignParticipantColors(participants) {
  state.userColorMap.clear();
  let index = 0;
  participants.forEach(p => {
    state.userColorMap.set(p, state.colorPalette[index % state.colorPalette.length]);
    index++;
  });
}

function processChatData(rawText, title = 'WhatsApp Conversation') {
  const messages = parseWhatsAppText(rawText);
  if (!messages || messages.length === 0) {
    alertFallback('No readable WhatsApp messages could be parsed from this text.');
    return;
  }

  state.messages = messages;
  state.chatTitle = title;

  const participants = new Set();
  messages.forEach(m => {
    if (!m.isSystem && m.sender && m.sender !== 'System') {
      participants.add(m.sender);
    }
  });
  state.participants = participants;

  assignParticipantColors(participants);

  const pArray = Array.from(participants);
  state.currentUser = pArray.length > 0 ? pArray[0] : null;

  updateSidebarAndStats();
  renderChatMessages();

  if (window.innerWidth < 768) {
    closeMobileSidebar();
  }
}

function updateSidebarAndStats() {
  const select = document.getElementById('user-select');
  select.innerHTML = '';

  if (state.participants.size === 0) {
    const opt = document.createElement('option');
    opt.textContent = 'No participants found';
    select.appendChild(opt);
  } else {
    state.participants.forEach(user => {
      const opt = document.createElement('option');
      opt.value = user;
      opt.textContent = user;
      if (user === state.currentUser) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  }

  document.getElementById('stat-total').textContent = state.messages.length.toLocaleString();
  document.getElementById('stat-participants').textContent = state.participants.size;
  document.getElementById('participants-count-tag').textContent = state.participants.size;

  if (state.messages.length > 0) {
    const first = state.messages[0].date;
    const last = state.messages[state.messages.length - 1].date;
    document.getElementById('stat-daterange').textContent = `${first} → ${last}`;
  } else {
    document.getElementById('stat-daterange').textContent = 'No dates';
  }

  const pListContainer = document.getElementById('participants-list');
  pListContainer.innerHTML = '';

  const msgCounts = {};
  state.messages.forEach(m => {
    if (!m.isSystem && m.sender) {
      msgCounts[m.sender] = (msgCounts[m.sender] || 0) + 1;
    }
  });

  state.participants.forEach(user => {
    const color = state.userColorMap.get(user) || '#059669';
    const isCurrent = user === state.currentUser;
    const count = msgCounts[user] || 0;

    const item = document.createElement('div');
    item.className = `flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer select-none active:scale-98 ${isCurrent ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`;
    item.onclick = () => {
      state.currentUser = user;
      select.value = user;
      renderChatMessages();
      updateSidebarAndStats();
      if (window.innerWidth < 768) {
        closeMobileSidebar();
      }
    };

    item.innerHTML = `
      <div class="flex items-center space-x-2 truncate">
        <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${color}"></span>
        <span class="font-medium text-gray-800 dark:text-gray-200 truncate">${escapeHTML(user)} ${isCurrent ? '<span class="text-[10px] text-wa-teal font-bold">(You)</span>' : ''}</span>
      </div>
      <span class="text-[11px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">${count}</span>
    `;
    pListContainer.appendChild(item);
  });

  document.getElementById('chat-title').textContent = state.chatTitle;
  const sub = state.participants.size > 2
    ? `${state.participants.size} participants: ${Array.from(state.participants).slice(0, 3).join(', ')}...`
    : Array.from(state.participants).join(', ') || 'No members';
  document.getElementById('chat-subtitle').textContent = sub;
  document.getElementById('chat-header-avatar').textContent = (state.chatTitle[0] || 'W').toUpperCase();
}

function formatMessageText(text, searchQuery) {
  if (!text) return '';

  if (text.includes('<Media omitted>') || text.includes('image omitted') || text.includes('audio omitted') || text.includes('video omitted') || text.includes('sticker omitted')) {
    return `
      <div class="flex items-center gap-2 p-2 my-1 rounded-lg bg-black/5 dark:bg-white/5 border border-dashed border-gray-400/40 text-xs text-gray-600 dark:text-gray-300">
        <svg class="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="font-medium italic">Attachment (Media omitted)</span>
      </div>
    `;
  }

  let escaped = escapeHTML(text);

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  escaped = escaped.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 dark:text-blue-400 hover:underline break-all">${url}</a>`;
  });

  if (searchQuery && searchQuery.trim() !== '') {
    const queryEscaped = escapeRegExp(searchQuery.trim());
    const searchReg = new RegExp(`(${queryEscaped})`, 'gi');
    escaped = escaped.replace(searchReg, `<mark class="highlight-search">$1</mark>`);
  }

  return escaped.replace(/\n/g, '<br>');
}

function renderChatMessages() {
  const emptyState = document.getElementById('empty-state');
  const messagesList = document.getElementById('messages-list');

  if (state.messages.length === 0) {
    emptyState.classList.remove('hidden');
    messagesList.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  messagesList.classList.remove('hidden');
  messagesList.innerHTML = '';

  let lastDate = null;
  let matchCount = 0;
  const search = state.searchQuery.toLowerCase().trim();

  state.messages.forEach((msg) => {
    if (msg.date && msg.date !== lastDate) {
      lastDate = msg.date;
      const dateDivider = document.createElement('div');
      dateDivider.className = 'flex justify-center my-2.5 sm:my-3 sticky top-2 z-10';
      dateDivider.innerHTML = `
        <span class="bg-white/85 dark:bg-gray-800/95 text-gray-600 dark:text-gray-300 text-[10px] sm:text-[11px] font-semibold px-3 py-1 rounded-full shadow-2xs backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          ${escapeHTML(msg.date)}
        </span>
      `;
      messagesList.appendChild(dateDivider);
    }

    const matchesSearch = !search || msg.content.toLowerCase().includes(search) || msg.sender.toLowerCase().includes(search);
    if (search && matchesSearch) matchCount++;

    if (msg.isSystem) {
      if (!hasVisibleText(msg.content)) return;

      const sysBubble = document.createElement('div');
      sysBubble.className = `flex justify-center my-1.5 transition-opacity ${matchesSearch ? 'opacity-100' : 'opacity-25'}`;
      sysBubble.innerHTML = `
        <div class="bg-amber-100/90 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 text-[10px] sm:text-[11px] text-center px-3 py-1.5 rounded-lg max-w-sm sm:max-w-md shadow-2xs font-medium leading-relaxed">
          ${formatMessageText(msg.content, state.searchQuery)}
        </div>
      `;
      messagesList.appendChild(sysBubble);
      return;
    }

    const isMe = state.currentUser && (msg.sender === state.currentUser);
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'} my-0.5 sm:my-1 transition-opacity ${matchesSearch ? 'opacity-100' : 'opacity-20'}`;

    const senderColor = state.userColorMap.get(msg.sender) || '#10b981';

    const bubble = document.createElement('div');
    bubble.className = `relative max-w-[88%] xs:max-w-[82%] sm:max-w-[70%] rounded-2xl px-3 py-1.5 sm:px-3.5 sm:pt-2 sm:pb-1.5 text-xs shadow-xs break-words ${isMe
        ? 'bg-wa-bubbleSentLight dark:bg-wa-bubbleSentDark text-gray-900 dark:text-gray-100 rounded-tr-none'
        : 'bg-wa-bubbleRecvLight dark:bg-wa-bubbleRecvDark text-gray-900 dark:text-gray-100 rounded-tl-none border border-black/5 dark:border-white/5'
      }`;

    let senderHeader = '';
    if (!isMe) {
      senderHeader = `
        <div class="text-[10px] sm:text-[11px] font-bold mb-0.5 truncate" style="color: ${senderColor}">
          ${escapeHTML(msg.sender)}
        </div>
      `;
    }

    bubble.innerHTML = `
      ${senderHeader}
      <div class="message-body leading-relaxed select-text text-gray-800 dark:text-gray-100">
        ${formatMessageText(msg.content, state.searchQuery)}
      </div>
      <div class="flex items-center justify-end gap-1 mt-1 text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 select-none">
        <span>${escapeHTML(msg.time)}</span>
        ${isMe ? `
          <svg class="w-3 h-3 text-blue-500 inline ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7m-7 4l4 4" />
          </svg>
        ` : ''}
      </div>
    `;

    bubbleWrapper.appendChild(bubble);
    messagesList.appendChild(bubbleWrapper);
  });

  const searchBadge = document.getElementById('search-matches');
  if (search) {
    searchBadge.classList.remove('hidden');
    searchBadge.textContent = `${matchCount}`;
  } else {
    searchBadge.classList.add('hidden');
  }

  document.getElementById('footer-chat-info').textContent = `${state.messages.length} messages (${state.participants.size} members)`;
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function alertFallback(msg) {
  const banner = document.createElement('div');
  banner.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50 flex items-center gap-2 border border-gray-700 animate-bounce max-w-[90vw]';
  banner.innerHTML = `
    <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
    <span class="truncate">${escapeHTML(msg)}</span>
  `;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 4000);
}

// Drawer Mobile Navigation
const sidebar = document.getElementById('sidebar');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const btnOpenSidebar = document.getElementById('btn-open-sidebar');
const btnCloseSidebar = document.getElementById('btn-close-sidebar');

function openMobileSidebar() {
  sidebar.classList.remove('-translate-x-full');
  drawerBackdrop.classList.remove('hidden');
}

function closeMobileSidebar() {
  sidebar.classList.add('-translate-x-full');
  drawerBackdrop.classList.add('hidden');
}

if (btnOpenSidebar) btnOpenSidebar.addEventListener('click', openMobileSidebar);
if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeMobileSidebar);
if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMobileSidebar);

// File Dropzone Handling (App Workspace)
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');

dropzone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover'].forEach(eventName => {
  window.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add('border-wa-teal', 'bg-emerald-50/30');
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  window.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('border-wa-teal', 'bg-emerald-50/30');
  }, false);
});

window.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files && files.length > 0) {
    showAppView();
    handleChatFile(files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleChatFile(e.target.files[0]);
  }
});

document.getElementById('btn-empty-browse').addEventListener('click', () => fileInput.click());

// Direct Footer Dropzone Handling
const footerDropzone = document.getElementById('footer-dropzone');
const footerFileInput = document.getElementById('footer-file-input');

if (footerDropzone && footerFileInput) {
  footerDropzone.addEventListener('click', () => footerFileInput.click());

  footerFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      showAppView();
      handleChatFile(e.target.files[0]);
    }
  });

  footerDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    footerDropzone.classList.add('border-wa-teal', 'bg-emerald-50/30');
  });

  footerDropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    footerDropzone.classList.remove('border-wa-teal', 'bg-emerald-50/30');
  });

  footerDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    footerDropzone.classList.remove('border-wa-teal', 'bg-emerald-50/30');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      showAppView();
      handleChatFile(e.dataTransfer.files[0]);
    }
  });
}

/**
 * Automatically handle either .txt or .zip chat export files
 */
async function handleChatFile(file) {
  const fileName = file.name.toLowerCase();

  // 1. Handle .ZIP files
  if (fileName.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
    if (typeof JSZip === 'undefined') {
      alertFallback('Zip extractor is loading. Please check your internet connection and retry.');
      return;
    }

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      // Look for the main chat log file inside the ZIP archive
      // Usually named "_chat.txt", "WhatsApp Chat with <Name>.txt", or any file ending with .txt
      let chatEntry = null;
      let preferredTxtName = '';

      zipContent.forEach((relativePath, entry) => {
        if (!entry.dir && relativePath.toLowerCase().endsWith('.txt')) {
          // Priority to _chat.txt (iOS format) or files with 'whatsapp' or 'chat' in the name
          if (relativePath.toLowerCase() === '_chat.txt' || relativePath.toLowerCase().includes('chat')) {
            chatEntry = entry;
            preferredTxtName = relativePath;
          } else if (!chatEntry) {
            chatEntry = entry;
            preferredTxtName = relativePath;
          }
        }
      });

      if (!chatEntry) {
        alertFallback('No WhatsApp .txt chat log found inside this zip file.');
        return;
      }

      // Read text content directly from the zip in memory
      const text = await chatEntry.async('string');

      // Determine title: prefer clean zip file name or extracted txt name
      let chatTitle = file.name.replace(/\.zip$/i, '').replace(/^WhatsApp Chat - /i, '');
      if (preferredTxtName && preferredTxtName.toLowerCase() !== '_chat.txt') {
        chatTitle = preferredTxtName.replace(/\.txt$/i, '').replace(/^WhatsApp Chat - /i, '');
      }

      processChatData(text, chatTitle);

      setTimeout(() => {
        const container = document.getElementById('chat-container');
        if (container) container.scrollTop = container.scrollHeight;
      }, 100);

    } catch (err) {
      console.error('Error unzipping chat file:', err);
      alertFallback('Failed to extract chat from zip file. Please make sure it is a valid zip archive.');
    }
    return;
  }

  // 2. Handle plain .TXT files
  if (fileName.endsWith('.txt') || file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const chatTitle = file.name.replace(/\.txt$/i, '').replace(/^WhatsApp Chat - /i, '');
      processChatData(text, chatTitle);
      setTimeout(() => {
        const container = document.getElementById('chat-container');
        if (container) container.scrollTop = container.scrollHeight;
      }, 100);
    };
    reader.readAsText(file);
    return;
  }

  // Fallback for unsupported extensions
  alertFallback('Please upload a valid .txt or .zip file exported from WhatsApp.');
}

// User perspective dropdown
document.getElementById('user-select').addEventListener('change', (e) => {
  state.currentUser = e.target.value;
  renderChatMessages();
  updateSidebarAndStats();
  if (window.innerWidth < 768) {
    closeMobileSidebar();
  }
});

// Sample Loaders
document.getElementById('btn-load-sample').addEventListener('click', () => {
  processChatData(SAMPLE_CHAT, 'Product Design Sprint 🚀');
});

document.getElementById('btn-empty-load-sample').addEventListener('click', () => {
  processChatData(SAMPLE_CHAT, 'Product Design Sprint 🚀');
});

// Search
const searchInput = document.getElementById('search-input');
const clearSearch = document.getElementById('clear-search');

searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  if (state.searchQuery.length > 0) {
    clearSearch.classList.remove('hidden');
  } else {
    clearSearch.classList.add('hidden');
  }
  renderChatMessages();
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  clearSearch.classList.add('hidden');
  renderChatMessages();
});

// Quick scroll buttons
document.getElementById('btn-jump-bottom').addEventListener('click', () => {
  const container = document.getElementById('chat-container');
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  if (window.innerWidth < 768) closeMobileSidebar();
});

document.getElementById('btn-jump-top').addEventListener('click', () => {
  const container = document.getElementById('chat-container');
  container.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.innerWidth < 768) closeMobileSidebar();
});

// Print & PDF
document.getElementById('btn-print').addEventListener('click', () => {
  window.print();
});

// JSON Export
document.getElementById('btn-export-json').addEventListener('click', () => {
  if (state.messages.length === 0) {
    alertFallback('No chat data to export. Please load or paste a chat first.');
    return;
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.messages, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${state.chatTitle || 'chat'}-export.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

// Paste modal
const pasteModal = document.getElementById('paste-modal');
const pasteTextarea = document.getElementById('paste-textarea');

document.getElementById('btn-paste-modal').addEventListener('click', () => {
  pasteModal.classList.remove('hidden');
  pasteTextarea.focus();
});

const closeModal = () => pasteModal.classList.add('hidden');
document.getElementById('btn-close-paste').addEventListener('click', closeModal);
document.getElementById('btn-cancel-paste').addEventListener('click', closeModal);

document.getElementById('btn-apply-paste').addEventListener('click', () => {
  const text = pasteTextarea.value.trim();
  if (!text) {
    alertFallback('Please paste chat contents first.');
    return;
  }
  processChatData(text, 'Pasted Chat Conversation');
  closeModal();
  pasteTextarea.value = '';
});

// Theme switcher sync (App + Landing header)
const btnTheme = document.getElementById('btn-theme-toggle');
const themeSun = document.getElementById('theme-sun');
const themeMoon = document.getElementById('theme-moon');

const landingBtnTheme = document.getElementById('landing-theme-toggle');
const landingThemeSun = document.getElementById('landing-theme-sun');
const landingThemeMoon = document.getElementById('landing-theme-moon');

function syncThemeIcons(isDark) {
  if (isDark) {
    themeSun.classList.add('hidden');
    themeMoon.classList.remove('hidden');
    landingThemeSun.classList.add('hidden');
    landingThemeMoon.classList.remove('hidden');
  } else {
    themeSun.classList.remove('hidden');
    themeMoon.classList.add('hidden');
    landingThemeSun.classList.remove('hidden');
    landingThemeMoon.classList.add('hidden');
  }
}

function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('chatflow_theme', 'light');
    syncThemeIcons(false);
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('chatflow_theme', 'dark');
    syncThemeIcons(true);
  }
}

btnTheme.addEventListener('click', toggleTheme);
landingBtnTheme.addEventListener('click', toggleTheme);

// Theme initialization
const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('chatflow_theme');

if (savedTheme === 'dark' || (!savedTheme && isSystemDark)) {
  document.documentElement.classList.add('dark');
  syncThemeIcons(true);
} else {
  document.documentElement.classList.remove('dark');
  syncThemeIcons(false);
}

// ========================================================
// HERO SECTION LIVE TYPING & LOCKED-BOX SIMULATION
// ========================================================
(function initHeroSimulation() {
  const canvas = document.getElementById('sim-chat-canvas');
  const status = document.getElementById('sim-status');
  if (!canvas || !status) return;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function setStatus(text, isTyping = false) {
    if (isTyping) {
      status.textContent = text;
      status.className = 'text-[10px] text-wa-teal font-semibold transition-colors';
    } else {
      status.textContent = text;
      status.className = 'text-[10px] text-slate-500 dark:text-slate-400 transition-colors';
    }
  }

  function scrollBoxToBottom() {
    const parentContainer = canvas.parentElement;
    if (parentContainer) {
      parentContainer.scrollTo({
        top: parentContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  function renderTypingIndicator(senderName, isRight = false) {
    const wrapper = document.createElement('div');
    wrapper.id = 'sim-typing-bubble';
    wrapper.className = `flex flex-col ${isRight ? 'items-end' : 'items-start'} animate-bubble-pop`;

    wrapper.innerHTML = `
      <div class="px-3.5 py-2 rounded-2xl ${
        isRight 
          ? 'bg-wa-bubbleSentLight dark:bg-wa-bubbleSentDark text-slate-700 dark:text-slate-200 rounded-tr-none' 
          : 'bg-white dark:bg-wa-bubbleRecvDark text-slate-600 dark:text-slate-300 rounded-tl-none shadow-xs'
      } flex items-center space-x-1.5">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    canvas.appendChild(wrapper);
    scrollBoxToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('sim-typing-bubble');
    if (el) el.remove();
  }

  function appendBubble({ sender, color, text, isMe, time, attachment, statusId }) {
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-bubble-pop`;

    let attachmentHTML = '';
    if (attachment) {
      attachmentHTML = `
        <div class="flex items-center gap-2 p-1.5 mb-1 rounded-lg bg-black/5 dark:bg-white/5 border border-dashed border-gray-400/40 text-[11px] text-slate-700 dark:text-slate-300">
          <svg class="w-3.5 h-3.5 text-wa-teal shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
          <span class="font-medium italic">${attachment}</span>
        </div>
      `;
    }

    bubbleWrapper.innerHTML = `
      <div class="max-w-[85%] rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-xs ${
        isMe
          ? 'bg-wa-bubbleSentLight dark:bg-wa-bubbleSentDark text-slate-900 dark:text-slate-100 rounded-tr-none'
          : 'bg-white dark:bg-wa-bubbleRecvDark text-slate-900 dark:text-slate-100 rounded-tl-none border border-black/5 dark:border-white/5'
      }">
        ${!isMe ? `<span class="text-[10px] font-bold block mb-0.5" style="color: ${color}">${sender}</span>` : ''}
        ${attachmentHTML}
        <div class="leading-relaxed">${text}</div>
        <div class="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-slate-400">
          <span>${time}</span>
          ${isMe ? `
            <span id="${statusId}" class="inline-flex transition-colors text-slate-400">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          ` : ''}
        </div>
      </div>
    `;

    canvas.appendChild(bubbleWrapper);
    scrollBoxToBottom();
  }

  async function runCycle() {
    canvas.innerHTML = '';
    setStatus('Alex, Sophia, Marcus');
    await wait(600);

    // 1. Sophia initial message
    appendBubble({
      sender: 'Sophia Chen',
      color: '#059669',
      text: 'Good morning! Dropping the sprint prototype wireframes here 🎨',
      isMe: false,
      time: '10:14 AM'
    });
    await wait(1400);

    // 2. You start typing
    setStatus('Alex is typing...', true);
    renderTypingIndicator('Alex', true);
    await wait(1500);
    removeTypingIndicator();
    setStatus('Alex, Sophia, Marcus');

    // 3. You reply
    const checkId1 = 'sim-receipt-1';
    appendBubble({
      sender: 'You',
      text: 'Looks super clean! Parsing it directly into ChatFlow now ⚡',
      isMe: true,
      time: '10:15 AM',
      statusId: checkId1
    });

    // Checkmark turns double, then blue
    await wait(400);
    const receipt1 = document.getElementById(checkId1);
    if (receipt1) {
      receipt1.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7m-7 4l4 4"/></svg>`;
    }
    await wait(500);
    if (receipt1) {
      receipt1.classList.remove('text-slate-400');
      receipt1.classList.add('text-blue-500');
    }

    await wait(1200);

    // 4. Marcus typing
    setStatus('Marcus Vance is typing...', true);
    renderTypingIndicator('Marcus', false);
    await wait(1400);
    removeTypingIndicator();
    setStatus('Alex, Sophia, Marcus');

    // 5. Marcus responds with attachment (starts pushing older messages smoothly upward)
    appendBubble({
      sender: 'Marcus Vance',
      color: '#2563eb',
      text: 'Synced! Here is the raw WhatsApp archive for testing.',
      attachment: '_chat.txt (28 KB)',
      isMe: false,
      time: '10:16 AM'
    });

    await wait(1500);

    // 6. You reply once more to demonstrate older messages fading behind the top header
    setStatus('Alex is typing...', true);
    renderTypingIndicator('Alex', true);
    await wait(1300);
    removeTypingIndicator();
    setStatus('Alex, Sophia, Marcus');

    const checkId2 = 'sim-receipt-2';
    appendBubble({
      sender: 'You',
      text: 'Imported in 20ms. Zero data sent to servers 🔒',
      isMe: true,
      time: '10:17 AM',
      statusId: checkId2
    });

    const receipt2 = document.getElementById(checkId2);
    if (receipt2) {
      receipt2.innerHTML = `<svg class="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7m-7 4l4 4"/></svg>`;
    }

    // Hold loop for reading, then smoothly fade and restart
    await wait(4200);
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 0.4s ease';
    await wait(400);
    canvas.style.opacity = '1';
    runCycle();
  }

  runCycle();
})();