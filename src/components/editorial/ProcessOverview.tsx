
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Phone, FileText, Gavel, Trophy } from 'lucide-react';

const ProcessOverview = () => {
  const steps = [
    {
      icon: Phone,
      title: "Free Consultation",
      description: "We review your situation, analyze your documents, and assess the strength of your case.",
      duration: "30-60 minutes",
      details: "Bring your solar contract, communications, and billing statements. We'll explain your legal options with no obligation."
    },
    {
      icon: FileText,
      title: "Case Investigation",
      description: "Our team conducts a thorough investigation, gathering evidence and building your case.",
      duration: "2-4 weeks",
      details: "We review contracts, performance data, industry standards, and identify all liable parties and applicable laws."
    },
    {
      icon: Gavel,
      title: "Legal Action",
      description: "We pursue your case through negotiation, arbitration, or litigation as appropriate.",
      duration: "3-18 months",
      details: "We start with demand letters and negotiations. If needed, we're prepared to take your case to court or arbitration."
    },
    {
      icon: Trophy,
      title: "Resolution",
      description: "We work to secure the best possible outcome for your situation.",
      duration: "Varies",
      details: "Outcomes may include monetary compensation, contract cancellation, system repairs, or other relief."
    }
  ];

  return (
    <section className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-bennett-navy mb-6">Our Process: What to Expect</h2>
        <div className="w-24 h-1 bg-bennett-gold mx-auto mb-8"></div>
        <p className="text-lg text-bennett-slate max-w-3xl mx-auto">
          We believe in transparency every step of the way. Here's exactly what happens when you work with Bennett Legal.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <Card key={index} className="relative border-l-4 border-l-bennett-gold shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-bennett-navy rounded-full flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-bennett-gold">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-bennett-navy mb-2">{step.title}</h3>
              <p className="text-bennett-slate mb-3 leading-relaxed">{step.description}</p>
              
              <div className="text-sm text-bennett-gold font-semibold mb-2">
                Timeline: {step.duration}
              </div>
              
              <p className="text-sm text-gray-600 leading-snug">{step.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">No upfront fees • Free consultation • Clear communication throughout</span>
        </div>
      </div>
    </section>
  );
};

export default ProcessOverview;
