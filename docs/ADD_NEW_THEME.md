# Adding a New Theme to MagPie Event Registration Platform

This guide will help you add a custom theme to the MagPie Event Registration Platform using Claude or other AI coding assistants.

## Overview

The MagPie platform supports multiple visual themes for the public registration page. Currently, two themes are included:
- **Default Theme**: Colorful gradients (purple/blue/pink) with full event information cards
- **Midnight Black Theme**: Sleek dark theme with pure black background and subtle particle effects

You can add your own custom theme by following this guide.

## Theme Architecture

The theme system consists of three main components:

1. **Theme Configuration** (`frontend/src/config/themes.js`)
   - Defines theme metadata and color schemes
   - Specifies which components and styles to load

2. **Theme-Specific CSS** (`frontend/src/styles/themes/`)
   - Custom CSS classes for each theme
   - Overrides default styles with theme-specific colors, spacing, and effects

3. **Theme-Aware Components** (`frontend/src/components/themes/`)
   - React components that adapt based on selected theme
   - Currently: `AnimatedBackground.jsx` for background effects

4. **Theme-Conditional Rendering** (`frontend/src/pages/HomePage.jsx`)
   - Main registration page that switches layouts based on theme
   - Loads theme-specific styles dynamically

## Prerequisites

Before adding a theme, ensure you have:
- Access to the codebase
- Basic understanding of React, CSS, and JavaScript
- The servers running (backend and frontend)
- Access to the dashboard at `http://localhost:3000/dashboard`

## Step-by-Step Instructions for AI Coding Assistants

When asking Claude or another coding assistant to add a theme, provide them with this information:

### 1. Theme Requirements

Specify your theme details:

```
Theme Name: [Your Theme Name]
Description: [Brief description of the visual style]
Color Scheme:
  - Primary color: [hex code]
  - Secondary color: [hex code]
  - Background color: [hex code]
  - Text color: [hex code]
  - Accent color: [hex code]

Visual Effects:
  - Background effects (gradients, particles, animations, etc.)
  - Card style (glass morphism, solid, bordered, etc.)
  - Typography style (font family, sizes, weights)
  - Animation preferences (subtle, prominent, none)

Special Features:
  - Any unique visual elements
  - Responsive behavior preferences
  - Accessibility considerations
```

### 2. Example Prompt for Claude

Use this template when asking Claude to add a theme:

```
I want to add a new theme called "[THEME_NAME]" to the MagPie Event Registration Platform.

Theme Details:
- Name: [Your Theme Name]
- Description: [Brief description]
- Primary Color: [#hex]
- Background: [Description of background style]
- Card Style: [Description of card appearance]
- Effects: [Any special visual effects]

Please follow the existing theme architecture:
1. Add theme configuration to frontend/src/config/themes.js
2. Create theme-specific CSS file in frontend/src/styles/themes/[theme-name].css
3. Update AnimatedBackground.jsx to support the new theme's background effects
4. Update HomePage.jsx to conditionally render the new theme layout
5. Ensure the theme selector in Dashboard → Branding Settings includes the new theme
6. Update CHANGELOG.md with the new theme addition

Make sure the theme:
- Supports all existing features (auto-fill, dynamic fields, validation)
- Is responsive on mobile and desktop
- Maintains accessibility standards
- Follows the existing theme patterns

Reference the "Midnight Black" theme implementation as an example.
```

### 3. Files to Modify

Provide Claude with these file paths to modify:

#### Required Files:
1. **`frontend/src/config/themes.js`**
   - Add new theme object to `THEMES` constant
   - Include: id, name, description, colors object

2. **`frontend/src/styles/themes/[your-theme-name].css`**
   - Create new CSS file for theme-specific styles
   - Define custom classes and overrides

3. **`frontend/src/components/themes/AnimatedBackground.jsx`**
   - Add new case in switch statement for your theme
   - Implement background visual effects

4. **`frontend/src/pages/HomePage.jsx`**
   - Add conditional rendering for your theme
   - Import and use theme-specific styles

#### Optional Files:
5. **`frontend/src/components/themes/[YourTheme]Components.jsx`**
   - If your theme needs custom components (optional)

6. **`CHANGELOG.md`**
   - Document the new theme addition

### 4. Theme Configuration Structure

Your theme configuration in `themes.js` should follow this structure:

```javascript
{
  id: 'your-theme-id',
  name: 'Your Theme Name',
  description: 'Brief description of the theme',
  colors: {
    primary: '#hex',
    secondary: '#hex',
    background: '#hex',
    text: '#hex',
    accent: '#hex'
  }
}
```

### 5. CSS File Structure

Your theme CSS file should include:

```css
/* Theme: Your Theme Name */

/* Background styles */
.your-theme-background {
  /* background properties */
}

/* Container styles */
.your-theme-container {
  /* layout properties */
}

/* Form card styles */
.your-theme-form-card {
  /* card styling */
}

/* Button styles */
.your-theme-button {
  /* button styling */
}

/* Input field styles */
.your-theme-input {
  /* input styling */
}

/* Text styles */
.your-theme-heading {
  /* heading styles */
}

.your-theme-text {
  /* body text styles */
}

/* Animation keyframes (if needed) */
@keyframes your-theme-animation {
  /* animation steps */
}
```

