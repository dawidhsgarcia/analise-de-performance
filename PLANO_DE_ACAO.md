# Plano de Ação — Migração para React + TypeScript

## Objetivo
Migrar a aplicação **Análise de Performance** (atualmente HTML+CSS+JS vanilla) para **React + TypeScript + CSS Modules**, hospedar no **GitHub** e fazer deploy automático no **Vercel**.

---

## Stack Definitiva

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 |
| Linguagem | TypeScript |
| Build | Vite |
| Estilo | CSS Modules |
| Estado | Zustand |
| Roteamento | React Router v6 |
| Gráficos | Chart.js + react-chartjs-2 |
| Planilhas | SheetJS (xlsx) |
| Banco | Firebase Firestore v9 (modular) |
| Versionamento | GitHub |
| Deploy | Vercel |

---

## Etapas de Execução

### Fase 1 — Setup do Projeto

- [ ] Inicializar Vite com template React + TypeScript
- [ ] Instalar dependências: `react-router-dom`, `zustand`, `firebase`, `chart.js`, `react-chartjs-2`, `xlsx`
- [ ] Configurar `tsconfig.json` (paths absolutos `@/` apontando para `src/`)
- [ ] Criar estrutura de diretórios em `src/`
- [ ] Configurar ESLint com regras para React + TypeScript

### Fase 2 — Tipos e Store

- [ ] Definir tipos globais em `src/types/index.ts`:
  - `Technician`, `Region`, `Params`, `QuartilLimits`, `AlertTech`, `AlertTeam`, `AlertProjection`
  - `DailyEntry`, `WeekDay`, `RankingRow`, `ProjectionRow`
  - `AppState` (estado completo)
- [ ] Criar store Zustand em `src/store/useStore.ts`:
  - State: toda a árvore de estado do app
  - Ações: CRUD de regiões, técnicos, entries, params
  - Integração com persistência (Firestore + localStorage)

### Fase 3 — Serviços

- [ ] `src/services/firebase.ts`
  - Inicialização modular do Firebase v9
  - Exportar `db`, funções `loadFromFirestore`, `saveToFirestore`
- [ ] `src/services/persistence.ts`
  - Função `loadState()` com fallback chain: Firestore → localStorage → seed
  - Função `scheduleSave()` com debounce
- [ ] `src/services/xlsxParser.ts`
  - Migrar `applyActivityReport()` e `normalizeRowKeys()`
- [ ] `src/services/calculations.ts`
  - Migrar `computeRanking()`, `computeProjection()`, `computeTeamGoalsSummary()`, `computeTeamOverview()`

### Fase 4 — Estilos Globais

- [ ] `src/styles/globals.css`
  - CSS custom properties (design system existente)
  - Tema claro/escuro (`data-theme`)
  - Estilos base (body, fontes, scrollbar)
- [ ] `src/styles/variables.css`
  - Separar variáveis CSS para reuso nos modules

### Fase 5 — Componentes

#### Layout
- [ ] `AppShell` — Grid principal, animação de fade-in
- [ ] `Header` — Título, save indicator (dot + texto), botão cloud sync
- [ ] `Footer` — Copyright

#### Controles
- [ ] `Controls` — Container flex com todos os controles
- [ ] `RegionSelect` — Select de regiões + botões add/remove
- [ ] `MonthNav` — Navegação entre meses
- [ ] `ImportButton` — Botão + input file oculto para XLSX
- [ ] `BackupButtons` — Export/import JSON

#### Abas (Tabs)
- [ ] `Tabs` — Navegação com React Router
- [ ] `Tabs` usa `<Routes>` com 3 rotas: `/dashboard`, `/acompanhamento`, `/parametros`

#### Dashboard
- [ ] `DashboardPage` — Container que orquestra os subcomponentes
- [ ] `KpiCards` — Grid de 9 KPIs com cores condicionais
- [ ] `AlertCards` — Seção de alertas automáticos (5 regras)
- [ ] `EvolucaoChart` — Gráfico de barras (evolução diária da equipe)
- [ ] `TendenciaSemanalChart` — Gráfico de barras (média semanal)
- [ ] `RadarChart` — Gráfico radar (perfil da equipe)
- [ ] `TechCards` — Grid de cards de evolução individual com sparklines SVG
- [ ] `ProjectionSection` — Projeção de fechamento (barra + tabela + gap)
- [ ] `ActivitySlaTable` — Tabela de SLA por atividade
- [ ] `IndisponibilidadeTable` — Tabela de justificativas

#### Acompanhamento
- [ ] `MainTablePage` — Container da aba de acompanhamento
- [ ] `LegendCodes` — Legenda das justificativas
- [ ] `LockBanner` — Banner de bloqueio (região bloqueada)
- [ ] `WeekRow` / `DayRow` / `TechRow` — Subcomponentes da tabela
- [ ] `DayCell` — Célula individual (input numérico ou select de justificativa)
- [ ] `GoalsTable` — Tabela de metas diárias da equipe

#### Parâmetros
- [ ] `ParamsPage` — Container da aba de parâmetros
- [ ] `ParamGroup` — Grupo de parâmetros (meta dia, quartis, alertas)
- [ ] `ParamToast` — Toast de feedback

### Fase 6 — Hooks Customizados

