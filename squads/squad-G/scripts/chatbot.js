/**
 * Chatbot Flutuante do Squad G com integração ao backend /api/chat (Gemini AI + Fallback)
 */
(function () {
  const CHAT_HISTORY = [];

  function formatMessage(text) {
    if (!text) return '';
    // Converte **negrito** e quebras de linha
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  function initChatbot() {
    // Evita duplicar se já foi inicializado
    if (document.getElementById('chatbot-root')) return;

    const root = document.createElement('div');
    root.id = 'chatbot-root';
    root.innerHTML = `
      <!-- Botão Flutuante -->
      <button id="chatbot-toggle-btn" class="chatbot-toggle-btn" aria-label="Abrir assistente virtual Squad G" title="Fale com a IA do Squad G">
        <svg class="chatbot-toggle-icon" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          <circle cx="8" cy="10" r="1.5"/>
          <circle cx="12" cy="10" r="1.5"/>
          <circle cx="16" cy="10" r="1.5"/>
        </svg>
        <span>Fale Conosco</span>
      </button>

      <!-- Janela do Chatbot -->
      <div id="chatbot-widget" class="chatbot-widget" role="dialog" aria-modal="false" aria-labelledby="chatbot-title">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">G</div>
            <div class="chatbot-header-text">
              <h3 id="chatbot-title">GIA — Assistente do Squad G</h3>
              <span><span class="chatbot-status-dot"></span> Online • IA Oficial</span>
            </div>
          </div>
          <button id="chatbot-close-btn" class="chatbot-close-btn" aria-label="Fechar chat">&times;</button>
        </div>

        <div id="chatbot-messages" class="chatbot-messages">
          <div class="chat-bubble bot">
            Olá! Eu sou a <strong>GIA</strong>, assistente virtual do <strong>Squad G</strong>. Posso ajudar você a conhecer nossos projetos, serviços, integrantes e outras informações do site. O que você gostaria de saber?
          </div>
          <div class="chatbot-quick-replies" id="chatbot-quick-replies">
            <button type="button" class="quick-reply-btn" data-msg="Quem é o Squad G?">Quem é o Squad G?</button>
            <button type="button" class="quick-reply-btn" data-msg="Quem são os integrantes?">Integrantes</button>
            <button type="button" class="quick-reply-btn" data-msg="Quais serviços vocês oferecem?">Serviços e Planos</button>
            <button type="button" class="quick-reply-btn" data-msg="Quais projetos foram desenvolvidos?">Projetos</button>
            <button type="button" class="quick-reply-btn" data-msg="Qual é o Case de Sucesso?">Case de Sucesso</button>
            <button type="button" class="quick-reply-btn" data-msg="Como posso entrar em contato?">Contato</button>
          </div>
        </div>

        <div class="chatbot-footer">
          <form id="chatbot-form" class="chatbot-input-form" onsubmit="return false;">
            <input
              type="text"
              id="chatbot-input"
              class="chatbot-input"
              placeholder="Digite sua dúvida sobre o Squad G..."
              autocomplete="off"
              aria-label="Mensagem para o assistente virtual"
            />
            <button type="submit" id="chatbot-send-btn" class="chatbot-send-btn" aria-label="Enviar mensagem">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const widget = document.getElementById('chatbot-widget');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const messagesContainer = document.getElementById('chatbot-messages');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const quickReplies = document.getElementById('chatbot-quick-replies');

    // Toggle da janela
    function toggleChat() {
      const isOpen = widget.classList.toggle('is-open');
      if (isOpen) {
        input.focus();
        scrollToBottom();
      }
    }

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', () => {
      widget.classList.remove('is-open');
    });

    function scrollToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addMessage(sender, text) {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${sender}`;
      bubble.innerHTML = formatMessage(text);
      messagesContainer.appendChild(bubble);
      scrollToBottom();
      CHAT_HISTORY.push({ sender, text });
    }

    function showTypingIndicator() {
      const indicator = document.createElement('div');
      indicator.id = 'chatbot-typing';
      indicator.className = 'typing-indicator';
      indicator.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      `;
      messagesContainer.appendChild(indicator);
      scrollToBottom();
    }

    function removeTypingIndicator() {
      const indicator = document.getElementById('chatbot-typing');
      if (indicator) indicator.remove();
    }

    async function handleUserSend(messageText) {
      const text = messageText || input.value.trim();
      if (!text) return;

      input.value = '';
      addMessage('user', text);

      // Remove sugestões rápidas após primeira pergunta para não poluir
      if (quickReplies) quickReplies.style.display = 'none';

      showTypingIndicator();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: CHAT_HISTORY
          })
        });

        const data = await response.json();
        removeTypingIndicator();

        if (data && data.reply) {
          addMessage('bot', data.reply);
        } else {
          addMessage(
            'bot',
            'Desculpe, tive um problema ao processar sua pergunta. Por favor, tente novamente.'
          );
        }
      } catch (err) {
        console.error('Erro na comunicação com o chatbot:', err);
        removeTypingIndicator();
        addMessage(
          'bot',
          'Não consegui me conectar ao servidor no momento. Por favor, verifique sua conexão ou tente mais tarde.'
        );
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserSend();
    });

    // Clique nas respostas rápidas
    if (quickReplies) {
      quickReplies.addEventListener('click', (e) => {
        const btn = e.target.closest('.quick-reply-btn');
        if (btn) {
          const msg = btn.getAttribute('data-msg');
          handleUserSend(msg);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
