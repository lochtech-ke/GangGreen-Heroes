# #GangGreen Platform - Technical Guide

**Last Updated**: November 19, 2025  
**Version**: 5.0  
**Status**: Sprint 4 - Design System Specification Complete

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Design System](#design-system)
4. [Icon System](#icon-system)
5. [Glassmorphism Components](#glassmorphism-components)
6. [Animation System](#animation-system)
7. [Authentication System](#authentication-system)
8. [User Profile Management](#user-profile-management)
9. [Initiative Management System](#initiative-management-system)
10. [Tree Registry and Monitoring](#tree-registry-and-monitoring)
11. [Antugrow API Integration](#antugrow-api-integration)
12. [Onboarding Chatbot System](#onboarding-chatbot-system)
13. [NFT Badge Purchase System](#nft-badge-purchase-system)
14. [Social Media Feed](#social-media-feed)
15. [Individual User Journey](#individual-user-journey)
16. [Legal Pages](#legal-pages)
17. [Database Schema](#database-schema)
18. [API Services](#api-services)
19. [Component Architecture](#component-architecture)
20. [State Management](#state-management)
21. [Security](#security)
22. [Testing](#testing)
23. [Deployment](#deployment)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile Web  │  │   Admin      │     │
│  │   (Vite)     │  │  (Responsive)│  │   Dashboard  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Design System Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Icons │ Glass │ Animations │ Tokens │ Components   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer (TypeScript)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Auth │ Profile │ Initiative │ Tree │ Chatbot │ NFT │  │
│  │  Social │ Journey │ GGCoin │ Badge │ Analytics      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Supabase)                         │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  PostgreSQL DB     │  │  Auth Service      │           │
│  │  - 30+ tables      │  │  - JWT tokens      │           │
│  │  - PostGIS         │  │  - Session mgmt    │           │
│  │  - RLS policies    │  │                    │           │
│  └────────────────────┘  └────────────────────┘           │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  Storage Buckets   │  │  Edge Functions    │           │
│  │  - Tree images     │  │  - Paystack webhook│           │
│  │  - Avatars         │  │  - Social feed     │           │
│  └────────────────────┘  └────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  Antugrow API      │  │  Paystack          │           │
│  │  (AI Monitoring)   │  │  (Payments)        │           │
│  └────────────────────┘  └────────────────────┘           │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  OpenStreetMap     │  │  Social APIs       │           │
│  │  (Maps)            │  │  (Instagram, etc)  │           │
│  └────────────────────┘  └────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 6.21.0
- **Icons**: Lucide React (NEW - comprehensive icon system)
- **Animations**: Framer Motion (NEW - for glassmorphism effects)
- **Maps**: Leaflet.js 1.9.4 + react-leaflet 4.2.1
- **Charts**: Recharts (for tree growth visualization)
- **State Management**: React Context API
- **Testing**: Vitest 4.0.8, Testing Library 16.3.0

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Database**: PostgreSQL 15 with PostGIS extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage (4 buckets)
- **Edge Functions**: Deno-based serverless functions

### External Integrations
- **Antugrow API**: AI-powered tree monitoring and health analysis
- **Paystack**: Payment processing for NFT badges
- **OpenStreetMap**: Free map tiles for Leaflet.js
- **Social Media APIs**: Instagram, Twitter, Facebook (for social feed)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 8.55.0
- **Formatting**: Prettier 3.1.1
- **Version Control**: Git

---

## Design System

### Overview

The Gang Green platform uses a comprehensive design system based on glassmorphism aesthetics, Lucide React icons, and Framer Motion animations.

**Status**: 🚧 Specification Complete, Implementation Pending

