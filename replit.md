# Sistema DRE - Financial Management Platform

## Overview

This is a comprehensive financial management system (Sistema DRE) built with React, Express, and PostgreSQL. The application provides complete financial oversight capabilities including contract management, budget tracking, actual expense monitoring, employee management, and advanced analytics with machine learning predictions. It features a modern dashboard interface with real-time KPI monitoring, automated alerting system, audit logging, and comprehensive reporting capabilities.

**Recent Completion (Aug 11, 2025):** Complete authentication system implemented with database-connected login, restricted access control, and administrative panel integration. All access now requires user registration through the admin panel. Authentication connects to real PostgreSQL database with role-based permissions ("edit" vs "view_only"). Secret admin access via Ctrl+Alt+A shortcut remains functional. Logout system corrected to prevent code display errors.

**Onboarding System (Aug 11, 2025):** Interactive onboarding tour implemented for new administrative panel users. Features welcome screen, guided tour with role-based content (admin vs view-only), and focus on cadastros (registrations) and indicadores (financial indicators). Tour is compact, fits entirely on screen without scrolling, and excludes secret panel references. Includes "Tour do Sistema" button in sidebar for manual restart. User preferences persisted in localStorage.

**User Management Enhancement (Aug 11, 2025):** Administrative panel user creation improved with clear role selection. Users can now choose between "Administrador" (full system access) and "Usuário" (view-only access) with visual icons and explanatory descriptions. Interface includes updated statistics, table headers, and badges using consistent "Administrador/Usuário" terminology instead of technical role names.

**Real-time Metrics Dashboard (Aug 11, 2025):** Comprehensive real-time dashboard implemented with interactive charts using Recharts library. Features live financial KPIs with trend indicators, automated updates every 30-60 seconds, connectivity status monitoring, and ability to pause/resume real-time updates. Includes area charts for monthly trends, pie charts for contract distribution, bar charts for category performance, and line charts for KPI evolution. All data updates automatically with realistic simulated financial metrics.

**Interface Customization System (Aug 11, 2025):** Complete theme personalization system implemented with lateral panel interface. Features 6 color schemes (Blue, Emerald, Purple, Orange, Red, Indigo), 4 layout options (Grid, List, Compact, Detailed), behavior settings (animations, trends display, auto-refresh), and 3 chart styles (Modern, Classic, Minimal). All preferences persist in localStorage with real-time preview and automatic application across the dashboard. Fully integrated with existing components and responsive design.

**Personalized Notification System (Aug 12, 2025):** Comprehensive notification system implemented with role-based templates and user customization. Features 8+ notification templates across 4 categories (financial, system, contracts, budget), 4 communication channels (email, push, SMS, dashboard), individual preference controls per notification type, sound settings, and notification history with read status. System includes admin-specific notifications (login alerts, system maintenance) and user-specific financial alerts (revenue targets, cost overruns, contract renewals). All preferences managed through lateral panel interface with real-time configuration updates. Switch components fully functional with proper visual feedback (color change and position movement) and local state management for responsive user interactions.

**PostgreSQL Database Integration for Employees (Aug 12, 2025):** Employee management module now uses PostgreSQL for data persistence instead of in-memory storage. Implemented DatabaseStorage class with complete CRUD operations for employees table, removed foreign key constraints to allow flexible contract associations, and corrected apiRequest function signature to properly handle HTTP methods. Employee data now persists between server restarts, resolving previous issues with data loss. System maintains backward compatibility with MemStorage for other entities while providing database-backed persistence for employee records.

**Report Settings Panel (Aug 12, 2025):** Complete configuration system for reports module implemented with comprehensive settings dialog. Features general configurations (default format, language, signature), notification settings for report events, and security options (double approval, audit logging, encryption). Accessible through Settings button in reports interface with organized sections and functional switches for all options. Integrates seamlessly with existing UI theme and provides toast feedback for saved configurations.

**Monthly Billing System (Aug 12, 2025):** Comprehensive monthly billing module implemented with complete analysis of predicted vs actual vs utilization rates by contract, month and year. Features interactive dashboard with summary KPI cards including indirect costs tracking, detailed filtering (contract, month, year, status), four-tab interface (List, Charts, Analysis, Provisão Geral), real-time metrics calculation, visual progress indicators, and comprehensive reporting with alerts for overdue bills and low utilization. Includes bar charts for monthly evolution, pie charts for status distribution, and automated performance indicators. System now includes indirect costs management (Glosas, Desconto SLA, Venda MOE) with dedicated tracking, compact visualization dialogs optimized for screen fit, business-specific status terminology (NF Emitida, Aguardando PO, Aguardando SLA, Aguardando aprovação shopping), and functional edit/view dialogs with complete form controls. New "Provisão Geral" tab provides comparative analysis between planned and projected billing with contract-level filtering and total calculations. Enhanced glosas management system with "Custos de Glosas de Atestado" field, updated nomenclature (Glosas de Atestados, Taxa de Impacto na Medição Final), and intelligent impact rate calculation that considers total glosas and attestation costs against actual billing amounts and contract values. Taxa de Impacto na Medição Final now accurately reflects financial impact on overall business performance. Fully integrated with sidebar navigation and existing design system.

