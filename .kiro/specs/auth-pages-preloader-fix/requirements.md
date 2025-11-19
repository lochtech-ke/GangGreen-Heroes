# Requirements Document

## Introduction

The authentication pages (login, register, reset-password) are currently blocked by the PixiPreloader component, making forms unclickable. The preloader displays a full-screen animation with z-index 50 that covers all content, including authentication forms. This prevents users from interacting with login and registration forms until the animation completes, creating a poor user experience and blocking access to the application.

## Glossary

- **PixiPreloader**: A full-screen loading animation component built with Pixi.js that displays during application initialization
- **Authentication Pages**: The login, register, and reset-password pages where users authenticate
- **App Component**: The root React component that manages application routing and the preloader state
- **z-index**: CSS property that controls the stacking order of elements

## Requirements

### Requirement 1

**User Story:** As a user visiting the login or registration page, I want to immediately interact with the authentication forms, so that I can access my account without waiting for animations

#### Acceptance Criteria

1. WHEN a user navigates to `/login`, `/register`, or `/reset-password`, THE App Component SHALL NOT render the PixiPreloader component
2. WHEN a user navigates to any other page (home, dashboard, etc.), THE App Component SHALL render the PixiPreloader component as currently implemented
3. THE App Component SHALL determine whether to show the preloader based on the current route path
4. THE authentication forms SHALL be immediately clickable and interactive upon page load
5. THE solution SHALL NOT require changes to the PixiPreloader component itself

### Requirement 2

**User Story:** As a developer, I want the preloader logic to be maintainable and clear, so that future route additions can easily be configured

#### Acceptance Criteria

1. THE App Component SHALL maintain a list of routes where the preloader should be excluded
2. THE route exclusion logic SHALL be implemented in a clear, readable manner
3. THE implementation SHALL use React Router's location awareness to detect the current route
4. THE code SHALL include comments explaining why certain routes exclude the preloader
