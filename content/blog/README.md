# Blog Content Directory

This directory contains all blog posts in Markdown/MDX format.

## File Structure

- Each blog post should be a `.md` or `.mdx` file
- The filename (without extension) becomes the URL slug
- Example: `how-to-do-instagram-outreach.mdx` → `/blog/how-to-do-instagram-outreach`

## Frontmatter Format

Each blog post must start with YAML frontmatter:

```yaml
---
title: "Your Blog Post Title"
description: "A compelling description for SEO and previews"
date: "2025-01-20"
readTime: "12 min"
category: "Instagram Outreach"
keywords:
  - "keyword1"
  - "keyword2"
  - "keyword3"
author: "Dhaval Trivedi"
authorRole: "COO, SocialOra"
metaTitle: "SEO Optimized Title | SocialOra"
metaDescription: "SEO optimized description"
featured: true
pillar: false
clusterOf: "how-to-do-instagram-outreach-that-actually-gets-replies"
funnelStage: "mofu"
relatedPosts:
  - "slug-of-related-post-1"
  - "slug-of-related-post-2"
faqs:
  - question: "What is this about?"
    answer: "This is a detailed answer to the question."
  - question: "How does it work?"
    answer: "Here's how it works in detail."
citations:
  - title: "Research Paper Title"
    url: "https://example.com/research"
    source: "Source Name"
    date: "2024"
    description: "Optional description"
---
```

## Required Fields

- `title`: Blog post title
- `description`: Meta description
- `date`: Publication date (YYYY-MM-DD)
- `readTime`: Estimated reading time
- `category`: Post category
- `keywords`: Array of SEO keywords

## Optional Fields

- `author`: Author name (defaults to "Dhaval Trivedi")
- `authorRole`: Author role (defaults to "COO, SocialOra")
- `metaTitle`: Custom SEO title
- `metaDescription`: Custom SEO description
- `featured`: Boolean for featured posts
- `pillar`: Boolean for pillar posts
- `clusterOf`: Slug of pillar post if this is a cluster
- `funnelStage`: "tofu", "mofu", or "bofu"
- `relatedPosts`: Array of related post slugs
- `faqs`: Array of FAQ objects
- `citations`: Array of citation objects

## Markdown Content

After the frontmatter, write your content in Markdown or MDX:

- Use `#` for H1 (main heading)
- Use `##` for H2 (section headings)
- Use `###` for H3 (subsections)
- Use `-` for bullet lists
- Use `1.` for numbered lists
- Use `>` for blockquotes
- Use `[text](url)` for links
- Use `![alt](url)` for images

## MDX Features

You can use React components in `.mdx` files:

```mdx
<FAQSection faqs={[
  { question: "Custom FAQ?", answer: "Yes!" }
]} />
```

## Best Practices

1. **SEO**: Use descriptive titles and descriptions
2. **Headings**: Use proper H1, H2, H3 hierarchy
3. **Internal Links**: Link to related posts using `/blog/slug`
4. **Images**: Place images in `/public/images/blog/`
5. **Keywords**: Include 5-10 relevant keywords
6. **Read Time**: Calculate based on ~200 words per minute

## Adding a New Post

1. Create a new `.md` or `.mdx` file in this directory
2. Add frontmatter with all required fields
3. Write your content in Markdown
4. The post will automatically appear on `/blog` and be available at `/blog/your-slug`

