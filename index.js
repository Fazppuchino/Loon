(() => {
  'use strict';

  // This client-side key is visible to anyone who can inspect the page.
  // Use only a key intended for public browser use, or proxy requests through a backend.
  const OPENROUTER_API_KEY = 'PUT YOUR API KEY HERE';
  const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const MODELS = [
    { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nemotron 3 Ultra · NVIDIA' },
    { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B · Google' }
  ];
  const SYSTEM_PROMPT = 'You are Loon, a friendly, thoughtful AI assistant named after the loon bird. Be helpful, clear, and honest. When an image is attached, use its visual contents to answer the user.';

  const styles = `
    #loon-page { width: min(100%, 940px); margin: 0 auto; }
    .loon-shell { display:flex; height:min(76vh, 820px); min-height:480px; flex-direction:column; overflow:hidden; border:1px solid var(--appearance-border, var(--border-color)); border-radius:16px; background:var(--appearance-raised, var(--modal-bg)); }
    .loon-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1rem 1.15rem; border-bottom:1px solid var(--appearance-border, var(--border-color)); }
    .loon-brand { display:flex; align-items:center; gap:.7rem; min-width:0; }
    .loon-mark { display:grid; width:38px; height:38px; flex:0 0 38px; place-items:center; border:1px solid var(--appearance-border, var(--border-color)); border-radius:12px; background:var(--appearance-surface, var(--panel-bg)); font-size:1.25rem; }
    .loon-heading { min-width:0; }
    .loon-heading h1 { font:600 1rem var(--display-font-family, var(--font-family)); }
    .loon-heading p { color:var(--muted-text); font-size:.72rem; }
    .loon-controls { display:flex; align-items:center; gap:.5rem; }
    .loon-header .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    .loon-model { max-width:250px; min-height:38px; padding:.4rem .6rem; font-size:.72rem; }
    .loon-clear { min-height:38px; padding:.4rem .7rem; font-size:.72rem; }
    .loon-messages { display:flex; flex:1; flex-direction:column; gap:1rem; overflow-y:auto; padding:1.25rem; overscroll-behavior:contain; }
    .loon-welcome { display:grid; flex:1; align-content:center; justify-items:center; gap:.65rem; padding:2rem; text-align:center; }
    .loon-welcome h2 { font:500 clamp(1.45rem, 4vw, 2rem) var(--display-font-family, var(--font-family)); }
    .loon-welcome p { max-width:28rem; color:var(--muted-text); font-size:.84rem; }
    .loon-message { display:flex; width:100%; gap:.65rem; align-items:flex-start; }
    .loon-message.user { justify-content:flex-end; }
    .loon-message-content { max-width:min(82%, 680px); padding:.8rem .95rem; border:1px solid var(--appearance-border, var(--border-color)); border-radius:14px; background:var(--appearance-surface, var(--panel-bg)); font-size:.84rem; line-height:1.65; overflow-wrap:anywhere; }
    .loon-message.user .loon-message-content { background:var(--appearance-hover, color-mix(in srgb, var(--text-color) 7%, transparent)); }
    .loon-message-text { white-space:pre-wrap; }
    .loon-message-image { display:block; max-width:min(100%, 420px); max-height:280px; margin-bottom:.65rem; border-radius:9px; object-fit:contain; }
    .loon-message-label { display:block; margin-bottom:.25rem; color:var(--muted-text); font-size:.62rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; }
    .loon-compose-area { padding:.85rem 1rem 1rem; border-top:1px solid var(--appearance-border, var(--border-color)); background:var(--appearance-surface, var(--panel-bg)); }
    .loon-attachment { display:flex; align-items:center; gap:.6rem; margin:0 auto .6rem; max-width:800px; color:var(--muted-text); font-size:.72rem; }
    .loon-attachment[hidden] { display:none; }
    .loon-attachment img { width:38px; height:38px; border-radius:6px; object-fit:cover; }
    .loon-attachment-name { overflow:hidden; flex:1; text-overflow:ellipsis; white-space:nowrap; }
    .loon-remove-image { min-height:30px; padding:.25rem .55rem; font-size:.68rem; }
    .loon-compose { display:flex; align-items:flex-end; gap:.5rem; width:min(100%, 800px); margin:0 auto; padding:.5rem; border:1px solid var(--appearance-border, var(--border-color)); border-radius:14px; background:var(--appearance-raised, var(--modal-bg)); }
    .loon-compose:focus-within { border-color:var(--accent-color); }
    .loon-input { width:100%; min-height:42px; max-height:180px; padding:.65rem .55rem; resize:none; border:0 !important; outline:0; background:transparent !important; box-shadow:none !important; color:var(--text-color); font:inherit; font-size:.84rem; line-height:1.5; }
    .loon-input::placeholder { color:var(--muted-text); }
    .loon-icon-btn { display:grid; width:40px; height:40px; flex:0 0 40px; place-items:center; border:1px solid transparent; border-radius:11px; background:transparent; color:var(--muted-text); cursor:pointer; font:inherit; font-size:1.1rem; }
    .loon-icon-btn:hover { border-color:var(--appearance-border, var(--border-color)); background:var(--appearance-hover, color-mix(in srgb, var(--text-color) 7%, transparent)); color:var(--text-color); }
    .loon-send { background:var(--accent-color); color:var(--appearance-accent-ink, var(--bg-color)); }
    .loon-send:hover { border-color:var(--accent-color); color:var(--appearance-accent-ink, var(--bg-color)); }
    .loon-icon-btn:disabled { cursor:not-allowed; opacity:.5; }
    .loon-hint { width:min(100%, 800px); margin:.45rem auto 0; color:var(--muted-text); font-size:.65rem; text-align:center; }
    .loon-status { min-height:1.1rem; margin:0 auto .4rem; color:var(--muted-text); font-size:.72rem; text-align:center; }
    .loon-status:empty { display:none; }
    @media(max-width:600px) {
      .loon-shell { height:calc(100dvh - 190px); min-height:420px; }
      .loon-header { align-items:flex-start; flex-direction:column; }
      .loon-controls { width:100%; }
      .loon-model { min-width:0; max-width:none; flex:1; }
      .loon-messages { padding:.85rem; }
      .loon-message-content { max-width:92%; }
      .loon-compose-area { padding:.7rem; }
    }
  `;

  function initLoon() {
    const main = document.querySelector('main');
    const nav = document.querySelector('#main-navigation .nav-group:last-child');
    if (!main || !nav || document.getElementById('loon')) return;

    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);

    const navButton = document.createElement('button');
    navButton.className = 'nav-link';
    navButton.type = 'button';
    navButton.dataset.page = 'loon';
    navButton.setAttribute('aria-label', 'Loon AI chat');
    navButton.title = 'Loon AI chat';
    navButton.textContent = 'Loon';
    navButton.addEventListener('click', () => window.switchPage('loon'));
    nav.appendChild(navButton);

    const page = document.createElement('section');
    page.id = 'loon';
    page.className = 'page-content';
    page.innerHTML = `
      <div id="loon-page">
        <div class="loon-shell" aria-label="Loon AI chat">
          <div class="loon-header">
            <div class="loon-brand">
              <div class="loon-mark" aria-hidden="true">🪶</div>
              <div class="loon-heading"><h1>Loon</h1><p>A thoughtful little AI assistant</p></div>
            </div>
            <div class="loon-controls">
              <label for="loon-model" class="sr-only">AI model</label>
              <select class="loon-model" id="loon-model" aria-label="Choose AI model"></select>
              <button class="btn btn-secondary loon-clear" id="loon-clear" type="button">New chat</button>
            </div>
          </div>
          <div class="loon-messages" id="loon-messages" role="log" aria-live="polite" aria-relevant="additions text">
            <div class="loon-welcome" id="loon-welcome"><div class="loon-mark" aria-hidden="true">🪶</div><h2>What’s on your mind?</h2><p>Ask Loon anything, or attach an image and ask what it sees.</p></div>
          </div>
          <div class="loon-compose-area">
            <div class="loon-status" id="loon-status" role="status" aria-live="polite"></div>
            <div class="loon-attachment" id="loon-attachment" hidden>
              <img id="loon-attachment-preview" alt="Selected image preview">
              <span class="loon-attachment-name" id="loon-attachment-name"></span>
              <button class="btn btn-secondary loon-remove-image" id="loon-remove-image" type="button">Remove</button>
            </div>
            <form class="loon-compose" id="loon-form">
              <input id="loon-file" type="file" accept="image/*" hidden>
              <button class="loon-icon-btn" id="loon-attach" type="button" aria-label="Attach an image" title="Attach an image">＋</button>
              <textarea class="loon-input" id="loon-input" rows="1" maxlength="12000" placeholder="Message Loon…" aria-label="Message Loon"></textarea>
              <button class="loon-icon-btn loon-send" id="loon-send" type="submit" aria-label="Send message" title="Send message">↑</button>
            </form>
            <p class="loon-hint">Enter to send · Shift+Enter for a new line · Responses may take a moment</p>
          </div>
        </div>
      </div>`;
    main.appendChild(page);

    const modelSelect = page.querySelector('#loon-model');
    MODELS.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name;
      modelSelect.appendChild(option);
    });

    const messagesEl = page.querySelector('#loon-messages');
    const input = page.querySelector('#loon-input');
    const form = page.querySelector('#loon-form');
    const fileInput = page.querySelector('#loon-file');
    const attachButton = page.querySelector('#loon-attach');
    const sendButton = page.querySelector('#loon-send');
    const status = page.querySelector('#loon-status');
    const attachment = page.querySelector('#loon-attachment');
    const imagePreview = page.querySelector('#loon-attachment-preview');
    const imageName = page.querySelector('#loon-attachment-name');
    const conversation = [{ role: 'system', content: SYSTEM_PROMPT }];
    let pendingImage = null;
    let controller = null;

    function scrollToBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }

    function appendMessage(role, text, imageUrl) {
      page.querySelector('#loon-welcome')?.remove();
      const row = document.createElement('div');
      row.className = 'loon-message ' + (role === 'user' ? 'user' : 'assistant');
      const bubble = document.createElement('div');
      bubble.className = 'loon-message-content';
      const label = document.createElement('span');
      label.className = 'loon-message-label';
      label.textContent = role === 'user' ? 'You' : 'Loon';
      bubble.appendChild(label);
      if (imageUrl) {
        const image = document.createElement('img');
        image.className = 'loon-message-image';
        image.src = imageUrl;
        image.alt = 'Image attached to message';
        bubble.appendChild(image);
      }
      const body = document.createElement('div');
      body.className = 'loon-message-text';
      body.textContent = text;
      bubble.appendChild(body);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      scrollToBottom();
      return body;
    }

    function setBusy(busy) {
      sendButton.disabled = busy;
      attachButton.disabled = busy;
      modelSelect.disabled = busy;
      sendButton.textContent = busy ? '…' : '↑';
      sendButton.setAttribute('aria-label', busy ? 'Loon is responding' : 'Send message');
      sendButton.title = busy ? 'Loon is responding' : 'Send message';
    }

    function clearPendingImage() {
      pendingImage = null;
      fileInput.value = '';
      attachment.hidden = true;
      imagePreview.removeAttribute('src');
      imageName.textContent = '';
    }

    page.querySelector('#loon-clear').addEventListener('click', () => {
      if (controller) controller.abort();
      controller = null;
      conversation.splice(1);
      messagesEl.innerHTML = '<div class="loon-welcome" id="loon-welcome"><div class="loon-mark" aria-hidden="true">🪶</div><h2>What’s on your mind?</h2><p>Ask Loon anything, or attach an image and ask what it sees.</p></div>';
      status.textContent = '';
      clearPendingImage();
      input.value = '';
      setBusy(false);
      input.focus();
    });

    attachButton.addEventListener('click', () => fileInput.click());
    page.querySelector('#loon-remove-image').addEventListener('click', clearPendingImage);
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        status.textContent = 'Please choose an image file.';
        fileInput.value = '';
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        status.textContent = 'That image is over 8 MB. Choose a smaller image.';
        fileInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        pendingImage = { dataUrl: String(reader.result), name: file.name };
        imagePreview.src = pendingImage.dataUrl;
        imageName.textContent = file.name;
        attachment.hidden = false;
        status.textContent = '';
      };
      reader.onerror = () => { status.textContent = 'Could not read that image.'; };
      reader.readAsDataURL(file);
    });

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 180) + 'px';
    });

    async function readStream(response, output) {
      if (!response.body || !response.body.getReader) {
        const result = await response.json();
        const content = result.choices?.[0]?.message?.content;
        if (typeof content !== 'string') throw new Error('The model returned an unsupported response.');
        output.textContent = content;
        return content;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          let event;
          try { event = JSON.parse(payload); } catch (error) { continue; }
          if (event.error?.message) throw new Error(event.error.message);
          const delta = event.choices?.[0]?.delta?.content;
          if (typeof delta === 'string') {
            fullText += delta;
            output.textContent = fullText;
            scrollToBottom();
          } else if (Array.isArray(delta)) {
            delta.forEach(part => {
              if (part.type === 'text' && typeof part.text === 'string') fullText += part.text;
            });
            output.textContent = fullText;
            scrollToBottom();
          }
        }
      }
      return fullText;
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (controller) return;
      const text = input.value.trim();
      if (!text && !pendingImage) return;
      if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'PUT YOUR API KEY HERE') {
        status.textContent = 'Add your OpenRouter API key in index.js before sending a message.';
        return;
      }

      const image = pendingImage;
      const userContent = image
        ? [
            ...(text ? [{ type: 'text', text }] : [{ type: 'text', text: 'Please describe this image.' }]),
            { type: 'image_url', image_url: { url: image.dataUrl } }
          ]
        : text;
      conversation.push({ role: 'user', content: userContent });
      appendMessage('user', text || 'What is in this image?', image && image.dataUrl);
      input.value = '';
      input.style.height = 'auto';
      clearPendingImage();
      status.textContent = 'Loon is thinking…';
      controller = new AbortController();
      const requestController = controller;
      setBusy(true);
      const responseBody = appendMessage('assistant', '');

      try {
        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          signal: requestController.signal,
          headers: {
            'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Loon AI'
          },
          body: JSON.stringify({
            model: modelSelect.value,
            messages: conversation,
            stream: true
          })
        });
        if (!response.ok) {
          let detail = 'OpenRouter request failed (' + response.status + ').';
          try {
            const errorData = await response.json();
            detail = errorData.error?.message || errorData.message || detail;
          } catch (error) {}
          throw new Error(detail);
        }
        const answer = await readStream(response, responseBody);
        if (!answer.trim()) throw new Error('The model returned an empty response.');
        conversation.push({ role: 'assistant', content: answer });
        status.textContent = '';
      } catch (error) {
        if (error.name === 'AbortError') return;
        responseBody.textContent = 'Sorry, I could not get a response. ' + error.message;
        status.textContent = 'Check the API key, model access, and browser console if this keeps happening.';
        conversation.pop();
        if (conversation[conversation.length - 1]?.role === 'user') conversation.pop();
      } finally {
        if (controller === requestController) {
          controller = null;
          setBusy(false);
          input.focus();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoon, { once: true });
  } else {
    initLoon();
  }
})();
