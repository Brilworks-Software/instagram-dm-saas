'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, ArrowRight, BarChart3, Book, Bot, CheckCircle, HelpCircle, Instagram, MessageSquare, Send, Settings, Shield, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Note: Metadata should be added via layout or server component wrapper
// For now, this is a client component for interactivity

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const quickLinks = [
    { icon: MessageSquare, title: 'Getting Started', href: '#getting-started', id: 'getting-started' },
    { icon: Settings, title: 'Connect Instagram', href: '#connect-instagram', id: 'connect-instagram' },
    { icon: MessageSquare, title: 'Manage Inbox', href: '#manage-inbox', id: 'manage-inbox' },
    { icon: Send, title: 'Create Campaigns', href: '#create-campaigns', id: 'create-campaigns' },
    { icon: Bot, title: 'AI Automations', href: '#ai-automations', id: 'ai-automations' },
    { icon: Target, title: 'Find Leads', href: '#find-leads', id: 'find-leads' },
    { icon: BarChart3, title: 'Analytics', href: '#analytics', id: 'analytics' },
    { icon: HelpCircle, title: 'Troubleshooting', href: '#troubleshooting', id: 'troubleshooting' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = quickLinks.map(link => link.id);
      const scrollPosition = window.scrollY + 150; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                Social<span className="text-accent">ora</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/support">
                <Button variant="ghost" size="sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Support
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-background-elevated rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-6">
                  <Book className="h-5 w-5 text-accent" />
                  <h2 className="font-semibold text-foreground">Documentation</h2>
                </div>
                <nav className="space-y-2">
                  {quickLinks.map((link, index) => {
                    const isActive = activeSection === link.id;
                    return (
                      <a
                        key={index}
                        href={link.href}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-sm ${
                          isActive
                            ? 'bg-accent/10 text-accent border border-accent/20'
                            : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
                        }`}
                      >
                        <link.icon className={`h-4 w-4 ${isActive ? 'text-accent' : ''}`} />
                        {link.title}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">Socialora Documentation</h1>
              <p className="text-xl text-foreground-muted">
                Complete guide to using Socialora for Instagram DM automation and management
              </p>
            </div>

            {/* Getting Started */}
            <section id="getting-started" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-6 w-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">Getting Started</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Welcome to Socialora! This guide will help you get started with automating and managing your Instagram direct messages.
                </p>

                <div className="bg-background-elevated rounded-xl p-6 border border-border mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">What is Socialora?</h3>
                  <p className="text-foreground-muted leading-relaxed mb-4">
                    Socialora is an all-in-one platform for managing Instagram direct messages. It helps you:
                  </p>
                  <ul className="list-disc list-inside text-foreground-muted space-y-2">
                    <li>Manage all Instagram DMs from a unified inbox</li>
                    <li>Automate responses with AI-powered replies</li>
                    <li>Create and run DM campaigns at scale</li>
                    <li>Find and engage with potential leads</li>
                    <li>Track performance with detailed analytics</li>
                  </ul>
                </div>

                <h3 className="text-2xl font-semibold text-foreground mb-4 mt-8">Step 1: Create Your Account</h3>
                <ol className="list-decimal list-inside space-y-4 text-foreground-muted mb-6">
                  <li>
                    <strong className="text-foreground">Sign up:</strong> Go to the <Link href="/signup" className="text-accent hover:underline">signup page</Link> and create your account
                  </li>
                  <li>
                    <strong className="text-foreground">Verify email:</strong> Check your email and click the verification link
                  </li>
                  <li>
                    <strong className="text-foreground">Complete profile:</strong> Add your name and set up your workspace
                  </li>
                </ol>

                <h3 className="text-2xl font-semibold text-foreground mb-4 mt-8">Step 2: Connect Your Instagram Account</h3>
                <p className="text-foreground-muted leading-relaxed mb-4">
                  Before you can start using Socialora, you need to connect at least one Instagram account. See the <a href="#connect-instagram" className="text-accent hover:underline">Connect Instagram</a> section for detailed instructions.
                </p>

                <div className="bg-gradient-to-br from-accent/10 via-pink-500/10 to-accent/10 rounded-xl p-6 border border-border">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Pro Tip</h4>
                      <p className="text-foreground-muted">
                        You can connect multiple Instagram accounts to manage them all from one dashboard. Perfect for agencies and businesses managing multiple brands!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Connect Instagram */}
            <section id="connect-instagram" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="h-6 w-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">Connect Instagram Account</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-foreground-muted leading-relaxed mb-6">
                  There are three ways to connect your Instagram account to Socialora. Choose the method that works best for you.
                </p>

                <div className="space-y-6 mb-8">
                  {/* Method 1: Direct Login */}
                  <div className="bg-background-elevated rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center text-white font-bold">1</div>
                      <h3 className="text-xl font-semibold text-foreground">Direct Login (Recommended)</h3>
                    </div>
                    <p className="text-foreground-muted leading-relaxed mb-4">
                      The easiest and most secure method. Socialora will open a browser window for you to log in directly to Instagram.
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-foreground-muted mb-4">
                      <li>Go to <strong className="text-foreground">Settings → Instagram Accounts</strong></li>
                      <li>Click <strong className="text-foreground">"Connect with Direct Login"</strong></li>
                      <li>A browser window will open - log in to Instagram</li>
                      <li>Your account will connect automatically!</li>
                    </ol>
                    <div className="bg-background-secondary rounded-lg p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Why use Direct Login?</p>
                          <p className="text-sm text-foreground-muted">
                            No need to copy cookies manually. If you're already logged in to Instagram, it uses your existing session. Fast, secure, and hassle-free!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Method 2: Chrome Extension */}
                  <div className="bg-background-elevated rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center text-white font-bold">2</div>
                      <h3 className="text-xl font-semibold text-foreground">Chrome Extension</h3>
                    </div>
                    <p className="text-foreground-muted leading-relaxed mb-4">
                      Use our Chrome extension for one-click Instagram account connection.
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-foreground-muted mb-4">
                      <li>Install the Socialora Chrome Extension (if not already installed)</li>
                      <li>Go to <strong className="text-foreground">Settings → Instagram Accounts</strong></li>
                      <li>Click <strong className="text-foreground">"Connect with Extension"</strong></li>
                      <li>Open Instagram in a new tab and log in</li>
                      <li>Click the Socialora extension icon in your browser</li>
                      <li>Click <strong className="text-foreground">"Grab Instagram Session"</strong></li>
                      <li>Your account will connect automatically!</li>
                    </ol>
                    <div className="bg-background-secondary rounded-lg p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Secure & Private</p>
                          <p className="text-sm text-foreground-muted">
                            The extension only extracts session cookies needed for authentication. All data is encrypted and stored securely in your Socialora account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Method 3: Manual Cookies */}
                  <div className="bg-background-elevated rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center text-white font-bold">3</div>
                      <h3 className="text-xl font-semibold text-foreground">Manual Cookies (Advanced)</h3>
                    </div>
                    <p className="text-foreground-muted leading-relaxed mb-4">
                      For advanced users who prefer to manually enter Instagram cookies.
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-foreground-muted mb-4">
                      <li>Go to <strong className="text-foreground">Settings → Instagram Accounts</strong></li>
                      <li>Click <strong className="text-foreground">"Connect with Cookies"</strong></li>
                      <li>Open Instagram in your browser and log in</li>
                      <li>Open browser Developer Tools (F12)</li>
                      <li>Go to <strong className="text-foreground">Application → Cookies → instagram.com</strong></li>
                      <li>Copy the values for: <code className="bg-background-secondary px-2 py-1 rounded">sessionid</code>, <code className="bg-background-secondary px-2 py-1 rounded">csrftoken</code>, and <code className="bg-background-secondary px-2 py-1 rounded">ds_user_id</code></li>
                      <li>Paste them into Socialora and click <strong className="text-foreground">"Connect"</strong></li>
                    </ol>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Important Note</p>
                          <p className="text-sm text-foreground-muted">
                            Cookies expire after some time. You'll need to reconnect your account when cookies expire. We recommend using Direct Login or the Extension for automatic reconnection.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-foreground mb-4 mt-8">Managing Multiple Accounts</h3>
                <p className="text-foreground-muted leading-relaxed mb-4">
                  You can connect multiple Instagram accounts to your Socialora workspace. Each account is managed separately:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground-muted mb-6">
                  <li>Switch between accounts from the Settings page</li>
                  <li>Each account has its own inbox and campaigns</li>
                  <li>Analytics are tracked per account</li>
                  <li>You can disconnect accounts at any time</li>
                </ul>
              </div>
            </section>

            {/* Manage Inbox */}
            <section id="manage-inbox" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-6 w-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">Manage Your Inbox</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-foreground-muted leading-relaxed mb-6">
                  The Inbox is your central hub for all Instagram direct messages. View, reply, and manage conversations from all your connected accounts.
                </p>

                <h3 className="text-2xl font-semibold text-foreground mb-4">Features</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Unified View</h4>
                    <p className="text-sm text-foreground-muted">
                      See all conversations from all connected Instagram accounts in one place
                    </p>
                  </div>
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Quick Replies</h4>
                    <p className="text-sm text-foreground-muted">
                      Use AI-powered quick replies to respond faster
                    </p>
                  </div>
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Search & Filter</h4>
                    <p className="text-sm text-foreground-muted">
                      Find specific conversations quickly with search and filters
                    </p>
                  </div>
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Read Status</h4>
                    <p className="text-sm text-foreground-muted">
                      Track which messages you've read and replied to
                    </p>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-foreground mb-4 mt-8">How to Use</h3>
                <ol className="list-decimal list-inside space-y-4 text-foreground-muted mb-6">
                  <li>
                    <strong className="text-foreground">Select Account:</strong> Choose which Instagram account's inbox you want to view from the dropdown
                  </li>
                  <li>
                    <strong className="text-foreground">View Conversations:</strong> All your DM conversations appear in the left sidebar
                  </li>
                  <li>
                    <strong className="text-foreground">Open Conversation:</strong> Click on any conversation to view messages
                  </li>
                  <li>
                    <strong className="text-foreground">Reply:</strong> Type your message in the input box and press Enter or click Send
                  </li>
                  <li>
                    <strong className="text-foreground">Use Quick Replies:</strong> Click the AI icon to generate suggested replies
                  </li>
                </ol>
              </div>
            </section>

            {/* Create Campaigns */}
            <section id="create-campaigns" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <Send className="h-6 w-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">Create DM Campaigns</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Campaigns allow you to send personalized messages to multiple Instagram users at once. Perfect for outreach, marketing, and lead generation.
                </p>

                <h3 className="text-2xl font-semibold text-foreground mb-4">Creating a Campaign</h3>
                <ol className="list-decimal list-inside space-y-4 text-foreground-muted mb-6">
                  <li>
                    <strong className="text-foreground">Go to Campaigns:</strong> Navigate to the Campaigns page from the sidebar
                  </li>
                  <li>
                    <strong className="text-foreground">Click "Create Campaign":</strong> Start a new campaign
                  </li>
                  <li>
                    <strong className="text-foreground">Select Account:</strong> Choose which Instagram account to send from
                  </li>
                  <li>
                    <strong className="text-foreground">Choose Recipients:</strong> Select contacts from your leads or add new ones
                  </li>
                  <li>
                    <strong className="text-foreground">Write Message:</strong> Create your message template (supports personalization with {`{name}`}, {`{username}`}, etc.)
                  </li>
                  <li>
                    <strong className="text-foreground">Set Schedule:</strong> Choose when to start sending (immediately or scheduled)
                  </li>
                  <li>
                    <strong className="text-foreground">Configure Settings:</strong> Set sending rate, delays between messages, etc.
                  </li>
                  <li>
                    <strong className="text-foreground">Launch:</strong> Start your campaign!
                  </li>
                </ol>

                <div className="bg-background-elevated rounded-xl p-6 border border-border mb-6">
                  <h4 className="text-lg font-semibold text-foreground mb-3">Message Personalization</h4>
                  <p className="text-foreground-muted leading-relaxed mb-4">
                    Make your messages more personal by using variables:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-foreground-muted">
                    <li><code className="bg-background-secondary px-2 py-1 rounded">{`{name}`}</code> - Recipient's full name</li>
                    <li><code className="bg-background-secondary px-2 py-1 rounded">{`{username}`}</code> - Instagram username</li>
                    <li><code className="bg-background-secondary px-2 py-1 rounded">{`{firstname}`}</code> - First name only</li>
                  </ul>
                  <p className="text-foreground-muted leading-relaxed mt-4">
                    Example: <code className="bg-background-secondary px-2 py-1 rounded">"Hi {`{firstname}`}! I noticed you're interested in..."</code>
                  </p>
                </div>

                <h3 className="text-2xl font-semibold text-foreground mb-4 mt-8">Campaign Best Practices</h3>
                <div className="space-y-4 mb-6">
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Respect Rate Limits</h4>
                        <p className="text-sm text-foreground-muted">
                          Don't send too many messages too quickly. Socialora automatically respects Instagram's rate limits to protect your account.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Personalize Messages</h4>
                        <p className="text-sm text-foreground-muted">
                          Use personalization variables to make messages feel authentic and increase engagement rates.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Test First</h4>
                        <p className="text-sm text-foreground-muted">
                          Send a test message to yourself before launching a large campaign to ensure everything looks good.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Automations */}
            <section id="ai-automations" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <Bot className="h-6 w-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">AI Automations</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Set up intelligent automations to automatically respond to incoming messages based on keywords, message types, or user behavior.
                </p>

                <h3 className="text-2xl font-semibold text-foreground mb-4">Creating an Automation</h3>
                <ol className="list-decimal list-inside space-y-4 text-foreground-muted mb-6">
                  <li>
                    <strong className="text-foreground">Go to AI Studio:</strong> Navigate to AI Studio from the sidebar
                  </li>
                  <li>
                    <strong className="text-foreground">Create Rule:</strong> Click "Create Automation"
                  </li>
                  <li>
                    <strong className="text-foreground">Set Triggers:</strong> Define when the automation should activate (keywords, message type, etc.)
                  </li>
                  <li>
                    <strong className="text-foreground">Write Response:</strong> Create AI-powered response templates
                  </li>
                  <li>
                    <strong className="text-foreground">Configure Settings:</strong> Set response delay, enable/disable auto-send, etc.
                  </li>
                  <li>
                    <strong className="text-foreground">Activate:</strong> Enable the automation
                  </li>
                </ol>

                <div className="bg-background-elevated rounded-xl p-6 border border-border mb-6">
                  <h4 className="text-lg font-semibold text-foreground mb-3">Automation Modes</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-semibold text-foreground mb-1">Manual Review</h5>
                      <p className="text-sm text-foreground-muted">
                        AI generates responses, but you review and approve them before sending. Recommended for important conversations.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground mb-1">Fully Automated</h5>
                      <p className="text-sm text-foreground-muted">
                        AI automatically sends responses without your review. Use for common questions and FAQs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Find Leads */}
            <section id="find-leads" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">Find Leads</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Discover potential customers and leads based on hashtags, user bios, followers, and more.
                </p>

                <h3 className="text-2xl font-semibold text-foreground mb-4">Search Methods</h3>
                <div className="space-y-4 mb-6">
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">By Hashtag</h4>
                    <p className="text-sm text-foreground-muted mb-2">
                      Find users who have specific hashtags in their bio or recent posts.
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Example: Search for <code className="bg-background-secondary px-2 py-1 rounded">#fitness</code> to find fitness enthusiasts.
                    </p>
                  </div>
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">By Account Followers</h4>
                    <p className="text-sm text-foreground-muted mb-2">
                      Get followers of specific Instagram accounts that match your target audience.
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Example: Get followers of a competitor's account to find potential customers.
                    </p>
                  </div>
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">By Bio Keywords</h4>
                    <p className="text-sm text-foreground-muted mb-2">
                      Search for users whose bio contains specific keywords.
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Example: Find users with "entrepreneur" or "business owner" in their bio.
                    </p>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-foreground mb-4 mt-8">Adding Leads to Campaigns</h3>
                <ol className="list-decimal list-inside space-y-2 text-foreground-muted mb-6">
                  <li>Search for leads using any of the methods above</li>
                  <li>Review the results and select users you want to contact</li>
                  <li>Click "Add to Contacts" to save them</li>
                  <li>Use these contacts when creating campaigns</li>
                </ol>
              </div>
            </section>

            {/* Analytics */}
            <section id="analytics" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-6 w-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">Analytics & Reports</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-foreground-muted leading-relaxed mb-6">
                  Track your performance with detailed analytics and insights.
                </p>

                <h3 className="text-2xl font-semibold text-foreground mb-4">Available Metrics</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Campaign Performance</h4>
                    <ul className="text-sm text-foreground-muted space-y-1">
                      <li>• Messages sent</li>
                      <li>• Response rate</li>
                      <li>• Conversion rate</li>
                      <li>• Engagement metrics</li>
                    </ul>
                  </div>
                  <div className="bg-background-elevated rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Inbox Metrics</h4>
                    <ul className="text-sm text-foreground-muted space-y-1">
                      <li>• Response time</li>
                      <li>• Messages received</li>
                      <li>• Active conversations</li>
                      <li>• Average response time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="h-6 w-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">Troubleshooting</h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="space-y-6">
                  <div className="bg-background-elevated rounded-lg p-6 border border-border">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Account Connection Issues</h3>
                    <div className="space-y-3 text-foreground-muted">
                      <div>
                        <strong className="text-foreground">Problem:</strong> Can't connect Instagram account
                        <p className="mt-1"><strong className="text-foreground">Solution:</strong> Make sure you're logged in to Instagram in your browser. Try using Direct Login method for easiest connection.</p>
                      </div>
                      <div>
                        <strong className="text-foreground">Problem:</strong> Account disconnected after some time
                        <p className="mt-1"><strong className="text-foreground">Solution:</strong> Instagram cookies expire. Reconnect your account using any of the three methods. Consider using Direct Login for automatic reconnection.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background-elevated rounded-lg p-6 border border-border">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Campaign Issues</h3>
                    <div className="space-y-3 text-foreground-muted">
                      <div>
                        <strong className="text-foreground">Problem:</strong> Messages not sending
                        <p className="mt-1"><strong className="text-foreground">Solution:</strong> Check if your Instagram account is still connected. Verify rate limits aren't being exceeded. Make sure the recipient hasn't blocked you.</p>
                      </div>
                      <div>
                        <strong className="text-foreground">Problem:</strong> Low response rate
                        <p className="mt-1"><strong className="text-foreground">Solution:</strong> Personalize your messages more. Avoid spammy language. Test different message templates to see what works best.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background-elevated rounded-lg p-6 border border-border">
                    <h3 className="text-xl font-semibold text-foreground mb-3">General Issues</h3>
                    <div className="space-y-3 text-foreground-muted">
                      <div>
                        <strong className="text-foreground">Problem:</strong> Features not loading
                        <p className="mt-1"><strong className="text-foreground">Solution:</strong> Refresh the page. Clear your browser cache. Make sure you're using a supported browser (Chrome, Firefox, Safari, Edge).</p>
                      </div>
                      <div>
                        <strong className="text-foreground">Problem:</strong> Need more help
                        <p className="mt-1"><strong className="text-foreground">Solution:</strong> Visit our <Link href="/support" className="text-accent hover:underline">Support page</Link> or contact digital@socialora.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-accent/10 via-pink-500/10 to-accent/10 rounded-2xl p-8 border border-border mt-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
                <p className="text-foreground-muted mb-6 max-w-2xl mx-auto">
                  Start automating your Instagram DMs today and grow your business faster.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/">
                    <Button size="lg">
                      Join Waiting List
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/support">
                    <Button variant="secondary" size="lg">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                Social<span className="text-accent">ora</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
              <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            </div>
            <p className="text-sm text-foreground-muted">
              © 2025 Socialora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
