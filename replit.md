# Overview

This is a PDF Page Numbering Web Application that allows users to upload PDF files and add customizable page numbers with advanced positioning options including gutter margins and mirrored gutter layouts for book-style documents. The application performs all PDF processing on the client-side using browser-based PDF libraries, eliminating the need for server-side PDF manipulation.

The application provides comprehensive numbering controls including starting page selection, custom number ranges, position presets (top/bottom, center/inner/outer), font customization, and skip patterns. It features a live preview system that shows how page numbers will appear before processing the final document.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: React hooks for local component state
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management (though primarily client-side focused)

## PDF Processing Architecture
- **Client-Side Processing**: All PDF manipulation happens in the browser using pdf-lib and PDF.js
- **PDF Rendering**: PDF.js for displaying PDF previews in canvas elements
- **PDF Modification**: pdf-lib for adding page numbers and generating new PDF files
- **No Server Processing**: Eliminates privacy concerns and server load by keeping files client-side

## Component Structure
- **Modular Design**: Separate components for upload, numbering controls, position controls, font controls, and preview
- **Controlled Components**: All form inputs use controlled component patterns for predictable state management
- **Type Safety**: Comprehensive TypeScript interfaces for all configuration objects (NumberingSettings, PositionSettings, FontSettings)

## Backend Architecture
- **Minimal Express Server**: Basic Express.js setup for development serving
- **Development Only**: Server primarily exists for Vite development middleware
- **No PDF APIs**: No server-side PDF processing endpoints since all work is client-side
- **Memory Storage**: Simple in-memory storage interface (unused in current implementation)

## File Processing Flow
1. **Upload**: Drag-and-drop or file picker for PDF selection
2. **Analysis**: Extract page count and generate preview thumbnails
3. **Configuration**: User configures numbering options through form controls
4. **Preview**: Live preview shows positioning on selected pages
5. **Processing**: Client-side PDF modification using pdf-lib
6. **Download**: Browser downloads the processed PDF file

## Utility Systems
- **Unit Conversion**: Comprehensive system for converting between points, millimeters, and inches
- **Position Calculation**: Algorithm for computing number placement based on page dimensions, gutter settings, and odd/even page logic
- **Skip Pattern Parsing**: System for interpreting comma/range syntax for excluding specific pages

## Configuration Management
- **Preset System**: Pre-defined positioning options with smart defaults
- **Gutter Logic**: Support for both standard and mirrored gutter margins for book layouts
- **Range Controls**: Flexible page range selection with visibility controls
- **Font Embedding**: Support for multiple font families with fallback handling

# External Dependencies

## PDF Processing Libraries
- **pdf-lib**: Client-side PDF creation and modification library for adding page numbers
- **PDF.js**: Mozilla's PDF rendering library for displaying previews and extracting page information
- **Browser APIs**: File API and Canvas API for file handling and rendering

## UI and Styling
- **Radix UI**: Headless UI primitives for accessible components (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for UI icons
- **Class Variance Authority**: Utility for creating component variants

## Development and Build Tools
- **Vite**: Build tool and development server with React plugin
- **TypeScript**: Type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler used by Vite
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## React Ecosystem
- **React Hook Form**: Form state management with validation
- **TanStack Query**: Server state management (minimal usage)
- **Wouter**: Lightweight routing library
- **React DOM**: React rendering library

## Database Integration
- **Drizzle ORM**: SQL query builder and ORM setup (configured but not actively used)
- **Neon Database**: PostgreSQL-compatible serverless database provider (configured for future use)
- **Database Schema**: Basic user table structure defined but not implemented in current features

## Development Tools
- **Replit Integration**: Development environment plugins and error handling
- **Runtime Error Overlay**: Development error display
- **Cartographer**: Replit-specific development tooling