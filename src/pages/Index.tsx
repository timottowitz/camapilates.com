
import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageTemplate from '@/components/layout/PageTemplate';
import StandardHero from '@/components/layout/StandardHero';
import TableOfContents from '@/components/editorial/TableOfContents';
import GrowingProblem from '@/components/editorial/GrowingProblem';
import VictimSigns from '@/components/editorial/VictimSigns';
import ConsumerRights from '@/components/editorial/ConsumerRights';
import CaseStudies from '@/components/editorial/CaseStudies';
import Prevention from '@/components/editorial/Prevention';
import HowWeHelp from '@/components/editorial/HowWeHelp';
import FAQ from '@/components/editorial/FAQ';
import ContactForm from '@/components/editorial/ContactForm';
import CallToAction from '@/components/editorial/CallToAction';
import AuthorInfo from '@/components/editorial/AuthorInfo';
import ShareYourStoryCTA from '@/components/editorial/ShareYourStoryCTA';
import LawyerExpertiseCTA from '@/components/editorial/LawyerExpertiseCTA';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { AlertTriangle, TrendingUp, CheckCircle2, Award, Users, Star, Phone, Shield, ArrowRight } from 'lucide-react';
import AirtableFormDialog from '@/components/ui/airtable-form-dialog';
import { Button } from '@/components/ui/button';
import { getCalApi } from "@calcom/embed-react";

