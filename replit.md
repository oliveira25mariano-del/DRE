# Sistema DRE - Financial Management Platform

## Overview
Sistema DRE is a comprehensive financial management platform designed to provide robust financial oversight. Its core purpose is to provide complete financial transparency, optimize resource allocation, and enable data-driven decision-making for businesses. Key capabilities include contract management, budget and actual expense tracking, employee management, and advanced analytics, all presented through a modern dashboard with real-time KPI monitoring, automated alerting, comprehensive audit logging, and reporting.

## Preferências do Usuário
Estilo de comunicação preferido: Linguagem simples e cotidiana.
Idioma da interface: Português (Brasil) - Todas as interfaces do sistema e documentação devem estar em português.
Idioma de comunicação: Todo o chat e comunicação deve ser em português brasileiro.
Requisito do usuário: Compreensão completa da configuração e navegação do Replit em português.
Acesso ao Painel Admin: Atalho Ctrl + Alt + A para painel administrativo oculto em /admin-panel-secreto
Padrões Visuais: Cards de KPI devem manter altura consistente, estilo de efeito vidro, e esquema de cores azul em toda aplicação.
Prevenção de Erros: Todos os erros TypeScript devem ser resolvidos para prevenir instabilidade da aplicação e garantir operação suave.

### Padrões de Interface Estabelecidos (Agosto 2025)
- **Formatação Monetária**: Todos os valores devem usar função `formatCompactCurrency` com R$ sempre na frente
- **Tamanhos de Fonte para Valores**: Cards de resumo (`text-sm`), tabelas (`text-sm`), sempre compactos
- **Cores Monetárias**: Valores individuais em azul claro (`text-blue-400`), totais em branco (`text-white`)
- **Botões de Ação**: Substituir textos por ícones (Edit/Trash2), usar variante ghost com cores temáticas
- **AlertDialogs**: Design moderno com ícone AlertTriangle, estilização profissional, cores apropriadas
- **Formato Compacto**: K para milhares, M para milhões, sempre 2 casas decimais para valores < 1000

## System Architecture

### Frontend
The frontend is a React and TypeScript single-page application, built with Vite. It utilizes shadcn/ui (based on Radix UI) for components, styled with Tailwind CSS for responsiveness. Wouter manages routing, and TanStack Query handles server state. The component architecture is modular, promoting reusability and consistent visual design with standardized icons and a blue color scheme. Contract forms feature comprehensive data validation and formatting.

### Backend
The backend is an Express.js application written in TypeScript, following a RESTful API design. It employs a layered architecture separating routes, data storage interfaces, and middleware for concerns like audit logging and error handling. API endpoints adhere to RESTful conventions, providing JSON responses and appropriate HTTP status codes, supporting both PUT and PATCH methods for updates.

### Data Storage
PostgreSQL serves as the primary database, managed with Drizzle ORM for type-safe operations and Drizzle Kit for schema migrations. The database is hosted on Neon Database. The schema includes financial entities such as contracts, budget/actual data, employee records, audit logs, alerts, and reporting configurations.

### Authentication and Authorization
The system features a secure, database-backed authentication system. User registration is administrative-panel exclusive. Passwords are bcrypt-encrypted. Role-based access control (RBAC) differentiates "edit" (full access) and "view_only" permissions. Session management and logout are integrated, with all operations audited by authenticated user ID. Granular permissions allow administrators to restrict user access to specific contracts.

### Core Features and Design Patterns
The platform incorporates:
- **MOE (Specialized Workforce) Management:** Complete CRUD system for employee management with advanced filtering, real-time cost calculations, professional confirmation modals, and comprehensive form validation.
- **Authentication System:** Secure login, role-based access, and admin panel for user management.
- **Onboarding System:** Interactive tours customizable by user role.
- **Real-time Dashboard:** Interactive charts (Recharts) displaying live financial KPIs with automated updates.
- **Interface Customization:** Comprehensive theme personalization, with preferences persisted locally.
- **Personalized Notification System:** Role-based notification templates across various categories with multiple communication channels.
- **Monthly Billing System:** Analyzes predicted vs. actual vs. utilization rates by contract, month, and year, including indirect costs and a "Provisão Geral" tab.
- **Direct Costs Management:** Comprehensive module for CRUD operations, validation, and real-time UI updates with advanced filtering.
- **Executive Presentation Mode:** Professional slide system with configurable automatic advancement.
- **Advanced Reporting System:** Module with customizable templates, advanced filters, and export options.
- **Predictive Machine Learning:** Advanced ML system for cost prediction, revenue forecasting, anomaly detection, and resource optimization.
- **External Integrations System:** Platform for connecting with accounting, banking, HR, and ERP systems, featuring status monitoring and automatic synchronization.
- **Advanced Executive Dashboard:** Strategic interface with executive KPIs, risk analysis, per-contract performance, customizable filters, and PDF report export.
- **Financial Analysis System:** Complete implementation with monthly, accumulated, and annual views per contract, budgeted vs. actual comparison with visual indicators.
- **Universal Export System:** Functionality for exporting data in PDF, CSV, Excel, and JSON across all relevant pages, featuring an interactive modal for format selection and professional PDF generation.
- **Payroll System:** Dedicated "Folha" tab with specific fields and mandatory filters, integrated with PostgreSQL.
- **Advanced Watermark System:** Customizable hexagon watermarks in the sidebar with adjustable parameters and predefined presets.
- **Job Management System (Vagas):** Complete job vacancy tracking system with CRUD operations, advanced filtering, and key performance metrics (TFV, TMF, Active Open Positions, Turnover Rate) with automated alerts.
- **Contract Visualization System:** Fully functional modal with comprehensive details and seamless navigation between view and edit modes.
- **Glosas System:** Comprehensive system for managing glosas with improved UI, chart visualizations, and robust validation.

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