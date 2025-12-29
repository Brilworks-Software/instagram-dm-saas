'use client';

import { Accordion, AccordionItem } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is SocialOra compliant with Instagram's policies?",
    answer: "Yes, 100%. SocialOra utilizes the official Meta Graph API for Instagram Direct Messages. We strictly adhere to all rate limits and platform guidelines to ensure your account remains safe and compliant while automating your outreach."
  },
  {
    question: "How authentic does the AI sound?",
    answer: "Incredibly authentic. You can customize the AI's 'persona' to match your brand's voice—whether that's professional, witty, or casual. You can upload your past conversations or brand guidelines, and our AI learns to mimic your specific tone and style."
  },
  {
    question: "What happens if the AI doesn't know the answer?",
    answer: "We have a smart 'Human-Handover' protocol. If a user asks a question that falls below a certain confidence threshold, the AI pauses and tags the conversation for your manual review. You can then jump in seamlessly to resolve the query."
  },
  {
    question: "Can I automate responses to comments too?",
    answer: "Yes! SocialOra isn't just for DMs. You can set up automation rules to reply to post comments or Story mentions, which can then trigger a DM conversation to nurture the lead further."
  },
  {
    question: "Do I need technical skills to set this up?",
    answer: "Not at all. We've designed SocialOra to be 'No-Code' friendly. You can build complex conversation flows using our visual drag-and-drop editor, or simply choose one of our pre-built templates for common use cases like Lead Gen or Customer Support."
  },
  {
    question: "How many accounts can I connect?",
    answer: "The Free Forever plan includes 1 Instagram account. Pro plans include up to 5 accounts so you can manage multiple brands or client accounts from a single dashboard. Enterprise plans offer unlimited connections. Contact our support team for custom pricing on multiple accounts."
  },
  {
    question: "Does it support multiple languages?",
    answer: "Yes, our AI models are multilingual. They can detect the language of the incoming message and respond fluently in over 50+ languages, helping you scale your business globally."
  },
  {
    question: "Is there a free plan available?",
    answer: "Yes! We offer a Free Forever plan that includes 1 Instagram account and 40 DMs daily bulk sending - completely free forever. No credit card required. For unlimited DMs and multiple accounts, contact our support team for custom pricing on Pro or Enterprise plans."
  }
];

export function FAQSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background-secondary relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Frequently Asked <span className="text-accent">Questions</span>
          </h2>
          <p className="text-xl text-foreground-muted">
            Everything you need to know about SocialOra.
          </p>
        </div>

        <Accordion className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              index={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </Accordion>
      </div>
    </section>
  );
}