const Index = () => {
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
  const heroStats = [
    {
      value: '300%',
      label: 'Increase in Solar Fraud Cases',
      icon: <TrendingUp className="h-6 w-6 text-red-400" />
    },
    {
      value: '50+',
      label: 'Years Combined Experience',
      icon: <Award className="h-6 w-6 text-bennett-gold" />
    },
    {
      value: '$75K',
      label: 'Average Consumer Loss',
      icon: <AlertTriangle className="h-6 w-6 text-red-400" />
    },
    {
      value: '24/7',
      label: 'Emergency Legal Support',
      icon: <Shield className="h-6 w-6 text-blue-400" />
    }
  ];

  const heroSection = (
    <StandardHero
      title="Fight Solar Panel Fraud in Texas"
      subtitle="Texas Consumer Protection"
      description="As solar energy grows in popularity across Texas, so do deceptive practices and outright scams. Learn how to protect yourself and what legal options are available if you've been victimized."
      primaryCTA={{
        text: "Schedule Free Consultation",
        component: (
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-bennett-gold to-yellow-500 hover:from-bennett-gold/90 hover:to-yellow-500/90 text-bennett-navy font-bold px-12 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-bennett-gold/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
            onClick={openCal}
          >
            <span className="flex items-center">
              Schedule Free Consultation
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        )
      }}
      secondaryCTA={{
        text: "Learn Your Rights",
        href: "#consumer-rights"
      }}
      trustBadge={{
        text: "Over 50 Years Combined Experience",
        icon: <Shield className="h-5 w-5 text-bennett-gold" />
      }}
      stats={heroStats}
      variant="gradient"
    />
  );

  const sidebarContent = (
    <>
      <EnhancedCard variant="glass" className="p-8 hover:shadow-2xl transition-all duration-500">
        <TableOfContents />
      </EnhancedCard>
      
      <EnhancedCard variant="gradient" className="bg-gradient-to-br from-bennett-navy via-slate-800 to-bennett-navy text-white p-8 hover:shadow-2xl transition-all duration-500">
        <ContactForm />
      </EnhancedCard>
      
      <EnhancedCard variant="glass" className="bg-gradient-to-br from-green-50/80 via-blue-50/80 to-green-50/80 p-8 border-2 border-green-200/50">
        <div className="space-y-8">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">50+</div>
            <div className="text-sm text-green-700 font-semibold">Years Combined Legal Experience</div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">$75K</div>
            <div className="text-sm text-blue-700 font-semibold">Average Homeowner Loss</div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Phone className="h-5 w-5 text-bennett-gold" />
              <span className="font-bold text-bennett-navy">(214) 473-5897</span>
            </div>
            <div className="text-sm text-bennett-slate">Free Consultation Available</div>
          </div>
        </div>
      </EnhancedCard>
    </>
  );

  return (
    <>
      <Helmet>
        <title>Texas Solar Panel Fraud Attorney | Bennett Legal - Consumer Protection</title>
        <meta name="description" content="Experienced Texas solar panel fraud attorney. Free consultation for victims of solar scams. Recover losses, cancel contracts, and get justice. Call Bennett Legal today." />
        <meta name="keywords" content="Texas solar panel fraud attorney, solar scam lawyer, solar fraud legal help, consumer protection attorney Texas, solar panel lawsuit, Bennett Legal" />
        <link rel="canonical" href="https://solarpanelfraud.org/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Texas Solar Panel Fraud Attorney | Bennett Legal" />
        <meta property="og:description" content="Expert legal help for solar panel fraud victims in Texas. Free consultation, proven results, consumer protection specialists." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://solarpanelfraud.org/" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LegalService",
            "name": "Bennett Legal",
            "description": "Texas solar panel fraud attorney specializing in consumer protection and solar scam recovery",
            "url": "https://solarpanelfraud.org",
            "telephone": "+1-214-473-5897",
            "address": {
              "@type": "PostalAddress",
              "addressRegion": "TX",
              "addressCountry": "US"
            },
            "areaServed": {
              "@type": "State",
              "name": "Texas"
            },
            "serviceType": "Consumer Protection Law",
            "priceRange": "Free Consultation",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "50"
            }
          })}
        </script>
      </Helmet>
      <PageTemplate
      heroSection={heroSection}
      sidebarContent={sidebarContent}
      showReadingProgress={true}
    >
      <div className="max-w-5xl">
        <h1 className="sr-only">The Ultimate Guide to Understanding and Fighting Solar Panel Fraud in Texas</h1>
        
        {/* Enhanced intro section */}
        <div className="mb-20">
          <div className="prose prose-xl max-w-none">
            <p className="text-2xl md:text-3xl text-bennett-slate mb-12 leading-relaxed font-light bg-gradient-to-r from-bennett-slate via-gray-600 to-bennett-slate bg-clip-text text-transparent">
              As solar energy gains popularity across Texas, unscrupulous companies are taking advantage of homeowners through deceptive sales tactics, substandard installations, and outright fraud. At Bennett Legal, we're dedicated to helping victims of solar fraud understand their rights and pursue justice through multiple legal avenues.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-8 mb-12">
              <h2 className="text-xl font-bold text-bennett-navy mb-4">Essential Resources for Homeowners</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <a href="/blog/free-ebook-texas-solar-fraud-guide" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="font-semibold text-blue-600 mb-2">FREE Legal Guide</div>
                  <div className="text-sm text-gray-600">Download our complete protection manual</div>
                </a>
                <a href="/blog/how-to-spot-solar-panel-scams-texas" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="font-semibold text-blue-600 mb-2">Spot Red Flags</div>
                  <div className="text-sm text-gray-600">Learn to identify solar scams</div>
                </a>
                <a href="/blog/texas-homeowners-legal-rights-solar-fraud" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="font-semibold text-blue-600 mb-2">Know Your Rights</div>
                  <div className="text-sm text-gray-600">Understanding legal protections</div>
                </a>
              </div>
            </div>
          </div>
          
          <EnhancedCard variant="glass" className="p-10 mb-16 group">
            <AuthorInfo />
          </EnhancedCard>
        </div>
        
        {/* Enhanced content sections with better spacing */}
        <div className="space-y-24">
          <section className="scroll-mt-24" id="growing-problem">
            <div className="animate-fade-in">
              <GrowingProblem />
            </div>
          </section>
          
          <div className="transform hover:scale-[1.01] transition-all duration-500">
            <EnhancedCard variant="gradient" className="overflow-hidden">
              <LawyerExpertiseCTA />
            </EnhancedCard>
          </div>
          
          <section className="scroll-mt-24" id="victim-signs">
            <div className="animate-slide-up">
              <VictimSigns />
            </div>
          </section>
          
          <div className="transform hover:scale-[1.01] transition-all duration-500">
            <EnhancedCard variant="elevated" className="overflow-hidden">
              <ShareYourStoryCTA />
            </EnhancedCard>
          </div>
          
          <section className="scroll-mt-24" id="consumer-rights">
            <div className="animate-fade-in">
              <ConsumerRights />
            </div>
          </section>
          
          <section className="scroll-mt-24" id="case-studies">
            <div className="animate-slide-up">
              <CaseStudies />
            </div>
          </section>
          
          <section className="scroll-mt-24" id="prevention">
            <div className="animate-fade-in">
              <Prevention />
            </div>
          </section>
          
          <section className="scroll-mt-24" id="how-we-help">
            <div className="animate-slide-up">
              <HowWeHelp />
            </div>
          </section>
          
          <section className="scroll-mt-24" id="faq">
            <div className="animate-fade-in">
              <FAQ />
            </div>
          </section>
        </div>
        
        <div className="mt-24 transform hover:scale-[1.02] transition-all duration-500">
          <CallToAction />
        </div>
      </div>
    </PageTemplate>
    </>
  );
};

export default Index;
