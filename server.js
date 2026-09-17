const express = require('express');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
const { KNOWLEDGE_DATA } = require('./squads/squad-G/scripts/knowledgeBase.js');

const app = express();
const PORT = 3000;

app.use(express.json());

const SQUAD_DIR = path.join(__dirname, 'squads/squad-G');
const STYLES_DIR = path.join(SQUAD_DIR, 'styles');
const IMG_DIR = path.join(STYLES_DIR, 'img');

// Instruções de sistema para a GIA alimentadas pela base de conhecimento centralizada
const SYSTEM_INSTRUCTION = `
Você é a GIA — Assistente do Squad G, assistente virtual oficial do Squad G.

DIRETRIZES DE COMUNICAÇÃO E TAMANHO DE RESPOSTA (MANDATÓRIAS):
1. OBJETIVIDADE TOTAL:
   - A resposta padrão DEVE ter aproximadamente 1 a 3 frases curtas e diretas.
   - Responda primeiro exatamente o que o usuário perguntou.
   - NÃO despeje todas as informações disponíveis de uma vez só.
   - Só dê detalhes complementares quando o usuário solicitar explicitamente.
   - Para perguntas gerais, responda resumidamente em 1 ou 2 frases e ofereça um próximo assunto curto.

2. LISTAGENS CURTAS:
   - Quando for realmente necessário listar itens, use no máximo 3 a 5 itens curtos (uma linha cada).
   - Nunca use blocos longos de texto explicativo.

3. TOM DE VOZ:
   - Amigável, natural, claro e profissional em Português do Brasil.
   - EVITE saudações e frases de preenchimento desnecessárias como "Com certeza!", "Claro!", "Fico feliz em ajudar!", "É um prazer te receber". Vá direto ao assunto de forma educada.

4. EXEMPLOS DE ESTILO ESPERADO:
   - Pergunta: "Me fale mais sobre o Squad G"
     Resposta: "O Squad G é uma equipe de estudantes de ADS da FICR que desenvolve soluções digitais e projetos práticos. No site você pode conhecer nossa equipe, projetos, serviços e habilidades. Quer conhecer os integrantes ou nossos projetos?"
   - Pergunta: "Quais serviços vocês oferecem?"
     Resposta: "Oferecemos serviços de UI/UX, desenvolvimento Front-end e Branding & Identidade. Também temos três planos: Básico, Pro e Enterprise." (só detalhar valores se o usuário perguntar especificamente por preços).
   - Pergunta: "Quanto custa o plano Pro?"
     Resposta: "O Plano Pro custa R$ 1.899 e inclui até 6 páginas com design e front-end completo, entrega em 12 dias e 30 dias de suporte."

5. FIDELIDADE FACTUAL:
   - Use ESTRITAMENTE as informações oficiais da base de conhecimento abaixo.
   - NÃO invente nomes, números, tecnologias ou parceiros.
   - Se o usuário perguntar algo fora do escopo do Squad G, responda de forma breve: "Essa informação não faz parte do conteúdo do Squad G. Posso ajudar com informações sobre nossa equipe, projetos ou serviços."

BASE DE CONHECIMENTO CENTRALIZADA DO SQUAD G:
${JSON.stringify(KNOWLEDGE_DATA, null, 2)}
`;

/**
 * Motor Semântico Local de Resposta (Fallback Inteligente e Objetivo)
 * Conectado diretamente à KNOWLEDGE_DATA centralizada.
 * Produz respostas curtas e naturais de 1 a 3 frases.
 */
