
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FAQItem = {
  question: string;
  answer: React.ReactNode;
};

const faqItems: FAQItem[] = [
  {
    question: "How do I know if I have a valid legal case against a solar company?",
    answer: (
      <p>
        Several factors can indicate a potential legal case, including: misrepresentation of system performance or savings; installation issues that weren't properly addressed; violations of contract terms; improper permitting or code violations; or undisclosed fees and obligations. During your free consultation, we'll evaluate your specific situation and documentation to determine if you have grounds for legal action under Texas consumer protection laws.
      </p>
    )
  },
  {
    question: "What documentation should I gather if I suspect solar panel fraud?",
    answer: (
      <>
        <p>
          You should collect as much documentation as possible, including:
        </p>
        <ul>
          <li>All contracts and agreements with the solar company</li>
          <li>Marketing materials you received (brochures, emails, etc.)</li>
          <li>Correspondence with the company (emails, texts, letters)</li>
          <li>Photos of the installation and any issues</li>
          <li>Utility bills before and after installation</li>
          <li>Any performance guarantees or warranty information</li>
          <li>Records of payments made</li>
          <li>Notes from conversations with sales representatives (including dates and names)</li>
        </ul>
        <p>
          Even if your documentation is incomplete, we may still be able to help. Contact us to discuss your specific situation.
        </p>
      </>
    )
  },
  {
    question: "How long will it take to resolve a solar fraud case?",
    answer: (
      <p>
        The timeline for resolving solar fraud cases varies depending on several factors, including the complexity of the case, whether the company is still in business, and if the matter can be resolved through negotiation or requires litigation. Some cases may be resolved in a few months through settlement negotiations, while others that proceed to litigation may take a year or longer. During your consultation, we can provide a more specific timeline based on the particulars of your case.
      </p>
    )
  },
  {
    question: "What kinds of compensation might I be entitled to?",
    answer: (
      <p>
        Depending on your case, you may be entitled to various forms of compensation, including: refunds for payments made; cancellation of remaining contractual obligations; compensation for property damage; costs for system repair or removal; reimbursement for excessive utility bills; and in some cases involving knowing violations, up to three times your economic damages under the Texas DTPA. Each case is unique, and the potential compensation depends on your specific circumstances and the nature of the violations.
      </p>
    )
  },
  {
    question: "Can I still pursue a case if the solar company has gone out of business?",
    answer: (
      <p>
        Yes, legal remedies may still be available even if the company has gone out of business. Depending on the circumstances, we may be able to pursue claims against the company's bonding agent, insurance, parent companies, individual owners or officers, or financial institutions that facilitated the transaction. Additionally, if your system was financed, you might have claims under federal lending laws that could provide relief from payment obligations. Don't assume you have no recourse—contact us to explore your options.
      </p>
    )
  },
  {
    question: "What if I signed a contract with an arbitration clause?",
    answer: (
      <p>
        Many solar contracts contain arbitration clauses that attempt to limit your right to sue in court. However, these clauses may not always be enforceable, particularly if they're part of a fraudulent agreement or if they're unconscionably one-sided. Even if the arbitration clause is valid, we can still represent you effectively in the arbitration process. We'll review your contract to determine how these clauses might affect your case and develop the strongest strategy accordingly.
      </p>
    )
  },
  {
    question: "How much does it cost to hire Bennett Legal for a solar fraud case?",
    answer: (
      <p>
        We handle many solar fraud cases on a contingency fee basis, which means you pay attorney fees only if we successfully recover compensation for you. The specific fee arrangement will be clearly explained during your free initial consultation. In some cases, the Texas DTPA allows for recovery of attorney's fees from the offending company, which can further reduce your out-of-pocket expenses if your case is successful. Our goal is to make legal representation accessible to consumers who have been victimized, regardless of their financial situation.
      </p>
    )
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="faq" className="scroll-mt-16">
      <h2>Frequently Asked Questions About Solar Panel Fraud</h2>
      
      <div className="article-body">
        <div className="my-8 space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex justify-between items-center p-4 text-left font-medium bg-white hover:bg-gray-50",
                  openIndex === index ? "border-b border-gray-200" : ""
                )}
                onClick={() => toggleQuestion(index)}
              >
                <span className="text-bennett-navy font-serif">{item.question}</span>
                <ChevronDown 
                  className={cn(
                    "h-5 w-5 text-bennett-navy transition-transform duration-200",
                    openIndex === index ? "transform rotate-180" : ""
                  )} 
                />
              </Button>
              {openIndex === index && (
                <div className="p-4 bg-gray-50">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <p>
          Have additional questions about solar panel fraud or your specific situation? Contact us today for a confidential consultation with one of our experienced consumer protection attorneys.
        </p>
      </div>
    </section>
  );
};

export default FAQ;
