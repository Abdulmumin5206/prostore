import React from 'react';
import Typography from './Typography';
import { 
  H1, H2, H3, H4, H5, Text, Display, Label, Caption, Link,
  AppleHeadline, AppleSubheadline, AppleProductTitle, AppleProductSubtitle, AppleProductDescription,
  AppleCaption, ApplePrice, AppleLink
} from './Typography';

const TypographyGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <H1 className="mb-8">Typography System Guide</H1>
      
      <section className="mb-12">
        <H2 className="mb-4">Standard Heading Components</H2>
        <div className="space-y-4 border p-4 rounded-lg">
          <H1>Heading 1 (H1)</H1>
          <H2>Heading 2 (H2)</H2>
          <H3>Heading 3 (H3)</H3>
          <H4>Heading 4 (H4)</H4>
          <H5>Heading 5 (H5)</H5>
        </div>
        
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text size="sm" className="mb-2">Usage example:</Text>
          <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
            {`import { H1 } from '../components/Typography';
            
<H1>Page Title</H1>
<H1 weight="bold" color="accent" align="center">Custom Heading</H1>`}
          </pre>
        </div>
      </section>
      
      <section className="mb-12">
        <H2 className="mb-4">Text Component</H2>
        <div className="space-y-4 border p-4 rounded-lg">
          <Text size="xs">Text Extra Small (xs)</Text>
          <Text size="sm">Text Small (sm)</Text>
          <Text size="base">Text Base (base - default)</Text>
          <Text size="lg">Text Large (lg)</Text>
          <Text size="xl">Text Extra Large (xl)</Text>
          <Text size="2xl">Text 2XL (2xl)</Text>
        </div>
        
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text size="sm" className="mb-2">Usage example:</Text>
          <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
            {`import { Text } from '../components/Typography';
            
<Text>Default text</Text>
<Text size="lg" weight="medium" color="secondary">Custom text</Text>`}
          </pre>
        </div>
      </section>
      
      <section className="mb-12">
        <H2 className="mb-4">Display Text</H2>
        <div className="space-y-4 border p-4 rounded-lg">
          <Display size="1">Display 1</Display>
          <Display size="2">Display 2</Display>
        </div>
        
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text size="sm" className="mb-2">Usage example:</Text>
          <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
            {`import { Display } from '../components/Typography';
            
<Display size="1">Hero Title</Display>`}
          </pre>
        </div>
      </section>
      
      <section className="mb-12">
        <H2 className="mb-4">Label & Caption</H2>
        <div className="space-y-4 border p-4 rounded-lg">
          <Label>Default Label</Label>
          <Label size="xs">Extra Small Label</Label>
          <Caption>Caption Text</Caption>
        </div>
        
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text size="sm" className="mb-2">Usage example:</Text>
          <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
            {`import { Label, Caption } from '../components/Typography';
            
<Label htmlFor="email">Email Address</Label>
<Caption>Last updated: 2 hours ago</Caption>`}
          </pre>
        </div>
      </section>
      
      <section className="mb-12">
        <H2 className="mb-4">Link Component</H2>
        <div className="space-y-4 border p-4 rounded-lg">
          <Link href="#">Default Link</Link>
          <div>
            <Text>Text with <Link href="#">embedded link</Link> inside it.</Text>
          </div>
          <Link href="#" size="lg" underline={false}>Large Link without underline</Link>
        </div>
        
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text size="sm" className="mb-2">Usage example:</Text>
          <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
            {`import { Link } from '../components/Typography';
            
<Link href="/about">About Us</Link>
<Link href="/contact" underline={false} weight="medium">Contact</Link>`}
          </pre>
        </div>
      </section>
      
      <section className="mb-12">
        <H2 className="mb-4">Apple-Specific Typography</H2>
        <div className="space-y-4 border p-4 rounded-lg">
          <AppleHeadline>Apple Headline</AppleHeadline>
          <AppleSubheadline>Apple Subheadline</AppleSubheadline>
          <AppleProductTitle>Product Title</AppleProductTitle>
          <AppleProductSubtitle>Product Subtitle</AppleProductSubtitle>
          <AppleProductDescription>
            This is a product description that explains the features and benefits of the product in detail.
            It can span multiple lines and provides important information to the customer.
          </AppleProductDescription>
          <div className="flex items-center gap-2">
            <ApplePrice>$999</ApplePrice>
            <AppleCaption>Starting price</AppleCaption>
          </div>
          <AppleLink href="#">Learn more</AppleLink>
        </div>
        
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text size="sm" className="mb-2">Usage example:</Text>
          <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
            {`import { 
  AppleHeadline, 
  AppleProductTitle, 
  AppleProductDescription, 
  ApplePrice 
} from '../components/Typography';
            
<AppleHeadline>MacBook Pro</AppleHeadline>
<AppleProductTitle>MacBook Pro 14"</AppleProductTitle>
<AppleProductDescription>Supercharged for pros.</AppleProductDescription>
<ApplePrice>$1,999</ApplePrice>`}
          </pre>
        </div>
      </section>
      
      <section className="mb-12">
        <H2 className="mb-4">Typography Customization</H2>
        <div className="space-y-4 border p-4 rounded-lg">
          <H3 color="accent" weight="bold">Custom Colored Heading</H3>
          <Text color="error">Error message text</Text>
          <Text color="success">Success message text</Text>
          <Text color="warning">Warning message text</Text>
          <Text align="center">Centered text</Text>
          <Text transform="uppercase">Uppercase text</Text>
          <Text italic>Italic text</Text>
          <Text underline>Underlined text</Text>
          <div className="max-w-xs">
            <Text truncate>This is a very long text that will be truncated when it reaches the end of its container</Text>
          </div>
        </div>
        
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text size="sm" className="mb-2">Available customization props:</Text>
          <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
            {`// All typography components accept these props:
weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
color: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'error' | 'success' | 'warning' | 'inherit'
align: 'left' | 'center' | 'right' | 'justify'
transform: 'uppercase' | 'lowercase' | 'capitalize' | 'normal'
truncate: boolean
italic: boolean
underline: boolean
className: string // For additional custom classes`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default TypographyGuide; 