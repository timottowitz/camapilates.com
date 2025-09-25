
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const RedFlagsChecklist = () => {
  const redFlags = [
    "Door-to-door sales with high-pressure tactics",
    "Promises that seem too good to be true",
    "Requests for large upfront payments",
    "Reluctance to provide written estimates",
    "Claims about limited-time government incentives",
    "Pushy salespeople who won't leave",
    "Verbal promises not included in the contract",
    "Unlicensed contractors or installers",
    "Extremely low prices compared to competitors",
    "Refusal to provide references or credentials"
  ];

  return (
    <section className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-bennett-navy mb-6">Solar Fraud Red Flags Checklist</h2>
        <div className="w-24 h-1 bg-bennett-gold mx-auto mb-8"></div>
        <p className="text-lg text-bennett-slate max-w-3xl mx-auto">
          Protect yourself by recognizing these common warning signs of solar panel fraud and deceptive practices.
        </p>
      </div>
      
      <Card className="border-l-4 border-l-red-500 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h3 className="text-2xl font-bold text-bennett-navy !m-0">Warning Signs to Watch For</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {redFlags.map((flag, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-bennett-slate">{flag}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">If you've experienced any of these red flags:</span>
            </div>
            <p className="text-green-700">
              You may have grounds for legal action. Contact Bennett Legal for a free consultation to discuss your situation.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RedFlagsChecklist;
