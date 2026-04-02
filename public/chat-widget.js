/* ============================================================
   TROUV — AI Chat Widget
   ============================================================ */
(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────
  const API_ENDPOINT = '/api/chat';
  const WELCOME_MSG  = "Good day. I'm the Trouv concierge. How can I help you today?";
  const WHATSAPP_NUMBER_INTL = '447494528909';
  const WHATSAPP_PREFILL = 'Hello Trouv, I would like to enquire about a chauffeur booking.';
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER_INTL}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;
  const QUICK_REPLIES = [
    'Airport transfers',
    'Corporate travel',
    'Fleet & vehicles',
    'Request a quote',
  ];

  // ── State ────────────────────────────────────────────────
  let isOpen     = false;
  let isLoading  = false;
  let messages   = []; // { role: 'user'|'assistant', content: string }
  let quickShown = true;

  // ── Build DOM ────────────────────────────────────────────
  function buildWidget() {
    // Bubble button
    const bubble = el('button', { class: 'trouv-chat-bubble', 'aria-label': 'Open chat' }, `
      <svg class="icon-chat" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 10H6v-2h12v2zm0-4H6V6h12v2z"/>
      </svg>
      <svg class="icon-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
      <span class="trouv-chat-badge"></span>
    `);

    // WhatsApp button (always visible on site)
    const whatsapp = el('a', {
      class: 'trouv-whatsapp-fab',
      href: WHATSAPP_URL,
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': 'WhatsApp Trouv',
      title: 'WhatsApp Trouv',
    }, `
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M19.11 17.19c-.28-.14-1.64-.81-1.9-.9-.26-.09-.45-.14-.64.14-.19.28-.73.9-.9 1.09-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.39-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.35 0 1.39 1.01 2.74 1.15 2.93.14.19 1.98 3.03 4.79 4.25.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.64-.67 1.87-1.31.23-.64.23-1.19.16-1.31-.07-.12-.26-.19-.54-.33z"/>
        <path d="M16.02 3.2c-7.04 0-12.76 5.72-12.76 12.76 0 2.25.59 4.38 1.7 6.26L3.2 28.8l6.72-1.76c1.81.99 3.89 1.51 6.1 1.51 7.04 0 12.76-5.72 12.76-12.76S23.06 3.2 16.02 3.2zm0 22.97c-2.03 0-3.91-.58-5.52-1.58l-.4-.24-3.99 1.05 1.06-3.89-.26-.41c-1.07-1.67-1.64-3.61-1.64-5.6 0-5.8 4.72-10.52 10.52-10.52s10.52 4.72 10.52 10.52-4.72 10.52-10.52 10.52z"/>
      </svg>
    `);

    // Panel
    const panel = el('div', { class: 'trouv-chat-panel', role: 'dialog', 'aria-label': 'Trouv concierge chat' }, `
      <div class="trouv-chat-header">
        <div class="trouv-chat-avatar">T</div>
        <div class="trouv-chat-header-info">
          <div class="trouv-chat-header-name">Trouv Concierge</div>
          <div class="trouv-chat-header-status">Online</div>
        </div>
        <a class="trouv-chat-whatsapp" href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Trouv">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M19.11 17.19c-.28-.14-1.64-.81-1.9-.9-.26-.09-.45-.14-.64.14-.19.28-.73.9-.9 1.09-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.39-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.35 0 1.39 1.01 2.74 1.15 2.93.14.19 1.98 3.03 4.79 4.25.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.64-.67 1.87-1.31.23-.64.23-1.19.16-1.31-.07-.12-.26-.19-.54-.33z"/>
            <path d="M16.02 3.2c-7.04 0-12.76 5.72-12.76 12.76 0 2.25.59 4.38 1.7 6.26L3.2 28.8l6.72-1.76c1.81.99 3.89 1.51 6.1 1.51 7.04 0 12.76-5.72 12.76-12.76S23.06 3.2 16.02 3.2zm0 22.97c-2.03 0-3.91-.58-5.52-1.58l-.4-.24-3.99 1.05 1.06-3.89-.26-.41c-1.07-1.67-1.64-3.61-1.64-5.6 0-5.8 4.72-10.52 10.52-10.52s10.52 4.72 10.52 10.52-4.72 10.52-10.52 10.52z"/>
          </svg>
          <span>WhatsApp</span>
        </a>
      </div>
      <div class="trouv-chat-messages" id="trouv-messages"></div>
      <div class="trouv-chat-quick" id="trouv-quick"></div>
      <div class="trouv-chat-input-row">
        <textarea class="trouv-chat-input" id="trouv-input" placeholder="Ask about our services…" rows="1" aria-label="Message"></textarea>
        <button class="trouv-chat-send" id="trouv-send" aria-label="Send" disabled>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    `);

    document.body.appendChild(bubble);
    document.body.appendChild(whatsapp);
    document.body.appendChild(panel);

    // Cache refs
    const msgsEl  = document.getElementById('trouv-messages');
    const inputEl = document.getElementById('trouv-input');
    const sendBtn = document.getElementById('trouv-send');
    const quickEl = document.getElementById('trouv-quick');

    // Welcome message
    appendMessage('assistant', WELCOME_MSG, msgsEl);
    renderQuickReplies(quickEl, inputEl, sendBtn, msgsEl);

    // ── Events ─────────────────────────────────────────────
    bubble.addEventListener('click', () => togglePanel(bubble, panel, inputEl));

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) togglePanel(bubble, panel, inputEl);
    });

    // Send on button click
    sendBtn.addEventListener('click', () => sendMessage(inputEl, sendBtn, msgsEl, quickEl));

    // Send on Enter (not shift+enter)
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) sendMessage(inputEl, sendBtn, msgsEl, quickEl);
      }
    });

    // Auto-resize textarea & enable/disable send
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
      sendBtn.disabled = inputEl.value.trim() === '' || isLoading;
    });
  }

  // ── Toggle open/close ────────────────────────────────────
  function togglePanel(bubble, panel, inputEl) {
    isOpen = !isOpen;
    bubble.classList.toggle('is-open', isOpen);
    panel.classList.toggle('is-open', isOpen);
    if (isOpen) {
      setTimeout(() => inputEl.focus(), 250);
    }
  }

  // ── Quick replies ────────────────────────────────────────
  function renderQuickReplies(quickEl, inputEl, sendBtn, msgsEl) {
    quickEl.innerHTML = '';
    QUICK_REPLIES.forEach((label) => {
      const btn = el('button', { class: 'trouv-quick-btn' }, label);
      btn.addEventListener('click', () => {
        quickEl.innerHTML = '';
        quickShown = false;
        inputEl.value = label;
        sendBtn.disabled = false;
        sendMessage(inputEl, sendBtn, msgsEl, quickEl);
      });
      quickEl.appendChild(btn);
    });
  }

  // ── Send message ─────────────────────────────────────────
  async function sendMessage(inputEl, sendBtn, msgsEl, quickEl) {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    // Clear input
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    quickEl.innerHTML = ''; // hide quick replies after first send

    // Add user message
    messages.push({ role: 'user', content: text });
    appendMessage('user', text, msgsEl);

    // Show typing
    const typingEl = showTyping(msgsEl);
    isLoading = true;

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      typingEl.remove();

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // Stream the response
      const assistantText = await streamResponse(res, msgsEl);
      messages.push({ role: 'assistant', content: assistantText });

    } catch (err) {
      typingEl.remove();
      appendMessage('assistant', 'Sorry, something went wrong. Please try again, call +44 203 835 5338, or WhatsApp +44 7494 528909.', msgsEl);
      console.error('[Trouv chat]', err);
    } finally {
      isLoading = false;
      sendBtn.disabled = inputEl.value.trim() === '';
    }
  }

  // ── Stream SSE response ──────────────────────────────────
  async function streamResponse(res, msgsEl) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    // Create streaming bubble
    const msgEl = el('div', { class: 'trouv-msg trouv-msg--assistant' });
    const bubble = el('div', { class: 'trouv-msg__bubble' });
    const timeEl = el('div', { class: 'trouv-msg__time' }, now());
    msgEl.appendChild(bubble);
    msgEl.appendChild(timeEl);
    msgsEl.appendChild(msgEl);
    scrollBottom(msgsEl);

    let fullText = '';
    let buffer   = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const json = JSON.parse(data);
          // Anthropic streaming event
          if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
            fullText += json.delta.text;
            bubble.innerHTML = renderText(fullText);
            scrollBottom(msgsEl);
          }
        } catch { /* skip malformed chunks */ }
      }
    }

    return fullText;
  }

  // ── Append a complete message ────────────────────────────
  // Convert basic markdown to HTML
  function renderText(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function appendMessage(role, text, msgsEl) {
    const msgEl  = el('div', { class: `trouv-msg trouv-msg--${role}` });
    const bubble = el('div', { class: 'trouv-msg__bubble' });
    bubble.innerHTML = renderText(text);
    const timeEl = el('div', { class: 'trouv-msg__time' }, now());
    msgEl.appendChild(bubble);
    msgEl.appendChild(timeEl);
    msgsEl.appendChild(msgEl);
    scrollBottom(msgsEl);
  }

  // ── Typing indicator ─────────────────────────────────────
  function showTyping(msgsEl) {
    const typingEl = el('div', { class: 'trouv-typing' }, '<span></span><span></span><span></span>');
    msgsEl.appendChild(typingEl);
    scrollBottom(msgsEl);
    return typingEl;
  }

  // ── Utilities ────────────────────────────────────────────
  function el(tag, attrs = {}, html = '') {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    node.innerHTML = html;
    return node;
  }

  function scrollBottom(el) {
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }

  function now() {
    return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  // ── Init ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
