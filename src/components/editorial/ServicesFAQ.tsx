
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

const ServicesFAQ = () => {
  const faqs = [
    {
      question: "How do I know if I have a valid solar fraud case?",
      answer: "You may have a valid case if you experienced significant discrepancies between what was promised and what was delivered, such as underperforming systems, hidden fees, property damage from poor installation, or if the company used high-pressure tactics or made false claims about savings or government incentives."
    },
    {
      question: "What documentation should I gather for my case?",
      answer: "Collect your solar contract, all sales materials and brochures, email communications, text messages, utility bills (before and after installation), system performance data, financing documents, warranty information, and any photos of installation issues or property damage."
    },
    {
      question: "How long does it typically take to resolve a solar fraud case?",
      answer: "Case timelines vary depending on complexity and the company's willingness to negotiate. Some cases settle within a few months through demand letters, while others requiring litigation may take 1-2 years. We'll provide a realistic timeline estimate during your consultation."
    },
    {
      question: "What compensation might I be entitled to?",
      answer: "Potential compensation may include refund of payments made, costs to repair or replace defective systems, property damage repairs, the difference between promised and actual savings, attorney fees, and in some cases, punitive damages for egregious conduct."
    },
    {
      question: "Can I pursue a case if the solar company went out of business?",
      answer: "Yes, you may still have options. We can pursue claims against financiers, equipment manufacturers, installers, or insurance companies. Many solar companies have bonds or insurance that may cover consumer losses even after the company closes."
    },
    {
      question: "What if my contract has arbitration clauses?",
      answer: "Arbitration clauses don't prevent you from seeking legal help. We regularly handle arbitration proceedings and can evaluate whether the arbitration clause is enforceable. Some arbitration clauses may be invalid if they're unconscionable or if fraud occurred during contract formation."
    },
    {
      question: "How much does it cost to hire Bennett Legal?",
      answer: "We offer free initial consultations to evaluate your case. Our fee structure varies by case type and complexity. Many consumer protection cases are handled on a contingency basis, meaning you don't pay attorney fees unless we recover compensation for you. We'll discuss all fee arrangements transparently during your consultation."
    },
    {
      question: "Is there a time limit for taking legal action?",
      answer: "Yes, there are statutes of limitations that vary by claim type and state. In Texas, most fraud claims must be filed within 4 years, but some contract claims may have different deadlines. It's crucial to contact us promptly to preserve your rights."
    }
  ];

  return (
    <section className="mb-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-bennett-lightBlue/20 rounded-full px-4 py-2 mb-6">
          <HelpCircle className="h-4 w-4 text-bennett-navy" />
          <span className="text-sm font-medium text-bennett-navy">Frequently Asked Questions</span>
        </div>
        <h2 className="text-4xl font-bold text-bennett-navy mb-6">Common Questions About Solar Fraud Cases</h2>
        <div className="w-24 h-1 bg-bennett-gold mx-auto mb-8"></div>
        <p className="text-lg text-bennett-slate max-w-3xl mx-auto">
          Get answers to the most common questions we receive from solar fraud victims. 
          Don't see your question? Contact us for a personalized consultation.
        </p>
      </div>
      
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold text-bennett-navy hover:text-bennett-gold transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-bennett-slate leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
};

export default ServicesFAQ;