### 6. Testing Checklist

After Claude implements the theme, verify:

- [ ] Theme appears in Dashboard → Branding Settings dropdown
- [ ] Selecting theme updates registration page immediately
- [ ] All form fields are visible and functional
- [ ] Auto-fill works correctly
- [ ] Form validation displays properly
- [ ] Submit button is visible and clickable
- [ ] Thank you page displays after submission
- [ ] Theme persists after page reload
- [ ] Responsive design works on mobile (375px) and desktop (1920px)
- [ ] Text is readable with sufficient contrast
- [ ] Animations don't cause performance issues

## Example: Adding a "Sunset Orange" Theme

Here's a complete example prompt:

```
Add a new "Sunset Orange" theme to the MagPie Event Registration Platform.

Theme Details:
- Name: Sunset Orange
- Description: Warm sunset-inspired theme with orange and pink gradients
- Primary Color: #FF6B35
- Secondary Color: #F7931E
- Background: Animated gradient from orange (#FF6B35) to pink (#FF8C94) to purple (#C9485B)
- Card Style: Semi-transparent white cards with subtle shadow and orange border
- Effects: Gentle floating particles in warm colors, smooth gradient animation

Requirements:
1. Add theme to frontend/src/config/themes.js
2. Create frontend/src/styles/themes/sunset-orange.css
3. Update AnimatedBackground.jsx with sunset gradient and particles
4. Update HomePage.jsx to render sunset theme layout
5. Ensure theme works with all form features
6. Update CHANGELOG.md

Follow the Midnight Black theme implementation pattern.
```

## Architecture Reference

### Current Theme System Files

```
frontend/
├── src/
│   ├── config/
│   │   └── themes.js                    # Theme definitions
│   ├── styles/
│   │   └── themes/
│   │       ├── midnight-black.css       # Midnight Black theme styles
│   │       └── [your-theme].css         # Your new theme styles
│   ├── components/
│   │   └── themes/
│   │       └── AnimatedBackground.jsx   # Theme-aware background
│   └── pages/
│       └── HomePage.jsx                 # Main registration page with theme logic
```

### Backend Files (if needed)

```
backend/
└── app/
    └── api/
        └── branding.py                   # Branding settings API (theme selection)
```

## Theme Selection Flow

1. User selects theme in Dashboard → Branding Settings
2. Theme selection saved to database (`branding_settings.theme`)
3. Frontend fetches branding settings on registration page load
4. HomePage.jsx reads theme from branding settings
5. Theme-specific CSS imported dynamically
6. AnimatedBackground.jsx renders theme-specific background
7. Form components styled with theme classes

## Database Schema

Theme selection is stored in the `branding_settings` table:

```sql
CREATE TABLE branding_settings (
    id INTEGER PRIMARY KEY,
    site_name TEXT DEFAULT 'MagPie Event Registration',
    logo_url TEXT,
    theme TEXT DEFAULT 'default',  -- Theme identifier
    created_at TEXT,
    updated_at TEXT
);
```

## Common Issues and Solutions

### Issue: Theme not appearing in dropdown
**Solution**: Ensure theme is added to `THEMES` array in `themes.js` with correct structure

### Issue: Theme selected but page doesn't change
**Solution**: Check that theme ID in database matches theme ID in `themes.js`

### Issue: CSS not loading
**Solution**: Verify CSS file path and import statement in HomePage.jsx

### Issue: Background not rendering
**Solution**: Check AnimatedBackground.jsx has case for your theme ID

### Issue: Form not functional
**Solution**: Ensure theme doesn't override critical form classes or event handlers

## Best Practices

1. **Accessibility**: Ensure text has sufficient contrast ratio (WCAG AA: 4.5:1 minimum)
2. **Performance**: Keep animations smooth (60fps), avoid heavy effects
3. **Responsiveness**: Test on mobile (375px), tablet (768px), and desktop (1920px)
4. **Consistency**: Match existing theme patterns and structure
5. **Documentation**: Update CHANGELOG.md with theme addition
6. **Testing**: Verify all form features work with new theme

## Resources

- [TailwindCSS Documentation](https://tailwindcss.com/docs) - For utility classes
- [Framer Motion Documentation](https://www.framer.com/motion/) - For animations
- [CSS Gradient Generator](https://cssgradient.io/) - Create gradients
- [Coolors](https://coolors.co/) - Color palette generator
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Check accessibility

## Support

If you encounter issues:
1. Check the console for JavaScript errors
2. Verify all file paths are correct
3. Ensure servers are running (backend and frontend)
4. Check database connection
5. Review CLAUDE.md for development guidelines

## Example Themes for Inspiration

- **Ocean Blue**: Deep blue gradient with wave animations
- **Forest Green**: Nature-inspired with leaf particles
- **Rose Gold**: Elegant metallic theme with shimmer effects
- **Neon Cyberpunk**: Bright neon colors with grid background
- **Minimalist White**: Clean white with subtle shadows
- **Galaxy Purple**: Space theme with stars and nebula effects
- **Corporate Professional**: Clean, professional blue and gray

---

**Happy Theming! 🎨**

For questions or issues, refer to the main documentation in `/docs` or check [CLAUDE.md](../CLAUDE.md) for development guidelines.
