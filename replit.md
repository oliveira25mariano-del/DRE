# Sistema DRE - Financial Management Platform

## Overview

Sistema DRE is a comprehensive financial management platform built with React, Express, and PostgreSQL. It provides robust capabilities for financial oversight, including contract management, budget and actual expense tracking, employee management, and advanced analytics. The system features a modern dashboard with real-time KPI monitoring, an automated alerting system, comprehensive audit logging, and reporting. Key ambitions include providing complete financial transparency, optimizing resource allocation, and enabling data-driven decision-making for businesses.

## User Preferences

Preferred communication style: Simple, everyday language.
Interface language: Portuguese (Brazil) - All system interfaces and documentation should be in Portuguese.
User requires: Complete understanding of Replit configuration and navigation in Portuguese.
Admin Panel Access: Ctrl + Alt + A shortcut for hidden administrative panel at /admin-panel-secreto

## System Architecture

### Frontend Architecture
The frontend is a single-page application (SPA) developed with React and TypeScript, using Vite for fast builds. UI components are built with shadcn/ui, based on Radix UI primitives, and styled with Tailwind CSS for a responsive design. Routing is handled by Wouter, and state management, particularly for server data, utilizes TanStack Query for caching and synchronization. The component architecture is modular, with reusable UI components and feature-specific organization.

### Backend Architecture
The backend is an Express.js application written in TypeScript, following a RESTful API design. It employs a layered architecture separating routes, data storage (through an interface for flexibility), and middleware for concerns like audit logging and error handling. API endpoints adhere to RESTful conventions, providing JSON responses and appropriate HTTP status codes.

### Data Storage Solutions
PostgreSQL serves as the primary database, managed with Drizzle ORM for type-safe operations and Drizzle Kit for schema migrations. The database is hosted on Neon Database for scalable serverless cloud storage. The schema encompasses financial entities such as contracts, budget/actual data, employee records, audit logs, alerts, and reporting configurations.

### Authentication and Authorization
The system includes a complete, database-backed authentication system. User registration is exclusively via the administrative panel. Passwords are encrypted with bcrypt. Role-based access control is implemented, differentiating between "edit" (full access) and "view_only" (read-only) permissions. Session management and logout are fully integrated, and all operations are tracked in the audit system by authenticated user ID.

### Core Features and Design Patterns
The platform incorporates several key features and design patterns:
- **Authentication System:** Secure login, role-based access, and admin panel for user management.
- **Onboarding System:** Interactive tours for new users, customizable based on user roles.
- **Real-time Dashboard:** Interactive charts (Recharts) display live financial KPIs with automated updates and trend indicators.
- **Interface Customization:** A comprehensive theme personalization system offering various color schemes, layout options, behavior settings, and chart styles, with preferences persisted locally.
- **Personalized Notification System:** Role-based notification templates across financial, system, contracts, and budget categories, with multiple communication channels (email, push, SMS, dashboard) and customizable preferences.
- **Employee Management:** Full CRUD operations for employee records, persisted in PostgreSQL.
- **Monthly Billing System:** Analyzes predicted vs. actual vs. utilization rates by contract, month, and year, including indirect costs tracking (Glosas, Desconto SLA, Venda MOE) and a "Provisão Geral" tab for comparative analysis.
- **Direct Costs Management:** Comprehensive module with PostgreSQL integration for CRUD operations, validation, and real-time UI updates for direct costs.
- **Advanced Filtering System:** Real-time filtering capabilities for direct costs by Contract, Month, Year, and Category with PostgreSQL integration and immediate UI updates.
- **UI Consistency:** Standardized icon usage and consistent layout patterns across all modules for a unified user experience.

