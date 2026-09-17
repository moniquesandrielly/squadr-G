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
Você é a GIA — Assistente do Squad G, a assistente virtual oficial do Squad G.

PERSONALIDADE E DIRETRIZES DE COMUNICAÇÃO:
- Seu nome é GIA — Assistente do Squad G.
- Você é simpática, clara, objetiva, educada e profissional, comunicando-se sempre em Português do Brasil com linguagem simples, acessível e acolhedora.
- Você NÃO é um chatbot genérico. Você é dedicada exclusivamente ao Squad G e ao conteúdo do seu site oficial.
- Suas respostas devem ser de tamanho curto a médio, claras e naturais, evitando blocos gigantes de texto. Utilize negrito e listas estruturadas para facilitar a leitura.
- Mantenha o contexto da conversa: use o histórico recente para responder perguntas complementares ou pronomes com fluidez.

DIRETRIZES DE RESPOSTA (CRÍTICAS):
1. PERGUNTAS AMPLAS OU GERAIS (ex: "Me fale mais sobre o Squad G", "O que é o Squad G?", "Quem são vocês?", "O que vocês fazem?", "Apresente o projeto"):
   - Dê uma visão geral acolhedora e completa combinando informações de diferentes páginas do site:
     • Quem somos: equipe de desenvolvimento formada por estudantes do 1º período de ADS na FICR (Faculdade Imaculada Conceição do Recife, turma 2025).
     • O que fazemos: desenvolvimento de soluções tecnológicas unindo boas práticas de design UI/UX, Front-End moderno (HTML5, CSS3, JS) e inovação.
     • A equipe: 4 integrantes talentosos (Amanda Gabrielly, Aylton Oliveira, Diógenes José e Guilherme Henrique).
     • Destaques do site: projetos individuais estruturados, serviços com planos acessíveis, case de sucesso real com a Alpha Corp e canais diretos de contato.
   - Ao final, ofereça de forma simpática alguns assuntos relacionados que o visitante pode explorar (ex: integrantes, serviços e planos, projetos práticos, case de sucesso ou formas de contato).

2. INTERPRETAÇÃO SEMÂNTICA:
   - Não exija palavras exatas nem correspondência rígida. Compreenda o significado e a intenção do usuário:
     • "quais serviços vocês oferecem" -> apresente os 3 serviços (UI/UX, Front-end, Branding) e mencione os planos de preços.
     • "quais projetos vocês fizeram" -> apresente os projetos práticos individuais de cada membro e os projetos destacados na Home.
     • "quem faz parte da equipe" -> apresente os 4 integrantes com seus perfis e papéis.
     • "quanto custa" / "preços" -> detalhe os planos Básico (R$ 799), Pro (R$ 1.899) e Enterprise (R$ 4.800).
     • "case de sucesso" -> apresente a solução e os resultados para a Alpha Corp (40% de redução de custos, 95% mais velocidade na conciliação, 0.2s de API).
     • "habilidades" / "tecnologias" -> detalhe a proficiência técnica em HTML, CSS e JavaScript de cada membro.
     • "contato" -> informe os e-mails individuais, as redes sociais e o formulário na Home.

3. FIDELIDADE À BASE DE CONHECIMENTO E PREVENÇÃO DE ALUCINAÇÕES:
   - NÃO invente informações, membros, números, tecnologias ou parceiros além dos descritos na base oficial.
   - Se o usuário fizer uma pergunta sobre algo que REALMENTE não existe no projeto, responda de maneira natural, educada e prestativa: esclareça que essa informação específica não consta no conteúdo do site e sugira temas relacionados disponíveis sobre o Squad G. Evite respostas robóticas ou frias.

