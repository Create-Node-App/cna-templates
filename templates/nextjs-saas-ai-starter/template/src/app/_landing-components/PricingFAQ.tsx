'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';

const FAQ_ITEMS = [
  {
    q: 'Is Next.js SaaS AI Template free to try?',
    a: 'Yes! The demo environment is fully functional with no payment required. Explore every feature with sample data.',
  },
  {
    q: 'What data do I need to get started?',
    a: 'Just your team roster. You can import from CSV, invite members manually, or use the bulk import feature. The platform is ready to use immediately after setup.',
  },
  {
    q: 'Does it work with our existing tools?',
    a: 'The template integrates with GitHub out of the box, and includes a flexible integration framework to connect any external system via webhooks or custom sync adapters.',
  },
  {
    q: 'How does the AI assistant work?',
    a: "The AI uses your organization's knowledge base and user data to answer questions, search documents, and provide contextual help. Supports OpenAI and Anthropic models.",
  },
  {
    q: 'Is my data secure?',
    a: "Absolutely. The template is multi-tenant by design — each organization's data is fully isolated. Enterprise-grade authentication (Auth.js) and permission-based access control (PBAC) are included.",
  },
  {
    q: 'Can I migrate my existing data?',
    a: 'Yes. The bulk import feature supports CSV import for team members. The integration engine can sync data from external systems on a schedule.',
  },
];

export function PricingFAQ() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
      {FAQ_ITEMS.map((item, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger className="text-left text-base font-medium">{item.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
