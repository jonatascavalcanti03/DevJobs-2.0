import { JobCardData } from "@/components/jobs/PremiumJobCard";

export interface DemoCompany {
  id: string;
  name: string;
  tradingName: string;
  segment: string;
  location: string;
  description: string;
  website: string;
  jobsCount: number;
  initials: string;
}

export interface DemoJobDetail extends JobCardData {
  companyTradingName: string;
  companySegment: string;
  salaryRange?: string;
  contractType: string;
  requirements: string[];
  responsibilities: string[];
}

export const DEMO_COMPANIES: DemoCompany[] = [
  {
    id: "demo-comp-01",
    name: "Nexus Cloud Solutions do Brasil Ltda",
    tradingName: "Nexus Cloud",
    segment: "Cloud Infrastructure & DevOps",
    location: "São Paulo, SP (Híbrido)",
    description: "Referência em orquestração de microsserviços, arquitetura distribuída resiliente e computação em nuvem de alto desempenho.",
    website: "https://nexuscloud.example.com",
    jobsCount: 3,
    initials: "NC",
  },
  {
    id: "demo-comp-02",
    name: "FinSecure Labs Tecnologia de Pagamentos S.A.",
    tradingName: "FinSecure Labs",
    segment: "Fintech & Segurança Digital",
    location: "Rio de Janeiro, RJ (Remoto)",
    description: "Plataforma inovadora de infraestrutura de pagamentos bancários e segurança cibernética com conformidade PCI-DSS e LGPD.",
    website: "https://finsecure.example.com",
    jobsCount: 3,
    initials: "FS",
  },
  {
    id: "demo-comp-03",
    name: "DataPulse Analytics & AI Soluções Ltda",
    tradingName: "DataPulse Analytics",
    segment: "Big Data & Inteligência Artificial",
    location: "Florianópolis, SC (Remoto)",
    description: "Especializada em pipelines preditivos de dados, engenharia analítica em tempo real e implantação de modelos de aprendizado profundo.",
    website: "https://datapulse.example.com",
    jobsCount: 3,
    initials: "DP",
  },
  {
    id: "demo-comp-04",
    name: "InovaHealth Digital Saúde Integrada S.A.",
    tradingName: "InovaHealth Digital",
    segment: "Healthtech & Telemedicina",
    location: "Belo Horizonte, MG (Híbrido)",
    description: "Transformando o cuidado em saúde com prontuários digitais interoperáveis, aplicativos móveis para pacientes e alta confiabilidade clínica.",
    website: "https://inovahealth.example.com",
    jobsCount: 3,
    initials: "IH",
  },
  {
    id: "demo-comp-05",
    name: "OmniRetail Digital Logística e E-Commerce Ltda",
    tradingName: "OmniRetail Platform",
    segment: "E-Commerce & Omnichannel",
    location: "Curitiba, PR (Presencial / Híbrido)",
    description: "Ecossistema global de varejo digital atendendo milhões de transações simultâneas com foco em UX veloz e logística conectada.",
    website: "https://omniretail.example.com",
    jobsCount: 3,
    initials: "OR",
  },
];

