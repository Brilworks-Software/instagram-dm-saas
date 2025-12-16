'use client';

import { CreditCard, Download, Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 29,
    features: ['1 Instagram account', '1,000 DMs/month', 'Basic analytics', 'Email support'],
    current: false,
  },
  {
    name: 'Pro',
    price: 79,
    features: ['5 Instagram accounts', '10,000 DMs/month', 'Advanced analytics', 'Priority support', 'AI automations'],
    current: true,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 199,
    features: ['Unlimited accounts', 'Unlimited DMs', 'Custom integrations', 'Dedicated support', 'API access'],
    current: false,
  },
];

const invoices = [
  { date: 'Dec 1, 2024', amount: '$79.00', status: 'Paid' },
  { date: 'Nov 1, 2024', amount: '$79.00', status: 'Paid' },
  { date: 'Oct 1, 2024', amount: '$79.00', status: 'Paid' },
];

export default function BillingPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-zinc-400">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Current Plan</h2>
            <p className="text-zinc-500">You are currently on the Pro plan</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">$79<span className="text-sm text-zinc-500">/month</span></p>
            <p className="text-sm text-zinc-500">Next billing: Jan 1, 2025</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-medium">
            Change Plan
          </button>
          <button className="px-4 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-medium">
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 relative ${
                plan.current
                  ? 'border-pink-500 bg-pink-500/5'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold text-white mb-4">
                ${plan.price}<span className="text-sm text-zinc-500 font-normal">/mo</span>
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="h-4 w-4 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-zinc-800 text-zinc-400 cursor-default'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                }`}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-white">Payment Method</h2>
            <p className="text-sm text-zinc-500">Visa ending in 4242</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-medium">
            Update
          </button>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">Billing History</h2>
        </div>
        <div className="divide-y divide-zinc-800">
          {invoices.map((invoice, index) => (
            <div key={index} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-white">{invoice.date}</p>
                <p className="text-sm text-zinc-500">{invoice.amount}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                  {invoice.status}
                </span>
                <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
