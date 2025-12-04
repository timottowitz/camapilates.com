import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, ChevronRight } from 'lucide-react';

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

const CertificationTeaser: React.FC = () => {
  return (
    <section className="w-full bg-[#3E2723] text-[#EAE8E4] py-16 md:py-20">
      <div className="max-w-[1800px] mx-auto px-8 md:px-24">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-7 h-7 text-[#EAE8E4]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif italic mb-2">
                  Conviértete en Instructor Certificado
                </h2>
                <p className="text-white/60 font-light max-w-xl">
                  Programas de certificación en pilates reformer. Formación completa, 
                  acreditación internacional y oportunidades de empleo.
                </p>
              </div>
            </div>
            
            <Link
              to="/certificacion-pilates"
              className="inline-flex items-center gap-2 bg-[#EAE8E4] text-[#2A2624] px-8 py-4 rounded-full text-xs uppercase tracking-[0.15em] hover:bg-white transition-colors group whitespace-nowrap"
            >
              Ver Certificaciones
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default CertificationTeaser;
