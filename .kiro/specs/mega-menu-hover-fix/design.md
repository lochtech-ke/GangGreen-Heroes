# Design Document

## Overview

This design implements a robust hover intent system for the mega menu navigation that prevents premature menu closure when users move their cursor from the trigger button to the submenu items. The solution uses delayed closing with cancellation, ensuring a smooth and frustration-free user experience.

## Architecture

### Component Structure

```
NavDropdown (Enhanced)
├── Hover Intent Logic
│   ├── Enter delay timer (150ms)
│   ├── Leave delay timer (300ms)
│   └── Timer cancellation handlers
├── Mouse Event Handlers
│   ├── onMouseEnter (trigger + dropdown)
│   ├── onMouseLeave (trigger + dropdown)
│   └── onClick (mobile toggle)
└── Dropdown Menu
    ├── Trigger Button
    ├── Dropdown Panel
    └── Menu Items
```

### State Management

The `NavDropdown` component will manage:
- `isOpen`: Boolean indicating dropdown visibility
- `enterTimer`: Ref to store the enter delay timeout
- `leaveTimer`: Ref to store the leave delay timeout
- `isMobile`: Boolean for mobile detection

## Components and Interfaces

### Enhanced NavDropdown Component

**Location:** `src/components/navigation/NavDropdown.tsx`

**Key Changes:**

1. **Hover Intent System**
   - Add `useRef` hooks for `enterTimerRef` and `leaveTimerRef`
   - Implement delayed opening (150ms) on mouse enter
   - Implement delayed closing (300ms) on mouse leave
   - Cancel timers when cursor returns to safe zone

2. **Mouse Event Handlers**
   ```typescript
   const handleMouseEnter = () => {
     if (isMobile) return;
     
     // Cancel any pending close
     if (leaveTimerRef.current) {
       clearTimeout(leaveTimerRef.current);
       leaveTimerRef.current = null;
     }
     
     // Open with slight delay for hover intent
     if (!isOpen) {
       enterTimerRef.current = setTimeout(() => {
         onToggle();
       }, 150);
     }
   };

   const handleMouseLeave = () => {
     if (isMobile) return;
     
     // Cancel any pending open
     if (enterTimerRef.current) {
       clearTimeout(enterTimerRef.current);
       enterTimerRef.current = null;
     }
     
     // Close with delay to allow cursor movement to dropdown
     leaveTimerRef.current = setTimeout(() => {
       onClose();
     }, 300);
   };
   ```

3. **Unified Container**
   - Wrap both trigger and dropdown in a single container
   - Apply mouse handlers to the container level
   - This creates a "safe zone" where the cursor can move freely

4. **Mobile Behavior**
   - Keep existing click toggle for mobile
   - Disable hover behavior on mobile viewports
   - Maintain backdrop overlay for mobile

### Updated Navigation Component

**Location:** `src/components/navigation/Navigation.tsx`

**Changes:**
- No structural changes needed
- The `NavDropdown` component handles its own hover logic
- Parent only manages which dropdown is currently open

## Data Models

No database changes required. This is purely a UI interaction enhancement.

## Error Handling

### Timer Cleanup

```typescript
useEffect(() => {
  // Cleanup timers on unmount
  return () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
    }
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
  };
}, []);
```

### Edge Cases

1. **Rapid Hover**: Multiple rapid hovers should cancel previous timers
2. **Component Unmount**: Clear all timers to prevent memory leaks
3. **Route Change**: Dropdown should close when navigation occurs
4. **Window Resize**: Re-detect mobile viewport and adjust behavior

## Testing Strategy

### Manual Testing

1. **Desktop Hover Flow**
   - Hover over trigger → menu opens after 150ms
   - Move cursor to dropdown → menu stays open
   - Move cursor away → menu closes after 300ms
   - Return cursor within 300ms → menu stays open

2. **Mobile Touch Flow**
   - Tap trigger → menu opens immediately
   - Tap trigger again → menu closes
   - Tap backdrop → menu closes
   - Tap menu item → menu closes and navigates

3. **Edge Cases**
   - Rapidly hover multiple triggers → only one menu open
   - Hover and immediately leave → menu doesn't flicker
   - Resize window from desktop to mobile → behavior switches correctly

### Accessibility Testing

1. Keyboard navigation still works (Tab, Enter, Escape)
2. Screen readers announce menu state correctly
3. Focus management remains intact

## Performance Considerations

- Timer delays are minimal (150ms/300ms) and don't impact performance
- No additional re-renders introduced
- Cleanup prevents memory leaks
- Mobile detection uses resize event with proper cleanup

## Visual Design

No visual changes to the menu appearance. The enhancement is purely behavioral:
- Same animations (200ms fade/slide)
- Same styling and colors
- Same layout and spacing

## Implementation Notes

1. **Timer Values**
   - Enter delay: 150ms (prevents accidental opens)
   - Leave delay: 300ms (allows cursor movement to dropdown)
   - These values are tuned for optimal UX and can be adjusted if needed

2. **Mobile Detection**
   - Use `window.innerWidth < 768` (Tailwind's `md` breakpoint)
   - Listen to resize events for dynamic detection
   - Clean up event listeners on unmount

3. **Backward Compatibility**
   - Changes are isolated to `NavDropdown` component
   - No breaking changes to parent components
   - Existing mobile behavior preserved
