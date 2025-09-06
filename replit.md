# Overview

This is a full-stack web application for managing and displaying link collections with metadata previews. The app allows users to add URLs which are automatically enriched with metadata (title, description, images) and displayed as visual cards. It's built as a modern web application with a React frontend and Express backend, featuring a clean mobile-first design.

# User Preferences

Preferred communication style: Simple, everyday language, extremely concise responses. No lengthy explanations, no English translations, just core keywords/phrases.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state and caching
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with TypeScript support and hot module replacement

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Middleware**: Request logging, JSON parsing, and error handling
- **Development**: Integrated Vite development server for full-stack development

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple

## Key Features
- **Link Management**: Add, view, and delete links with automatic metadata fetching
- **Metadata Extraction**: Automatic fetching of page titles, descriptions, and images using Cheerio
- **Responsive Design**: Mobile-first design with card-based layout
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Skeleton loaders and optimistic updates
- **Toast Notifications**: User feedback for actions and errors

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **express**: Web application framework for the backend API
- **cheerio**: Server-side HTML parsing for metadata extraction

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives for accessibility
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema definition
- **wouter**: Lightweight routing library
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **@vitejs/plugin-react**: React support for Vite
- **drizzle-kit**: Database migration and schema management
- **tsx**: TypeScript execution for development

### Third-party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development platform integration
- **Unsplash**: Default placeholder images for links