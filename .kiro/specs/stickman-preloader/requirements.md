# Requirements Document

## Introduction

The current PixiPreloader displays a complex three-scene animation with African heritage themes. This specification defines a simpler, more playful preloader featuring a hand-sketch stickman animation on a dark green background with pulsating text "Chill Kiasii..." in rotating colors (red, green, black, and white) that creates a light box effect. The design aims to provide a more casual, engaging loading experience that reduces perceived wait time.

## Glossary

- **Preloader**: An animated loading screen displayed while the application initializes
- **Stickman Animation**: A simple hand-drawn style character animation using basic lines and shapes
- **Light Box Effect**: A pulsating color animation that cycles through multiple colors creating a glowing, attention-grabbing effect
- **Platform**: The #GangGreen web application
- **Hand-Sketch Style**: Animation style that mimics hand-drawn sketches with imperfect lines and organic movement

## Requirements

### Requirement 1

**User Story:** As a platform user, I want to see a playful stickman animation while the application loads, so that I feel relaxed and entertained during the wait

#### Acceptance Criteria

1. WHEN the Platform initializes, THE Preloader SHALL display a full-screen animation with a dark green background
2. THE Preloader SHALL render a white hand-sketch style stickman character performing animated actions
3. THE Preloader SHALL use simple line-based graphics to create the stickman with visible sketch imperfections
4. THE Preloader SHALL animate the stickman with smooth, organic movements at 60 frames per second
5. THE Preloader SHALL maintain the stickman animation continuously while the application loads

### Requirement 2

**User Story:** As a platform user, I want to see the text "Chill Kiasii..." with a pulsating light box effect, so that I understand the platform wants me to relax while loading

#### Acceptance Criteria

1. THE Preloader SHALL display the text "Chill Kiasii..." prominently on the screen
2. THE Preloader SHALL animate the text color cycling through red, green, black, and white in sequence
3. THE Preloader SHALL create a pulsating effect where each color transition takes 800 milliseconds
4. THE Preloader SHALL apply a glow or light box effect to make the text appear illuminated
5. THE Preloader SHALL ensure the text remains readable against the dark green background during all color phases

### Requirement 3

**User Story:** As a platform user, I want the preloader to have a dark green background, so that it aligns with the #GangGreen brand identity

#### Acceptance Criteria

1. THE Preloader SHALL use a dark green background color (approximately #0D4D2D or similar forest green)
2. THE Preloader SHALL fill the entire viewport with the background color
3. THE Preloader SHALL maintain consistent background color throughout the loading animation
4. THE Preloader SHALL ensure sufficient contrast between the white stickman and dark green background

### Requirement 4

**User Story:** As a developer, I want the preloader to be lightweight and performant, so that it loads quickly and doesn't add to the initial load time

#### Acceptance Criteria

1. THE Preloader SHALL use CSS animations or lightweight JavaScript for the stickman animation
2. THE Preloader SHALL use CSS keyframe animations for the text color pulsating effect
3. THE Preloader SHALL render without requiring large animation libraries or asset files
4. THE Preloader SHALL initialize within 100 milliseconds
5. THE Preloader SHALL use hardware-accelerated CSS properties (transform, opacity) where possible

### Requirement 5

**User Story:** As a platform user, I want the preloader to fade out smoothly when loading completes, so that the transition to the main application feels polished

#### Acceptance Criteria

1. WHEN the Platform completes loading, THE Preloader SHALL fade out within 500 milliseconds
2. THE Preloader SHALL use a smooth opacity transition for the fade-out effect
3. THE Preloader SHALL remove itself from the DOM after the fade-out completes
4. THE Preloader SHALL maintain a minimum display duration of 1.5 seconds to ensure users see the animation
5. THE Preloader SHALL allow the application to render underneath during the fade-out

### Requirement 6

**User Story:** As a developer, I want the preloader to be configurable, so that I can adjust timing and behavior without modifying the component code

#### Acceptance Criteria

1. THE Preloader SHALL accept a minimum display duration configuration parameter
2. THE Preloader SHALL accept a fade-out duration configuration parameter
3. THE Preloader SHALL accept a background color configuration parameter
4. THE Preloader SHALL provide a callback function that executes when the animation completes
5. THE Preloader SHALL accept configuration for the text color cycle speed

### Requirement 7

**User Story:** As a platform user on authentication pages, I want to not see the preloader, so that I can immediately access login and registration forms

#### Acceptance Criteria

1. WHEN a user navigates to `/login`, `/register`, or `/reset-password`, THE Platform SHALL NOT render the Preloader
2. WHEN a user navigates to any other page, THE Platform SHALL render the Preloader as designed
3. THE Platform SHALL determine whether to show the preloader based on the current route path
4. THE authentication forms SHALL be immediately clickable and interactive upon page load
