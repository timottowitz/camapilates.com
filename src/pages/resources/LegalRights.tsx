import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import StandardHero from '@/components/layout/StandardHero';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import SectionHeader from '@/components/ui/section-header';
import { Scale, Shield, FileText, Users, Gavel, CheckCircle2, AlertTriangle, Phone } from 'lucide-react';

const LegalRights = () => {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Resources', href: '#' },
    { label: 'Legal Rights', href: '/legal-rights-protections' }
  ];

  const heroStats = [
    {
      value: '50+',
      label: 'Years Combined Experience',
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-400" />
    },
    {
      value: '$75K',
      label: 'Average Homeowner Loss',
      icon: <Scale className="h-6 w-6 text-bennett-gold" />
    }
  ];

  const heroSection = (
    <StandardHero
      title="Your Legal Rights & Protections"
      subtitle="Texas Consumer Protection Laws"
      description="Understand the comprehensive legal protections available to Texas consumers and how Bennett Legal can help you enforce your rights against fraudulent solar companies."
      primaryCTA={{
        text: "Know Your Rights",
        href: "#texas-laws"
      }}
      secondaryCTA={{
        text: "Free Legal Consultation",
        href: "#contact"
      }}
      trustBadge={{
        text: "Texas State Bar Certified Attorneys"
      }}
      stats={heroStats}
      variant="gradient"
    />
  );

  const sidebarContent = (
    <>
      <EnhancedCard variant="glass" className="bg-blue-50/80 border-blue-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <h3 className="text-xl font-bold text-blue-900 !m-0">Legal Protection</h3>
        </div>
        <p className="text-blue-800 mb-4">
          Texas has strong consumer protection laws. Understanding your rights is the first step to getting justice.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">(214) 473-5897</span>
          </div>
          <div className="text-sm text-blue-700">Free consultation available</div>
        </div>
      </EnhancedCard>

      <EnhancedCard variant="elevated" className="p-8">
        <h3 className="text-xl font-bold text-bennett-navy mb-6">Quick Reference</h3>
        <ul className="space-y-3">
          <li><a href="#texas-laws" className="text-bennett-slate hover:text-bennett-navy transition-colors">Texas DTPA</a></li>
          <li><a href="#federal-laws" className="text-bennett-slate hover:text-bennett-navy transition-colors">Federal Protections</a></li>
          <li><a href="#remedies" className="text-bennett-slate hover:text-bennett-navy transition-colors">Available Remedies</a></li>
          <li><a href="#enforcement" className="text-bennett-slate hover:text-bennett-navy transition-colors">Enforcement</a></li>
        </ul>
      </EnhancedCard>
    </>
  );

  return (
    <PageTemplate
      heroSection={heroSection}
      sidebarContent={sidebarContent}
      breadcrumbs={breadcrumbs}
      showReadingProgress={true}
    >
      <div className="space-y-24">
        <section id="texas-laws">
          <SectionHeader
            title="Texas Deceptive Trade Practices Act"
            description="Your primary protection against consumer fraud in Texas"
            size="md"
          />
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <EnhancedCard variant="elevated" className="p-8">
              <div className="flex flex-col items-start gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-bennett-navy !m-0">Prohibited Practices</h3>
                </div>
                <div>
                  <ul className="space-y-2 text-bennett-slate">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="min-w-3 h-3 w-3 text-red-500" />
                      <span>False or misleading statements</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="min-w-3 h-3 w-3 text-red-500" />
                      <span>Unconscionable actions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="min-w-3 h-3 w-3 text-red-500" />
                      <span>Failure to disclose material facts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" className="p-8">
              <div className="flex flex-col items-start gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-bennett-navy !m-0">Consumer Rights</h3>
                </div>
                <div>
                  <ul className="space-y-2 text-bennett-slate">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="min-w-3 h-3 w-3 text-green-500" />
                      <span>Right to honest dealings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="min-w-3 h-3 w-3 text-green-500" />
                      <span>Protection from deception</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="min-w-3 h-3 w-3 text-green-500" />
                      <span>Right to legal remedies</span>
                    </li>
                  </ul>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </section>

        <section id="federal-laws">
          <SectionHeader
            title="Federal Consumer Protections"
            description="Additional protections under federal law"
            size="md"
          />
          
          <div className="prose prose-xl max-w-none mt-12">
            <EnhancedCard variant="glass" className="p-10">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-bennett-navy mb-3">FTC Act</h3>
                  <p className="text-bennett-slate text-sm">Federal Trade Commission Act prohibits unfair or deceptive practices in commerce.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Scale className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-bennett-navy mb-3">Consumer Rights</h3>
                  <p className="text-bennett-slate text-sm">Right to cancel certain contracts within specified time periods.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Gavel className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-bennett-navy mb-3">Enforcement</h3>
                  <p className="text-bennett-slate text-sm">Private right of action allows individuals to seek damages in court.</p>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </section>

        <section id="remedies">
          <SectionHeader
            title="Available Legal Remedies"
            description="What you can recover when your rights are violated"
            size="md"
          />
          
          <EnhancedCard variant="gradient" className="bg-gradient-to-br from-bennett-navy to-slate-800 text-white p-12 mt-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-white text-2xl font-bold mb-6">Monetary Recovery</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="min-w-5 h-5 w-5 text-bennett-gold" />
                    <span>Actual economic damages</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="min-w-5 h-5 w-5 text-bennett-gold" />
                    <span>Additional damages up to $1,000</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="min-w-5 h-5 w-5 text-bennett-gold" />
                    <span>Treble damages for knowing violations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="min-w-5 h-5 w-5 text-bennett-gold" />
                    <span>Attorney fees and court costs</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white text-2xl font-bold mb-6">Other Remedies</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="min-w-5 h-5 w-5 text-bennett-gold" />
                    <span>Contract cancellation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="min-w-5 h-5 w-5 text-bennett-gold" />
                    <span>Restitution of payments</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="min-w-5 h-5 w-5 text-bennett-gold" />
                    <span>Injunctive relief</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="min-w-5 h-5 w-5 text-bennett-gold" />
                    <span>Mental anguish damages</span>
                  </li>
                </ul>
              </div>
            </div>
          </EnhancedCard>
        </section>
      </div>
    </PageTemplate>
  );
};

export default LegalRights;