### Mudanças Recentes (Agosto 2025)
- **Sistema de Filtros:** Implementação completa do sistema de filtros em tempo real para custos diretos com integração PostgreSQL
- **Persistência de Dados:** Migração bem-sucedida do armazenamento em memória para PostgreSQL com operações CRUD completas
- **Correções de Autenticação:** Resolução de problemas de formato de requisições API no painel administrativo
- **Dados de Teste:** Criação de dataset abrangente com múltiplos contratos, categorias e períodos para validação dos filtros
- **Mudança de Nomenclatura:** Alteração de "Faturamento" para "Provisões" em toda a interface para melhor clareza dos conceitos financeiros
- **Modo de Apresentação Executiva:** Sistema completo com 4 slides profissionais, avanço automático configurável e controles avançados
- **Sistema de Relatórios Avançados:** Implementação de módulo de relatórios com templates personalizáveis, filtros avançados e opções de exportação
- **Machine Learning Preditivo:** Sistema avançado de ML com 4 modelos (predição de custos, previsão de receitas, detecção de anomalias, otimização de recursos), análise preditiva de 3-24 meses e sugestões inteligentes de otimização
- **Sistema de Integrações Externas:** Plataforma completa para conectar com sistemas contábeis (Contabilizei), bancários (Banco do Brasil), RH (Senior) e ERPs (SAP), com monitoramento de status, logs detalhados e sincronização automática
- **Dashboard Executivo Avançado:** Interface estratégica com KPIs executivos, análise de risco, performance por contrato, filtros personalizáveis, comparações temporais e exportação de relatórios executivos em PDF
- **Sistema de Personalização Completo:** Interface de customização com 6 esquemas de cores (Azul Padrão, Verde Esmeralda, Roxo Real, Laranja Vibrante, Vermelho Energia, Índigo Profundo), configurações de layout, modo escuro forçado e opções avançadas
- **Padronização Visual Completa (Agosto 2025):** Unificação total de todos os gráficos da aplicação para uso exclusivo de tonalidades de azul, garantindo consistência visual em 100% da interface - incluindo Financial Analysis, Dashboard Executivo, KPI Cards, Real-time Charts, e todos os componentes visuais
- **Sistema de Análise Financeira:** Implementação completa com visões mensais, acumuladas e anuais por contrato, comparativo orçado vs. realizado com indicadores visuais e KPIs executivos funcionais
- **Sistema de Permissões Granulares (Agosto 2025):** Controle de acesso por contrato específico no painel administrativo, permitindo que administradores definam quais contratos cada usuário pode visualizar, com campos `restrictToOwnContracts` e `allowedContracts` no schema
- **Sistema de Exportação Universal (Agosto 2025):** Implementação completa de funcionalidade de exportação em PDF, CSV, Excel e JSON em TODOS os botões de exportar do sistema: DRE, Provisões, Logs de Auditoria, Fringe Benefits, Contratos, Análise Financeira, Glosas e MOE, com modal interativo de seleção de formato, geração de PDFs profissionais com títulos/subtítulos/marca d'água, e biblioteca exportUtils centralizada
- **Sistema de Folha de Pagamento (Agosto 2025):** Nova aba "Folha" implementada com campos específicos (Salários, Hora Extra, Benefícios, VT, Imestra), sistema de filtros obrigatórios (contrato, ano, período), integração completa com PostgreSQL, APIs backend funcionais e sistema de exportação universal mantido
- **Refinamento do Header:** Data reduzida no header principal com formato mais compacto (dd/mmm/yyyy) para otimização do espaço visual
- **Correção de Erros Críticos:** Resolução definitiva do erro yAxisId nos gráficos Recharts, correção de assinaturas de API requests e eliminação de todos os erros LSP, garantindo aplicação 100% funcional
- **Correção Sistema de Exportação (Agosto 2025):** Resolução completa do erro "exportUtils.showExportModal is not a function", recriação do arquivo exportUtils.ts com função showExportModal funcional, correção de todas as páginas que usam exportação (DRE, Provisões, Auditoria, Fringe Benefits, Contratos, Glosas, MOE), garantindo sistema de exportação universal 100% operacional em PDF, CSV, Excel e JSON. Botão de exportação removido da página Folha conforme solicitado pelo usuário
- **Padronização Visual Folha (Agosto 2025):** Todos os valores monetários na página Folha alterados para tonalidades de azul (blue-600, blue-500, blue-700, blue-800, blue-900), exceto o total geral que permanece branco/cinza, seguindo o padrão visual unificado da aplicação

