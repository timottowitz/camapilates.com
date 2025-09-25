
import React from 'react';
import { AirtableFormEmbed } from '@/components/ui/airtable-form-dialog';

const ContactForm = () => {
  return (
    <section id="contact-form" className="scroll-mt-16 my-12 bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-serif font-bold text-bennett-navy mb-6">Get a Free Case Evaluation</h2>
      
      <p className="text-bennett-slate mb-6">
        If you believe you've been a victim of solar panel fraud, our experienced attorneys are ready to review your case. 
        Complete the form below for a confidential consultation.
      </p>
      
      <AirtableFormEmbed />
    </section>
  );
};

export default ContactForm;
