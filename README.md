# Rosangela Sousa — Psicanalista, Neurocientista & Terapeuta Holística

> Projeto de presença digital e estratégia comercial para a prática clínica e educacional da Dra. Rosangela Sousa.

---

## Sobre a Profissional

**Rosangela Sousa** é psicanalista, neurocientista especializada em educação, terapeuta holística e radiestesista. Sua prática clínica integra quatro campos do conhecimento de forma única e complementar: a profundidade da psicanálise, o rigor científico da neurociência, a sabedoria ancestral das terapias holísticas e a sensibilidade da radiestesia terapêutica.

Com atendimento **online e presencial** (consultório próprio e coworking terapêutico), Rosangela oferece uma jornada de autoconhecimento, equilíbrio e transformação que vai muito além das abordagens convencionais.

Ela também é cofundadora e mentora do projeto **Educa com Talento**, voltado ao desenvolvimento de metodologias ativas e à aplicação da neurociência no contexto educacional — atendendo famílias, professores e instituições de ensino.

---

## Especialidades

| Especialidade | Descrição |
|---|---|
| **Psicanálise** | Abordagem clássica e contemporânea para adultos, adolescentes e crianças |
| **Neurociência Aplicada** | Neuroplasticidade, aprendizado, comportamento e bem-estar mental |
| **Terapia Holística Integrativa** | Equilíbrio energético, chakras, limpeza áurica e harmonização |
| **Radiestesia Terapêutica** | Detecção e harmonização de energias no campo sutil e ambiental |
| **Neuroeducação (Educa com Talento)** | Metodologias ativas, desenvolvimento de talentos, suporte a famílias |

---

## Estrutura do Repositório

```
rosangela-sousa-psicanalista/
│
├── README.md                          # Este arquivo — visão geral do projeto
│
├── docs/                              # Documentação estratégica
│   ├── 01-proposta-atendimento.md     # Proposta completa de trabalho e atendimento
│   ├── 02-servicos-e-temas.md         # Catálogo de serviços, temas e programas
│   ├── 03-estrategia-comercial.md     # Análise de mercado, posicionamento, metas
│   ├── 04-funil-de-vendas.md          # Arquitetura do funil, scripts, lead magnets
│   └── 05-precificacao.md             # Tabela de preços, política, comparativo
│
├── site/                              # Site institucional (HTML/CSS/JS puro)
│   ├── index.html                     # Página principal
│   ├── pages/                         # Páginas internas
│   ├── css/                           # Estilos
│   ├── js/                            # Scripts
│   └── assets/                        # Imagens, ícones, fontes
│
├── cursos/                            # Materiais de cursos e programas
│
└── estrategia-comercial/              # Documentos de estratégia e captação
```

---

## Documentação do Projeto

| Arquivo | Descrição | Status |
|---|---|---|
| [01 — Proposta de Atendimento](docs/01-proposta-atendimento.md) | Bio, filosofia, modalidades, processo terapêutico, público-alvo | Concluído |
| [02 — Serviços e Temas](docs/02-servicos-e-temas.md) | Catálogo completo, programas especiais, grupos terapêuticos | Concluído |
| [03 — Estratégia Comercial](docs/03-estrategia-comercial.md) | Mercado, personas, canais, metas de receita, parcerias | Concluído |
| [04 — Funil de Vendas](docs/04-funil-de-vendas.md) | Funil TOFU/MOFU/BOFU, emails, scripts WhatsApp, KPIs | Concluído |
| [05 — Precificação](docs/05-precificacao.md) | Tabela de preços, política, pacotes, corporativo | Concluído |

---

## Tecnologias do Site

O site institucional foi desenvolvido em **HTML, CSS e JavaScript puro**, sem dependência de frameworks ou bibliotecas externas (exceto fontes e ícones via CDN), garantindo:

- Carregamento ultra-rápido (sem build step)
- Compatibilidade máxima com todos os navegadores
- Facilidade de manutenção por qualquer profissional
- Hospedagem em qualquer serviço (Netlify, GitHub Pages, Vercel, cPanel)

### Stack