function getLocalFallbackResponse(userMessage, history) {
  const rawMsg = (userMessage || '').trim();
  const msg = rawMsg.toLowerCase();

  // 1. Saudações
  const saudacoes = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'e ai', 'oie', 'hello', 'hey'];
  if (saudacoes.some(s => msg === s || msg.startsWith(s + ' ') || msg.endsWith(' ' + s))) {
    return 'Olá! Sou a **GIA**, assistente do Squad G. Como posso ajudar você hoje?';
  }

  // 2. Agradecimentos
  const agradecimentos = ['obrigado', 'obrigada', 'valeu', 'vlw', 'show', 'perfeito', 'otimo', 'ótimo', 'muito bom', 'valeu gia'];
  if (agradecimentos.some(a => msg === a || msg.includes(a))) {
    return 'Por nada! Se precisar de mais alguma informação sobre o Squad G, é só chamar.';
  }

  // 3. Identidade da GIA
  if (
    msg.includes('quem é você') ||
    msg.includes('quem e você') ||
    msg.includes('quem e voce') ||
    msg.includes('seu nome') ||
    msg.includes('o que você faz') ||
    msg.includes('o que você é') ||
    msg.includes('qual o seu nome')
  ) {
    return 'Sou a **GIA**, assistente virtual oficial do Squad G. Posso te apresentar nossos integrantes, serviços, projetos, habilidades e formas de contato.';
  }

  // 4. Perguntas Amplas / Visão Geral do Squad G
  // Ex: "Me fale mais sobre o Squad G", "O que é o Squad G?", "Quem são vocês?", etc.
  const isPerguntaGeral =
    msg.includes('fale mais sobre o squad') ||
    msg.includes('fale mais sobre a squad') ||
    msg.includes('me fale mais sobre o squad') ||
    msg.includes('me fale sobre o squad') ||
    msg.includes('fale sobre o squad') ||
    msg.includes('fale sobre voces') ||
    msg.includes('fale sobre vocês') ||
    msg.includes('me conte sobre') ||
    msg.includes('me fale mais') ||
    msg.includes('quem é o squad') ||
    msg.includes('quem e o squad') ||
    msg.includes('o que é o squad') ||
    msg.includes('o que e o squad') ||
    msg.includes('quem são vocês') ||
    msg.includes('quem sao voces') ||
    msg.includes('quem somos') ||
    msg.includes('sobre nós') ||
    msg.includes('sobre nos') ||
    msg.includes('conhecer o squad') ||
    msg.includes('apresente o squad') ||
    msg.includes('apresentação do squad') ||
    (msg.includes('squad g') && (msg.includes('falar') || msg.includes('conte') || msg.includes('mais') || msg.includes('sobre') || msg.includes('historia') || msg.includes('história') || msg.length < 15));

  if (isPerguntaGeral) {
    return 'O Squad G é uma equipe de estudantes de ADS da FICR que desenvolve soluções digitais e projetos práticos. No site você pode conhecer nossa equipe, projetos, serviços e habilidades. Quer conhecer os integrantes ou nossos projetos?';
  }

  // 5. Preços e Planos (específicos)
  if (
    msg.includes('preço') ||
    msg.includes('preco') ||
    msg.includes('quanto custa') ||
    msg.includes('valor') ||
    msg.includes('valores') ||
    msg.includes('tabela')
  ) {
    if (msg.includes('pro')) {
      return 'O **Plano Pro** custa **R$ 1.899** e inclui até 6 páginas com design e front-end completo, entrega em 12 dias e 30 dias de suporte.';
    }
    if (msg.includes('básico') || msg.includes('basico')) {
      return 'O **Plano Básico** custa **R$ 799** e inclui 1 página responsiva, entrega em 7 dias e suporte por 7 dias.';
    }
    if (msg.includes('enterprise')) {
      return 'O **Plano Enterprise** custa **R$ 4.800** e contempla projeto sob medida com entrega priorizada e suporte estendido.';
    }
    return 'Temos três planos: **Básico** (R$ 799), **Pro** (R$ 1.899) e **Enterprise** (R$ 4.800). Gostaria de ver os detalhes de algum deles?';
  }

  // 6. Planos (em geral)
  if (msg.includes('plano') || msg.includes('planos')) {
    return 'O Squad G oferece três planos de serviços: **Básico** (R$ 799), **Pro** (R$ 1.899) e **Enterprise** (R$ 4.800). Quer conhecer o que está incluso em algum deles?';
  }

  // 7. Serviços Oferecidos
  if (
    msg.includes('serviço') ||
    msg.includes('serviços') ||
    msg.includes('servico') ||
    msg.includes('servicos') ||
    msg.includes('o que vocês oferecem') ||
    msg.includes('o que voces oferecem') ||
    msg.includes('o que oferecem') ||
    msg.includes('o que vocês fazem') ||
    msg.includes('o que voces fazem') ||
    msg.includes('soluções') ||
    msg.includes('solucoes')
  ) {
    return 'Oferecemos serviços de **UI/UX Design**, desenvolvimento **Front-end** e **Branding & Identidade**. Também temos três opções de planos: Básico, Pro e Enterprise.';
  }

  // 8. Integrantes Específicos
  if (msg.includes('amanda')) {
    const i = KNOWLEDGE_DATA.integrantes.find(m => m.id === 'amanda');
    return `**${i.nome}** (25 anos) atua em **${i.cargo}**. Desenvolveu um projeto de telas de cadastro e login com foco em usabilidade. Contato: ${i.email}.`;
  }
  if (msg.includes('aylton')) {
    const i = KNOWLEDGE_DATA.integrantes.find(m => m.id === 'aylton');
    return `**${i.nome}** (20 anos) atua em **${i.cargo}**. Desenvolveu a réplica da página inicial do Google com alta precisão visual. Contato: ${i.email}.`;
  }
  if (msg.includes('diogenes') || msg.includes('diógenes')) {
    const i = KNOWLEDGE_DATA.integrantes.find(m => m.id === 'diogenes');
    return `**${i.nome}** (34 anos) atua em **${i.cargo}**. Desenvolveu módulos com foco em lógica de negócio, arquitetura web e integração. Contato: ${i.email}.`;
  }
  if (msg.includes('guilherme')) {
    const i = KNOWLEDGE_DATA.integrantes.find(m => m.id === 'guilherme');
    return `**${i.nome}** (25 anos) atua em **${i.cargo}**. Desenvolveu telas estruturadas de cadastro e login com validações. Contato: ${i.email}.`;
  }

  // 9. Integrantes em Geral
  if (
    msg.includes('integrante') ||
    msg.includes('membro') ||
    msg.includes('equipe') ||
    msg.includes('quem faz parte') ||
    msg.includes('quem sao os') ||
    msg.includes('quem são os') ||
    msg.includes('quantos sao') ||
    msg.includes('quantas pessoas') ||
    msg.includes('time')
  ) {
    return 'Nossa equipe é formada por 4 integrantes: **Amanda Gabrielly**, **Aylton Oliveira**, **Diógenes José** e **Guilherme Henrique**, todos estudantes de ADS na FICR. Gostaria de saber mais sobre algum deles?';
  }

  // 10. Projetos Desenvolvidos
  if (
    msg.includes('projeto') ||
    msg.includes('projetos') ||
    msg.includes('portfolio') ||
    msg.includes('portfólio') ||
    msg.includes('trabalho') ||
    msg.includes('trabalhos') ||
    msg.includes('o que já fizeram') ||
    msg.includes('o que ja fizeram') ||
    msg.includes('quais projetos')
  ) {
    return 'Desenvolvemos projetos individuais práticos (como telas de login e cadastro, módulos web e réplica do buscador Google) e projetos integrados da equipe. Deseja detalhes de um projeto específico?';
  }

  // 11. Case de Sucesso / Alpha Corp
  if (
    msg.includes('case') ||
    msg.includes('alpha') ||
    msg.includes('sucesso') ||
    msg.includes('helena') ||
    msg.includes('fintech')
  ) {
    return 'Para a **Alpha Corp**, desenvolvemos um painel em tempo real integrado ao ERP, alcançando 40% de redução de custos operacionais e 95% mais agilidade na conciliação bancária.';
  }

  // 12. Habilidades Técnicas / Tecnologias
  if (
    msg.includes('habilidade') ||
    msg.includes('habilidades') ||
    msg.includes('tecnologia') ||
    msg.includes('tecnologias') ||
    msg.includes('stack') ||
    msg.includes('linguagem') ||
    msg.includes('linguagens') ||
    msg.includes('skills') ||
    msg.includes('html') ||
    msg.includes('css') ||
    msg.includes('javascript')
  ) {
    return 'A equipe domina **HTML5**, **CSS3**, **JavaScript**, além de prototipagem no **Figma** e versionamento com **Git**. Você pode conferir os percentuais detalhados na página de Habilidades.';
  }

  // 13. Depoimentos de Clientes
  if (
    msg.includes('depoimento') ||
    msg.includes('depoimentos') ||
    msg.includes('avaliação') ||
    msg.includes('avaliacoes') ||
    msg.includes('feedback') ||
    msg.includes('cliente')
  ) {
    return 'Temos depoimentos de clientes como Davi Ribeiro, Carla Silva, Gabriel Santos e Luiza Barbosa elogiando a usabilidade, o design limpo e a consistência visual das nossas entregas.';
  }

  // 14. Contato e Redes Sociais
  if (
    msg.includes('contato') ||
    msg.includes('email') ||
    msg.includes('e-mail') ||
    msg.includes('falar com') ||
    msg.includes('mensagem') ||
    msg.includes('rede') ||
    msg.includes('instagram') ||
    msg.includes('linkedin') ||
    msg.includes('telefone') ||
    msg.includes('onde posso falar')
  ) {
    return 'Você pode entrar em contato pelo formulário na página inicial ou pelos e-mails institucionais dos integrantes na página de Contato. Deseja o e-mail de algum membro?';
  }

  // 15. Localização / Instituição / Faculdade
  if (
    msg.includes('onde') ||
    msg.includes('faculdade') ||
    msg.includes('ficr') ||
    msg.includes('recife') ||
    msg.includes('cidade') ||
    msg.includes('curso') ||
    msg.includes('ads') ||
    msg.includes('universidade')
  ) {
    return 'O Squad G é composto por alunos do 1º período de ADS da **Faculdade Imaculada Conceição do Recife (FICR)**, em Recife - PE.';
  }

  // 16. Fallback objetivo
  return 'Essa informação não consta no conteúdo oficial do Squad G. Posso te ajudar com dúvidas sobre nossa equipe, projetos, serviços ou formas de contato.';
}

