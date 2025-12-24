'use client';

import { GenericToolForm } from './generic-tool-form';

export function FancyFontsGenerator() {
  const fields = [
    {
      id: 'text',
      label: 'Text to Convert',
      placeholder: 'Enter text for fancy fonts',
      required: true,
    },
    {
      id: 'style',
      label: 'Font Style Preference',
      placeholder: 'e.g., Bold, Italic, Cursive, Outlined',
      required: false,
    },
  ];

  return (
    <GenericToolForm
      toolSlug="fancy-fonts-generator"
      toolName="Instagram Fancy Fonts Generator"
      heroTitle="Instagram Fancy Fonts Generator"
      heroDescription="Generate copy-paste fancy fonts for your bio and captions. Stand out with unique text styles."
      heroGradient="from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20"
      heroBorder="border-amber-200 dark:border-amber-800"
      fields={fields}
      usageCount={6543}
      seoKeywords={[
        'fancy fonts generator',
        'instagram fonts',
        'cool fonts for instagram',
        'instagram bio fonts',
        'fancy text generator',
        'instagram font changer',
        'stylish fonts instagram',
        'copy paste fonts',
        'instagram text styles',
        'aesthetic fonts instagram'
      ]}
      seoTitle="Free Instagram Fancy Fonts Generator | Cool Fonts for Bio & Captions"
      seoDescription="Generate fancy fonts for Instagram bio and captions. Copy and paste stylish text, cool fonts, and unique characters. Free font generator tool."
    />
  );
}