export const DEMO_JOBS: DemoJobDetail[] = [
  // 1. Full Stack (Nexus Cloud)
  {
    id: "d0000001-0000-4000-8000-000000000001",
    title: "Desenvolvedor Full Stack Sênior",
    companyName: "Nexus Cloud",
    companyTradingName: "Nexus Cloud",
    companySegment: "Cloud Infrastructure & DevOps",
    status: "ACTIVE",
    location: "São Paulo, SP",
    modality: "REMOTE",
    level: "SENIOR",
    created_at: "2026-03-10T10:00:00.000Z",
    skills: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "Docker", "Tailwind"],
    salaryRange: "R$ 14.000 - R$ 18.000",
    contractType: "CLT ou PJ",
    description: "Buscamos Engenheiro Full Stack Sênior para liderar a evolução de nossa plataforma corporativa de gerenciamento de clusters, desenhando interfaces de alta performance e microsserviços Node.js escaláveis.",
    responsibilities: [
      "Projetar e implementar interfaces modernas com Next.js 16 e Server Components",
      "Desenvolver APIs RESTful e GraphQL resilientes em Node.js com TypeScript",
      "Otimizar consultas e modelagem relacional em PostgreSQL",
      "Contribuir para a cultura de testes automatizados e integração contínua",
    ],
    requirements: [
      "Experiência sólida com TypeScript, React e Node.js em arquiteturas distribuídas",
      "Domínio de bancos de dados relacionais e modelagem SQL",
      "Vivência com conteinerização (Docker) e práticas DevOps",
      "Capacidade comprovada de mentorar desenvolvedores menos experientes",
    ],
  },
  // 2. Frontend (OmniRetail)
  {
    id: "d0000001-0000-4000-8000-000000000002",
    title: "Desenvolvedor Frontend Especialista",
    companyName: "OmniRetail Platform",
    companyTradingName: "OmniRetail Platform",
    companySegment: "E-Commerce & Omnichannel",
    status: "ACTIVE",
    location: "Curitiba, PR",
    modality: "HYBRID",
    level: "SENIOR",
    created_at: "2026-03-12T14:30:00.000Z",
    skills: ["React", "TypeScript", "Next.js", "Tailwind", "Design Systems", "Web Performance", "Jest"],
    salaryRange: "R$ 13.000 - R$ 16.500",
    contractType: "CLT",
    description: "Você será responsável pelo Core Web Vitals e pela arquitetura de Design System do checkout e catálogo de nosso marketplace omnichannel.",
    responsibilities: [
      "Manter e expandir nossa biblioteca interna de componentes acessíveis e auditados",
      "Garantir pontuações máximas em Core Web Vitals e acessibilidade (WCAG AA)",
      "Colaborar ativamente com Product Designers para viabilizar microinterações fluidas",
    ],
    requirements: [
      "Domínio profundo de React, Next.js e TypeScript",
      "Experiência na construção de Design Systems para larga escala",
      "Forte conhecimento em renderização no navegador e estratégias de bundle optimization",
    ],
  },
  // 3. Backend (FinSecure)
  {
    id: "d0000001-0000-4000-8000-000000000003",
    title: "Desenvolvedor Backend Pleno (Go / APIs)",
    companyName: "FinSecure Labs",
    companyTradingName: "FinSecure Labs",
    companySegment: "Fintech & Segurança Digital",
    status: "ACTIVE",
    location: "Rio de Janeiro, RJ",
    modality: "REMOTE",
    level: "MID",
    created_at: "2026-03-15T09:15:00.000Z",
    skills: ["Go", "PostgreSQL", "Redis", "Docker", "Microsserviços", "Kafka", "REST API"],
    salaryRange: "R$ 9.000 - R$ 12.000",
    contractType: "PJ",
    description: "Oportunidade para atuar no motor de conciliação financeira de baixa latência e alta disponibilidade, lidando com milhares de operações por segundo.",
    responsibilities: [
      "Construir serviços backend eficientes em Go para autorização de transações",
      "Implementar filas e mensageria com Apache Kafka e RabbitMQ",
      "Projetar caching de alta performance com Redis",
    ],
    requirements: [
      "Experiência com desenvolvimento backend em Go ou linguagem fortemente tipada",
      "Familiaridade com conceitos ACID e transações financeiras distribuídas",
      "Conhecimento de boas práticas de segurança defensiva em APIs",
    ],
  },
  // 4. Java / Spring (FinSecure)
  {
    id: "d0000001-0000-4000-8000-000000000004",
    title: "Desenvolvedor Java / Spring Sênior",
    companyName: "FinSecure Labs",
    companyTradingName: "FinSecure Labs",
    companySegment: "Fintech & Segurança Digital",
    status: "ACTIVE",
    location: "Rio de Janeiro, RJ",
    modality: "HYBRID",
    level: "SENIOR",
    created_at: "2026-03-18T11:00:00.000Z",
    skills: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Microsserviços", "Docker", "AWS"],
    salaryRange: "R$ 13.500 - R$ 17.500",
    contractType: "CLT",
    description: "Lidere a modernização de serviços de pagamento regulados pelo Bacen, utilizando Java 21, Spring Cloud e arquitetura orientada a eventos.",
    responsibilities: [
      "Definir padrões de código e arquitetura hexagonal para o ecossistema bancário",
      "Garantir resiliência com Circuit Breakers, rate limiters e telemetria aberta",
      "Atuar em conjunto com o time de cibersegurança em revisões de código",
    ],
    requirements: [
      "Ampla experiência com Java moderno (17+) e ecossistema Spring (Boot, Security, Data)",
      "Experiência prévia em ambientes financeiros ou transacionais críticos",
      "Domínio de mensageria assíncrona corporativa com Kafka",
    ],
  },
  // 5. Python / FastAPI (DataPulse)
  {
    id: "d0000001-0000-4000-8000-000000000005",
    title: "Desenvolvedor Python / FastAPI Pleno",
    companyName: "DataPulse Analytics",
    companyTradingName: "DataPulse Analytics",
    companySegment: "Big Data & Inteligência Artificial",
    status: "ACTIVE",
    location: "Florianópolis, SC",
    modality: "REMOTE",
    level: "MID",
    created_at: "2026-03-20T16:00:00.000Z",
    skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "Celery", "API Design"],
    salaryRange: "R$ 8.500 - R$ 11.500",
    contractType: "CLT",
    description: "Desenvolvimento de APIs analíticas assíncronas em Python para alimentar dashboards executivos e servir predições de modelos em tempo de resposta submétrico.",
    responsibilities: [
      "Construir endpoints REST performáticos usando FastAPI e Pydantic v2",
      "Orquestrar tarefas em segundo plano assíncronas com Celery e Redis",
      "Integrar serviços com datalakes e bancos relacionais em nuvem",
    ],
    requirements: [
      "Experiência com Python 3.10+ voltado para backend e serviços web",
      "Conhecimento prático de SQLAlchemy, Alembic e testes automatizados com Pytest",
      "Familiaridade com conteinerização Docker e pipelines de CI",
    ],
  },
  // 6. React / Mobile (InovaHealth)
  {
    id: "d0000001-0000-4000-8000-000000000006",
    title: "Desenvolvedor React Native / Mobile",
    companyName: "InovaHealth Digital",
    companyTradingName: "InovaHealth Digital",
    companySegment: "Healthtech & Telemedicina",
    status: "ACTIVE",
    location: "Belo Horizonte, MG",
    modality: "HYBRID",
    level: "MID",
    created_at: "2026-03-22T08:45:00.000Z",
    skills: ["React Native", "TypeScript", "React", "Mobile", "iOS", "Android", "Redux"],
    salaryRange: "R$ 9.500 - R$ 12.500",
    contractType: "CLT",
    description: "Atue na concepção do novo aplicativo mobile para médicos e pacientes, unindo telemedicina por vídeo, prescrição eletrônica e histórico de exames.",
    responsibilities: [
      "Desenvolver funcionalidades cross-platform fluidas para iOS e Android com React Native",
      "Integrar SDKs nativos de streaming de áudio/vídeo e biometria",
      "Garantir experiência offline-first e sincronização de dados segura",
    ],
    requirements: [
      "Experiência comprovada em aplicativos React Native publicados nas lojas",
      "Bons conhecimentos em TypeScript e gerenciamento de estado previsível",
      "Atenção aos padrões de design humanizado para plataformas móveis",
    ],
  },
  // 7. Node.js Sênior (Nexus Cloud)
  {
    id: "d0000001-0000-4000-8000-000000000007",
    title: "Desenvolvedor Node.js Backend Sênior",
    companyName: "Nexus Cloud",
    companyTradingName: "Nexus Cloud",
    companySegment: "Cloud Infrastructure & DevOps",
    status: "ACTIVE",
    location: "São Paulo, SP",
    modality: "REMOTE",
    level: "SENIOR",
    created_at: "2026-03-23T13:20:00.000Z",
    skills: ["Node.js", "TypeScript", "NestJS", "PostgreSQL", "Docker", "TDD", "GraphQL"],
    salaryRange: "R$ 13.000 - R$ 16.000",
    contractType: "PJ",
    description: "Responsável pelo núcleo de gestão de recursos de nuvem e faturamento de clusters híbridos com arquitetura modular NestJS e TypeScript.",
    responsibilities: [
      "Desenvolver microsserviços em TypeScript utilizando o framework NestJS",
      "Garantir cobertura abrangente de testes unitários e de integração (Jest / Vitest)",
      "Construir integrações seguras com provedores de nuvem (AWS, GCP)",
    ],
    requirements: [
      "Forte bagagem em desenvolvimento de serviços escaláveis com Node.js",
      "Domínio de padrões como Inversion of Control, Clean Architecture e DDD",
      "Conhecimento de bancos relacionais com índices eficientes e queries complexas",
    ],
  },
  // 8. DevOps / SRE (Nexus Cloud)
  {
    id: "d0000001-0000-4000-8000-000000000008",
    title: "Engenheiro DevOps / SRE Sênior",
    companyName: "Nexus Cloud",
    companyTradingName: "Nexus Cloud",
    companySegment: "Cloud Infrastructure & DevOps",
    status: "ACTIVE",
    location: "São Paulo, SP",
    modality: "REMOTE",
    level: "SENIOR",
    created_at: "2026-03-25T10:00:00.000Z",
    skills: ["Kubernetes", "Terraform", "Docker", "CI/CD", "AWS", "Prometheus", "Linux"],
    salaryRange: "R$ 15.000 - R$ 19.000",
    contractType: "CLT ou PJ",
    description: "Estruture e opere clusters Kubernetes de missão crítica, crie infraestrutura como código (IaC) e garanta SLAs de 99.99% para nossos clientes globais.",
    responsibilities: [
      "Automatizar provisionamento de ambientes multi-cloud com Terraform",
      "Operar e ajustar clusters de contêineres gerenciados (EKS e GKE)",
      "Implantar observabilidade unificada com Prometheus, Grafana e OpenTelemetry",
    ],
    requirements: [
      "Ampla vivência como DevOps ou SRE em ambientes de produção com tráfego intenso",
      "Certificações CKA/CKAD ou equivalentes na nuvem AWS são diferenciais positivos",
      "Experiência com segurança de infraestrutura (Zero Trust, RBAC, Secret Management)",
    ],
  },
  // 9. Analista de Dados (DataPulse)
  {
    id: "d0000001-0000-4000-8000-000000000009",
    title: "Analista de Dados Pleno",
    companyName: "DataPulse Analytics",
    companyTradingName: "DataPulse Analytics",
    companySegment: "Big Data & Inteligência Artificial",
    status: "ACTIVE",
    location: "Florianópolis, SC",
    modality: "REMOTE",
    level: "MID",
    created_at: "2026-03-26T15:10:00.000Z",
    skills: ["SQL", "Python", "Power BI", "Data Modeling", "ETL", "PostgreSQL", "Analytics"],
    salaryRange: "R$ 7.500 - R$ 10.000",
    contractType: "CLT",
    description: "Crie painéis de visualização estratégica e queries analíticas avançadas para apoiar a tomada de decisão corporativa de nossos parceiros de negócio.",
    responsibilities: [
      "Construir e manter relatórios executivos no Power BI com DAX refinado",
      "Escrever queries analíticas complexas e procedimentos de extração e carga (ETL)",
      "Traduzir necessidades de negócio em métricas acionáveis e confiáveis",
    ],
    requirements: [
      "Domínio pleno de SQL e modelagem dimensional (Star Schema)",
      "Conhecimento de Python voltado à análise e manipulação de dados (Pandas)",
      "Excelente comunicação e capacidade analítica para diálogo com stakeholders",
    ],
  },
  // 10. Cientista de Dados / IA (DataPulse)
  {
    id: "d0000001-0000-4000-8000-000000000010",
    title: "Cientista de Dados Sênior (IA & Machine Learning)",
    companyName: "DataPulse Analytics",
    companyTradingName: "DataPulse Analytics",
    companySegment: "Big Data & Inteligência Artificial",
    status: "ACTIVE",
    location: "Florianópolis, SC",
    modality: "REMOTE",
    level: "SENIOR",
    created_at: "2026-03-27T09:30:00.000Z",
    skills: ["Python", "Machine Learning", "PyTorch", "LLMs", "NLP", "Docker", "MLOps"],
    salaryRange: "R$ 16.000 - R$ 20.000",
    contractType: "PJ",
    description: "Desenvolva modelos generativos de IA, pipelines de embeddings e algoritmos preditivos integrados diretamente a soluções de software em escala.",
    responsibilities: [
      "Pesquisar, treinar e fazer fine-tuning de modelos de linguagem e de recomendação",
      "Construir arquitetura RAG e busca semântica em bancos vetoriais",
      "Estabelecer pipelines de MLOps para versionamento e monitoramento de drift",
    ],
    requirements: [
      "Formação avançada em Ciência da Computação, Estatística ou áreas correlatas",
      "Experiência com frameworks líderes como PyTorch, HuggingFace e Scikit-learn",
      "Prática na colocação de modelos em produção com Docker e inferência de baixa latência",
    ],
  },
  // 11. UX/UI Designer (OmniRetail)
  {
    id: "d0000001-0000-4000-8000-000000000011",
    title: "UX/UI Product Designer Sênior",
    companyName: "OmniRetail Platform",
    companyTradingName: "OmniRetail Platform",
    companySegment: "E-Commerce & Omnichannel",
    status: "ACTIVE",
    location: "Curitiba, PR",
    modality: "HYBRID",
    level: "SENIOR",
    created_at: "2026-03-28T11:45:00.000Z",
    skills: ["Figma", "UI Design", "UX Research", "Design Systems", "Prototyping", "Design Tokens"],
    salaryRange: "R$ 11.000 - R$ 14.000",
    contractType: "CLT",
    description: "Projetar experiências de compra digitais intuitivas, eficientes e belas, estabelecendo o design system unificado web e mobile da empresa.",
    responsibilities: [
      "Conduzir pesquisas com usuários, testes de usabilidade e mapeamento de jornadas",
      "Criar protótipos de alta fidelidade e fluxos interativos completos no Figma",
      "Manter alinhamento estreito com a engenharia de frontend para garantir fidelidade visual",
    ],
    requirements: [
      "Portfólio robusto demonstrando soluções de produtos SaaS ou comércio eletrônico",
      "Domínio avançado de Figma, auto-layout, componentes variantes e variáveis",
      "Forte entendimento de heurísticas de Nielsen e acessibilidade de interface",
    ],
  },
  // 12. Mobile Flutter (OmniRetail)
  {
    id: "d0000001-0000-4000-8000-000000000012",
    title: "Desenvolvedor Mobile Flutter Pleno",
    companyName: "OmniRetail Platform",
    companyTradingName: "OmniRetail Platform",
    companySegment: "E-Commerce & Omnichannel",
    status: "ACTIVE",
    location: "Curitiba, PR",
    modality: "REMOTE",
    level: "MID",
    created_at: "2026-03-29T14:15:00.000Z",
    skills: ["Flutter", "Dart", "Mobile", "REST API", "Clean Architecture", "Bloc", "Git"],
    salaryRange: "R$ 9.000 - R$ 12.000",
    contractType: "CLT",
    description: "Desenvolver o aplicativo para equipes de distribuição e controle de estoque de lojas físicas com interface responsiva e leitor biométrico/código de barras.",
    responsibilities: [
      "Desenvolver aplicações mobile robustas em Flutter utilizando gerência de estado BLoC",
      "Integrar periféricos nativos como impressoras térmicas e scanners de código de barras",
      "Otimizar tempo de inicialização e uso de memória em dispositivos de baixa gama",
    ],
    requirements: [
      "Experiência sólida na linguagem Dart e framework Flutter",
      "Familiaridade com arquiteturas desacopladas e consumo de APIs REST",
      "Vivência com publicação nas lojas Google Play Store e Apple App Store",
    ],
  },
  // 13. Segurança da Informação (FinSecure)
  {
    id: "d0000001-0000-4000-8000-000000000013",
    title: "Analista de Segurança da Informação (AppSec)",
    companyName: "FinSecure Labs",
    companyTradingName: "FinSecure Labs",
    companySegment: "Fintech & Segurança Digital",
    status: "ACTIVE",
    location: "Rio de Janeiro, RJ",
    modality: "REMOTE",
    level: "SENIOR",
    created_at: "2026-03-30T10:30:00.000Z",
    skills: ["AppSec", "OWASP", "DevSecOps", "SAST/DAST", "Linux", "Cloud Security", "Python"],
    salaryRange: "R$ 12.000 - R$ 15.000",
    contractType: "CLT",
    description: "Assegurar que todas as aplicações e infraestruturas do ecossistema financeiro cumpram rigorosos padrões de segurança cibernética e blindagem contra invasões.",
    responsibilities: [
      "Conduzir modelagem de ameaças e testes de invasão (pentests) em APIs e portais web",
      "Integrar ferramentas SAST/DAST e auditoria de dependências nas pipelines de CI/CD",
      "Responder a incidentes de segurança e apoiar na conformidade com a LGPD e Bacen",
    ],
    requirements: [
      "Sólida experiência com segurança de aplicações e top 10 OWASP",
      "Conhecimento de práticas DevSecOps e segurança em nuvem (IAM, VPC, criptografia)",
      "Certificações como CEH, CompTIA Security+, AWS Security ou OSCP são valorizadas",
    ],
  },
  // 14. QA Engineer (InovaHealth)
  {
    id: "d0000001-0000-4000-8000-000000000014",
    title: "QA Automation Engineer Pleno",
    companyName: "InovaHealth Digital",
    companyTradingName: "InovaHealth Digital",
    companySegment: "Healthtech & Telemedicina",
    status: "ACTIVE",
    location: "Belo Horizonte, MG",
    modality: "REMOTE",
    level: "MID",
    created_at: "2026-03-31T09:00:00.000Z",
    skills: ["Playwright", "Cypress", "TypeScript", "QA Automation", "CI/CD", "Postman", "Jest"],
    salaryRange: "R$ 8.000 - R$ 11.000",
    contractType: "CLT",
    description: "Automatize testes de ponta a ponta e de carga para fluxos de agendamento hospitalar e chamadas médicas, garantindo qualidade e zero regressões.",
    responsibilities: [
      "Desenvolver suítes de testes automatizados E2E utilizando Playwright e TypeScript",
      "Implementar testes automatizados de integração de APIs e contratos",
      "Integrar a execução dos testes ao pipeline de integração contínua (GitHub Actions)",
    ],
    requirements: [
      "Experiência com frameworks modernos de automação de testes (Playwright ou Cypress)",
      "Bons conhecimentos em TypeScript e estratégias de Mock e Fixtures",
      "Comprometimento com critérios de qualidade e identificação proativa de bugs",
    ],
  },
  // 15. Tech Lead / Software Engineer (InovaHealth)
  {
    id: "d0000001-0000-4000-8000-000000000015",
    title: "Engenheiro de Software / Tech Lead",
    companyName: "InovaHealth Digital",
    companyTradingName: "InovaHealth Digital",
    companySegment: "Healthtech & Telemedicina",
    status: "ACTIVE",
    location: "Belo Horizonte, MG",
    modality: "HYBRID",
    level: "SENIOR",
    created_at: "2026-04-01T15:00:00.000Z",
    skills: ["Software Architecture", "TypeScript", "Node.js", "React", "PostgreSQL", "Cloud", "Leadership"],
    salaryRange: "R$ 18.000 - R$ 22.000",
    contractType: "PJ",
    description: "Liderança técnica transversal da equipe de desenvolvimento clínico, direcionando decisões arquiteturais de alta complexidade e orientando o time de engenharia.",
    responsibilities: [
      "Definir diretrizes técnicas, arquitetura de sistemas e escolha de tecnologias",
      "Garantir a evolução sustentável da base de código com refatorações estratégicas",
      "Realizar 1:1s técnicos e apoiar o plano de desenvolvimento dos engenheiros",
    ],
    requirements: [
      "Carreira sólida com desenvolvimento full stack e liderança técnica de equipes tech",
      "Profundo conhecimento de arquiteturas escaláveis, seguras e distribuídas",
      "Habilidades excepcionais de comunicação, empatia e facilitação técnica",
    ],
  },
];

export function getDemoJobById(id: string): DemoJobDetail | undefined {
  return DEMO_JOBS.find((j) => j.id === id);
}

export function searchDemoJobs(
  query?: string,
  location?: string,
  modality?: string,
  level?: string
): DemoJobDetail[] {
  let list = DEMO_JOBS;

  if (query) {
    const q = query.toLowerCase().trim();
    list = list.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (location) {
    const loc = location.toLowerCase().trim();
    list = list.filter(
      (job) =>
        (job.location && job.location.toLowerCase().includes(loc)) ||
        (job.modality && job.modality.toLowerCase().includes(loc))
    );
  }

  if (modality && modality !== "ALL") {
    const mod = modality.toUpperCase().trim();
    list = list.filter((job) => job.modality?.toUpperCase() === mod);
  }

  if (level && level !== "ALL") {
    const lvl = level.toUpperCase().trim();
    list = list.filter((job) => {
      const jobLvl = job.level?.toUpperCase();
      if (lvl === "PLENO" || lvl === "MID") {
        return jobLvl === "PLENO" || jobLvl === "MID";
      }
      return jobLvl === lvl;
    });
  }

  return list;
}

