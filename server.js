const express = require('express');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 3000;

app.use(express.json());

const SQUAD_DIR = path.join(__dirname, 'squads/squad-G');
const STYLES_DIR = path.join(SQUAD_DIR, 'styles');
const IMG_DIR = path.join(STYLES_DIR, 'img');

// Base de conhecimento oficial do Squad G e instruções de sistema para a GIA
const KNOWLEDGE_BASE = `
Você é a GIA — Assistente do Squad G, a assistente virtual oficial do Squad G.

PERSONALIDADE E TOM DE VOZ:
- Você é simpática, clara, objetiva, educada e profissional, comunicando-se em uma linguagem simples, acessível e acolhedora.
- Você NÃO é um chatbot genérico e NUNCA deve responder como um assistente de propósito geral. Você é dedicada exclusivamente ao Squad G e ao seu site.
- Você ajuda o visitante a conhecer o Squad G e a encontrar qualquer informação presente nas páginas do site.
- Mantenha sempre o contexto da conversa: se o visitante fizer perguntas de acompanhamento ou referências a mensagens anteriores, utilize o histórico para responder de forma natural e sem repetições vazias.

REGRA DE TRANSPARÊNCIA E PRECISÃO (CRÍTICA):
- Use ESTRITAMENTE as informações oficiais do projeto descritas abaixo.
- NÃO invente nomes, cargos, idades, experiências, contatos, preços, prazos, tecnologias ou características que não estejam presentes no conteúdo oficial.
- Se o usuário perguntar qualquer coisa que NÃO esteja disponível no projeto (por exemplo, informações sobre outras empresas, previsão do tempo, código aleatório, opiniões não relacionadas, outros membros inexistentes, etc.), responda de forma transparente e educada:
  "Essa informação não está disponível no conteúdo do Squad G no momento."
- Nunca fuja do seu papel de assistente oficial do Squad G.

CONTEÚDO OFICIAL COMPLETO DO PROJETO SQUAD G:

1. QUEM É O SQUAD G (Páginas Home e Sobre Nós):
- O Squad G é uma equipe de desenvolvimento de software formada por estudantes do 1º período do curso de Análise e Desenvolvimento de Sistemas (ADS) da Faculdade Imaculada Conceição do Recife (FICR) no ano letivo de 2025.
- Missão e Objetivo: Um grupo dedicado ao desenvolvimento de soluções tecnológicas que une criatividade, colaboração e foco em resultados, transformando ideias em experiências reais através de boas práticas de design, programação e inovação.

2. INTEGRANTES DA EQUIPE (Páginas Sobre Nós, Habilidades, Projetos e Contato):
- Amanda Gabrielly:
  • Perfil: 25 anos, estudante do 1º período de ADS na FICR.
  • Cargo/Atuação: Front-End & UI/UX Designer.
  • Habilidades técnicas: HTML (60%), CSS (45%), JavaScript (10%).
  • Projeto individual: Tela de cadastro e tela de login moderna com foco em usabilidade.
  • Contato oficial: amanda.squadg@ficr.edu.br, além de Instagram e LinkedIn.
- Aylton Oliveira:
  • Perfil: 20 anos, estudante do 1º período de ADS na FICR.
  • Cargo/Atuação: Front-End & UI/UX Designer.
  • Habilidades técnicas: HTML (80%), CSS (80%), JavaScript (10%).
  • Projeto individual: Tela de navegação inicial do Google desenvolvida com alta precisão e fidelidade visual.
  • Contato oficial: aylton.squadg@ficr.edu.br, além de Instagram e LinkedIn.
- Diógenes José:
  • Perfil: 34 anos, estudante do 1º período de ADS na FICR.
  • Cargo/Atuação: Front-End & UI/UX Designer.
  • Habilidades técnicas: HTML (50%), CSS (50%), JavaScript (10%).
  • Projeto individual: Desenvolvimento focado em módulos web & backend, lógica de negócio, arquitetura web e integração de funcionalidades.
  • Contato oficial: diogenes.squadg@ficr.edu.br, além de Instagram e LinkedIn.
- Guilherme Henrique:
  • Perfil: 25 anos, estudante do 1º período de ADS na FICR.
  • Cargo/Atuação: Front-End & UI/UX Designer.
  • Habilidades técnicas: HTML (80%), CSS (80%), JavaScript (10%).
  • Projeto individual: Tela de cadastro e tela de login com design estruturado.
  • Contato oficial: guilherme.squadg@ficr.edu.br, além de Instagram e LinkedIn.

3. SERVIÇOS OFERECIDOS (Página Serviços):
- Design de UI/UX: Wireframes, protótipos e design responsivo focado na melhor usabilidade. Entregáveis: Protótipos em Figma e Design responsivo.
- Desenvolvimento Front-end: Landing pages, sites estáticos e interfaces modernas em HTML/CSS/JS. Entregáveis: Componentes reutilizáveis e SEO básico.
- Branding & Identidade: Logotipos, paletas de cores e guias visuais completos de estilo. Entregáveis: Manual básico da marca e Fichas de aplicação.

4. PLANOS E PREÇOS (Página Serviços):
- Plano Básico: R$ 799
  • Entregáveis: 1 página responsiva, entrega em 7 dias, suporte por 7 dias.
- Plano Pro: R$ 1.899
  • Entregáveis: Até 6 páginas, design + front-end completo, entrega em 12 dias, suporte por 30 dias.
- Plano Enterprise: R$ 4.800
  • Entregáveis: Projeto sob medida, entrega priorizada, suporte estendido.

5. PROJETOS DESENVOLVIDOS (Página Projetos):
- Projeto Amanda: Interface completa de login e cadastro com foco em usabilidade.
- Projeto Guilherme: Telas de cadastro e login com design estruturado e validações.
- Projeto Aylton: Reprodução da interface inicial do buscador Google com fidelidade visual e layout fluido.
- Projeto Diógenes: Estruturação técnica de módulos web, arquitetura e backend.

6. CASE DE SUCESSO — ALPHA CORP (Página Case de Sucesso):
- Empresa parceira: Alpha Corp (setor Fintech/Otimização).
- O Desafio: A Alpha Corp enfrentava processos legados lentos e caros, resultando em gargalos no fluxo de caixa e relatórios. Enfrentavam demora de 5 dias úteis na conciliação bancária, alto custo de manutenção de infraestrutura antiga e falta de visibilidade em tempo real.
- A Solução do Squad G: Desenvolvimento ágil com metodologia Scrum para entregas incrementais, plataforma customizada (Dashboard em tempo real para fluxo de caixa) e integração segura via APIs modernas com o ERP da empresa.
- Métricas e Resultados Alcançados:
  • 40% de Redução de Custos Operacionais.
  • 95% de Aumento na Velocidade da Conciliação bancária.
  • 0.2s de Tempo de Resposta Médio da API.
- Depoimento da Liderança: "O Squad G não apenas atendeu às nossas expectativas, mas as superou. A solução é robusta e mudou a forma como gerenciamos nossas finanças." — Helena Barbosa, CEO da Alpha Corp.

7. DEPOIMENTOS DE CLIENTES (Página Depoimentos):
- Davi Ribeiro: "O projeto desenvolvido pelo Squad G me surpreendeu bastante, interface é bem intuitiva e o impacto foi imediato!"
- Carla Silva: "Fiquei impressionada com o nível de detalhe e a qualidade da execução. É visível o empenho do Squad G em entregar uma solução detalhada."
- Gabriel Santos: "Há uma consistência visual forte em todas as páginas, o que reforça a identidade do projeto. É um trabalho de design muito coeso e bem executado pelo Squad G."
- Luiza Barbosa: "O design é limpo, moderno e muito profissional. A paleta de cores escolhida pelo Squad G é agradável e facilita a leitura do conteúdo."

8. INFORMAÇÕES DE CONTATO E LOCALIZAÇÃO (Página Contato e Home):
- Instituição: Faculdade Imaculada Conceição do Recife (FICR) — Recife, Pernambuco (PE). Turma de ADS 2025.
- E-mails:
  • amanda.squadg@ficr.edu.br
  • aylton.squadg@ficr.edu.br
  • diogenes.squadg@ficr.edu.br
  • guilherme.squadg@ficr.edu.br
- Redes Sociais: Cada integrante disponibiliza links para Instagram e LinkedIn na página de Contato.
- Formulário de Contato: Localizado na página inicial (Home), com campos de Nome, E-mail, Assunto e Mensagem.

9. PÁGINAS DO SITE:
- Home (home.html)
- Sobre Nós (sobre.html)
- Serviços (servicos.html)
- Projetos (projetos.html)
- Habilidades (habilidades.html)
- Depoimentos (depoimentos.html)
- Case de Sucesso (case-de-sucesso.html)
- Contato (contato.html)
`;