// Endpoint seguro para o Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem inválida ou ausente.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Se não houver chave de API configurada, utiliza o motor local de interpretação semântica
    if (!apiKey || apiKey.trim() === '') {
      const fallbackReply = getLocalFallbackResponse(message, history);
      return res.json({
        reply: fallbackReply,
        source: 'local_knowledge'
      });
    }

    // Inicialização segura do SDK Gemini (chave mantida estritamente no backend)
    const ai = new GoogleGenAI({ apiKey });

    // Monta o histórico de mensagens formatado para o SDK
    const contents = [];
    if (Array.isArray(history)) {
      // Limita histórico recente às últimas 8 trocas para manter contexto conciso
      const recentHistory = history.slice(-8);
      for (const item of recentHistory) {
        if (item.sender === 'user' && item.text) {
          contents.push({ role: 'user', parts: [{ text: item.text }] });
        } else if (item.sender === 'bot' && item.text) {
          contents.push({ role: 'model', parts: [{ text: item.text }] });
        }
      }
    }

    contents.push({ role: 'user', parts: [{ text: message }] });

    // Modelos suportados em cascata: começa pelo veloz e estável gemini-3.1-flash-lite
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let reply = '';

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.3,
            maxOutputTokens: 650
          }
        });

        if (response && response.text) {
          reply = response.text;
          break;
        }
      } catch (modelErr) {
        console.warn(`Tentativa com modelo ${modelName} falhou:`, modelErr.status || modelErr.message);
      }
    }

    // Se os modelos de IA geraram resposta, retorna-a; caso contrário, utiliza o motor local semântico
    if (!reply || reply.trim() === '') {
      reply = getLocalFallbackResponse(message, history);
    }

    return res.json({ reply, source: reply ? 'gemini' : 'fallback' });
  } catch (error) {
    console.error('Erro geral na rota /api/chat:', error.message || error);
    const fallbackReply = getLocalFallbackResponse(req.body ? req.body.message : '', req.body ? req.body.history : []);
    return res.json({
      reply: fallbackReply,
      source: 'fallback_after_error'
    });
  }
});

