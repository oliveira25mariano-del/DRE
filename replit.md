# Sistema DRE - Financial Management Platform

## Overview

This is a comprehensive financial management system (Sistema DRE) built with React, Express, and PostgreSQL. The application provides complete financial oversight capabilities including contract management, budget tracking, actual expense monitoring, employee management, and advanced analytics with machine learning predictions. It features a modern dashboard interface with real-time KPI monitoring, automated alerting system, audit logging, and comprehensive reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.
Interface language: Portuguese (Brazil) - All system interfaces and documentation should be in Portuguese.
User requires: Complete understanding of Replit configuration and navigation in Portuguese.

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
Currently, the application uses a simple user identification system through headers. The audit system tracks operations by user ID, providing accountability for all changes. The system is designed to accommodate future authentication implementations through middleware patterns.

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