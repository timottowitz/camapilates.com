
import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageTemplate from '@/components/layout/PageTemplate';
import StandardHero from '@/components/layout/StandardHero';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import SectionHeader from '@/components/ui/section-header';
import { Scale, Users, Award, CheckCircle2, Phone, Mail, Clock, Shield, ArrowRight } from 'lucide-react';
import { getCalApi } from "@calcom/embed-react";
import { Button } from '@/components/ui/button';

const About = () => {
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
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' }
  ];

  const heroStats = [
    {
      value: '50+',
      label: 'Years Combined Experience',
      icon: <Award className="h-6 w-6 text-bennett-gold" />
    }
  ];

  const heroSection = (
    <StandardHero
      title="About Bennett Legal"
      subtitle="Experienced Consumer Protection Attorneys"
      description="With over 50 years of combined experience, Bennett Legal is dedicated to protecting Texas consumers from solar panel fraud and deceptive business practices through comprehensive legal advocacy."
      primaryCTA={{
        text: "Free Consultation",
        component: (
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-bennett-gold to-yellow-500 hover:from-bennett-gold/90 hover:to-yellow-500/90 text-bennett-navy font-bold px-12 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-bennett-gold/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
            onClick={openCal}
          >
            <span className="flex items-center">
              Free Consultation
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        )
      }}
      secondaryCTA={{
        text: "Our Services",
        href: "/services"
      }}
      trustBadge={{
        text: "Texas State Bar Certified"
      }}
      stats={heroStats}
      variant="gradient"
    />
  );

  const sidebarContent = (
    <>
      <EnhancedCard variant="glass" className="bg-blue-50/80 border-blue-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Scale className="h-8 w-8 text-blue-600" />
          <h3 className="text-xl font-bold text-blue-900 !m-0">Legal Expertise</h3>
        </div>
        <p className="text-blue-800 mb-4">
          Experienced in consumer protection law, fraud cases, arbitration, trials, and Texas regulations.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">(214) 473-5897</span>
          </div>
          <div className="text-sm text-blue-700">Schedule your consultation</div>
        </div>
      </EnhancedCard>

      <EnhancedCard variant="elevated" className="p-8">
        <h3 className="text-xl font-bold text-bennett-navy mb-6">Practice Areas</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-bennett-gold" />
            <span className="text-sm">Solar Panel Fraud</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-bennett-gold" />
            <span className="text-sm">Consumer Protection</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-bennett-gold" />
            <span className="text-sm">Deceptive Trade Practices</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-bennett-gold" />
            <span className="text-sm">Contract Disputes</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-bennett-gold" />
            <span className="text-sm">Litigation & Arbitration</span>
          </li>
        </ul>
      </EnhancedCard>
    </>
  );

  return (
    <>
      <Helmet>
        <title>About Bennett Legal | Experienced Texas Solar Fraud Attorneys</title>
        <meta name="description" content="Meet Charles Bennett and the legal team at Bennett Legal. Over 50 years combined experience protecting Texas consumers from solar panel fraud and deceptive practices." />
        <meta name="keywords" content="Charles Bennett attorney, Bennett Legal team, Texas consumer protection lawyer, solar fraud attorney experience, Texas legal services" />
        <link rel="canonical" href="https://solarpanelfraud.org/about" />
        
        {/* Open Graph */}
        <meta property="og:title" content="About Bennett Legal | Experienced Texas Solar Fraud Attorneys" />
        <meta property="og:description" content="Meet Charles Bennett and the legal team with over 50 years combined experience protecting Texas consumers from solar fraud." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://solarpanelfraud.org/about" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "mainEntity": {
              "@type": "Attorney",
              "name": "Charles Bennett",
              "jobTitle": "Consumer Protection Attorney",
              "worksFor": {
                "@type": "LegalService",
                "name": "Bennett Legal"
              },
              "areaOfLaw": "Consumer Protection",
              "yearsOfExperience": "15+",
              "specialization": "Solar Panel Fraud"
            }
          })}
        </script>
      </Helmet>
      <PageTemplate
      heroSection={heroSection}
      sidebarContent={sidebarContent}
      breadcrumbs={breadcrumbs}
      showReadingProgress={true}
    >
      <div className="space-y-24">
        <section>
          <SectionHeader
            title="Our Mission"
            description="Protecting Texas families from solar panel fraud and deceptive business practices"
            size="md"
          />
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <EnhancedCard variant="elevated" className="p-8">
              <div className="flex flex-col items-start gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-12 h-12 bg-bennett-gold/20 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-bennett-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-bennett-navy !m-0">Consumer Protection</h3>
                </div>
                <div>
                  <p className="text-bennett-slate">
                    We fight for homeowners who have been victimized by solar panel scams, helping them understand their legal options and pursue various claims for recovery under multiple consumer protection laws.
                  </p>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" className="p-8">
              <div className="flex flex-col items-start gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Scale className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-bennett-navy !m-0">Legal Excellence</h3>
                </div>
                <div>
                  <p className="text-bennett-slate">
                    Our team combines decades of experience in consumer law, litigation, arbitration, and trial advocacy with a deep understanding of emerging industry practices and their potential for consumer harm.
                  </p>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </section>

        <section>
          <SectionHeader
            title="Our Team"
            description="Experienced attorneys dedicated to consumer protection and litigation"
            size="md"
          />
          
          <EnhancedCard variant="gradient" className="bg-gradient-to-br from-bennett-navy to-slate-800 text-white p-12 mt-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-bennett-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scale className="h-12 w-12 text-bennett-gold" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Legal Expertise</h3>
                <p className="text-gray-300">Over 50 years of combined experience in consumer protection law, fraud cases, arbitration, and trial advocacy</p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-bennett-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-12 w-12 text-bennett-gold" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Client Focus</h3>
                <p className="text-gray-300">Dedicated to achieving the best possible outcomes through comprehensive legal advocacy and multiple claim strategies</p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-bennett-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-12 w-12 text-bennett-gold" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Proven Results</h3>
                <p className="text-gray-300">Extensive experience with litigation, arbitration, and trial advocacy in consumer protection matters</p>
              </div>
            </div>
          </EnhancedCard>
        </section>

        <section>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-8 mb-12">
            <h3 className="text-xl font-bold text-bennett-navy mb-4">Expert Legal Insights</h3>
            <p className="text-bennett-slate mb-6">Read our in-depth analysis and stay informed about solar fraud developments:</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-bennett-navy mb-3">Featured Investigation</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/blog/solar-fraud-crisis-2008-parallels" className="text-blue-600 hover:underline">Solar Fraud Crisis: 2008 Parallels</a></li>
                  <li><a href="/blog/texas-solar-panel-boom-fraud-crisis" className="text-blue-600 hover:underline">Why Texas Solar Boom Became a Nightmare</a></li>
                  <li><a href="/blog/texas-senate-bill-1036-solar-regulations" className="text-blue-600 hover:underline">Texas Senate Bill 1036 Analysis</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-bennett-navy mb-3">Legal Action Guides</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/blog/how-to-report-solar-panel-fraud" className="text-blue-600 hover:underline">Step-by-Step Fraud Reporting</a></li>
                  <li><a href="/services" className="text-blue-600 hover:underline">Our Legal Services</a></li>
                  <li><a href="/blog/free-ebook-texas-solar-fraud-guide" className="text-blue-600 hover:underline">FREE Protection Guide</a></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <section id="contact">
          <SectionHeader
            title="Contact Bennett Legal"
            description="Get the legal help you need to fight solar panel fraud"
            size="md"
          />
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <EnhancedCard variant="glass" className="p-8">
              <h3 className="text-xl font-bold text-bennett-navy mb-6">Office Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="min-w-5 h-5 w-5 text-bennett-gold" />
                  <span className="font-semibold">(214) 473-5897</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="min-w-5 h-5 w-5 text-bennett-gold" />
                  <span>cbennett@bennettlegal.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <Scale className="min-w-5 h-5 w-5 text-bennett-gold mt-1" />
                  <div>
                    <div>1409 S. Lamar Street Suite 24</div>
                    <div>Dallas, TX 75215</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="min-w-5 h-5 w-5 text-bennett-gold" />
                  <span>Available for urgent consumer protection matters</span>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" className="p-8">
              <h3 className="text-xl font-bold text-bennett-navy mb-6">Why Choose Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="min-w-5 h-5 w-5 text-green-500" />
                  <span>No upfront costs - contingency fees only</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="min-w-5 h-5 w-5 text-green-500" />
                  <span>Free initial consultation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="min-w-5 h-5 w-5 text-green-500" />
                  <span>Extensive litigation and arbitration experience</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="min-w-5 h-5 w-5 text-green-500" />
                  <span>Multiple legal claim strategies</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="min-w-5 h-5 w-5 text-green-500" />
                  <span>Personalized attention to every case</span>
                </li>
              </ul>
            </EnhancedCard>
          </div>
        </section>
      </div>
    </PageTemplate>
    </>
  );
};

export default About;
