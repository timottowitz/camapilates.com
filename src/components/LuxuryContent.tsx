'use client';

import React from 'react';
import { motion } from 'framer-motion';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const Separator = () => (
  <div className="w-full h-[1px] bg-[#2A2624] opacity-10 my-4" />
);

export default function LuxuryContent() {
  return (
    <div className="bg-[#EAE8E4] text-[#2A2624] min-h-screen w-full selection:bg-[#3E2723] selection:text-white">
      
      {/* --- SECTION 1: PHILOSOPHY (Editorial Split) --- */}
      <section className="w-full max-w-[1800px] mx-auto px-8 md:px-24 py-32 md:py-48 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-start">
        <div className="md:col-span-5 sticky top-32">
            <FadeIn>
                <h2 className="text-4xl md:text-6xl font-serif italic leading-tight mb-8">
                    Form follows <br/>
                    <span className="not-italic font-sans font-light tracking-tighter">Function.</span>
                </h2>
                <div className="w-12 h-[1px] bg-[#3E2723] mb-8"></div>
                <p className="font-sans font-light text-lg leading-relaxed text-[#5D5550]">
                    We believe the equipment you use should be as refined as the movement it supports. 
                    Our reformers are not merely gym equipment; they are architectural statements 
                    crafted from sustainable walnut and aerospace-grade aluminum.
                </p>
            </FadeIn>
        </div>
        
        <div className="md:col-span-7 flex flex-col gap-12 md:mt-24">
            <FadeIn delay={0.2}>
                <div className="aspect-[4/3] w-full bg-[#D6D3CD] rounded-sm overflow-hidden relative group">
                     {/* Placeholder for High-End Image */}
                     <div className="absolute inset-0 flex items-center justify-center text-[#2A2624]/20 text-xs tracking-widest uppercase">
                        [ Image: Close up of wood grain ]
                     </div>
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700" />
                </div>
                <div className="flex justify-between mt-4 font-sans text-xs tracking-[0.2em] uppercase text-[#5D5550]">
                    <span>Sustainable Harvest</span>
                    <span>American Walnut</span>
                </div>
            </FadeIn>
            
            <FadeIn delay={0.4}>
                <div className="aspect-[16/9] w-full bg-[#D6D3CD] rounded-sm overflow-hidden relative mt-12">
                     {/* Placeholder for High-End Image */}
                     <div className="absolute inset-0 flex items-center justify-center text-[#2A2624]/20 text-xs tracking-widest uppercase">
                        [ Image: Woman stretching, soft light ]
                     </div>
                </div>
                <div className="flex justify-between mt-4 font-sans text-xs tracking-[0.2em] uppercase text-[#5D5550]">
                    <span>The Studio Series</span>
                    <span>2024 Collection</span>
                </div>
            </FadeIn>
        </div>
      </section>

      {/* --- SECTION 2: TECHNICAL SPECIFICATIONS (Minimalist List) --- */}
      <section className="w-full bg-[#E3E0DB] py-32">
        <div className="max-w-[1800px] mx-auto px-8 md:px-24">
            <FadeIn>
                <div className="flex flex-col md:flex-row justify-between items-end mb-24">
                    <h3 className="text-3xl md:text-5xl font-light tracking-tight max-w-lg">
                        Engineered for <span className="font-serif italic">Silence</span>
                    </h3>
                    <p className="text-xs font-sans tracking-[0.2em] uppercase mt-8 md:mt-0 opacity-60">
                        Specification 02
                    </p>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2A2624]/10 border-t border-b border-[#2A2624]/10">
                {/* Feature 1 */}
                <div className="bg-[#E3E0DB] py-12 md:pr-12 group hover:bg-[#DDDCD7] transition-colors duration-500">
                    <FadeIn delay={0.1}>
                        <span className="block text-xs tracking-[0.2em] text-[#3E2723] mb-6">01. MATERIALS</span>
                        <h4 className="text-2xl font-serif italic mb-4">Solid Walnut</h4>
                        <p className="text-sm text-[#5D5550] leading-relaxed font-light max-w-xs">
                            Sourced from sustainable forests in Pennsylvania. Hand-finished with natural oils to preserve the grain's organic texture.
                        </p>
                    </FadeIn>
                </div>

                {/* Feature 2 */}
                <div className="bg-[#E3E0DB] py-12 md:px-12 border-t md:border-t-0 md:border-l border-[#2A2624]/10 group hover:bg-[#DDDCD7] transition-colors duration-500">
                    <FadeIn delay={0.2}>
                        <span className="block text-xs tracking-[0.2em] text-[#3E2723] mb-6">02. MECHANICS</span>
                        <h4 className="text-2xl font-serif italic mb-4">Whisper Glide™</h4>
                        <p className="text-sm text-[#5D5550] leading-relaxed font-light max-w-xs">
                            Our proprietary 8-wheel carriage system ensures zero friction and zero noise, allowing for pure mental focus.
                        </p>
                    </FadeIn>
                </div>

                {/* Feature 3 */}
                <div className="bg-[#E3E0DB] py-12 md:pl-12 border-t md:border-t-0 md:border-l border-[#2A2624]/10 group hover:bg-[#DDDCD7] transition-colors duration-500">
                    <FadeIn delay={0.3}>
                        <span className="block text-xs tracking-[0.2em] text-[#3E2723] mb-6">03. TOUCH</span>
                        <h4 className="text-2xl font-serif italic mb-4">Full Grain</h4>
                        <p className="text-sm text-[#5D5550] leading-relaxed font-light max-w-xs">
                            Upholstered in premium full-grain leather that breathes and ages beautifully, providing superior grip and comfort.
                        </p>
                    </FadeIn>
                </div>
            </div>
        </div>
      </section>

      {/* --- SECTION 3: BIG TYPE QUOTE (Social Proof) --- */}
      <section className="w-full py-40 px-8 md:px-24 flex flex-col items-center justify-center text-center">
        <FadeIn>
            <div className="text-xs tracking-[0.3em] uppercase mb-12 text-[#3E2723]">The Review</div>
            <blockquote className="max-w-4xl mx-auto">
                <p className="text-3xl md:text-6xl font-serif leading-[1.2] text-[#2A2624]">
                    "Finally, a reformer that doesn't look like industrial machinery. It is a piece of furniture that <span className="italic text-[#3E2723]">invites</span> movement."
                </p>
                <footer className="mt-12 font-sans font-medium text-sm tracking-widest uppercase opacity-60">
                    — Architectural Digest
                </footer>
            </blockquote>
        </FadeIn>
      </section>

      {/* --- SECTION 4: CTA / FOOTER --- */}
      <footer className="bg-[#2A2624] text-[#EAE8E4] pt-32 pb-12 px-8 md:px-24">
        <div className="max-w-[1800px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24">
                <div>
                    <h2 className="text-5xl md:text-8xl font-serif italic mb-6">
                        Begin your <br/>
                        <span className="font-sans not-italic font-light">Practice.</span>
                    </h2>
                    <button className="mt-8 bg-[#EAE8E4] text-[#2A2624] px-10 py-4 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors">
                        Shop the Reformer
                    </button>
                </div>
                <div className="mt-12 md:mt-0 text-right hidden md:block">
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Crafted in</p>
                    <p className="text-xl font-serif italic">Los Angeles, CA</p>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 text-xs uppercase tracking-[0.15em] opacity-60 font-sans">
                <div className="flex flex-col gap-4">
                    <a href="#" className="hover:opacity-100 transition-opacity">Shop</a>
                    <a href="#" className="hover:opacity-100 transition-opacity">About</a>
                    <a href="#" className="hover:opacity-100 transition-opacity">Journal</a>
                </div>
                <div className="flex flex-col gap-4">
                    <a href="#" className="hover:opacity-100 transition-opacity">Instagram</a>
                    <a href="#" className="hover:opacity-100 transition-opacity">Pinterest</a>
                    <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
                </div>
                <div className="col-span-2 md:text-right flex flex-col justify-end">
                    <p>&copy; 2024 AeroPilates. All Rights Reserved.</p>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
