'use client';

import { TrendingUp, Users, Target, Zap } from 'lucide-react';

const stats = [
  {
    label: "Average Open Rate",
    value: "92%",
    description: "Compare to 20% for email",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500"
  },
  {
    label: "Lead Conversion",
    value: "3.5x",
    description: "Increase in qualified leads",
    icon: Target,
    color: "from-blue-500 to-indigo-500"
  },
  {
    label: "Time Saved",
    value: "20hrs",
    description: "Per week on average",
    icon: Zap,
    color: "from-orange-500 to-red-500"
  },
  {
    label: "ROI Reported",
    value: "12x",
    description: "Average return on spend",
    icon: Users,
    color: "from-purple-500 to-pink-500"
  }
];

export function ResultsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[120px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Proven Results for <span className="bg-gradient-to-r from-accent to-pink-500 bg-clip-text text-transparent">Scale</span>
          </h2>
          <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
            Our users aren't just sending messages; they're building empires. Join the top 1% of Instagram marketers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="group relative p-8 rounded-[2rem] bg-background-elevated/40 border border-border hover:border-accent/40 transition-all duration-500 backdrop-blur-sm overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
              
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              
              <div className="text-4xl font-bold text-foreground mb-2 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all">
                {stat.value}
              </div>
              
              <div className="text-lg font-semibold text-foreground mb-1">
                {stat.label}
              </div>
              
              <div className="text-sm text-foreground-muted">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