## Sistema de Exportação Universal - Configurações Técnicas (Agosto 2025)

### Estrutura Implementada:
- **Biblioteca Centralizada:** `client/src/lib/exportUtils.ts` com funções universais
- **Modal Interativo:** Componente de seleção com 4 formatos (PDF, CSV, Excel, JSON)
- **PDFs Profissionais:** Títulos, subtítulos, marca d'água e orientação configurável
- **Dados Inteligentes:** Exportação baseada em filtros aplicados em cada página

### Páginas com Exportação Completa:
1. **DRE** - Demonstrativo do Resultado do Exercício
2. **Provisões/Billing** - Dados de faturamento mensal
3. **Logs de Auditoria** - Histórico completo de ações do sistema
4. **Fringe Benefits** - Benefícios dos colaboradores
5. **Contratos** - Gestão de contratos ativos
6. **Análise Financeira** - Visões mensais, trimestrais e anuais
7. **Glosas** - Controle de glosas por contrato
8. **MOE** - Mão de Obra Externa

### IDs para Exportação PDF:
- `#dre-content` - Tabela DRE principal
- `#billing-content` - Conteúdo de provisões
- `#audit-table-content` - Tabela de auditoria
- `#fringe-table-content` - Tabela de fringe benefits
- `#contracts-table-content` - Tabela de contratos
- `#financial-analysis-content` - Análise financeira
- `#glosas-table-content` - Tabela de glosas
- `#moe-table-content` - Tabela de MOE

### Configurações Salvas para Manutenção:
- Todos os componentes usam `exportUtils.showExportModal()`
- Dados formatados em português brasileiro (R$, dd/MM/yyyy)
- Tratamento de erros com toast notifications
- Tipagem corrigida com `(contracts as any[])` onde necessário
- Estrutura consistente em todas as implementações

### Próximas Funcionalidades Sugeridas
**Análise Financeira Avançada:**
- Relatório DRE completo com receitas e despesas por contrato
- Dashboard de margem de lucro por projeto
- Análise de tendências financeiras com gráficos mensais/anuais
- Alertas automáticos para desvios orçamentários

**Gestão de Contratos:**
- Sistema de previsão vs faturado vs aproveitamento
- Módulo de glosas e descontos SLA
- Controle de vendas MOE (Mão de Obra Externa)
- Provisão geral para análise comparativa

**Relatórios e Exportação:**
- Exportação de relatórios em Excel/PDF
- Dashboards executivos personalizáveis
- Relatórios de auditoria detalhados
- Análises de performance por contrato

**Integrações Externas:**
- API para sistemas contábeis
- Integração com bancos para conciliação
- Sincronização com sistemas de RH
- Webhooks para notificações automáticas

**Machine Learning:**
- Predição de custos baseada em histórico
- Detecção de anomalias em gastos
- Otimização automática de recursos
- Análise preditiva de rentabilidade

## External Dependencies

### Database
- **PostgreSQL**: Via Neon Database (cloud-hosted, serverless).
- **Drizzle ORM**: For type-safe database interactions.

### Frontend Framework and Libraries
- **React**: Core UI framework.
- **Vite**: Build tool and development server.
- **TanStack React Query**: Server state management.
- **Wouter**: Lightweight client-side routing.

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Accessible UI component primitives.
- **shadcn/ui**: Component library built on Radix UI.
- **Lucide React**: Icon library.

### Form Handling and Validation
- **React Hook Form**: Form management.
- **Zod**: Schema validation.

### Development and Build Tools
- **TypeScript**: Language for type safety.
- **ESBuild**: Fast bundler.
- **PostCSS**: CSS processing.
- **Replit Development Plugins**: For enhanced development environment.

### Date and Utility Libraries
- **date-fns**: Date manipulation.