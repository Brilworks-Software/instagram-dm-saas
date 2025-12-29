'use client';

import { Instagram, Sparkles, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: "01",
    title: "Connect Your Account",
    description: "Securely link your Instagram account in seconds with our direct login. No manual setup required.",
    icon: Instagram,
    color: "from-accent to-pink-500",
    detail: "One-click secure connection",
    features: ["OAuth integration", "Multi-account support", "Secure & encrypted"]
  },
  {
    number: "02",
    title: "Set Up AI Assistant",
    description: "Configure your AI preferences, response templates, and automation rules. Customize your brand voice.",
    icon: Sparkles,
    color: "from-pink-500 to-purple-500",
    detail: "AI-powered personalization",
    features: ["Brand voice training", "Smart responses", "Auto-reply rules"]
  },
  {
    number: "03",
    title: "Start Engaging",
    description: "Launch campaigns and watch your engagement grow. Let AI handle responses or manage conversations manually.",
    icon: Rocket,
    color: "from-purple-500 to-indigo-500",
    detail: "Real-time analytics",
    features: ["Campaign tracking", "Lead generation", "Performance insights"]
  },
];

export function TimelineSteps({ onCtaClick }: { onCtaClick: () => void }) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background-secondary">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-elevated border border-accent/30 mb-6">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-accent font-semibold tracking-wider uppercase text-xs sm:text-sm">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            From Zero to Automation
            <br />
            <span className="bg-gradient-to-r from-accent via-pink-500 to-purple-500 bg-clip-text text-transparent">in Minutes</span>
          </h2>
          <p className="text-base sm:text-lg text-foreground-muted max-w-2xl mx-auto mt-4">
            Get started in 3 simple steps. No technical skills required.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 w-full h-0.5 bg-gradient-to-r from-border via-border to-border z-0">
            <div 
              className="h-full bg-gradient-to-r from-accent via-pink-500 to-purple-500 transition-all duration-700 ease-in-out shadow-lg shadow-accent/30"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="group relative flex flex-col"
                onMouseEnter={() => setActiveStep(index)}
              >
                {/* Step Number Badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 shadow-xl",
                    index <= activeStep 
                      ? `bg-gradient-to-br ${step.color} text-white` 
                      : "bg-background-elevated border-2 border-border text-foreground-muted"
                  )}>
                    <step.icon className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10",
                      index <= activeStep ? "text-white" : "text-foreground-muted"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-3 py-1.5 bg-background-elevated rounded-full text-xs font-semibold text-foreground-muted border border-border mb-2">
                      {step.number}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">{step.title}</h3>
                  </div>
                </div>

                {/* Content Card */}
                <div className={cn(
                  "p-6 sm:p-8 rounded-2xl border transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1",
                  index <= activeStep
                    ? "bg-background-elevated border-accent/40 shadow-lg shadow-accent/10"
                    : "bg-background-elevated/50 border-border group-hover:border-accent/30"
                )}>
                  <p className="text-foreground-muted leading-relaxed mb-6 text-sm sm:text-base">
                    {step.description}
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-2">
                    {step.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-2 text-sm text-foreground-muted">
                        <CheckCircle2 className={cn(
                          "h-4 w-4 flex-shrink-0 transition-colors",
                          index <= activeStep ? "text-accent" : "text-foreground-subtle"
                        )} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Detail Badge */}
                  <div className={cn(
                    "mt-6 inline-block px-4 py-2 rounded-full text-xs font-semibold transition-all",
                    index <= activeStep
                      ? "bg-gradient-to-r from-accent/20 to-pink-500/20 text-accent border border-accent/30"
                      : "bg-background border border-border text-foreground-muted opacity-0 group-hover:opacity-100"
                  )}>
                    {step.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 sm:mt-20 text-center">
          <Button
            size="lg"
            onClick={onCtaClick}
            className="group bg-gradient-to-r from-accent via-pink-600 to-purple-600 hover:from-accent/90 hover:via-pink-500 hover:to-purple-500 text-white font-semibold px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg shadow-2xl shadow-accent/40 hover:shadow-accent/60 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Start Automating Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          <p className="text-sm text-foreground-muted mt-4">
            Free forever plan • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
