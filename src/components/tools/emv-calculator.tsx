'use client';

import { GenericToolForm } from './generic-tool-form';
import { Info } from 'lucide-react';

export function EMVCalculator() {
  const fields = [
    {
      id: 'instagram-handle',
      label: 'Instagram Handle',
      placeholder: 'Enter your Instagram handle',
      required: true,
    },
    {
      id: 'follower-count',
      label: 'Follower Count',
      placeholder: 'e.g., 10k, 50k, 1.5m',
      type: 'text' as const,
      required: true,
    },
    {
      id: 'engagement-rate',
      label: 'Engagement Rate (%)',
      placeholder: 'e.g., 3.5',
      type: 'number' as const,
      required: true,
    },
  ];

  return (
    <>
      {/* Engagement Rate Calculation Guide */}
      <div className="mb-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How to Calculate Your Engagement Rate
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p className="font-medium">Formula:</p>
              <div className="bg-white dark:bg-blue-900/30 p-3 rounded-lg font-mono text-xs">
                Engagement Rate = ((Total Likes + Total Comments) / Total Posts) / Followers × 100
              </div>
              
              <p className="font-medium mt-3">Step-by-step:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Take your last 10-12 posts</li>
                <li>Add up all the likes from those posts</li>
                <li>Add up all the comments from those posts</li>
                <li>Divide the total by the number of posts (e.g., 10)</li>
                <li>Divide that number by your follower count</li>
                <li>Multiply by 100 to get the percentage</li>
              </ol>
              
              <p className="font-medium mt-3">Example:</p>
              <div className="bg-white dark:bg-blue-900/30 p-3 rounded-lg text-xs space-y-1">
                <p>• Total Likes (10 posts): 5,000</p>
                <p>• Total Comments (10 posts): 500</p>
                <p>• Average per post: (5,000 + 500) / 10 = 550</p>
                <p>• Followers: 10,000</p>
                <p>• Engagement Rate: (550 / 10,000) × 100 = <span className="font-bold text-blue-600 dark:text-blue-400">5.5%</span></p>
              </div>
              
              <p className="mt-3">
                <span className="font-medium">Benchmark:</span> Good engagement rates are 1-3% (average), 3-6% (good), 6%+ (excellent)
              </p>
            </div>
          </div>
        </div>
      </div>

      <GenericToolForm
        toolSlug="emv-calculator"
        toolName="Instagram Earned Media Value (EMV) Calculator"
        heroTitle="Instagram Earned Media Value (EMV) Calculator"
        heroDescription="Estimate the earned media value for creators or campaigns. Understand your content's worth in monetary terms."
        heroGradient="from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20"
        heroBorder="border-green-200 dark:border-green-800"
        fields={fields}
        usageCount={1654}
        seoKeywords={[
          'earned media value calculator',
          'emv calculator',
          'instagram emv',
          'social media value calculator',
          'influencer worth calculator',
          'instagram roi calculator',
          'media value estimation',
          'instagram campaign value',
          'influencer marketing calculator',
          'content value calculator'
        ]}
        seoTitle="Free Instagram EMV Calculator | Calculate Earned Media Value"
        seoDescription="Calculate your Instagram Earned Media Value (EMV) instantly. Free tool to estimate content worth and ROI for influencer campaigns. Get accurate EMV metrics."
      />
    </>
  );
}