// Fallback inteligente da GIA com consciência contextual e conhecimento estrito do Squad G
function getLocalFallbackResponse(userMessage, history) {
  const msg = (userMessage || '').trim().toLowerCase();

  // Histórico recente para contexto
  let lastUserMsg = '';
  let lastBotMsg = '';
  if (Array.isArray(history) && history.length > 0) {
    const userHistory = history.filter(h => h.sender === 'user');
    const botHistory = history.filter(h => h.sender === 'bot');
    if (userHistory.length > 0) lastUserMsg = userHistory[userHistory.length - 1].text.toLowerCase();
    if (botHistory.length > 0) lastBotMsg = botHistory[botHistory.length - 1].text.toLowerCase();
  }

  // Saudações
  const saudacoes = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'e ai', 'oie', 'hello', 'hey'];
  if (saudacoes.some(s => msg === s || msg.startsWith(s + ' ') || msg.endsWith(' ' + s))) {
    return 'Olá! Eu sou a GIA, assistente virtual do Squad G. Posso ajudar você a conhecer nossos projetos, serviços, integrantes e outras informações do site. O que você gostaria de saber?';
  }

  // Identidade da assistente
  if (msg.includes('quem é você') || msg.includes('seu nome') || msg.includes('quem e voce') || msg.includes('o que você faz') || msg.includes('o que você é')) {
    return 'Eu sou a **GIA**, assistente virtual oficial do **Squad G**! Estou aqui para ajudar você a conhecer nossos projetos, serviços, integrantes, habilidades, case de sucesso e formas de contato.';
  }

  // Informações sobre integrantes específicos (Amanda)
  if (msg.includes('amanda') || ((msg.includes('ela') || msg.includes('dela')) && lastBotMsg.includes('amanda'))) {
    return 'A **Amanda Gabrielly** tem 25 anos e é estudante do 1º período de ADS na FICR. Atua em Front-End & UI/UX Design. Suas habilidades técnicas são HTML (60%), CSS (45%) e JavaScript (10%). Ela desenvolveu uma tela de login e cadastro moderna com foco em usabilidade. Você pode falar com ela pelo e-mail amanda.squadg@ficr.edu.br ou pelas redes na página de Contato!';
  }

  // Informações sobre integrantes específicos (Aylton)
  if (msg.includes('aylton') || ((msg.includes('ele') || msg.includes('dele')) && lastBotMsg.includes('aylton'))) {
    return 'O **Aylton Oliveira** tem 20 anos e é estudante do 1º período de ADS na FICR. Atua em Front-End & UI/UX Design. Suas habilidades técnicas são HTML (80%), CSS (80%) e JavaScript (10%). Ele desenvolveu a interface inicial de navegação do Google com alta precisão e fidelidade visual. Contato: aylton.squadg@ficr.edu.br.';
  }

  // Informações sobre integrantes específicos (Diógenes)
  if (msg.includes('diogenes') || msg.includes('diógenes') || ((msg.includes('ele') || msg.includes('dele')) && (lastBotMsg.includes('diogenes') || lastBotMsg.includes('diógenes')))) {
    return 'O **Diógenes José** tem 34 anos e é estudante do 1º período de ADS na FICR. Atua em Front-End & UI/UX Design. Suas habilidades técnicas são HTML (50%), CSS (50%) e JavaScript (10%). Seu projeto é voltado para arquitetura web, módulos de backend e integração de funcionalidades. Contato: diogenes.squadg@ficr.edu.br.';
  }

  // Informações sobre integrantes específicos (Guilherme)
  if (msg.includes('guilherme') || ((msg.includes('ele') || msg.includes('dele')) && lastBotMsg.includes('guilherme'))) {
    return 'O **Guilherme Henrique** tem 25 anos e é estudante do 1º período de ADS na FICR. Atua em Front-End & UI/UX Design. Suas habilidades técnicas são HTML (80%), CSS (80%) e JavaScript (10%). Ele desenvolveu um projeto de telas de cadastro e login com design estruturado. Contato: guilherme.squadg@ficr.edu.br.';
  }

  // Perguntas sobre quem são vocês / o que é o Squad G
  if (msg.includes('quem é o squad') || msg.includes('quem sao voces') || msg.includes('quem são vocês') || msg.includes('o que é o squad') || msg.includes('o que e o squad') || msg.includes('squad g') || msg.includes('sobre nós') || msg.includes('sobre nos') || msg.includes('quem somos')) {
    return 'O **Squad G** é uma equipe de desenvolvimento web formada por estudantes do 1º período de Análise e Desenvolvimento de Sistemas (ADS) da **Faculdade Imaculada Conceição do Recife (FICR)** (turma 2025). O grupo transforma ideias em experiências reais combinando design centrado no usuário, HTML5, CSS3 e boas práticas de desenvolvimento.';
  }

  // Integrantes em geral
  if (msg.includes('integrante') || msg.includes('membro') || msg.includes('equipe') || msg.includes('quem faz parte') || msg.includes('quem são os') || msg.includes('quantos são')) {
    return 'O Squad G é formado por 4 integrantes:\n\n• **Amanda Gabrielly** (25 anos) — Front-End & UI/UX\n• **Aylton Oliveira** (20 anos) — Front-End & UI/UX\n• **Diógenes José** (34 anos) — Front-End & UI/UX\n• **Guilherme Henrique** (25 anos) — Front-End & UI/UX\n\nTodos são estudantes de ADS na FICR e você pode ver os detalhes individuais na página Sobre Nós!';
  }

  // Preços e Planos específicos
  if (msg.includes('preço') || msg.includes('preco') || msg.includes('quanto custa') || msg.includes('valor') || msg.includes('valores') || msg.includes('plano') || msg.includes('planos')) {
    return 'Na página de Serviços, o Squad G disponibiliza três planos:\n\n• **Plano Básico (R$ 799)**: 1 página responsiva, entrega em 7 dias e 7 dias de suporte.\n• **Plano Pro (R$ 1.899)**: até 6 páginas, design + front-end completo, entrega em 12 dias e 30 dias de suporte.\n• **Plano Enterprise (R$ 4.800)**: projeto sob medida, entrega priorizada e suporte estendido.';
  }

  // Serviços oferecidos
  if (msg.includes('serviço') || msg.includes('serviços') || msg.includes('servicos') || msg.includes('o que vocês fazem') || msg.includes('o que voces fazem') || msg.includes('o que oferecem')) {
    return 'O Squad G oferece 3 frentes de serviços:\n\n1. **Design de UI/UX**: Wireframes, protótipos no Figma e design responsivo focado em usabilidade.\n2. **Desenvolvimento Front-end**: Landing pages, sites estáticos e interfaces modernas em HTML5, CSS3 e JS com componentes reutilizáveis e SEO básico.\n3. **Branding & Identidade**: Logotipos, paletas de cores e manual visual da marca.\n\nAlém disso, oferecemos planos Básico (R$ 799), Pro (R$ 1.899) e Enterprise (R$ 4.800).';
  }

  // Projetos
  if (msg.includes('projeto') || msg.includes('projetos') || msg.includes('portfolio') || msg.includes('portfólio') || msg.includes('trabalho') || msg.includes('trabalhos')) {
    return 'Na página de Projetos, você encontra as produções práticas de cada integrante:\n\n• **Projeto Amanda**: Tela de cadastro e login moderna com foco em usabilidade.\n• **Projeto Guilherme**: Telas de cadastro e login com design estruturado.\n• **Projeto Aylton**: Reprodução precisa da interface inicial de busca do Google.\n• **Projeto Diógenes**: Módulos web e backend com foco em arquitetura e lógica de negócio.';
  }

  // Case de Sucesso
  if (msg.includes('case') || msg.includes('alpha') || msg.includes('sucesso') || msg.includes('helena')) {
    return 'Nosso **Case de Sucesso** foi desenvolvido para a **Alpha Corp**: o Squad G solucionou lentidões em processos financeiros legados através de metodologia ágil e um painel customizado integrado ao ERP. Resultados:\n\n• **40% de redução** nos custos operacionais;\n• **95% de aumento** na velocidade de conciliação bancária;\n• **0.2s de tempo de resposta** médio da API.\n\nHelena Barbosa, CEO da Alpha Corp, destacou que a solução superou as expectativas!';
  }

  // Habilidades
  if (msg.includes('habilidade') || msg.includes('habilidades') || msg.includes('tecnologia') || msg.includes('tecnologias') || msg.includes('stack') || msg.includes('linguagem') || msg.includes('skills')) {
    return 'As habilidades demonstradas pela equipe na página de Habilidades são:\n\n• **HTML5**: Aylton (80%), Guilherme (80%), Amanda (60%), Diógenes (50%)\n• **CSS3**: Aylton (80%), Guilherme (80%), Diógenes (50%), Amanda (45%)\n• **JavaScript**: 10% para todos os integrantes no 1º período de ADS\n\nTambém aplicam UI/UX Design com Figma e versionamento com Git e GitHub.';
  }

  // Depoimentos
  if (msg.includes('depoimento') || msg.includes('depoimentos') || msg.includes('avaliação') || msg.includes('avaliacoes') || msg.includes('feedback') || msg.includes('clientes')) {
    return 'Na página de Depoimentos, temos avaliações de clientes:\n\n• **Davi Ribeiro**: elogiou a surpresa positiva com a interface intuitiva e impacto imediato;\n• **Carla Silva**: destacou o nível de detalhes e a qualidade da execução;\n• **Gabriel Santos**: ressaltou a consistência visual em todas as páginas;\n• **Luiza Barbosa**: elogiou o design limpo, moderno e a paleta de cores agradável.';
  }

  // Contato
  if (msg.includes('contato') || msg.includes('email') || msg.includes('e-mail') || msg.includes('redes') || msg.includes('instagram') || msg.includes('linkedin') || msg.includes('falar com') || msg.includes('como posso entrar em contato')) {
    return 'Você pode entrar em contato com os membros do Squad G pelos e-mails:\n\n• amanda.squadg@ficr.edu.br\n• aylton.squadg@ficr.edu.br\n• diogenes.squadg@ficr.edu.br\n• guilherme.squadg@ficr.edu.br\n\nOu através dos links de Instagram e LinkedIn disponíveis na página de **Contato**, além do formulário na página inicial (Home)!';
  }

  // Localização / Faculdade
  if (msg.includes('onde') || msg.includes('faculdade') || msg.includes('ficr') || msg.includes('recife') || msg.includes('cidade') || msg.includes('curso') || msg.includes('ads')) {
    return 'O Squad G é composto por estudantes do curso de Análise e Desenvolvimento de Sistemas (ADS) da **Faculdade Imaculada Conceição do Recife (FICR)**, localizada em Recife - PE.';
  }

  // Resposta padrão estrita para dados não disponíveis no projeto
  return 'Essa informação não está disponível no conteúdo do Squad G no momento. Se quiser, posso te apresentar nossos integrantes, projetos, serviços, planos de preços, case de sucesso ou formas de contato!';
}

// Endpoint seguro para o Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem inválida ou ausente.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Se não houver chave de API configurada, utiliza o fallback local inteligente com histórico
    if (!apiKey || apiKey.trim() === '') {
      const fallbackReply = getLocalFallbackResponse(message, history);
      return res.json({
        reply: fallbackReply,
        source: 'local_knowledge'
      });
    }

    // Inicialização segura do SDK Gemini
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: KNOWLEDGE_BASE,
        temperature: 0.2, // Baixa temperatura para respostas factuais e fiéis ao conteúdo
        maxOutputTokens: 600
      }
    });

    const reply = response.text || getLocalFallbackResponse(message, history);
    return res.json({ reply, source: 'gemini' });
  } catch (error) {
    console.error('Erro na rota /api/chat:', error.message || error);
    // Em caso de falha transitória na API, responde com a base local sem quebrar a experiência do usuário
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
