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
- **UI Consistency:** Standardized icon usage and consistent layout patterns across all modules for a unified user experience.

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