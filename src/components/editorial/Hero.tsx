
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, Shield, Star, CheckCircle2, Award, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import AirtableFormDialog from '@/components/ui/airtable-form-dialog';

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-bennett-navy via-slate-900 to-bennett-navy/90 text-white overflow-hidden">
      {/* Advanced Background Elements */}
      <div className="absolute inset-0">
        {/* Primary gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(201,154,46,0.15)_0%,transparent_60%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.1)_0%,transparent_60%)]"></div>
        
        {/* Animated floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-bennett-gold/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400/5 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-32 w-20 h-20 bg-bennett-gold/10 rounded-full blur-sm animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Sophisticated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        
        {/* Diagonal accent line */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-bennett-gold/10 via-transparent to-transparent transform skew-x-12"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-20 md:py-32 flex items-center min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Main Content */}
            <div className="space-y-8">
              {/* Trust Badge with sophisticated design */}
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 mb-8 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-bennett-gold" />
                  <span className="text-sm font-semibold">Trusted by 200+ Texas Families</span>
                </div>
                <div className="flex gap-1 ml-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-bennett-gold text-bennett-gold" />
                  ))}
                </div>
              </div>
              
              {/* Enhanced headline with better typography */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-bennett-gold mb-4">
                  <AlertTriangle size={28} className="animate-pulse" />
                  <span className="uppercase text-sm font-bold tracking-widest">Texas Consumer Protection</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight">
                  <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                    Fight Solar
                  </span>
                  <span className="block bg-gradient-to-r from-bennett-gold via-yellow-400 to-bennett-gold bg-clip-text text-transparent mt-2">
                    Panel Fraud
                  </span>
                  <span className="block text-white/90 text-4xl md:text-5xl xl:text-6xl mt-4 font-medium">
                    in Texas
                  </span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-2xl font-light">
                As solar energy grows in popularity across Texas, so do deceptive practices and outright scams. 
                <span className="text-bennett-gold font-semibold block mt-2">Learn how to protect yourself</span> 
                and what legal options are available if you've been victimized.
              </p>
              
              {/* Enhanced CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <AirtableFormDialog 
                  title="Get Your Free Case Review" 
                  description="Complete our form to receive a confidential consultation about your solar fraud case"
                >
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-bennett-gold to-yellow-500 hover:from-bennett-gold/90 hover:to-yellow-500/90 text-bennett-navy font-bold px-12 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-bennett-gold/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group relative overflow-hidden w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center">
                      Get Free Case Review 
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </AirtableFormDialog>
                
                <Link to="/legal-rights-protections">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-white/40 text-white hover:bg-white/15 hover:text-white hover:border-white/60 font-semibold px-12 py-6 text-lg rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 w-full sm:w-auto"
                  >
                    Learn Your Rights
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Column - Statistics Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-bennett-gold/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-bennett-gold" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">300%</div>
                  <div className="text-gray-300 text-sm leading-relaxed">Increase in solar fraud complaints in Texas</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">$40K+</div>
                  <div className="text-gray-300 text-sm leading-relaxed">Average homeowner loss from solar fraud</div>
                </div>
              </div>
              
              <div className="space-y-6 mt-12">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">$2.5M+</div>
                  <div className="text-gray-300 text-sm leading-relaxed">Recovered for fraud victims</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">50+</div>
                  <div className="text-gray-300 text-sm leading-relaxed">Years combined legal experience</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Trust Indicators */}
          <div className="mt-24 pt-12 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-6 text-center">Trusted by leading consumer protection organizations</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                <div className="text-xs font-semibold tracking-wider">TEXAS STATE BAR</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                <div className="text-xs font-semibold tracking-wider">CONSUMER PROTECTION</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                <div className="text-xs font-semibold tracking-wider">BBB ACCREDITED</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
