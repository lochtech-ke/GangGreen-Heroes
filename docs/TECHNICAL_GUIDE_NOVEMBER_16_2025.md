# #GangGreen Platform - Technical Guide

**Last Updated**: November 16, 2025  
**Version**: 4.0  
**Status**: Sprint 3 In Progress - Tree Registry & AI Integration

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication System](#authentication-system)
4. [User Profile Management](#user-profile-management)
5. [Initiative Management System](#initiative-management-system)
6. [Tree Registry System](#tree-registry-system)
7. [Antugrow AI Integration](#antugrow-ai-integration)
8. [Geospatial Features](#geospatial-features)
9. [Database Schema](#database-schema)
10. [API Services](#api-services)
11. [Component Architecture](#component-architecture)
12. [State Management](#state-management)
13. [Security](#security)
14. [Testing](#testing)
15. [Deployment](#deployment)

---

##
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
│                  Service Layer (TypeScript)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Auth │ Profile │ Initiative │ Tree │ Marketplace   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Supabase)                         │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  PostgreSQL DB     │  │  Auth Service      │           │
│  │  - 20 tables       │  │  - JWT tokens      │           │
│  │  - PostGIS         │  │  - Session mgmt    │           │
│  │  - RLS policies    │  │                    │           │
│  └────────────────────┘  └────────────────────┘           │
│  ┌────────────────────┐                                    │
│  │  Storage Buckets   │                                    │
│  │  - Tree images     │                                    │
│  │  - Avatars         │                                    │
│  └────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Geospatial Layer (Leaflet)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Maps │ Markers │ Polygons │ Location Picker        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Flow

```
User Action
   ↓
React Component (UI)
   ↓
Service Layer (Business Logic)
   ↓
Supabase Client (API)
   ↓
PostgreSQL Database (PostGIS)
   ↓
Response
   ↓
Component State Update
   ↓
UI Re-render (with Maps)
```

---

## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 6.21.0
- **Maps**: Leaflet.js 1.9.4 + react-leaflet 4.2.1
- **State Management**: React Context API
- **Testing**: Vitest 4.0.8, Testing Library 16.3.0

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Database**: PostgreSQL 15 with PostGIS extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage (4 buckets)

### Geospatial
- **Mapping Library**: Leaflet.js 1.9.4
- **React Integration**: react-leaflet 4.2.1
- **Map Tiles**: OpenStreetMap (free, no API key)
- **Coordinate System**: WGS84 (EPSG:4326)
- **Database Extension**: PostGIS for spatial queries

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 8.55.0
- **Formatting**: Prettier 3.1.1
- **Version Control**: Git

---

## Authentication System

### Overview

The authentication system provides secure user registration, login, and session management with role-based access control.

**Status**: ✅ Complete

[Previous authentication documentation remains the same...]

---

## User Profile Management

### Overview

User profiles store additional information beyond authentication credentials.

**Status**: ✅ Complete

[Previous profile documentation remains the same...]

---

## Initiative Management System

### Overview

The initiative management system enables organizations to create and manage tree planting initiatives with geospatial tracking, participant management, and progress monitoring.

**Status**: ✅ Complete (Service Layer + UI Components + Geospatial Features + Participation + Tests)

[Previous initiative documentation remains the same...]

---

## Tree Registry System

### Overview

The tree registry system enables community members to register, track, and monitor individual trees planted as part of conservation initiatives. It provides comprehensive tree management with geospatial tracking, image storage, health monitoring, and preparation for AI-powered analysis through the Antugrow API.

**Status**: 🚧 Service Layer Complete (Task 6.1 - 80%)

### Type Definitions

**Location**: `src/types/tree.types.ts`

**Core Types**:

```typescript
// Tree health status
export type TreeHealthStatus = 'healthy' | 'stressed' | 'diseased' | 'dead';

// Main tree interface
export interface Tree {
  id: string;
  initiative_id: string;
  species: string;
  planted_date: string;
  location: GeoPoint;
  planted_by: string;
  antugrow_id?: string;
  current_height_cm?: number;
  current_diameter_cm?: number;
  health_status?: TreeHealthStatus;
  last_monitored?: string;
  created_at: string;
  updated_at: string;
}

// Tree image tracking
export interface TreeImage {
  id: string;
  tree_id: string;
  image_url: string;
  captured_at: string;
  antugrow_analysis?: AntugrowAnalysis;
  created_at: string;
}

// AI analysis results (Antugrow integration)
export interface AntugrowAnalysis {
  health_score: number;
  growth_rate: number;
  disease_detected: boolean;
  recommendations: string[];
  analyzed_at: string;
}

// Tree with images
export interface TreeWithImages extends Tree {
  images: TreeImage[];
}

// Tree statistics
export interface TreeStatistics {
  total_trees: number;
  by_species: Record<string, number>;
  by_health_status: Record<TreeHealthStatus, number>;
  by_initiative: Record<string, number>;
  average_height_cm?: number;
  average_diameter_cm?: number;
  healthy_percentage: number;
}
```

**Request/Response Types**:

```typescript
// Create tree data
export interface CreateTreeData {
  initiative_id: string;
  species: string;
  planted_date: string;
  location: GeoPoint;
  planted_by: string;
  current_height_cm?: number;
  current_diameter_cm?: number;
}

// Update tree data
export interface UpdateTreeData {
  species?: string;
  current_height_cm?: number;
  current_diameter_cm?: number;
  health_status?: TreeHealthStatus;
  antugrow_id?: string;
}

// Filter options
export interface TreeFilters {
  initiative_id?: string;
  species?: string;
  health_status?: TreeHealthStatus;
  planted_by?: string;
  search?: string;
  forest?: string;
}

// Response types
export interface TreeResponse {
  tree: Tree | null;
  error: Error | null;
}

export interface TreesResponse {
  trees: Tree[];
  error: Error | null;
}

export interface TreeImageResponse {
  image: TreeImage | null;
  error: Error | null;
}

export interface TreeImagesResponse {
  images: TreeImage[];
  error: Error | null;
}
```

### Tree Service

**Location**: `src/services/tree.service.ts`

**Methods**:

```typescript
class TreeService {
  // Create a new tree record
  async createTree(data: CreateTreeData): Promise<TreeResponse>;

  // Get tree by ID
  async getTree(treeId: string): Promise<TreeResponse>;

  // Get tree with all images
  async getTreeWithImages(treeId: string): Promise<{
    tree: TreeWithImages | null;
    error: Error | null;
  }>;

  // Get all trees with optional filtering
  async getTrees(filters?: TreeFilters): Promise<TreesResponse>;

  // Get trees by initiative
  async getTreesByInitiative(initiativeId: string): Promise<TreesResponse>;

  // Update tree
  async updateTree(treeId: string, updates: UpdateTreeData): Promise<TreeResponse>;

  // Delete tree
  async deleteTree(treeId: string): Promise<{ error: Error | null }>;

  // Get tree images
  async getTreeImages(treeId: string): Promise<TreeImagesResponse>;

  // Add tree image
  async addTreeImage(
    treeId: string,
    imageUrl: string,
    capturedAt?: string
  ): Promise<TreeImageResponse>;

  // Delete tree image
  async deleteTreeImage(imageId: string): Promise<{ error: Error | null }>;

  // Calculate tree statistics
  async calculateStatistics(filters?: TreeFilters): Promise<TreeStatistics | null>;

  // Search trees by species
  async searchTrees(searchTerm: string): Promise<TreesResponse>;

  // Get unique species list
  async getSpeciesList(): Promise<{ species: string[]; error: Error | null }>;
}
```

### Usage Examples

#### Register a New Tree

```typescript
import { treeService } from '@/services';

const { tree, error } = await treeService.createTree({
  initiative_id: 'initiative-uuid',
  species: 'Acacia melanoxylon',
  planted_date: '2025-11-15',
  location: {
    type: 'Point',
    coordinates: [34.8522, 0.2827], // [longitude, latitude]
  },
  planted_by: 'user-uuid',
  current_height_cm: 25,
  current_diameter_cm: 2.5,
});

if (error) {
  console.error('Failed to register tree:', error);
} else {
  console.log('Tree registered:', tree);
}
```

#### Get Trees with Filters

```typescript
// Get all trees for an initiative
const { trees, error } = await treeService.getTrees({
  initiative_id: 'initiative-uuid',
});

// Get trees by species
const { trees, error } = await treeService.getTrees({
  species: 'Acacia melanoxylon',
});

// Get trees by health status
const { trees, error } = await treeService.getTrees({
  health_status: 'healthy',
});

// Search trees
const { trees, error } = await treeService.searchTrees('Acacia');
```

#### Update Tree Information

```typescript
const { tree, error } = await treeService.updateTree(treeId, {
  current_height_cm: 45,
  current_diameter_cm: 5.2,
  health_status: 'healthy',
});
```

#### Add Tree Monitoring Image

```typescript
const { image, error } = await treeService.addTreeImage(
  treeId,
  'https://storage.url/tree-image.jpg',
  '2025-11-16T10:30:00Z'
);
```

#### Calculate Tree Statistics

```typescript
// Get statistics for all trees
const stats = await treeService.calculateStatistics();

// Get statistics for an initiative
const stats = await treeService.calculateStatistics({
  initiative_id: 'initiative-uuid',
});

// Example result:
{
  total_trees: 1250,
  by_species: {
    "Acacia melanoxylon": 450,
    "Eucalyptus grandis": 380,
    "Indigenous Mix": 420
  },
  by_health_status: {
    healthy: 1100,
    stressed: 120,
    diseased: 25,
    dead: 5
  },
  by_initiative: {
    "initiative-uuid-1": 600,
    "initiative-uuid-2": 650
  },
  average_height_cm: 185.5,
  average_diameter_cm: 12.3,
  healthy_percentage: 88
}
```

#### Get Tree with Images

```typescript
const { tree, error } = await treeService.getTreeWithImages(treeId);

if (tree) {
  console.log('Tree:', tree);
  console.log('Images:', tree.images);
  tree.images.forEach(image => {
    console.log('Image URL:', image.image_url);
    console.log('Captured:', image.captured_at);
    if (image.antugrow_analysis) {
      console.log('Health Score:', image.antugrow_analysis.health_score);
    }
  });
}
```

### Key Features

1. **Tree Registration**
   - Register individual trees with species, location, and planter
   - Link trees to initiatives
   - Track planting date
   - Record initial measurements

2. **Geospatial Tracking**
   - GeoJSON format for location data
   - Automatic conversion to/from PostGIS format
   - Support for point-based locations
   - Spatial queries (future)

3. **Growth Monitoring**
   - Track height over time
   - Track diameter over time
   - Calculate growth rates
   - Average measurements across trees

4. **Health Status**
   - Four health states: healthy, stressed, diseased, dead
   - Health status updates
   - Health statistics calculation
   - Survival rate tracking

5. **Image Management**
   - Multiple images per tree
   - Capture date tracking
   - Image gallery support
   - Antugrow analysis storage

6. **Statistics & Analytics**
   - Total tree count
   - Species distribution
   - Health status breakdown
   - Initiative-wise counts
   - Average measurements
   - Healthy percentage

7. **Filtering & Search**
   - Filter by initiative
   - Filter by species
   - Filter by health status
   - Filter by planter
   - Full-text search on species
   - Get unique species list

8. **Validation**
   - Species name validation (max 100 characters)
   - Planted date validation (cannot be in future)
   - Location coordinate validation
   - Non-negative measurements
   - Required field checking

9. **Antugrow Integration Preparation**
   - `antugrow_id` field for API linking
   - `AntugrowAnalysis` interface for AI results
   - Image-analysis relationship
   - Health score tracking
   - Disease detection support
   - Recommendations storage

### Tree-Initiative Integration

**Linking Trees to Initiatives**:

```typescript
// Get all trees for an initiative
const { trees } = await treeService.getTreesByInitiative(initiativeId);

// Calculate tree statistics for an initiative
const stats = await treeService.calculateStatistics({
  initiative_id: initiativeId,
});

// Update initiative trees_planted count
const treeCount = stats?.total_trees || 0;
await initiativeService.updateInitiative(initiativeId, {
  trees_planted: treeCount,
});
```

### Tree-User Integration

**Tracking User Contributions**:

```typescript
// Get trees planted by a user
const { trees } = await treeService.getTrees({
  planted_by: userId,
});

// Calculate user statistics
const userStats = await treeService.calculateStatistics({
  planted_by: user