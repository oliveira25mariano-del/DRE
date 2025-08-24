# Sistema DRE - Financial Management Platform

## Overview
Sistema DRE is a comprehensive financial management platform designed to provide robust financial oversight, optimize resource allocation, and enable data-driven decision-making for businesses. It offers contract management, budget and actual expense tracking, employee management, and advanced analytics. Key capabilities include a modern dashboard with real-time KPI monitoring, automated alerting, comprehensive audit logging, and reporting.

## User Preferences
Estilo de comunicação preferido: Linguagem simples e cotidiana.
Idioma da interface: Português (Brasil) - Todas as interfaces do sistema e documentação devem estar em português.
Idioma de comunicação: Todo o chat e comunicação deve ser em português brasileiro.
Requisito do usuário: Compreensão completa da configuração e navegação do Replit em português.
Acesso ao Painel Admin: Atalho Ctrl + Alt + A para painel administrativo oculto em /admin-panel-secreto
Padrões Visuais: Sistema de temas fixado no azul (remoção definitiva do sistema dual). Cards KPI com animações hover (scale 1.02), altura consistente. Menu lateral compacto e elegante sem bordas com animações suaves (hover scale 1.02 + translação). Sidebar sem linha azul lateral de destaque nos itens ativos, sem sombras excessivas ou sobreposições visuais. Cards de logo e clima compactos com espaçamentos reduzidos. Logo Opus exibida diretamente sem card ao redor. Botão de sincronização BD no topo do sidebar. Transições suaves entre elementos.
Prevenção de Erros: Todos os erros TypeScript devem ser resolvidos para prevenir instabilidade da aplicação e garantir operação suave.
Compatibilidade Mobile: Sistema totalmente responsivo com suporte para Android e iOS, incluindo menu hambúrguer, tabelas com scroll horizontal, botões touch-friendly e viewport otimizado.
**CRÍTICO - Integridade de Dados**: NUNCA criar, inserir ou sugerir dados fictícios, mock ou de exemplo no sistema. Trabalhar apenas com dados reais inseridos pelo usuário ou dados autênticos de APIs externas. Sistema deve permanecer 100% limpo sem informações irrelevantes. Dados de teste/exemplo são estritamente proibidos. Focar exclusivamente em melhorias técnicas e visuais solicitadas pelo usuário.
**CRÍTICO - Preservação de Dados**: NUNCA apagar dados já cadastrados pelo usuário. Apenas implementar melhorias na interface e funcionalidades sem afetar dados existentes. Dados de glosas, contratos e outras informações já inseridas devem ser mantidos intactos durante todas as atualizações do sistema.
**CRÍTICO - Proteção de Dados**: Sistema implementado com backup automático e verificação de integridade. Todo dado cadastrado é protegido contra perda através de verificação dupla e auditoria completa. Configurações salvas no PostgreSQL para preservar estado do sistema após restarts.
**CRÍTICO - PostgreSQL 100%**: Sistema totalmente migrado para PostgreSQL. Memória local removida completamente. Todas as operações (contratos, orçamentos, realizados, funcionários, custos diretos, glosas, usuários, relatórios, categorias, alertas, previsões, auditoria e folha) executadas exclusivamente no banco de dados. Performance otimizada e consistência de dados garantida. Migração concluída em 23/08/2025.
**CRÍTICO - Tema Visual Persistente**: Sistema de tema escuro/preto completamente implementado e salvo no PostgreSQL. Todas as configurações visuais (cores slate, remoção de bordas, layout uniforme) armazenadas na tabela interface_settings para carregamento automático. Configurações aplicadas: contratos idêntico a glosas, botões sem bordas, paleta slate/preto uniforme. Implementação completa em 23/08/2025.
**CRÍTICO - Localização**: TODAS as sugestões, mensagens, tooltips e textos do sistema devem estar SEMPRE em português brasileiro. Sistema configurado com localização pt-BR obrigatória em todas as interfaces e funcionalidades.

## System Architecture

### Frontend
The frontend is a React and TypeScript single-page application, built with Vite. It utilizes shadcn/ui (based on Radix UI) for components, styled with Tailwind CSS for responsiveness. Wouter manages routing, and TanStack Query handles server state. The component architecture is modular, promoting reusability and consistent visual design with standardized icons and a blue color scheme. Contract forms feature comprehensive data validation and formatting. The system is fully responsive for mobile, including a hamburger menu, horizontal table scrolling, touch-friendly buttons, and an optimized viewport for Android/iOS.

