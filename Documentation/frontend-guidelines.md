# Frontend Guidelines

## Design Principles
1. **Intimacy**: Warm, soft visuals that evoke closeness.  
2. **Simplicity**: Minimalist interface to prioritize content.  
3. **Consistency**: Uniform interactions across all pages.  
4. **Privacy**: Clear indicators of private/shared content.  

---

## Styling
### Colors  
- **Primary**: `#FF6B6B` (Coral for buttons/accent)  
- **Secondary**: `#6C5CE7` (Purple for highlights)  
- **Background**: `#FFF9FB` (Soft pinkish white)  
- **Text**: `#2D3436` (Charcoal for readability)  
- **Success**: `#00B894` (Green for fulfilled hints)  

### Typography  
- **Font**: `Inter` (Google Fonts, sans-serif)  
- **Weights**:  
  - Headings: `600`  
  - Body: `400`  
- **Sizes**:  
  - H1: `2rem`  
  - H2: `1.5rem`  
  - Body: `1rem`  

### Spacing  
- Use Tailwind’s spacing scale (e.g., `p-4`, `gap-4`, `m-2`).  
- **Grid**: 12px baseline grid for alignment.  

---

## Components
### Reusable Components  
1. **`<MemoryCard>`**:  
   - Displays image/text preview in timeline.  
   - Props: `type`, `content`, `date`, `mediaUrl`.  
2. **`<AffectionButton>`**:  
   - Animated hug/kiss button with ripple effect.  
3. **`<HintForm>`**:  
   - Modal for adding hints (text/link/category).  

### Interaction Rules  
- **Image Upload**:  
  - Drag-and-drop zone + file picker.  
  - Validation: 10MB max, JPG/PNG only.  
- **Affection Gestures**:  
  - Disable button for 5s after sending to prevent spam.  

---

## Layouts
### Dashboard  
- **Sidebar**: Fixed left panel (240px width).  
- **Main Content**: Responsive grid (1–3 columns).  
- **Mobile**: Collapsible sidebar → bottom navbar.  

### Modals  
- **Overlay**: Semi-transparent black (`rgba(0,0,0,0.5)`).  
- **Animation**: Slide-in from bottom (Framer Motion).  

---

## Accessibility
1. **Semantic HTML**: Use `<nav>`, `<main>`, `<section>`.  
2. **ARIA Labels**:  
   - `aria-label="Send hug"` for affection buttons.  
   - `aria-describedby="hint-instructions"` for forms.  
3. **Keyboard Navigation**:  
   - All buttons/links focusable via `Tab`.  

---

## Responsiveness
- **Breakpoints**:  
  - Mobile: `< 640px`  
  - Tablet: `640px – 1024px`  
  - Desktop: `> 1024px`  
- **Testing Tools**: Chrome DevTools + Responsively App.  

---

## Code Quality
### Naming Conventions  
- **Components**: PascalCase (e.g., `HintForm.tsx`).  
- **Variables**: camelCase (e.g., `isLoading`).  

### Linting/Formatting  
- **ESLint Rules**: Airbnb style + React hooks.  
- **Prettier**: Enforce trailing commas + single quotes.  

---

## Future Improvements
- **Dark Mode**: Toggleable dark theme.  
- **Micro-Interactions**: Hover effects for cards/buttons.
