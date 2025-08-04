# Spacing System Documentation

## Overview

This document outlines our standardized spacing system designed to ensure consistent UI spacing throughout the application. The system is built on top of Tailwind CSS and provides reusable components and utility classes.

## Spacing Scale

Our spacing system is built on a consistent scale:

| Token | Size | Description |
|-------|------|-------------|
| `section-y` | 2.5rem (40px) | Standard vertical padding for sections |
| `section-y-sm` | 2rem (32px) | Smaller vertical padding for sections |
| `section-y-lg` | 3rem (48px) | Larger vertical padding for sections |
| `section-x` | 1rem (16px) | Standard horizontal padding for sections |
| `content-y` | 1.5rem (24px) | Vertical spacing between content blocks |
| `content-y-sm` | 1rem (16px) | Smaller vertical spacing between content blocks |
| `content-y-lg` | 2rem (32px) | Larger vertical spacing between content blocks |
| `element-y` | 0.75rem (12px) | Vertical spacing between elements |
| `element-y-sm` | 0.375rem (6px) | Smaller vertical spacing between elements |
| `element-y-lg` | 1rem (16px) | Larger vertical spacing between elements |

## Components

### Section Component

The `Section` component provides consistent outer container spacing and background colors.

```jsx
<Section 
  size="md"               // 'sm' | 'md' | 'lg'
  background="light"      // 'white' | 'light' | 'dark' | 'black'
  containerWidth="xl"     // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className="custom-class"
>
  {/* Section content */}
</Section>
```

### ContentBlock Component

The `ContentBlock` component provides consistent spacing between content blocks within a section.

```jsx
<ContentBlock 
  spacing="md"            // 'sm' | 'md' | 'lg' | 'none'
  className="custom-class"
>
  {/* Content */}
</ContentBlock>
```

### Spacing Component

The `Spacing` component adds vertical space between elements.

```jsx
<Spacing size="md" />    // 'sm' | 'md' | 'lg'
```

## Usage Guidelines

1. **Sections**: Use the `Section` component for all major page sections
2. **Content Blocks**: Use the `ContentBlock` component for grouping related content within sections
3. **Element Spacing**: Use the `Spacing` component or utility classes for spacing between individual elements

## Best Practices

1. Maintain consistent spacing between similar UI elements across the application
2. Use the provided components rather than custom spacing values
3. For special cases, extend the system rather than creating one-off solutions
4. Use the appropriate size variant based on the visual hierarchy of the content

## Examples

### Page Structure Example

```jsx
<Section size="md" background="light">
  <ContentBlock spacing="lg">
    <AppleHeadline>Main Heading</AppleHeadline>
    <AppleSubheadline>Subheading text</AppleSubheadline>
  </ContentBlock>
  
  <ContentBlock spacing="md">
    {/* Main content */}
  </ContentBlock>
  
  <ContentBlock spacing="none">
    {/* Footer content with no bottom margin */}
  </ContentBlock>
</Section>
```

### Element Spacing Example

```jsx
<div>
  <h3>Element Title</h3>
  <Spacing size="sm" />
  <p>Element description text</p>
  <Spacing />
  <Button>Action</Button>
</div>
``` 