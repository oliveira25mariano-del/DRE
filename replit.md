# Sistema DRE - Financial Management Platform

## Overview
Sistema DRE is a comprehensive financial management platform providing robust capabilities for financial oversight, including contract management, budget and actual expense tracking, employee management, and advanced analytics. The system features a modern dashboard with real-time KPI monitoring, an automated alerting system, comprehensive audit logging, and reporting. Its core purpose is to provide complete financial transparency, optimize resource allocation, and enable data-driven decision-making for businesses.

## User Preferences
Preferred communication style: Simple, everyday language.
Interface language: Portuguese (Brazil) - All system interfaces and documentation should be in Portuguese.
User requires: Complete understanding of Replit configuration and navigation in Portuguese.
Admin Panel Access: Ctrl + Alt + A shortcut for hidden administrative panel at /admin-panel-secreto
Visual Standards: KPI cards must maintain consistent height, glass-effect styling, and blue color scheme throughout the application.
Error Prevention: All TypeScript errors must be resolved to prevent application instability and ensure smooth operation.

## System Architecture

### Frontend Architecture
The frontend is a single-page application (SPA) developed with React and TypeScript, utilizing Vite for build processes. UI components are built with shadcn/ui, based on Radix UI primitives, and styled with Tailwind CSS for responsive design. Routing is managed by Wouter, and server state management uses TanStack Query for caching and synchronization. The component architecture is modular, promoting reusability and feature-specific organization. Visual consistency is achieved through standardized icon usage and consistent layout patterns, with all monetary values and visual components primarily using blue color tones.

### Backend Architecture
The backend is an Express.js application written in TypeScript, adhering to a RESTful API design. It employs a layered architecture separating routes, data storage interfaces, and middleware for concerns such as audit logging and error handling. API endpoints follow RESTful conventions, providing JSON responses and appropriate HTTP status codes.

### Data Storage Solutions
PostgreSQL serves as the primary database, managed with Drizzle ORM for type-safe operations and Drizzle Kit for schema migrations. The database is hosted on Neon Database for scalable serverless cloud storage. The schema encompasses financial entities like contracts, budget/actual data, employee records, audit logs, alerts, and reporting configurations.

### Authentication and Authorization
The system includes a secure, database-backed authentication system. User registration is exclusively via the administrative panel. Passwords are encrypted with bcrypt. Role-based access control (RBAC) is implemented, differentiating between "edit" (full access) and "view_only" (read-only) permissions. Session management and logout are integrated, with all operations tracked in the audit system by authenticated user ID. Granular permissions allow administrators to restrict user access to specific contracts.

### Core Features and Design Patterns
The platform incorporates:
- **Authentication System:** Secure login, role-based access, and admin panel for user management.
- **Onboarding System:** Interactive tours customizable by user role.
- **Real-time Dashboard:** Interactive charts (Recharts) display live financial KPIs with automated updates.
- **Interface Customization:** Comprehensive theme personalization system offering various color schemes, layout options, and chart styles, with preferences persisted locally.
- **Personalized Notification System:** Role-based notification templates across financial, system, contracts, and budget categories, with multiple communication channels and customizable preferences.
- **Employee Management:** Full CRUD operations for employee records.
- **Monthly Billing System:** Analyzes predicted vs. actual vs. utilization rates by contract, month, and year, including indirect costs tracking and a "Provisão Geral" tab.
- **Direct Costs Management:** Comprehensive module for CRUD operations, validation, and real-time UI updates for direct costs, with advanced real-time filtering by Contract, Month, Year, and Category.
- **Executive Presentation Mode:** A system with professional slides, configurable automatic advancement, and advanced controls.
- **Advanced Reporting System:** Module with customizable templates, advanced filters, and export options.
- **Predictive Machine Learning:** Advanced ML system with models for cost prediction, revenue forecasting, anomaly detection, and resource optimization, offering predictive analysis and smart optimization suggestions.
- **External Integrations System:** Platform for connecting with accounting, banking, HR, and ERP systems, featuring status monitoring, detailed logs, and automatic synchronization.
- **Advanced Executive Dashboard:** Strategic interface with executive KPIs, risk analysis, per-contract performance, customizable filters, temporal comparisons, and PDF report export.
- **Financial Analysis System:** Complete implementation with monthly, accumulated, and annual views per contract, budgeted vs. actual comparison with visual indicators and functional executive KPIs.
- **Universal Export System:** Functionality for exporting data in PDF, CSV, Excel, and JSON across all relevant pages (DRE, Provisions, Audit Logs, Fringe Benefits, Contracts, Financial Analysis, Glosas, MOE), featuring an interactive modal for format selection and professional PDF generation with titles, subtitles, and watermarks.
- **Payroll System:** Dedicated "Folha" tab with specific fields (Salaries, Overtime, Benefits, Transport, Impairment), mandatory filters (contract, year, period), and full PostgreSQL integration.
- **Advanced Watermark System:** Customizable hexagon watermarks in the sidebar with a dedicated configuration file (`watermarkConfig.ts`), offering over 15 adjustable parameters (opacity, size, position, CSS filters, transformations, blend modes, optional animations) and four predefined presets.
- **Job Management System (Vagas):** Complete job vacancy tracking system with CRUD operations, advanced filtering, and key performance metrics including TFV (Taxa de Fechamento de Vagas), TMF (Tempo Médio de Fechamento), Active Open Positions, and Turnover Rate calculated over the last 12 months with automated alerts for rates above 20%.
- **TypeScript Error Resolution:** Complete resolution of all LSP diagnostics in server-side code, ensuring type safety for nullable fields, proper handling of undefined properties, and consistent data structure across all storage operations.

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