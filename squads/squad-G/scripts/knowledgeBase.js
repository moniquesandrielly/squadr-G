/**
 * Base de Conhecimento Centralizada Oficial do Squad G
 * Extraída estritamente das páginas reais do projeto:
 * Home, Sobre Nós, Serviços, Projetos, Habilidades, Depoimentos, Case de Sucesso e Contato.
 */

const KNOWLEDGE_DATA = {
  squad: {
    nome: "Squad G",
    titulo: "Equipe de Desenvolvimento Web e Soluções Digitais",
    instituicao: "Faculdade Imaculada Conceição do Recife (FICR)",
    localizacao: "Recife, Pernambuco (PE)",
    curso: "Análise e Desenvolvimento de Sistemas (ADS)",
    periodo: "1º período",
    ano: "2025",
    slogan: "Excelência e soluções profissionais.",
    missao: "Somos um grupo de estudantes dedicados ao desenvolvimento de soluções tecnológicas, unindo criatividade, colaboração e foco em resultados. Nosso objetivo é transformar ideias em experiências reais, aplicando boas práticas de design, programação e inovação.",
    descricaoResumida: "O Squad G é uma equipe de desenvolvimento web formada por estudantes do 1º período de ADS na FICR (Recife-PE, 2025). Desenvolvemos interfaces modernas, responsivas e acessíveis combinando UI/UX, HTML5, CSS3 e JavaScript.",
    paginas: [
      { nome: "Home", arquivo: "home.html", descricao: "Apresentação geral, resumo de projetos e formulário de contato direto." },
      { nome: "Sobre Nós", arquivo: "sobre.html", descricao: "História, quem somos e apresentação dos 4 integrantes." },
      { nome: "Serviços", arquivo: "servicos.html", descricao: "Serviços de UI/UX, Front-end e Branding, além da tabela com planos e preços." },
      { nome: "Projetos", arquivo: "projetos.html", descricao: "Demonstração prática dos projetos individuais desenvolvidos por cada membro." },
      { nome: "Habilidades", arquivo: "habilidades.html", descricao: "Nível de proficiência técnica dos integrantes em HTML, CSS e JavaScript." },
      { nome: "Depoimentos", arquivo: "depoimentos.html", descricao: "Avaliações e feedbacks de clientes reais sobre o trabalho do Squad G." },
      { nome: "Case de Sucesso", arquivo: "case-de-sucesso.html", descricao: "Otimização financeira e tecnológica desenvolvida para a Alpha Corp." },
      { nome: "Contato", arquivo: "contato.html", descricao: "Canais de contato direto, e-mails, LinkedIn e Instagram de cada integrante." }
    ]
  },

  integrantes: [
    {
      id: "amanda",
      nome: "Amanda Gabrielly",
      idade: 25,
      cargo: "Front-End & UI/UX Designer",
      formacao: "Estudante do 1º período de ADS na FICR",
      habilidades: { html: "60%", css: "45%", js: "10%" },
      projeto: "Projeto Amanda: tela de cadastro e tela de login modernas com foco em usabilidade e experiência do usuário.",
      email: "amanda.squadg@ficr.edu.br",
      redes: ["Instagram", "LinkedIn"]
    },
    {
      id: "aylton",
      nome: "Aylton Oliveira",
      idade: 20,
      cargo: "Front-End & UI/UX Designer",
      formacao: "Estudante do 1º período de ADS na FICR",
      habilidades: { html: "80%", css: "80%", js: "10%" },
      projeto: "Projeto Aylton: tela de navegação inicial do buscador Google, desenvolvida com alta precisão e fidelidade visual.",
      email: "aylton.squadg@ficr.edu.br",
      redes: ["Instagram", "LinkedIn"]
    },
    {
      id: "diogenes",
      nome: "Diógenes José",
      idade: 34,
      cargo: "Front-End & UI/UX Designer",
      formacao: "Estudante do 1º período de ADS na FICR",
      habilidades: { html: "50%", css: "50%", js: "10%" },
      projeto: "Projeto Diógenes: desenvolvimento com foco em lógica de negócio, arquitetura web, módulos de backend e integração de funcionalidades.",
      email: "diogenes.squadg@ficr.edu.br",
      redes: ["Instagram", "LinkedIn"]
    },
    {
      id: "guilherme",
      nome: "Guilherme Henrique",
      idade: 25,
      cargo: "Front-End & UI/UX Designer",
      formacao: "Estudante do 1º período de ADS na FICR",
      habilidades: { html: "80%", css: "80%", js: "10%" },
      projeto: "Projeto Guilherme: telas de cadastro e login com design estruturado e validações.",
      email: "guilherme.squadg@ficr.edu.br",
      redes: ["Instagram", "LinkedIn"]
    }
  ],

  servicos: [
    {
      nome: "Design de UI/UX",
      descricao: "Wireframes, protótipos e design responsivo focado na melhor usabilidade.",
      entregaveis: ["Protótipos em Figma", "Design responsivo"]
    },
    {
      nome: "Desenvolvimento Front-end",
      descricao: "Landing pages, sites estáticos e interfaces modernas em HTML/CSS/JS.",
      entregaveis: ["Componentes reutilizáveis", "SEO básico"]
    },
    {
      nome: "Branding & Identidade",
      descricao: "Logotipos, paletas de cores e guias visuais completos de estilo.",
      entregaveis: ["Manual básico da marca", "Fichas de aplicação"]
    }
  ],

  planos: [
    {
      plano: "Básico",
      preco: "R$ 799",
      itens: ["1 página responsiva", "Entrega em 7 dias", "Suporte por 7 dias"]
    },
    {
      plano: "Pro",
      preco: "R$ 1.899",
      itens: ["Até 6 páginas", "Design + Front-end completo", "Entrega em 12 dias", "Suporte por 30 dias"]
    },
    {
      plano: "Enterprise",
      preco: "R$ 4.800",
      itens: ["Projeto sob medida", "Entrega priorizada", "Suporte estendido"]
    }
  ],

  projetos: [
    {
      nome: "Projeto Amanda",
      responsavel: "Amanda Gabrielly",
      descricao: "Tela de cadastro e tela de login moderna com foco em usabilidade."
    },
    {
      nome: "Projeto Guilherme",
      responsavel: "Guilherme Henrique",
      descricao: "Telas de cadastro e login com design estruturado."
    },
    {
      nome: "Projeto Aylton",
      responsavel: "Aylton Oliveira",
      descricao: "Tela de navegação inicial do Google desenvolvida com alta precisão e fidelidade visual."
    },
    {
      nome: "Projeto Diógenes",
      responsavel: "Diógenes José",
      descricao: "Módulos Web & Backend com foco em estruturação técnica, lógica de negócio e integração de funcionalidades."
    },
    {
      nome: "Projetos Estratégicos (Home)",
      descricao: "Projetos desenvolvidos pela equipe com foco em modernidade, usabilidade, desenvolvimento ágil, acessibilidade e responsividade digital."
    }
  ],

  caseDeSucesso: {
    cliente: "Alpha Corp",
    setor: "Fintech & Otimização Financeira",
    tags: ["#Fintech", "#Otimização", "#SquadG"],
    desafio: "A Alpha Corp enfrentava processos legados lentos e caros, resultando em gargalos na gestão de fluxo de caixa e relatórios financeiros: lentidão na conciliação bancária (demora de 5 dias úteis), alto custo de manutenção de infraestrutura antiga e falta de visibilidade em tempo real sobre métricas chave.",
    solucao: [
      "Desenvolvimento Ágil: metodologia Scrum para entregas incrementais e feedback constante.",
      "Plataforma Customizada: painel de controle (Dashboard) em tempo real para monitoramento do fluxo de caixa.",
      "Integração Segura: APIs modernas para conexão bidirecional e segura com o ERP da empresa."
    ],
    metricas: [
      { valor: "40%", descricao: "Redução de custos operacionais" },
      { valor: "95%", descricao: "Aumento na velocidade da conciliação bancária" },
      { valor: "0.2s", descricao: "Tempo de resposta médio da API" }
    ],
    depoimentoLideranca: {
      autor: "Helena Barbosa",
      cargo: "CEO da Alpha Corp",
      citacao: "O Squad G não apenas atendeu às nossas expectativas, mas as superou. A solução é robusta e mudou a forma como gerenciamos nossas finanças."
    }
  },

  depoimentos: [
    {
      autor: "Davi Ribeiro",
      texto: "O projeto desenvolvido pelo Squad G me surpreendeu bastante, interface é bem intuitiva e o impacto foi imediato!"
    },
    {
      autor: "Carla Silva",
      texto: "Fiquei impressionada com o nível de detalhe e a qualidade da execução. É visível o empenho do Squad G em entregar uma solução detalhada."
    },
    {
      autor: "Gabriel Santos",
      texto: "Há uma consistência visual forte em todas as páginas, o que reforça a identidade do projeto. É um trabalho de design muito coeso e bem executado pelo Squad G."
    },
    {
      autor: "Luiza Barbosa",
      texto: "O design é limpo, moderno e muito profissional. A paleta de cores escolhida pelo Squad G é agradável e facilita a leitura do conteúdo."
    }
  ],

  contato: {
    emails: [
      "amanda.squadg@ficr.edu.br",
      "aylton.squadg@ficr.edu.br",
      "diogenes.squadg@ficr.edu.br",
      "guilherme.squadg@ficr.edu.br"
    ],
    redes: "Instagram e LinkedIn individuais de cada membro na página de Contato.",
    formulario: "Disponível na página inicial (Home), com campos para Nome, E-mail e Mensagem.",
    instituicao: "Faculdade Imaculada Conceição do Recife (FICR) - Recife, PE."
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KNOWLEDGE_DATA };
}
