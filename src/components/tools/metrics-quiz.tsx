'use client';

import { GenericToolForm } from './generic-tool-form';

export function MetricsQuiz() {
  const fields = [
    {
      id: 'full-name',
      label: 'Your Name',
      placeholder: 'Enter your name',
      required: true,
    },
    {
      id: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      type: 'email',
      required: true,
    },
    {
      id: 'instagram-handle',
      label: 'Instagram Handle (Optional)',
      placeholder: 'Enter your Instagram handle',
      required: false,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="metrics-quiz"
      toolName="Instagram Metrics Knowledge Quiz"
      fields={fields}
      usageCount={1432}
      heroConfig={{
        title: 'Instagram Metrics Knowledge Quiz',
        description: 'Test your understanding of Instagram metrics and best practices.',
        gradient: 'from-emerald-50 via-green-50 to-lime-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-lime-950/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
      }}
      seoKeywords={[
        'instagram metrics quiz',
        'instagram knowledge test',
        'social media metrics quiz',
        'instagram analytics quiz',
        'instagram learning quiz',
        'test instagram knowledge',
        'instagram marketing quiz',
        'instagram best practices',
        'instagram education',
        'learn instagram metrics'
      ]}
      seoTitle="Instagram Metrics Knowledge Quiz | Test Your Instagram Skills"
      seoDescription="Test your Instagram metrics knowledge with our free quiz. Learn best practices, analytics, and strategies to improve your Instagram performance."
    />
  );
}
