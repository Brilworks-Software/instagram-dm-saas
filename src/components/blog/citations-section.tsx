interface Citation {
  title: string;
  url: string;
  source: string;
  date?: string;
  description?: string;
}

interface CitationsSectionProps {
  citations: Citation[];
  title?: string;
}

export function CitationsSection({ citations, title = 'References & Citations' }: CitationsSectionProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <section className="blog-citations-section my-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>
      <div className="space-y-3">
        {citations.map((citation, index) => (
          <div key={index} className="text-sm text-foreground-muted">
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 decoration-pink-400/50 hover:decoration-pink-300 transition-colors duration-200"
            >
              {citation.title}
            </a>
            {citation.source && (
              <span className="ml-2">
                - {citation.source}
                {citation.date && ` (${citation.date})`}
              </span>
            )}
            {citation.description && (
              <p className="mt-1 text-xs opacity-80">{citation.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