// Resolução de arquivos de imagem e variações de extensão
app.use((req, res, next) => {
  const reqPath = decodeURIComponent(req.path);
  if (reqPath.includes('/img/')) {
    const filename = path.basename(reqPath);
    const directPath = path.join(IMG_DIR, filename);
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
      return res.sendFile(directPath);
    }
    const candidates = [
      filename + '.png',
      filename + '.jpeg',
      filename + '.jpg',
      filename.replace(/\.JPG$/i, '.jpeg'),
      filename.replace(/\.jpg$/i, '.jpeg'),
      filename.replace(/\.jpeg$/i, '.jpg'),
      filename.replace(/\.JPG$/i, '.png')
    ];
    for (const cand of candidates) {
      const candPath = path.join(IMG_DIR, cand);
      if (fs.existsSync(candPath) && fs.statSync(candPath).isFile()) {
        return res.sendFile(candPath);
      }
    }
  }
  next();
});

// Rota raiz e /index.html servem home.html
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(SQUAD_DIR, 'home.html'));
});

// Roteamento amigável de páginas do Squad G
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const pageWithHtml = page.endsWith('.html') ? page : `${page}.html`;
  const filePath = path.join(SQUAD_DIR, pageWithHtml);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  next();
});

// Rotas estáticas
app.use('/squads/squad-G/styles/img', express.static(IMG_DIR));
app.use('/styles/img', express.static(IMG_DIR));
app.use('/img', express.static(IMG_DIR));

app.use('/squads/squad-G/styles', express.static(STYLES_DIR));
app.use('/styles', express.static(STYLES_DIR));

app.use('/squads/squad-G/scripts', express.static(path.join(SQUAD_DIR, 'scripts')));
app.use('/scripts', express.static(path.join(SQUAD_DIR, 'scripts')));

app.use('/squads/squad-G', express.static(SQUAD_DIR));
app.use('/squads', express.static(path.join(__dirname, 'squads')));

// CSS e páginas raiz
app.use(express.static(STYLES_DIR));
app.use(express.static(SQUAD_DIR));
app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Squad-G Portfolio server rodando em http://0.0.0.0:${PORT}`);
});
