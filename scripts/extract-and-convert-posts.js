const fs = require('fs');
const path = require('path');

// Read the blog-posts.ts file
const blogPostsFile = path.join(process.cwd(), 'src/lib/blog-posts.ts');
const content = fs.readFileSync(blogPostsFile, 'utf8');

// Simple HTML to Markdown converter
function htmlToMarkdown(html) {
  if (!html) return '';
  
  let markdown = html
    // Remove script and style tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Headings
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    // Links
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Bold
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // Italic
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // Blockquotes
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    // Lists
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br[^>]*>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();

  return markdown;
}

// Extract posts from the TypeScript file using regex
function extractPosts(content) {
  const posts = [];
  const postRegex = /{\s*slug:\s*'([^']+)',[\s\S]*?content:\s*`([\s\S]*?)`\s*,?\s*}/g;
  
  let match;
  while ((match = postRegex.exec(content)) !== null) {
    const slug = match[1];
    const postContent = match[0];
    
    // Extract fields using regex
    const titleMatch = postContent.match(/title:\s*["']([^"']+)["']/);
    const descMatch = postContent.match(/description:\s*["']([^"']+)["']/);
    const dateMatch = postContent.match(/date:\s*["']([^"']+)["']/);
    const readTimeMatch = postContent.match(/readTime:\s*["']([^"']+)["']/);
    const categoryMatch = postContent.match(/category:\s*["']([^"']+)["']/);
    const metaTitleMatch = postContent.match(/metaTitle:\s*["']([^"']+)["']/);
    const metaDescMatch = postContent.match(/metaDescription:\s*["']([^"']+)["']/);
    const featuredMatch = postContent.match(/featured:\s*(true|false)/);
    const pillarMatch = postContent.match(/pillar:\s*(true|false)/);
    const clusterOfMatch = postContent.match(/clusterOf:\s*["']([^"']+)["']/);
    const funnelStageMatch = postContent.match(/funnelStage:\s*["']([^"']+)["']/);
    
    // Extract keywords array
    const keywordsMatch = postContent.match(/keywords:\s*\[([\s\S]*?)\]/);
    const keywords = keywordsMatch 
      ? keywordsMatch[1].match(/["']([^"']+)["']/g).map(k => k.replace(/["']/g, ''))
      : [];
    
    // Extract FAQs
    const faqsMatch = postContent.match(/faqs:\s*\[([\s\S]*?)\]/);
    const faqs = faqsMatch ? parseFAQs(faqsMatch[1]) : [];
    
    // Extract citations
    const citationsMatch = postContent.match(/citations:\s*\[([\s\S]*?)\]/);
    const citations = citationsMatch ? parseCitations(citationsMatch[1]) : [];
    
    // Extract related posts
    const relatedMatch = postContent.match(/relatedPosts:\s*\[([\s\S]*?)\]/);
    const relatedPosts = relatedMatch 
      ? relatedMatch[1].match(/["']([^"']+)["']/g).map(r => r.replace(/["']/g, ''))
      : [];
    
    const htmlContent = match[2];
    
    posts.push({
      slug,
      title: titleMatch ? titleMatch[1] : '',
      description: descMatch ? descMatch[1] : '',
      date: dateMatch ? dateMatch[1] : '',
      readTime: readTimeMatch ? readTimeMatch[1] : '',
      category: categoryMatch ? categoryMatch[1] : '',
      keywords,
      metaTitle: metaTitleMatch ? metaTitleMatch[1] : '',
      metaDescription: metaDescMatch ? metaDescMatch[1] : '',
      featured: featuredMatch ? featuredMatch[1] === 'true' : false,
      pillar: pillarMatch ? pillarMatch[1] === 'true' : false,
      clusterOf: clusterOfMatch ? clusterOfMatch[1] : undefined,
      funnelStage: funnelStageMatch ? funnelStageMatch[1] : '',
      faqs,
      citations,
      relatedPosts,
      content: htmlToMarkdown(htmlContent),
    });
  }
  
  return posts;
}

function parseFAQs(faqsContent) {
  const faqs = [];
  const faqRegex = /{\s*question:\s*["']([^"']+)["'],\s*answer:\s*["']([^"']+)["']\s*}/g;
  let match;
  while ((match = faqRegex.exec(faqsContent)) !== null) {
    faqs.push({
      question: match[1].replace(/\\'/g, "'"),
      answer: match[2].replace(/\\'/g, "'"),
    });
  }
  return faqs;
}

function parseCitations(citationsContent) {
  const citations = [];
  const citationRegex = /{\s*title:\s*["']([^"']+)["'],\s*url:\s*["']([^"']+)["'],\s*source:\s*["']([^"']+)["'](?:,\s*date:\s*["']([^"']*)["'])?(?:,\s*description:\s*["']([^"']*)["'])?\s*}/g;
  let match;
  while ((match = citationRegex.exec(citationsContent)) !== null) {
    citations.push({
      title: match[1],
      url: match[2],
      source: match[3],
      date: match[4] || '',
      description: match[5] || '',
    });
  }
  return citations;
}

// Function to create markdown file
function createMarkdownFile(post) {
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  // Create frontmatter
  const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
description: "${post.description.replace(/"/g, '\\"')}"
date: "${post.date}"
readTime: "${post.readTime}"
category: "${post.category}"
keywords:
${post.keywords.map(k => `  - "${k.replace(/"/g, '\\"')}"`).join('\n')}
author: "Dhaval Trivedi"
authorRole: "COO, SocialOra"
metaTitle: "${(post.metaTitle || post.title).replace(/"/g, '\\"')}"
metaDescription: "${(post.metaDescription || post.description).replace(/"/g, '\\"')}"
featured: ${post.featured}
pillar: ${post.pillar}
${post.clusterOf ? `clusterOf: "${post.clusterOf}"` : ''}
funnelStage: "${post.funnelStage || 'mofu'}"
${post.relatedPosts && post.relatedPosts.length > 0 ? `relatedPosts:\n${post.relatedPosts.map(rp => `  - "${rp}"`).join('\n')}` : ''}
${post.faqs && post.faqs.length > 0 ? `faqs:\n${post.faqs.map(faq => `  - question: "${faq.question.replace(/"/g, '\\"')}"\n    answer: "${faq.answer.replace(/"/g, '\\"')}"`).join('\n')}` : ''}
${post.citations && post.citations.length > 0 ? `citations:\n${post.citations.map(cit => `  - title: "${cit.title.replace(/"/g, '\\"')}"\n    url: "${cit.url}"\n    source: "${cit.source}"\n    date: "${cit.date || ''}"\n    description: "${(cit.description || '').replace(/"/g, '\\"')}"`).join('\n')}` : ''}
---

`;

  // Combine frontmatter and content
  const fileContent = frontmatter + post.content;

  // Write file
  const filePath = path.join(blogDir, `${post.slug}.mdx`);
  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log(`✅ Created: ${filePath}`);
}

// Run extraction and conversion
console.log('🚀 Extracting and converting blog posts...\n');

try {
  const posts = extractPosts(content);
  console.log(`Found ${posts.length} posts to convert\n`);
  
  posts.forEach(post => {
    // Only convert cluster posts and pillar post
    if (post.pillar || post.clusterOf === 'how-to-do-instagram-outreach-that-actually-gets-replies') {
      createMarkdownFile(post);
    }
  });
  
  console.log(`\n✅ Migration complete!`);
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}

