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
Critical Bug Fixes: User expressed high frustration with contract editing failures and demanded definitive resolution - implemented comprehensive fix with HTTP method compatibility and proper data handling.

## System Architecture

### Frontend Architecture
The frontend is a single-page application (SPA) developed with React and TypeScript, utilizing Vite for build processes. UI components are built with shadcn/ui, based on Radix UI primitives, and styled with Tailwind CSS for responsive design. Routing is managed by Wouter, and server state management uses TanStack Query for caching and synchronization. The component architecture is modular, promoting reusability and feature-specific organization. Visual consistency is achieved through standardized icon usage and consistent layout patterns, with all monetary values and visual components primarily using blue color tones. Contract forms implement comprehensive data validation with proper currency formatting, null field handling, and array initialization to prevent data loss during CRUD operations.

### Backend Architecture
The backend is an Express.js application written in TypeScript, adhering to a RESTful API design. It employs a layered architecture separating routes, data storage interfaces, and middleware for concerns such as audit logging and error handling. API endpoints follow RESTful conventions, providing JSON responses and appropriate HTTP status codes. Contract update operations support both PUT and PATCH methods for maximum frontend compatibility, with shared handler function ensuring consistent behavior.

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
- **Contract Visualization System:** Implemented fully functional contract viewing modal with comprehensive details including client information, financial data, dates, categories, tags, and action buttons for seamless navigation between view and edit modes.
- **Data Integrity Enhancement:** Improved server-side validation and logging for contract creation and updates, ensuring all form data is properly saved and retrieved with enhanced debugging capabilities and robust null/undefined field handling.
- **Form Validation Improvements:** Enhanced contract form with proper default value handling, currency formatting, and comprehensive field validation to prevent data loss during creation and editing operations.
- **Cache Management Fix:** Implemented robust React Query cache invalidation strategy for contract operations to ensure table updates immediately after create/edit/delete operations, preventing stale data display and ensuring real-time UI updates.
- **Critical Contract Edit Bug Resolution (August 2025):** Identified and fixed the root cause of contract editing failures - HTTP method mismatch between frontend (PATCH) and backend (PUT only). Added PATCH route handler alongside existing PUT handler to ensure compatibility. Implemented comprehensive data validation and processing in contract forms with proper null/undefined handling, currency formatting, and array initialization. Removed complex local state management that caused sync issues, replacing with direct server data usage and forced refresh after mutations.
- **Glosas System Bug Fix (August 2025):** Resolved glosas creation validation errors by implementing proper Zod schema validation with date coercion and decimal handling. Fixed TypeScript errors in form fields for nullable values. Added comprehensive data processing in form submission with proper null/undefined field handling and currency formatting. System now successfully creates and manages glosas with proper data validation.
- **Glosas UI Improvements (August 2025):** Made the glosas creation modal more compact and user-friendly by reducing grid columns from 3 to 2, making description and reason fields full-width, reducing input heights, and implementing form reset after successful submission to prevent data persistence in fields. Removed export button from glosas tab as requested by user.
- **Glosas System Enhanced (August 2025):** Complete redesign of glosas interface with improved modal layout (2-column grid), changed "Descrição" field to "Nome do Colaborador(a)", added analysis button with bar chart visualization showing monthly costs by contract, fixed SelectItem component errors by using non-empty values, and implemented comprehensive form validation and error handling.
- **Glosas Chart Optimization (August 2025):** Enhanced the analysis chart with improved readability through better number formatting, increased margins to prevent text overlap with chart bars, separated cost visualization into distinct "Custo Glosa" and "Custo Atestado" categories with blue color palette (#3B82F6 and #1D4ED8), removed white hover highlights from chart bars, and added comprehensive CSS styling to prevent visual interference. All DialogDescription elements added to resolve accessibility warnings.
- **Glosas Monthly Bar Chart (August 2025):** Transformed the chart from donut to monthly bar chart displaying costs aggregated by month (MMM/yyyy format), with separate bars for "Custo Glosa" and "Custo Atestado". Implemented proper date sorting, blue color palette (#3B82F6 and #1D4ED8), improved margins to prevent text overlap, and comprehensive tooltip with currency formatting. Chart now shows temporal progression of costs with clear separation between glosa and attestation costs.
- **Glosas Contract-Month Chart Enhancement (August 2025):** Final optimization of glosas chart to display data by contract and month combination in format "Contract Name - MMM/yyyy". Removed text truncation to show complete contract names, added dark backgrounds with stroke effects for better text readability, increased margins to accommodate longer labels, and fixed all TypeScript errors. Chart now provides comprehensive view of costs separated by both contract and time period with enhanced visual clarity.

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