- [ ] `useProjection(region, weeks)` — Cálculo de projeção
- [ ] `useRanking(region, weeks)` — Ranking e quartis
- [ ] `useTeamGoals(region, weeks)` — Metas da equipe
- [ ] `useFirebase()` — Hook para acesso ao Firestore
- [ ] `useTheme()` — Alternar tema claro/escuro
- [ ] `useDebounce()` — Debounce para salvamento

### Fase 7 — Roteamento

- [ ] Configurar React Router:
  - `/` redireciona para `/dashboard`
  - `/dashboard` → DashboardPage
  - `/acompanhamento` → MainTablePage
  - `/parametros` → ParamsPage

### Fase 8 — Integração Firebase

- [ ] Configurar variáveis de ambiente (`.env`):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- [ ] Load state do Firestore na inicialização
- [ ] Salvar com debounce (400ms) em todas as mutações

### Fase 9 — GitHub

- [ ] `git init`
- [ ] Criar `.gitignore` (node_modules, dist, .env, *.local)
- [ ] `git add . && git commit -m "feat: initial React migration"`
- [ ] Criar repositório no GitHub
- [ ] `git remote add origin <url> && git push -u origin main`

### Fase 10 — Vercel (Deploy)

- [ ] Importar repositório do GitHub no Vercel
- [ ] Configurar:
  - Framework: Vite
  - Build: `npm run build`
  - Output: `dist/`
- [ ] Adicionar variáveis de ambiente do Firebase no Vercel
- [ ] Deploy automático ativado (push na main)

---

## Estrutura de Arquivos Final

```
analise-de-performance/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts
│   ├── store/
│   │   └── useStore.ts
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── persistence.ts
│   │   ├── xlsxParser.ts
│   │   └── calculations.ts
│   ├── hooks/
│   │   ├── useProjection.ts
│   │   ├── useRanking.ts
│   │   ├── useTeamGoals.ts
│   │   ├── useFirebase.ts
│   │   ├── useTheme.ts
│   │   └── useDebounce.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── AppShell.tsx + .module.css
│   │   │   ├── Header.tsx + .module.css
│   │   │   └── Footer.tsx + .module.css
│   │   ├── Controls/
│   │   │   ├── Controls.tsx + .module.css
│   │   │   ├── RegionSelect.tsx + .module.css
│   │   │   ├── MonthNav.tsx + .module.css
│   │   │   ├── ImportButton.tsx + .module.css
│   │   │   └── BackupButtons.tsx + .module.css
│   │   ├── Tabs/
│   │   │   ├── Tabs.tsx + .module.css
│   │   │   └── TabPanel.tsx + .module.css
│   │   ├── Dashboard/
│   │   │   ├── DashboardPage.tsx + .module.css
│   │   │   ├── KpiCards.tsx + .module.css
│   │   │   ├── AlertCards.tsx + .module.css
│   │   │   ├── EvolucaoChart.tsx
│   │   │   ├── TendenciaSemanalChart.tsx
│   │   │   ├── RadarChart.tsx
│   │   │   ├── TechCards.tsx + .module.css
│   │   │   ├── ProjectionSection.tsx + .module.css
│   │   │   ├── ActivitySlaTable.tsx + .module.css
│   │   │   └── IndisponibilidadeTable.tsx + .module.css
│   │   ├── MainTable/
│   │   │   ├── MainTablePage.tsx + .module.css
│   │   │   ├── MainTable.tsx + .module.css
│   │   │   ├── GoalsTable.tsx + .module.css
│   │   │   ├── DayCell.tsx + .module.css
│   │   │   ├── LegendCodes.tsx + .module.css
│   │   │   └── LockBanner.tsx + .module.css
│   │   ├── Params/
│   │   │   ├── ParamsPage.tsx + .module.css
│   │   │   ├── ParamGroup.tsx + .module.css
│   │   │   └── ParamToast.tsx + .module.css
│   │   └── Shared/
│   │       ├── Modal.tsx + .module.css
│   │       ├── Button.tsx + .module.css
│   │       └── Spinner.tsx + .module.css
│   └── utils/
│       ├── dates.ts       # buildWeeks, isoDate, pad, MONTHS, DOW
│       ├── constants.ts   # JUSTIFICATION_CODES, LABELS, COLORS, DEFAULT_PARAMS
│       └── formatters.ts  # fmtNum, quartilOf, minScoreForDow
├── .env                   # Variáveis Firebase
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## Ordem de Implementação Recomendada

1. Setup do projeto (Vite + dependências + diretórios)
2. Tipos (`types/index.ts`)
3. Utilitários (`utils/`)
4. Serviços (`services/`)
5. Store Zustand (`store/`)
6. Estilos globais (`styles/`)
7. Componentes de Layout (AppShell, Header, Footer)
8. Componentes Compartilhados (Button, Modal)
9. Sistema de Abas + Router
10. Componentes de Controles
11. Tabela Principal + GoalsTable (acompanhamento)
12. Dashboard (KPIs, Charts, Cards, Projeção)
13. Parâmetros
14. Hooks customizados
15. Integração Firebase + Persistência
16. Testes manuais e ajustes
17. GitHub + Vercel

---

## Critérios de Sucesso

- [ ] A aplicação funciona 100% igual à original (mesmos dados, mesmos cálculos)
- [ ] Tema claro/escuro preservado
- [ ] Importação de XLSX funciona com o mesmo formato
- [ ] Persistência no Firebase + localStorage funcional
- [ ] Deploy automático no Vercel a cada push
- [ ] Build sem erros (`npm run build`)
- [ ] Código componentizado e de fácil manutenção
