
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Clock, Shield, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCalApi } from "@calcom/embed-react";

const LawyerExpertiseCTA = () => {
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
    <section className="relative bg-gradient-to-br from-bennett-navy via-slate-800 to-bennett-navy rounded-3xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(201,154,46,0.1)_0%,transparent_50%)]"></div>
      </div>
      
      <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
        {/* Left Content */}
        <div className="text-white space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bennett-gold/20 rounded-xl">
              <Shield className="h-6 w-6 text-bennett-gold" />
            </div>
            <span className="text-bennett-gold font-semibold text-sm uppercase tracking-wider">
              Experienced Legal Protection
            </span>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-white text-4xl lg:text-5xl font-bold leading-tight font-serif">
              Work with Experienced Consumer Protection Attorneys
            </h2>
            
            <p className="text-xl text-gray-200 leading-relaxed">
              Bennett Legal has over 50 years of combined experience with fraud cases, arbitration, trial advocacy, and consumer protection law. Our team is dedicated to protecting Texas consumers from emerging industry scams. No upfront costs—you only pay if we achieve a successful outcome.
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-bennett-gold/20 rounded-xl">
                <Award className="h-6 w-6 text-bennett-gold" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-gray-300">Years Combined Experience</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-bennett-gold/20 rounded-xl">
                <Users className="h-6 w-6 text-bennett-gold" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">$75K</div>
                <div className="text-sm text-gray-300">Average Consumer Loss</div>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              size="lg"
              className="bg-bennett-gold hover:bg-bennett-gold/90 text-bennett-navy font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg"
              onClick={openCal}
            >
              Schedule Free Consultation
            </Button>
          </div>
        </div>
        
        {/* Right Content - Time-Sensitive Alert Card */}
        <div className="flex items-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 w-full">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col">
                  <div className="flex flex-row items-center gap-2 mb-2">
                    <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
                      <Clock className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-bennett-navy !m-0 font-serif">
                      Time-Sensitive Alert
                    </h3>
                  </div>
                  <p className="text-bennett-slate leading-relaxed">
                    Texas consumer protection laws including the Deceptive Trade Practices Act and other applicable laws have strict time limitations. Don't delay—call today to check if your case is eligible for multiple legal claims.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-bennett-gold/10 to-bennett-gold/5 p-6 rounded-xl border-l-4 border-bennett-gold">
                <p className="text-sm font-medium text-bennett-navy">
                  <strong>Free Case Evaluation:</strong> No obligation consultation to review your solar contract and determine if you have valid legal claims under multiple consumer protection laws including DTPA, breach of contract, and other applicable statutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LawyerExpertiseCTA;
