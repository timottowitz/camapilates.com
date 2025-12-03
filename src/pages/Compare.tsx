import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin, generateCompareSchema } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { Check, ArrowRight, Star, Shield, Truck, Clock } from 'lucide-react';
import { ContextualImage } from '@/components/ContextualImage';
import { motion } from 'framer-motion';

const Compare = () => {
  const origin = getOrigin();
  const title = 'The Collection | Edelweiss Pilates';
  const desc = 'Compare our professional and home reformer models. German engineering, Mexican soul. 3-week delivery.';

  const [activeTab, setActiveTab] = useState<'overview' | 'specs'>('overview');

  const compareSchema = generateCompareSchema();

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/compare`} />
        <script type="application/ld+json">
          {JSON.stringify(compareSchema)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <div className="text-center mb-16">
          <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
            Handcrafted in Mexico City
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
            The Collection
          </h1>
          <p className="text-lg text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed">
            Two distinct models, one shared philosophy: absolute silence, organic materials, and precision engineering.
          </p>
        </div>

        {/* Model Split */}
        <div className="grid lg:grid-cols-2 gap-8 mb-24">
          {/* Home Model */}
          <div className="group relative bg-[#EAE8E4] rounded-sm overflow-hidden border border-[#2A2624]/10 hover:border-[#2A2624]/30 transition-colors duration-500">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src="/images/compare-home.png"
                alt="Edelweiss Home Reformer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-serif italic text-[#2A2624] mb-2">The Home</h2>
                  <p className="text-xs uppercase tracking-widest text-[#5D5550]">For Your Sanctuary</p>
                </div>
                <div className="text-xl font-serif italic text-[#2A2624]">$35,000</div>
              </div>
              <p className="text-[#5D5550] font-light mb-8 leading-relaxed">
                Compact footprint without compromising the smooth, silent glide. Designed to blend seamlessly into your living space.
              </p>
              <ul className="space-y-3 mb-8 border-t border-[#2A2624]/10 pt-6">
                <li className="flex items-center gap-3 text-sm text-[#5D5550]">
                  <Check className="w-4 h-4 text-[#3E2723]" /> Compact Design
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550]">
                  <Check className="w-4 h-4 text-[#3E2723]" /> Silent Glide Technology
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550]">
                  <Check className="w-4 h-4 text-[#3E2723]" /> American Walnut & Leather
                </li>
              </ul>
              <Link
                to="/product/reformer-casa"
                className="inline-flex items-center justify-center w-full px-6 py-4 bg-[#EAE8E4] border border-[#2A2624] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors"
              >
                Shop Home
              </Link>
            </div>
          </div>

          {/* Professional Model */}
          <div className="group relative bg-[#2A2624] text-[#EAE8E4] rounded-sm overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity">
              <img
                src="/images/compare-pro.png"
                alt="Edelweiss Professional Reformer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-serif italic text-[#EAE8E4] mb-2">The Professional</h2>
                  <p className="text-xs uppercase tracking-widest text-white/60">For The Studio</p>
                </div>
                <div className="text-xl font-serif italic text-[#EAE8E4]">$50,000</div>
              </div>
              <p className="text-white/70 font-light mb-8 leading-relaxed">
                Engineered for continuous use. Reinforced structure, extended carriage, and complete accessory kit for the demanding instructor.
              </p>
              <ul className="space-y-3 mb-8 border-t border-white/10 pt-6">
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Check className="w-4 h-4 text-[#EAE8E4]" /> Heavy-Duty Construction
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Check className="w-4 h-4 text-[#EAE8E4]" /> Full Accessory Suite
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Check className="w-4 h-4 text-[#EAE8E4]" /> Studio Warranty
                </li>
              </ul>
              <Link
                to="/product/reformer-profesional"
                className="inline-flex items-center justify-center w-full px-6 py-4 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
              >
                Shop Professional
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-[#2A2624]/10 mb-24">
          <div className="text-center">
            <Shield className="w-6 h-6 mx-auto text-[#3E2723] mb-3" />
            <h3 className="text-xs uppercase tracking-widest text-[#2A2624] mb-1">1 Year Warranty</h3>
            <p className="text-[10px] text-[#5D5550]">Comprehensive coverage</p>
          </div>
          <div className="text-center">
            <Truck className="w-6 h-6 mx-auto text-[#3E2723] mb-3" />
            <h3 className="text-xs uppercase tracking-widest text-[#2A2624] mb-1">Nationwide Shipping</h3>
            <p className="text-[10px] text-[#5D5550]">Secure delivery across Mexico</p>
          </div>
          <div className="text-center">
            <Clock className="w-6 h-6 mx-auto text-[#3E2723] mb-3" />
            <h3 className="text-xs uppercase tracking-widest text-[#2A2624] mb-1">3 Week Delivery</h3>
            <p className="text-[10px] text-[#5D5550]">Handcrafted to order</p>
          </div>
          <div className="text-center">
            <Star className="w-6 h-6 mx-auto text-[#3E2723] mb-3" />
            <h3 className="text-xs uppercase tracking-widest text-[#2A2624] mb-1">Premium Materials</h3>
            <p className="text-[10px] text-[#5D5550]">Walnut, Leather, Steel</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-24">
          <h2 className="text-3xl font-serif italic text-[#2A2624] mb-12 text-center">Technical Comparison</h2>

          <div className="bg-white/50 backdrop-blur-sm rounded-sm border border-[#2A2624]/10 overflow-hidden">
            <div className="grid grid-cols-3 border-b border-[#2A2624]/10 bg-[#2A2624]/5">
              <div className="p-6 font-serif italic text-[#2A2624]">Feature</div>
              <div className="p-6 font-serif italic text-[#2A2624] text-center">Home</div>
              <div className="p-6 font-serif italic text-[#2A2624] text-center">Professional</div>
            </div>

            {[
              { label: 'Ideal For', home: 'Home Use (1-2 users)', pro: 'Studio / Commercial' },
              { label: 'Structure', home: 'Walnut & Standard Steel', pro: 'Walnut & Reinforced Steel' },
              { label: 'Carriage', home: 'Silent Glide', pro: 'Silent Glide + Heavy Duty' },
              { label: 'Footbar', home: '3 Positions', pro: '5 Positions Quick-Adjust' },
              { label: 'Springs', home: '5 Standard', pro: '5 High-Precision' },
              { label: 'Box & Jumpboard', home: 'Included', pro: 'Included (Studio Grade)' },
              { label: 'Warranty', home: '1 Year', pro: '1 Year Commercial' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 border-b border-[#2A2624]/10 last:border-0 hover:bg-white/50 transition-colors">
                <div className="p-6 text-sm font-medium text-[#2A2624]">{row.label}</div>
                <div className="p-6 text-sm text-[#5D5550] text-center font-light">{row.home}</div>
                <div className="p-6 text-sm text-[#5D5550] text-center font-light">{row.pro}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Studio Pack CTA */}
        <div className="bg-[#2A2624] text-[#EAE8E4] rounded-sm p-12 md:p-24 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-white/50 mb-6">
              For Studio Owners
            </span>
            <h2 className="text-4xl md:text-5xl font-serif italic leading-tight mb-8">
              Equipping a Studio?
            </h2>
            <p className="text-lg text-white/70 font-light mb-12 leading-relaxed">
              We offer exclusive pricing for orders of 8+ units, including coordinated installation and priority support.
            </p>
            <Link
              to="/packs/estudio"
              className="inline-flex items-center px-8 py-4 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
            >
              View Studio Packs
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-3xl font-serif italic text-[#2A2624] mb-12 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How long does delivery take?', a: 'We deliver nationwide in Mexico within 3 weeks. International shipping times vary by location.' },
              { q: 'Do you offer financing?', a: 'Yes, we accept all major credit cards and offer financing options for studio orders.' },
              { q: 'Can I customize the finish?', a: 'We offer standard Walnut and Black finishes. Custom finishes are available for bulk orders.' },
              { q: 'Is assembly required?', a: 'Our reformers arrive 90% assembled. Final setup takes about 20 minutes with included tools.' }
            ].map((faq, i) => (
              <details key={i} className="group bg-transparent border-b border-[#2A2624]/10 pb-4">
                <summary className="font-sans text-lg text-[#2A2624] cursor-pointer hover:text-[#3E2723] transition-colors list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-[#3E2723] group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="mt-4 text-[#5D5550] font-light leading-relaxed">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default Compare;
