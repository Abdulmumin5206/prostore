# Typography System Documentation

This document outlines the standardized typography system used across the ProStore application. The system is designed to ensure consistency, accessibility, and scalability across all pages and components.

## Overview

The typography system is built using React components with Tailwind CSS. It provides a set of pre-styled components that handle text styling consistently throughout the application.

You can view a live demo of all typography components at: `/typography` route in the application.

## Core Components

### Heading Components

```tsx
import { H1, H2, H3, H4, H5 } from '../components/Typography';

<H1>Page Title</H1>
<H2>Section Title</H2>
<H3>Subsection Title</H3>
<H4>Minor Section Title</H4>
<H5>Small Heading</H5>
```

### Text Component

```tsx
import { Text } from '../components/Typography';

<Text>Default text with base size</Text>
<Text size="sm">Small text</Text>
<Text size="lg">Large text</Text>
```

Available sizes: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`

### Display Component

For large, impactful text like hero headlines:

```tsx
import { Display } from '../components/Typography';

<Display size="1">Hero Title</Display>
<Display size="2">Secondary Hero Title</Display>
```

### Label Component

For form labels and other small identifying text:

```tsx
import { Label } from '../components/Typography';

<Label htmlFor="email">Email Address</Label>
<Label size="xs">Small Label</Label>
```

### Caption Component

For auxiliary information, timestamps, etc.:

```tsx
import { Caption } from '../components/Typography';

<Caption>Last updated: 2 hours ago</Caption>
```

### Link Component

For hyperlinks:

```tsx
import { Link } from '../components/Typography';

<Link href="/about">About Us</Link>
<Link href="/contact" underline={false}>Contact</Link>
```

## Apple-Specific Components

For maintaining Apple-like design patterns:

```tsx
import { 
  AppleHeadline, 
  AppleSubheadline,
  AppleProductTitle,
  AppleProductSubtitle,
  AppleProductDescription,
  AppleCaption,
  ApplePrice,
  AppleLink
} from '../components/Typography';

<AppleHeadline>MacBook Pro</AppleHeadline>
<AppleSubheadline>Supercharged for pros.</AppleSubheadline>
<AppleProductTitle>MacBook Pro 14"</AppleProductTitle>
<AppleProductSubtitle>Power. Unleashed.</AppleProductSubtitle>
<AppleProductDescription>
  The most powerful MacBook Pro ever is here. With the blazing-fast M1 Pro or M1 Max chip — the first Apple silicon designed for pros — you get groundbreaking performance and amazing battery life.
</AppleProductDescription>
<ApplePrice>$1,999</ApplePrice>
<AppleCaption>Starting price</AppleCaption>
<AppleLink href="#">Learn more</AppleLink>
```

## Customization Props

All typography components accept the following props for customization:

| Prop | Type | Description |
|------|------|-------------|
| `weight` | `'light' \| 'normal' \| 'medium' \| 'semibold' \| 'bold'` | Font weight |
| `color` | `'primary' \| 'secondary' \| 'tertiary' \| 'accent' \| 'error' \| 'success' \| 'warning' \| 'inherit'` | Text color |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | Text alignment |
| `transform` | `'uppercase' \| 'lowercase' \| 'capitalize' \| 'normal'` | Text transformation |
| `truncate` | `boolean` | Whether to truncate text with ellipsis |
| `italic` | `boolean` | Whether to italicize text |
| `underline` | `boolean` | Whether to underline text |
| `className` | `string` | Additional CSS classes |

Example usage:

```tsx
<H2 
  weight="bold" 
  color="accent" 
  align="center"
  transform="uppercase"
>
  Featured Products
</H2>

<Text 
  color="error" 
  weight="medium"
>
  This field is required
</Text>

<Text truncate>
  This is a very long text that will be truncated when it reaches the end of its container
</Text>
```

## Color System

The typography system uses the following semantic color tokens:

- `primary`: Main text color (dark in light mode, white in dark mode)
- `secondary`: Secondary text color (medium gray in light mode, light gray in dark mode)
- `tertiary`: Tertiary text color (lighter gray in both modes)
- `accent`: Accent color for emphasis (blue in both modes)
- `error`: Error messages (red in both modes)
- `success`: Success messages (green in both modes)
- `warning`: Warning messages (amber in both modes)
- `inherit`: Inherit color from parent element

## Best Practices

1. **Use semantic components**: Choose the component that best represents the meaning of your text, not just its appearance.

2. **Maintain hierarchy**: Use heading levels (H1-H5) in order and don't skip levels for proper document outline.

3. **Limit customization**: Try to use the default styles when possible. Only customize when necessary to maintain consistency.

4. **Responsive considerations**: The typography components are already responsive. Heading sizes automatically adjust for mobile devices.

5. **Accessibility**: The system is designed with accessibility in mind. Maintain sufficient color contrast and don't rely solely on color to convey meaning.

6. **Dark mode compatibility**: All components automatically adjust for dark mode.

## Implementation Details

The typography system is implemented in `src/components/Typography.tsx`. It uses Tailwind CSS for styling and React for component structure.

The system leverages Tailwind's utility classes for styling, making it easy to maintain and extend.

## Extending the System

If you need to add new typography components or styles:

1. Add them to the `Typography.tsx` file
2. Follow the existing pattern of using helper functions for styling
3. Export the new component both individually and in the default export object
4. Update this documentation and the TypographyGuide component 