| Camada | Tecnologia |
|---|---|
| Estrutura | HTML5 semântico |
| Estilo | CSS3 + variáveis CSS + Flexbox/Grid |
| Interatividade | JavaScript ES6+ vanilla |
| Fontes | Google Fonts (Playfair Display + Lato) |
| Ícones | Font Awesome 6 (CDN) |
| Formulários | Integração com WhatsApp API + EmailJS |
| SEO | Meta tags + Open Graph + Schema.org |

---

## Como Rodar o Site Localmente

### Opção 1 — Direto no Navegador (mais simples)

```bash
# Abra o arquivo diretamente
xdg-open /home/almirmeira/rosangela-sousa-psicanalista/site/index.html
# ou no Windows/Mac: abra o arquivo index.html com duplo clique
```

### Opção 2 — Servidor Local com Python (recomendado)

```bash
cd /home/almirmeira/rosangela-sousa-psicanalista/site
python3 -m http.server 3000
# Acesse: http://localhost:3000
```

### Opção 3 — Servidor Local com Node.js

```bash
# Instale o serve globalmente (uma única vez)
npm install -g serve

cd /home/almirmeira/rosangela-sousa-psicanalista/site
serve -p 3000
# Acesse: http://localhost:3000
```

### Opção 4 — Live Server (VS Code)

1. Instale a extensão **Live Server** no VS Code
2. Abra a pasta `site/` no VS Code
3. Clique com botão direito em `index.html`
4. Selecione **"Open with Live Server"**
5. Acesse: `http://localhost:5500`

---

## Paleta de Cores do Site

| Nome | Hex | Uso |
|---|---|---|
| Verde Sálvia Profundo | `#4A7C59` | Cor primária, botões principais |
| Dourado Suave | `#C9A84C` | Destaques, títulos especiais |
| Bege Quente | `#F5EFE0` | Fundo principal |
| Branco Puro | `#FFFFFF` | Cards, formulários |
| Cinza Escuro | `#2D2D2D` | Textos principais |
| Lilás Suave | `#9B8EC4` | Elementos holísticos |

---

## Plataformas de Presença Digital

| Plataforma | Finalidade | Prioridade |
|---|---|---|
| **Instagram** | Conteúdo principal, stories, reels, lives | Alta |
| **WhatsApp Business** | Atendimento, agendamento, grupos | Alta |
| **Site Institucional** | Credibilidade, SEO, agendamento | Alta |
| **LinkedIn** | Networking profissional, B2B, parcerias | Média |
| **Facebook** | Grupos temáticos, anúncios locais | Média |
| **Threads** | Conteúdo textual, debates, divulgação | Baixa |
| **YouTube** | Conteúdo longo, masterclasses gratuitas | Futura |

---

## Regulamentações e Compliance

- **CFP Resolução 09/2024** — Atendimento psicológico online
- **CFF / CFP** — Exercício ético da psicanálise e psicologia
- **ABRATH** — Associação Brasileira de Terapeutas Holísticos
- **CRT** — Conselho de Radiestesia Terapêutica
- **LGPD (Lei 13.709/2018)** — Proteção de dados dos pacientes
- **CFP Resolução 010/2005** — Relação profissional com meios digitais

---

## Conexão com o Projeto Educa com Talento

O projeto **Educa com Talento** é uma extensão natural da atuação de Rosangela no campo da neuroeducação. Inclui:

- Atendimento a crianças com dificuldades de aprendizagem
- Formação e suporte a educadores
- Palestras e workshops para famílias
- Avaliações neurodesenvolvimentais
- Metodologias ativas aplicadas ao desenvolvimento infantil

Os dois projetos se retroalimentam: pacientes adultos frequentemente chegam por indicação de escolas parceiras do Educa com Talento, e famílias atendidas no consultório são convidadas a participar dos programas educacionais.

---

## Status do Projeto

| Entregável | Status |
|---|---|
| Documentação estratégica (docs/) | Concluído |
| Estrutura do site (HTML/CSS/JS) | Em andamento |
| Integração WhatsApp Business | Planejado |
| SEO e Google Meu Negócio | Planejado |
| Integração de agendamento online | Planejado |
| Lançamento nas redes sociais | Planejado |

---

## Contato e Informações do Projeto

- **Profissional:** Rosangela Sousa
- **Projeto desenvolvido por:** Almir Meira
- **Ano de início:** 2026

---

*"A integração entre ciência e espiritualidade não é contradição — é a mais completa compreensão do ser humano."*
— Rosangela Sousa
