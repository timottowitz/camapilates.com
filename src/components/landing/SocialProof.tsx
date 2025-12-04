import React from 'react';
import { motion } from 'framer-motion';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const SocialProof: React.FC = () => {
  return (
    <section className="w-full bg-[#EAE8E4] py-24 md:py-32 px-8 md:px-24 flex flex-col items-center justify-center text-center">
      <FadeIn>
        <div className="text-xs tracking-[0.3em] uppercase mb-8 text-[#3E2723]">The Review</div>
        <blockquote className="max-w-3xl mx-auto">
          <p className="text-2xl md:text-5xl font-serif leading-[1.2] text-[#2A2624]">
            "Finally, a reformer that doesn't look like industrial machinery. 
            It is a piece of furniture that <span className="italic text-[#3E2723]">heals</span>."
          </p>
          <footer className="mt-8 font-sans font-medium text-sm tracking-widest uppercase opacity-60">
            — Architectural Digest
          </footer>
        </blockquote>
      </FadeIn>
    </section>
  );
};

export default SocialProof;
