'use client';

import { Check, Sparkles, Infinity, Zap, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: "Free Forever",
    description: "Start automating your Instagram DMs today",
    price: { monthly: "FREE", yearly: "FREE" },
    badge: "LIMITED TIME",
    badgeColor: "bg-gradient-to-r from-accent via-pink-500 to-purple-500",
    features: [
      "1 Instagram account",
      "40 DMs daily bulk sending",
      "Basic AI response engine",
      "Unified Inbox access",
      "Email support",
      "Free forever - no credit card required"
    ],
    cta: "Claim Free Forever",
    highlight: true,
    isFree: true
  },
  {
    name: "Pro",
    description: "Scale your outreach with advanced features",
    price: { monthly: "Custom", yearly: "Custom" },
    badge: "POPULAR",
    badgeColor: "bg-gradient-to-r from-accent to-pink-500",
    features: [
      "Unlimited automated DMs",
      "Advanced AI with persona training",
      "Lead scoring & qualification",
      "Priority support",
      "Up to 5 Instagram accounts",
      "Analytics Dashboard",
      "Custom features on request"
    ],
    cta: "Get Custom Pricing",
    highlight: false,
    isFree: false
  },
  {
    name: "Enterprise",
    description: "Custom solutions for large scale operations",
    price: { monthly: "Custom", yearly: "Custom" },
    badge: "ENTERPRISE",
    badgeColor: "bg-gradient-to-r from-purple-500 to-indigo-500",
    features: [
      "Multi-user collaboration",
      "API access",
      "Custom AI model training",
      "Dedicated account manager",
      "Unlimited accounts",
      "SLA guarantee",
      "White-glove setup & support"
    ],
    cta: "Talk to Sales Team",
    highlight: false,
    isFree: false
  }
];

export function PricingSection({ onJoinWaitlist }: { onJoinWaitlist: () => void }) {

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16 px-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/15 via-pink-500/15 to-purple-500/15 border border-accent/30 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 mb-6 shadow-md shadow-accent/5 backdrop-blur-sm">
            <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            <span className="text-xs sm:text-sm font-semibold text-accent">Limited Time: Claim Your Free Forever Plan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Start <span className="bg-gradient-to-r from-accent to-pink-500 bg-clip-text text-transparent">Free Forever</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-foreground-muted mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed">
            Get 1 Instagram account + 40 DMs daily bulk sending - completely free for life. No credit card required.
          </p>
          <p className="text-sm sm:text-base text-foreground-muted/70 max-w-xl mx-auto">
            Need more? Connect with our support team for custom pricing on unlimited DMs, multiple accounts, and advanced features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-background-secondary rounded-3xl p-8 sm:p-10 border transition-all duration-300 hover:scale-[1.02] flex flex-col ${
                plan.highlight 
                  ? plan.isFree
                    ? 'border-accent/60 shadow-2xl shadow-accent/30 scale-[1.02] ring-2 ring-accent/20' 
                    : 'border-accent shadow-2xl shadow-accent/20 scale-[1.02]'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg`}>
                  {plan.isFree ? <Infinity className="h-3 w-3" /> : plan.highlight ? <Sparkles className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                  {plan.badge}
                </div>
              )}

              <div className="mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-foreground-muted text-sm sm:text-base">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  {plan.isFree ? (
                    <>
                      <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-accent via-pink-500 to-purple-500 bg-clip-text text-transparent">
                        FREE
                      </span>
                      <span className="text-foreground-muted text-base sm:text-lg ml-2">Forever</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price.monthly}
                      </span>
                      {plan.price.monthly !== 'Custom' && (
                        <span className="text-foreground-muted">/month</span>
                      )}
                    </>
                  )}
                </div>
                {plan.isFree && (
                  <p className="text-accent text-sm font-semibold mt-2 flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-accent" />
                    No credit card required
                  </p>
                )}
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3 text-foreground-muted text-sm sm:text-base">
                    <Check className={`h-5 w-5 flex-shrink-0 text-accent`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlight ? 'primary' : 'secondary'}
                className={`w-full py-5 sm:py-6 text-base sm:text-lg font-semibold rounded-2xl transition-all group mt-auto ${
                  plan.isFree
                    ? 'bg-gradient-to-r from-accent via-pink-600 to-purple-600 hover:from-accent/90 hover:via-pink-500 hover:to-purple-500 text-white shadow-xl shadow-accent/40 hover:shadow-accent/60 hover:scale-105'
                    : plan.highlight 
                    ? 'bg-gradient-to-r from-accent to-pink-600 hover:from-accent/90 hover:to-pink-500 text-white shadow-lg shadow-accent/30' 
                    : 'bg-background hover:bg-background-elevated border-2 border-border hover:border-accent/50'
                }`}
                onClick={onJoinWaitlist}
              >
                <span className="flex items-center justify-center gap-2">
                  {plan.cta}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
