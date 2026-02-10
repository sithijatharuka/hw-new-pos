# Responsive Design Quick Reference

## 🎨 Common Responsive Patterns

### Layout Patterns

#### 1. Stack on Mobile, Side-by-Side on Desktop

```jsx
<div className="flex flex-col md:flex-row gap-4">
  <div>Content A</div>
  <div>Content B</div>
</div>
```

#### 2. Responsive Grid

```jsx
<!-- 1 column on mobile, 2 on tablet, 3 on desktop -->
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>
```

#### 3. Responsive Padding/Spacing

```jsx
<div className="p-3 sm:p-4 md:p-6 lg:p-8">
  <!-- Padding increases with screen size -->
</div>
```

### Table Patterns

#### Desktop Table, Mobile Cards

```jsx
{
  /* Desktop Table */
}
<div className="hidden lg:block">
  <table>...</table>
</div>;

{
  /* Mobile Cards */
}
<div className="lg:hidden">
  {items.map((item) => (
    <div className="card">...</div>
  ))}
</div>;
```

### Modal Patterns

#### Responsive Modal

```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
  <div className="w-full max-w-md max-h-[80vh] flex flex-col">
    <!-- Modal content -->
  </div>
</div>
```

### Text Patterns

#### Responsive Typography

```jsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl">Title</h1>
<p className="text-sm sm:text-base">Body text</p>
```

### Button Patterns

#### Responsive Button Layout

```jsx
<div className="flex flex-col sm:flex-row gap-2">
  <button className="w-full sm:w-auto">Button 1</button>
  <button className="w-full sm:w-auto">Button 2</button>
</div>
```

## 📐 Spacing Scale

| Class    | Mobile | Desktop |
| -------- | ------ | ------- |
| `p-2`    | 8px    | 8px     |
| `sm:p-4` | -      | 16px    |
| `md:p-6` | -      | 24px    |
| `lg:p-8` | -      | 32px    |

## 🎯 Breakpoint Usage

### When to Use Each

- **Base (no prefix)**: Universal or mobile-first styles
- **sm:**: Adjustments for larger phones/small tablets
- **md:**: Tablet-specific changes
- **lg:**: Desktop layout changes
- **xl:**: Large desktop enhancements

## 🔍 Common Class Combinations

### Responsive Containers

```jsx
className = "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
```

### Responsive Flex

```jsx
className = "flex flex-col md:flex-row items-center gap-4";
```

### Responsive Text Alignment

```jsx
className = "text-center md:text-left";
```

### Hide/Show by Breakpoint

```jsx
className = "hidden md:block"; // Hidden on mobile, visible on desktop
className = "md:hidden"; // Visible on mobile, hidden on desktop
```

## 📱 Mobile-Specific Patterns

### Fixed Mobile Header

```jsx
<header className="fixed top-0 left-0 right-0 z-40 md:hidden">
  <!-- Mobile header content -->
</header>
```

### Fixed Mobile Bottom Nav

```jsx
<nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
  <!-- Mobile navigation -->
</nav>
```

### Main Content with Mobile Nav Spacing

```jsx
<main className="mt-[60px] md:mt-0 mb-[64px] md:mb-0">
  <!-- Content with space for mobile header/footer -->
</main>
```

## 🎨 Touch-Friendly Design

### Minimum Touch Targets

```jsx
className = "min-h-[44px] min-w-[44px]"; // iOS/Android guidelines
```

### Touch-Friendly Buttons

```jsx
className = "px-4 py-3 text-sm sm:text-base"; // Adequate padding
```

## 💡 Best Practices

1. **Start Mobile-First**: Write base styles for mobile, enhance for larger screens
2. **Test All Breakpoints**: Use browser dev tools to test at various sizes
3. **Use Semantic Breakpoints**: Choose breakpoints based on content, not devices
4. **Maintain Touch Targets**: Keep interactive elements ≥44px on mobile
5. **Optimize Performance**: Use conditional rendering for different views
6. **Consistent Patterns**: Reuse responsive patterns across components

## 📊 Component Checklist

When creating a new component, ensure:

- [ ] Responsive padding/margins
- [ ] Proper font sizing at all breakpoints
- [ ] Touch-friendly interactive elements
- [ ] Layouts adapt appropriately
- [ ] Tables have mobile alternatives
- [ ] Modals fit mobile screens
- [ ] Images/media scale properly
- [ ] No horizontal overflow on mobile

---

**Quick Tip**: Use browser DevTools responsive mode to test:

- iPhone SE (375px) - Small mobile
- iPad (768px) - Tablet
- Desktop (1280px+) - Desktop
