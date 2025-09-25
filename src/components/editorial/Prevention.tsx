
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Prevention = () => {
  return (
    <section id="prevention" className="scroll-mt-16">
      <h2>Preventing Solar Panel Fraud: How to Protect Yourself</h2>
      
      <div className="article-body">
        <p>
          While understanding how to respond to solar fraud is essential, preventing it in the first place is even better. 
          Here are some key preventive measures Texas consumers should take before signing any solar agreements:
        </p>
        
        <ul>
          <li>
            <strong>Research multiple companies</strong> and check their ratings with the Better Business Bureau, online reviews, and solar industry associations
          </li>
          <li>
            <strong>Get multiple quotes</strong> from different providers to compare offerings and identify outliers
          </li>
          <li>
            <strong>Verify licenses and credentials</strong> with the Texas Department of Licensing and Regulation
          </li>
          <li>
            <strong>Ask for references</strong> from previous customers and actually contact them
          </li>
          <li>
            <strong>Have contracts reviewed</strong> by an attorney before signing
          </li>
        </ul>
        
        <div className="bg-bennett-lightGold p-6 rounded-lg my-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="md:w-3/4">
              <h3 className="text-bennett-navy mt-0 mb-2">Get Our Complete Prevention Guide</h3>
              <p className="mb-4 md:mb-0">
                Our comprehensive guide covers everything you need to know to safely purchase solar in Texas, 
                including contract red flags, installer verification tips, and a pre-purchase checklist.
              </p>
            </div>
            <div className="md:w-1/4 text-center">
              <Button 
                className="bg-bennett-navy text-white hover:bg-bennett-navy/90"
                asChild>
                <Link to="/prevention-guide">
                  Read Full Guide <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <p>
          For a deeper dive into preventing solar panel fraud, including specific questions to ask installers, contract provisions 
          to watch for, and tools for verifying company claims, visit our detailed prevention guide.
        </p>
        
        <div className="mt-6 text-right">
          <Link to="/prevention-guide" className="text-bennett-navy hover:text-bennett-gold inline-flex items-center font-medium">
            Read our complete Prevention Guide <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Prevention;
