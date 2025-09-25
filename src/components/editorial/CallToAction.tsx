import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Clock, ArrowRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCalApi } from "@calcom/embed-react";
import AirtableFormDialog from '@/components/ui/airtable-form-dialog';

const CallToAction = () => {
  const openCal = () => {
    getCalApi().then((cal) => {
      cal("ui", {
        "styles": { "branding": { "brandColor": "#D4A574" } },
        "hideEventTypeDetails": false,
        "layout": "month_view"
      });
      cal("floatingButton", { "calLink": "cbennett/solar-fraud-consultation" });
    });
  };
  return (
    <section className="bg-bennett-navy text-white py-12 md:py-16 px-4 md:px-8 rounded-lg mt-16">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
          Don't Let Solar Panel Fraud in Texas Compromise Your Financial Future
        </h2>
        
        <p className="text-lg md:text-xl text-gray-100 mb-8">
          Our team of experienced Texas consumer protection attorneys is ready to evaluate your case and help you understand your legal options. Contact us today for legal help with solar panel fraud in Texas.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
          <Button 
            size="lg" 
            className="bg-bennett-gold hover:bg-bennett-gold/90 text-bennett-navy font-medium w-full md:w-auto"
            onClick={openCal}
          >
            Schedule Free Consultation <Clock className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-bennett-navy hover:text-white hover:bg-white/10 w-full md:w-auto flex items-center gap-2"
            onClick={() => window.location.href = 'tel:(214)473-5897'}
          >
            <Avatar className="w-6 h-6 bg-bennett-navy">
              <AvatarImage src="/lovable-uploads/b9eed837-d3e3-4439-9e6d-a416f2c12d78.png" alt="Charles Bennett" />
              <AvatarFallback className="text-xs text-white font-serif">CB</AvatarFallback>
            </Avatar>
            <Phone className="h-4 w-4" /> Call (214) 473-5897
          </Button>
        </div>
        
        <p className="text-sm text-gray-300">
          <em>Time is critical - Remember that the DTPA has a 2-year statute of limitations from date of discovery</em>
        </p>
      </div>
    </section>
  );
};

export default CallToAction;
