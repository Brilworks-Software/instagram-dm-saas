'use client';

import { GenericToolForm } from './generic-tool-form';
import { CheckCircle } from 'lucide-react';

export function UsernameChecker() {
  const fields = [
    {
      id: 'username',
      label: 'Username',
      placeholder: 'Enter username to check availability',
      required: true,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="username-checker"
      toolName="Instagram Username Checker"
      fields={fields}
      usageCount={4523}
      heroGradient="from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20"
      heroBorder="border-amber-200 dark:border-amber-800"
      heroIcon={<CheckCircle className="h-8 w-8 text-amber-500" />}
      heroDescription="Check username availability and brainstorm handle ideas."
      seoKeywords={[
        'instagram username checker',
        'check username availability',
        'instagram handle checker',
        'username available instagram',
        'instagram name checker',
        'check if username is taken',
        'instagram username generator',
        'find instagram username',
        'username availability checker',
        'instagram handle ideas'
      ]}
      seoTitle="Free Instagram Username Checker | Check Handle Availability"
      seoDescription="Check Instagram username availability instantly. Find out if your desired handle is available and get creative username ideas. Free checker tool."
    />
  );
}
