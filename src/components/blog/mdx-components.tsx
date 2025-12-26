import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';
import { FAQSection } from './faq-section';
import { CitationsSection } from './citations-section';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override default HTML elements
    h1: ({ children, ...props }) => (
      <h1 className="text-4xl font-bold mb-6 mt-8 text-foreground" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-3xl font-bold mb-4 mt-8 text-foreground" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-2xl font-semibold mb-3 mt-6 text-foreground" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="text-xl font-semibold mb-2 mt-4 text-foreground" {...props}>
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p className="mb-4 leading-relaxed text-foreground-muted" {...props}>
        {children}
      </p>
    ),
    a: ({ href, children, ...props }: any) => {
      const isExternal = href?.startsWith('http');
      const isInternal = href?.startsWith('/');
      
      if (isInternal) {
        return (
          <Link
            href={href || '#'}
            className="text-pink-400 hover:text-pink-300 decoration-pink-400/50 hover:decoration-pink-300 transition-colors duration-200"
            {...props}
          >
            {children}
          </Link>
        );
      }
      
      return (
        <a
          href={href}
          className="text-pink-400 hover:text-pink-300 decoration-pink-400/50 hover:decoration-pink-300 transition-colors duration-200"
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },
    ul: ({ children, ...props }) => (
      <ul className="mb-4 ml-6 list-disc space-y-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="mb-1" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-accent pl-4 italic my-4 text-foreground-muted bg-background-elevated py-2 rounded-r"
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ children, className, ...props }: any) => {
      const isInline = !className;
      return isInline ? (
        <code
          className="bg-background-elevated px-2 py-1 rounded text-sm font-mono text-accent"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre
        className="bg-background-elevated p-4 rounded-lg overflow-x-auto mb-4 border border-border"
        {...props}
      >
        {children}
      </pre>
    ),
    img: ({ src, alt, ...props }: any) => (
      <Image
        src={src || ''}
        alt={alt || ''}
        width={800}
        height={400}
        className="rounded-lg my-4 w-full h-auto"
        {...props}
      />
    ),
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-border" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th className="border border-border px-4 py-2 bg-background-elevated font-semibold text-left" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="border border-border px-4 py-2" {...props}>
        {children}
      </td>
    ),
    // Custom components
    FAQSection,
    CitationsSection,
    ...components,
  };
}

