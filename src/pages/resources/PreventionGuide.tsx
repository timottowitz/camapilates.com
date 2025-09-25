import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import StandardHero from '@/components/layout/StandardHero';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import SectionHeader from '@/components/ui/section-header';
import { Shield, AlertTriangle, CheckCircle2, Eye, Clock, FileText, Users, Phone } from 'lucide-react';

const PreventionGuide = () => {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Resources', href: '#' },
    { label: 'Prevention Guide', href: '/prevention-guide' }
  ];

  const heroStats = [
    {
      value: '90%',
      label: 'Scams Can Be Prevented',
      icon: <Shield className="h-6 w-6 text-green-400" />
    },
    {
      value: '24hrs',
      label: 'Cooling-Off Period',
      icon: <Clock className="h-6 w-6 text-blue-400" />
    }
  ];

  const heroSection = (
    <StandardHero
      title="Solar Scam Prevention Guide"
      subtitle="Protect Yourself from Fraud"
      description="Learn how to identify and avoid solar panel scams before they happen. Knowledge is your best defense against fraudulent solar companies."
      primaryCTA={{
        text: "Download Prevention Checklist",
        href: "#checklist"
      }}
      secondaryCTA={{
        text: "Report Suspicious Activity",
        href: "/reporting-seeking-help"
      }}
      trustBadge={{
        text: "Prevention is the Best Protection"
      }}
      stats={heroStats}
      variant="gradient"
    />
  );

  const sidebarContent = (
    <>
      <EnhancedCard variant="glass" className="bg-green-50/80 border-green-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-green-600" />
          <h3 className="text-xl font-bold text-green-900 !m-0">Stay Protected</h3>
        </div>
        <p className="text-green-800 mb-4">
          Follow our prevention guidelines to avoid becoming a victim of solar fraud.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span className="font-semibold">(214) 473-5897</span>
          </div>
          <div className="text-sm text-green-700">Call if you have concerns</div>
        </div>
      </EnhancedCard>

      <EnhancedCard variant="elevated" className="p-8">
        <h3 className="text-xl font-bold text-bennett-navy mb-6">Prevention Steps</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-bennett-gold" />
            <span className="text-sm">Research the company</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-bennett-gold" />
            <span className="text-sm">Get multiple quotes</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-bennett-gold" />
            <span className="text-sm">Read all contracts</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-bennett-gold" />
            <span className="text-sm">Verify credentials</span>
          </li>
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
        <section>
          <SectionHeader
            title="Red Flags to Watch For"
            description="Warning signs that indicate a potential solar scam"
            size="md"
          />
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <EnhancedCard variant="elevated" className="p-8">
              <div className="flex flex-col items-start gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-bennett-navy !m-0">High-Pressure Sales Tactics</h3>
                </div>
                <div>
                  <ul className="space-y-2 text-bennett-slate [&_li]:items-start">
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-red-500" />
                      <span>Sign today or lose this deal forever</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-red-500" />
                      <span>Refusing to leave your property</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-red-500" />
                      <span>Demanding immediate payment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-red-500" />
                      <span>Door-to-door sales with urgent offers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" className="p-8">
              <div className="flex flex-col items-start gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-bennett-navy !m-0">Too-Good-to-Be-True Offers</h3>
                </div>
                <div>
                  <ul className="space-y-2 text-bennett-slate [&_li]:items-start">
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-orange-500" />
                      <span>"Free" solar panel installations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-orange-500" />
                      <span>Guaranteed 90% savings claims</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-orange-500" />
                      <span>No-money-down promotions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-orange-500" />
                      <span>Prices significantly below market rate</span>
                    </li>
                  </ul>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" className="p-8">
              <div className="flex flex-col items-start gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-bennett-navy !m-0">Documentation Issues</h3>
                </div>
                <div>
                  <ul className="space-y-2 text-bennett-slate [&_li]:items-start">
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-yellow-500" />
                      <span>Incomplete or missing contracts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-yellow-500" />
                      <span>Refusal to provide written estimates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-yellow-500" />
                      <span>Vague or confusing contract terms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-yellow-500" />
                      <span>No proper licensing information</span>
                    </li>
                  </ul>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="elevated" className="p-8">
              <div className="flex flex-col items-start gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-bennett-navy !m-0">Company Credibility Issues</h3>
                </div>
                <div>
                  <ul className="space-y-2 text-bennett-slate [&_li]:items-start">
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-purple-500" />
                      <span>No physical business address</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-purple-500" />
                      <span>Unlicensed or uninsured contractors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-purple-500" />
                      <span>No verifiable customer references</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="min-w-3 mt-1.5 h-3 w-3 text-purple-500" />
                      <span>Poor Better Business Bureau rating</span>
                    </li>
                  </ul>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </section>

        <section id="checklist">
          <SectionHeader
            title="Protection Checklist"
            description="Essential steps to protect yourself from solar scams"
            size="md"
          />
          
          <EnhancedCard variant="gradient" className="bg-gradient-to-br from-bennett-navy to-slate-800 text-white p-12 mt-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-white text-2xl font-bold mb-6">Before Signing</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-bennett-gold" />
                    <span>Research the company thoroughly</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-bennett-gold" />
                    <span>Get multiple quotes and compare</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-bennett-gold" />
                    <span>Verify licenses and insurance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-bennett-gold" />
                    <span>Read all contract terms carefully</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-bennett-gold" />
                    <span>Check references and reviews</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white text-2xl font-bold mb-6">Contract Review</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-bennett-gold" />
                    <span>Understand all costs and fees</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-bennett-gold" />
                    <span>Know your cancellation rights</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-bennett-gold" />
                    <span>Verify warranty terms</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-bennett-gold" />
                    <span>Confirm installation timeline</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-bennett-gold" />
                    <span>Get everything in writing</span>
                  </li>
                </ul>
              </div>
            </div>
          </EnhancedCard>
        </section>

        <section>
          <SectionHeader
            title="What to Do If You Suspect Fraud"
            description="Immediate steps to take if you think you're being scammed"
            size="md"
          />
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <EnhancedCard variant="glass" className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-bennett-navy mb-3">Stop All Payments</h3>
              <p className="text-bennett-slate text-sm">
                Immediately stop any payments or financing related to the solar contract.
              </p>
            </EnhancedCard>

            <EnhancedCard variant="glass" className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-bennett-navy mb-3">Document Everything</h3>
              <p className="text-bennett-slate text-sm">
                Save all contracts, emails, recordings, and communication with the company.
              </p>
            </EnhancedCard>

            <EnhancedCard variant="glass" className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-bennett-navy mb-3">Get Legal Help</h3>
              <p className="text-bennett-slate text-sm">
                Contact Bennett Legal immediately for a free consultation and case evaluation.
              </p>
            </EnhancedCard>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

export default PreventionGuide;