### Backend
The backend is an Express.js application written in TypeScript, following a RESTful API design. It employs a layered architecture separating routes, data storage interfaces, and middleware for concerns like audit logging and error handling. API endpoints adhere to RESTful conventions, providing JSON responses and appropriate HTTP status codes, supporting both PUT and PATCH methods for updates.

### Data Storage
PostgreSQL serves as the primary database, managed with Drizzle ORM for type-safe operations and Drizzle Kit for schema migrations. The database is hosted on Neon Database. The schema includes financial entities such as contracts, budget/actual data, employee records, audit logs, alerts, and reporting configurations. All interface, layout, and functionality configurations are persisted in the database, including sidebar elements, header layout, menu structure, and theme settings.

### Authentication and Authorization
The system features a secure, database-backed authentication system. User registration is administrative-panel exclusive. Passwords are bcrypt-encrypted. Role-based access control (RBAC) differentiates "edit" (full access) and "view_only" permissions. Session management and logout are integrated, with all operations audited by authenticated user ID. Granular permissions allow administrators to restrict user access to specific contracts.

### Core Features and Design Patterns
The platform incorporates:
- **Mão de obra extra Management:** Complete CRUD system for employee management.
- **Authentication System:** Secure login, role-based access, and admin panel.
- **Onboarding System:** Interactive tours customizable by user role.
- **Real-time Dashboard:** Interactive charts displaying live financial KPIs with automated updates.
- **Interface Customization:** Comprehensive theme personalization, with preferences persisted.
- **Personalized Notification System:** Role-based notification templates across various categories with multiple communication channels.
- **Monthly Billing System:** Analyzes predicted vs. actual vs. utilization rates by contract, month, and year, including indirect costs and a "Provisão Geral" tab.
- **Direct Costs Management:** Comprehensive module for CRUD operations, validation, and real-time UI updates.
- **Executive Presentation Mode:** Professional slide system with configurable automatic advancement.
- **Advanced Reporting System:** Module with customizable templates, advanced filters, and export options.
- **Predictive Machine Learning:** Advanced ML system for cost prediction, revenue forecasting, anomaly detection, and resource optimization.
- **External Integrations System:** Platform for connecting with accounting, banking, HR, and ERP systems, featuring status monitoring and automatic synchronization.
- **Advanced Executive Dashboard:** Strategic interface with executive KPIs, risk analysis, per-contract performance, customizable filters, and PDF report export.
- **Financial Analysis System:** Complete implementation with monthly, accumulated, and annual views per contract, budgeted vs. actual comparison with visual indicators.
- **Universal Export System:** Functionality for exporting data in PDF, CSV, Excel, and JSON across all relevant pages.
- **Payroll System:** Dedicated "Folha" tab with specific fields and mandatory filters.
- **Advanced Watermark System:** Customizable hexagon watermarks in the sidebar.
- **Job Management System (Vagas):** Complete job vacancy tracking system with CRUD operations, advanced filtering, and key performance metrics.
- **Contract Visualization System:** Fully functional modal with comprehensive details and seamless navigation between view and edit modes.
- **Glosas System:** Comprehensive system for managing glosas with improved UI, chart visualizations, and robust validation.
- **Contract Management:** Complete contract management system with native HTML form elements for select fields, automatic Brazilian real currency formatting, native HTML date fields with timezone correction, Cost Center (CC) field, Phone field, State (UF) field, and an automatic status monitoring system with alerts for contracts nearing expiration (1 month before) and finalized contracts (after expiration). Includes mandatory field validation before registration.

## External Dependencies

### Database
- **PostgreSQL**: Hosted on Neon Database.
- **Drizzle ORM**: For database interactions.

### Frontend Framework and Libraries
- **React**: Core UI framework.
- **Vite**: Build tool.
- **TanStack React Query**: Server state management.
- **Wouter**: Client-side routing.

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Accessible UI component primitives.
- **shadcn/ui**: Component library built on Radix UI.
- **Lucide React**: Icon library.
- **Recharts**: Charting library.

### Form Handling and Validation
- **React Hook Form**: Form management.
- **Zod**: Schema validation.

### Development and Utility Libraries
- **TypeScript**: Language for type safety.
- **Express.js**: Backend framework.
- **date-fns**: Date manipulation.
- **bcrypt**: Password encryption.