**UI Consistency and Icon Standardization (Aug 12, 2025):** Comprehensive icon standardization applied across all system modules for consistent visual presentation. All metric cards throughout the application (MOE, Glosas, Billing, Alerts, Audit) now feature small icons (w-5 h-5) positioned in the top-right corner using absolute positioning. Replaced large circular background icons with discrete corner positioning, creating cleaner visual hierarchy and consistent user experience. Updated form labels in MOE module: "Email" field changed to "Data" with date input type, and "Taxa Fringe (%)" renamed to "Faturado Extra" for business-appropriate terminology. System-wide consistency achieved across all dashboard cards with standardized layout patterns and unified positioning approach.

## User Preferences

Preferred communication style: Simple, everyday language.
Interface language: Portuguese (Brazil) - All system interfaces and documentation should be in Portuguese.
User requires: Complete understanding of Replit configuration and navigation in Portuguese.
Admin Panel Access: Ctrl + Alt + A shortcut for hidden administrative panel at /admin-panel-secreto

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, implementing a single-page application (SPA) architecture. The application uses Vite as the build tool and development server for fast hot-reload capabilities. The UI is built with shadcn/ui components using Radix UI primitives and styled with Tailwind CSS for a modern, responsive design system.

The client-side routing is handled by Wouter, providing lightweight routing without the complexity of React Router. State management is handled through TanStack Query (React Query) for server state synchronization and caching, eliminating the need for complex global state management patterns.

The component architecture follows a modular approach with reusable UI components in the `/components/ui` directory and feature-specific components organized by functionality. Pages are structured to handle specific business domains (contracts, budgets, employees, etc.).

### Backend Architecture
The backend uses Express.js with TypeScript, following a RESTful API design pattern. The server implements a layered architecture with clear separation of concerns:

- **Routes Layer**: Handles HTTP requests and responses, input validation, and error handling
- **Storage Layer**: Abstracts data access operations through an interface pattern, allowing for easy database switching
- **Middleware Layer**: Implements cross-cutting concerns like audit logging and error handling

The API endpoints follow RESTful conventions with proper HTTP status codes and JSON responses. Audit logging is implemented as middleware to track all data modifications automatically.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema is defined in TypeScript with automatic type generation, ensuring compile-time safety for database operations.

Database migrations are handled through Drizzle Kit, providing version-controlled schema changes. The connection uses Neon Database serverless PostgreSQL for scalable cloud-based storage.

The schema includes comprehensive financial entities:
- Contracts with client information and financial terms
- Budget and actual financial data with monthly granularity
- Employee records with salary and benefit calculations
- Audit logs for compliance and change tracking
- Alert system for automated notifications
- Reporting system with approval workflows

### Authentication and Authorization
The application now implements a complete authentication system with database-connected login functionality. Only users registered through the administrative panel can access the system - there is no public registration available. Authentication validates against PostgreSQL database storing encrypted passwords using bcrypt. The system supports role-based access control with "edit" (full access) and "view_only" (read-only) permissions. Session management and logout functionality are fully integrated. The audit system tracks all operations by authenticated user ID, providing complete accountability for all changes.

### External Service Integrations
- **Neon Database**: Cloud PostgreSQL hosting with serverless scaling
- **Replit Integration**: Development environment with specialized Vite plugins for runtime error handling and debugging
- **Email/Notification System**: Prepared infrastructure for alert notifications (implementation pending)

The application is structured to easily integrate additional external services for enhanced functionality like automated reporting, advanced analytics, or third-party financial data feeds.

## External Dependencies

### Database
- **PostgreSQL via Neon**: Cloud-hosted serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database operations and migrations
- **Drizzle Kit**: Database migration and schema management tools

### Frontend Framework and Libraries
- **React 18**: Core frontend framework with modern hooks and concurrent features
- **Vite**: Fast build tool and development server with hot module replacement
- **TanStack React Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Accessible UI component primitives
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Comprehensive icon library
- **Class Variance Authority**: Type-safe CSS variant management

### Form Handling and Validation
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first schema declaration and validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Development and Build Tools
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript/TypeScript bundler for server-side code
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Replit Development Plugins**: Runtime error handling and debugging tools

### Date and Utility Libraries
- **date-fns**: Modern JavaScript date utility library with i18n support
- **clsx**: Utility for constructing className strings conditionally

The application is designed with minimal external dependencies while maintaining modern development practices and user experience standards.