BASE DE CONHECIMENTO CENTRALIZADA DO SQUAD G:
${JSON.stringify(KNOWLEDGE_DATA, null, 2)}
`;

/**
 * Motor Semântico Local de Resposta (Fallback Inteligente)
 * Conectado diretamente à KNOWLEDGE_DATA centralizada.
 * Interpreta o significado e intenção da pergunta com suporte a sinônimos e perguntas amplas.
 */
function getLocalFallbackResponse(userMessage, history) {
  const rawMsg = (userMessage || '').trim();
  const msg = rawMsg.toLowerCase();

  // Histórico recente para contexto
  let lastBotMsg = '';
  if (Array.isArray(history) && history.length > 0) {
    const botHistory = history.filter(h => h.sender === 'bot');
    if (botHistory.length > 0) {
      lastBotMsg = (botHistory[botHistory.length - 1].text || '').toLowerCase();
    }
  }

  // 1. Saudações
  const saudacoes = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'e ai', 'oie', 'hello', 'hey'];
  if (saudacoes.some(s => msg === s || msg.startsWith(s + ' ') || msg.endsWith(' ' + s))) {
    return 'Olá! Eu sou a **GIA**, assistente virtual oficial do **Squad G**. Posso ajudar você a conhecer nossa equipe, projetos, serviços, planos, habilidades e muito mais. O que você gostaria de saber?';
  }

  // 2. Agradecimentos
  const agradecimentos = ['obrigado', 'obrigada', 'valeu', 'vlw', 'show', 'perfeito', 'otimo', 'ótimo', 'muito bom', 'valeu gia'];
  if (agradecimentos.some(a => msg === a || msg.includes(a))) {
    return 'De nada! Fico feliz em ajudar. Se tiver mais alguma dúvida sobre o **Squad G**, é só me chamar!';
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
    return 'Eu sou a **GIA**, assistente virtual oficial do **Squad G**! Meu objetivo é ajudar você a conhecer tudo sobre nosso grupo, nossos integrantes, serviços, projetos, habilidades, case de sucesso e formas de contato.';
  }

  // 4. Perguntas Amplas / Visão Geral do Squad G
  // Ex: "Me fale mais sobre o Squad G", "O que é o Squad G?", "Quem são vocês?", "Fale sobre o projeto", etc.
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
    return 'O **Squad G** é uma equipe de desenvolvimento web formada por estudantes do 1º período de Análise e Desenvolvimento de Sistemas (ADS) da **Faculdade Imaculada Conceição do Recife (FICR)**, turma de 2025.\n\n' +
      'Nosso objetivo é transformar ideias em soluções digitais reais, unindo design centrado no usuário, desenvolvimento moderno em HTML5/CSS3/JS e colaboração focada em resultados.\n\n' +
      'O grupo é composto por 4 integrantes: **Amanda Gabrielly**, **Aylton Oliveira**, **Diógenes José** e **Guilherme Henrique**.\n\n' +
      '💡 **Sobre o que você gostaria de saber mais agora?**\n' +
      '• **Integrantes**: perfil, cargo e habilidades de cada membro;\n' +
      '• **Serviços & Planos**: design UI/UX, front-end, branding e preços;\n' +
      '• **Projetos**: telas e módulos desenvolvidos na prática;\n' +
      '• **Case de Sucesso**: a solução financeira para a Alpha Corp;\n' +
      '• **Contato**: e-mails e redes sociais da equipe.';
  }

  // 5. Integrantes Específicos
  // Amanda
  if (msg.includes('amanda') || ((msg.includes('ela') || msg.includes('dela')) && lastBotMsg.includes('amanda'))) {
    const amanda = KNOWLEDGE_DATA.integrantes.find(i => i.id === 'amanda');
    return `A **${amanda.nome}** tem ${amanda.idade} anos e é ${amanda.formacao}. Atua como **${amanda.cargo}**.\n\n` +
      `• **Habilidades**: HTML (${amanda.habilidades.html}), CSS (${amanda.habilidades.css}) e JavaScript (${amanda.habilidades.js}).\n` +
      `• **Projeto**: ${amanda.projeto}\n` +
      `• **Contato**: ${amanda.email} e links de redes na página de Contato.`;
  }

  // Aylton
  if (msg.includes('aylton') || ((msg.includes('ele') || msg.includes('dele')) && lastBotMsg.includes('aylton'))) {
    const aylton = KNOWLEDGE_DATA.integrantes.find(i => i.id === 'aylton');
    return `O **${aylton.nome}** tem ${aylton.idade} anos e é ${aylton.formacao}. Atua como **${aylton.cargo}**.\n\n` +
      `• **Habilidades**: HTML (${aylton.habilidades.html}), CSS (${aylton.habilidades.css}) e JavaScript (${aylton.habilidades.js}).\n` +
      `• **Projeto**: ${aylton.projeto}\n` +
      `• **Contato**: ${aylton.email} e links de redes na página de Contato.`;
  }

  // Diógenes
  if (msg.includes('diogenes') || msg.includes('diógenes') || ((msg.includes('ele') || msg.includes('dele')) && (lastBotMsg.includes('diogenes') || lastBotMsg.includes('diógenes')))) {
    const diogenes = KNOWLEDGE_DATA.integrantes.find(i => i.id === 'diogenes');
    return `O **${diogenes.nome}** tem ${diogenes.idade} anos e é ${diogenes.formacao}. Atua como **${diogenes.cargo}**.\n\n` +
      `• **Habilidades**: HTML (${diogenes.habilidades.html}), CSS (${diogenes.habilidades.css}) e JavaScript (${diogenes.habilidades.js}).\n` +
      `• **Projeto**: ${diogenes.projeto}\n` +
      `• **Contato**: ${diogenes.email} e links de redes na página de Contato.`;
  }

  // Guilherme
  if (msg.includes('guilherme') || ((msg.includes('ele') || msg.includes('dele')) && lastBotMsg.includes('guilherme'))) {
    const guilherme = KNOWLEDGE_DATA.integrantes.find(i => i.id === 'guilherme');
    return `O **${guilherme.nome}** tem ${guilherme.idade} anos e é ${guilherme.formacao}. Atua como **${guilherme.cargo}**.\n\n` +
      `• **Habilidades**: HTML (${guilherme.habilidades.html}), CSS (${guilherme.habilidades.css}) e JavaScript (${guilherme.habilidades.js}).\n` +
      `• **Projeto**: ${guilherme.projeto}\n` +
      `• **Contato**: ${guilherme.email} e links de redes na página de Contato.`;
  }

  // 6. Integrantes em Geral / Quem faz parte da equipe
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
    return 'A equipe do **Squad G** é formada por 4 estudantes de ADS na FICR:\n\n' +
      '• **Amanda Gabrielly** (25 anos) — Front-End & UI/UX Designer\n' +
      '• **Aylton Oliveira** (20 anos) — Front-End & UI/UX Designer\n' +
      '• **Diógenes José** (34 anos) — Front-End & UI/UX Designer\n' +
      '• **Guilherme Henrique** (25 anos) — Front-End & UI/UX Designer\n\n' +
      'Todos colaboram em design e desenvolvimento web. Você pode ver as fotos e detalhes na página **Sobre Nós** ou os projetos de cada um em **Projetos**!';
  }

  // 7. Planos e Preços
  if (
    msg.includes('preço') ||
    msg.includes('preco') ||
    msg.includes('quanto custa') ||
    msg.includes('valor') ||
    msg.includes('valores') ||
    msg.includes('plano') ||
    msg.includes('tabela')
  ) {
    return 'Na página de **Serviços**, o Squad G oferece 3 opções de planos:\n\n' +
      '• **Plano Básico (R$ 799)**: 1 página responsiva, entrega em 7 dias e suporte por 7 dias.\n' +
      '• **Plano Pro (R$ 1.899)**: até 6 páginas, design + front-end completo, entrega em 12 dias e suporte por 30 dias.\n' +
      '• **Plano Enterprise (R$ 4.800)**: projeto sob medida, entrega priorizada e suporte estendido.\n\n' +
      'Gostaria de saber mais sobre os entregáveis de algum plano específico?';
  }

  // 8. Serviços Oferecidos
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
    return 'O **Squad G** atua em 3 frentes principais de serviços:\n\n' +
      '1. **Design de UI/UX**: Wireframes, protótipos interativos no Figma e design responsivo com foco em usabilidade.\n' +
      '2. **Desenvolvimento Front-end**: Landing pages, sites estáticos e interfaces modernas em HTML5, CSS3 e JavaScript, com código reutilizável e SEO básico.\n' +
      '3. **Branding & Identidade**: Logotipos, paletas de cores e manuais visuais de marca.\n\n' +
      'Também oferecemos os planos Básico (R$ 799), Pro (R$ 1.899) e Enterprise (R$ 4.800), detalhados na página de Serviços!';
  }

  // 9. Projetos Desenvolvidos
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
    return 'Na página de **Projetos**, você pode conferir os trabalhos práticos de cada integrante:\n\n' +
      '• **Projeto Amanda**: Interface moderna de tela de cadastro e login com foco em usabilidade.\n' +
      '• **Projeto Guilherme**: Telas de cadastro e login com design estruturado e validações.\n' +
      '• **Projeto Aylton**: Reprodução da tela inicial do Google com alta precisão e fidelidade visual.\n' +
      '• **Projeto Diógenes**: Módulos web e backend com foco em arquitetura, lógica de negócio e integração de APIs.\n\n' +
      'Além disso, na Home temos o resumo dos projetos estratégicos da equipe com foco em desenvolvimento ágil e acessibilidade!';
  }

  // 10. Case de Sucesso / Alpha Corp
  if (
    msg.includes('case') ||
    msg.includes('alpha') ||
    msg.includes('sucesso') ||
    msg.includes('helena') ||
    msg.includes('fintech')
  ) {
    return 'Nosso **Case de Sucesso** foi desenvolvido para a **Alpha Corp** (setor Fintech/Otimização Financeira).\n\n' +
      '• **Desafio**: Processos legados lentos (conciliação bancária demorava 5 dias úteis) e alto custo de infraestrutura.\n' +
      '• **Solução do Squad G**: Metodologia ágil Scrum, Dashboard em tempo real para fluxo de caixa e integração de APIs modernas com o ERP.\n' +
      '• **Resultados**: 40% de redução de custos operacionais, 95% mais velocidade na conciliação e tempo de resposta de 0.2s na API.\n\n' +
      'A CEO da Alpha Corp, Helena Barbosa, elogiou a robustez e o impacto da entrega!';
  }

  // 11. Habilidades Técnicas / Tecnologias
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
    return 'Na página de **Habilidades**, apresentamos a proficiência técnica dos integrantes:\n\n' +
      '• **HTML5**: Aylton (80%), Guilherme (80%), Amanda (60%), Diógenes (50%)\n' +
      '• **CSS3**: Aylton (80%), Guilherme (80%), Diógenes (50%), Amanda (45%)\n' +
      '• **JavaScript**: 10% para todos os integrantes no 1º período de ADS\n\n' +
      'A equipe também domina ferramentas de prototipação no Figma, versionamento com Git/GitHub e práticas de acessibilidade e design responsivo.';
  }

  // 12. Depoimentos de Clientes
  if (
    msg.includes('depoimento') ||
    msg.includes('depoimentos') ||
    msg.includes('avaliação') ||
    msg.includes('avaliacoes') ||
    msg.includes('feedback') ||
    msg.includes('cliente') ||
    msg.includes('davi') ||
    msg.includes('carla') ||
    msg.includes('gabriel') ||
    msg.includes('luiza')
  ) {
    return 'Na página de **Depoimentos**, contamos com avaliações de clientes:\n\n' +
      '• **Davi Ribeiro**: destacou que a interface é muito intuitiva e o impacto foi imediato.\n' +
      '• **Carla Silva**: impressionada com o nível de detalhes e a qualidade da execução.\n' +
      '• **Gabriel Santos**: elogiou a consistência visual forte e coesa em todas as páginas.\n' +
      '• **Luiza Barbosa**: ressaltou o design limpo, moderno e a paleta agradável de cores.';
  }

  // 13. Contato e Redes Sociais
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
    return 'Você pode entrar em contato com o Squad G de diversas formas:\n\n' +
      '• **E-mails individuais**:\n' +
      '  - amanda.squadg@ficr.edu.br\n' +
      '  - aylton.squadg@ficr.edu.br\n' +
      '  - diogenes.squadg@ficr.edu.br\n' +
      '  - guilherme.squadg@ficr.edu.br\n' +
      '• **Redes Sociais**: links para Instagram e LinkedIn na página de **Contato**.\n' +
      '• **Formulário de Contato**: disponível na página inicial (**Home**), enviando mensagens diretamente para nossa equipe!';
  }

  // 14. Localização / Instituição / Faculdade
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
    return 'O **Squad G** é composto por estudantes do curso de Análise e Desenvolvimento de Sistemas (ADS) da **Faculdade Imaculada Conceição do Recife (FICR)**, localizada em Recife - PE, turma de 2025.';
  }

  // 15. Páginas do site
  if (msg.includes('página') || msg.includes('paginas') || msg.includes('menu') || msg.includes('navegação') || msg.includes('site')) {
    return 'O site do Squad G é estruturado em 8 páginas:\n\n' +
      '1. **Home**: apresentação e formulário rápido de contato;\n' +
      '2. **Sobre Nós**: história e os 4 integrantes;\n' +
      '3. **Serviços**: soluções oferecidas e tabela de preços;\n' +
      '4. **Projetos**: trabalhos práticos da equipe;\n' +
      '5. **Habilidades**: proficiência técnica em HTML, CSS e JS;\n' +
      '6. **Depoimentos**: avaliações de clientes;\n' +
      '7. **Case de Sucesso**: resultados com a Alpha Corp;\n' +
      '8. **Contato**: e-mails e redes sociais.';
  }

  // 16. Fallback amigável e natural caso o usuário pergunte algo não coberto
  return 'Não encontrei informações específicas sobre isso no conteúdo oficial do nosso site. Mas posso te ajudar com tudo sobre o **Squad G**!\n\n' +
    'Você gostaria de saber mais sobre nossos **integrantes**, **serviços e planos de preços**, **projetos desenvolvidos**, **habilidades técnicas**, **case de sucesso** ou **formas de contato**?';
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
