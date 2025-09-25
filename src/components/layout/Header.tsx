import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Phone, ChevronDown, Scale, Menu, X, Calendar } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCalApi } from "@calcom/embed-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/20 py-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-bennett-navy">
            <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
              <div className="p-2 bg-bennett-gold rounded-xl">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-bennett-gold">Solar Panel</span>
                <span className="block text-lg leading-tight">Consumer Resources</span>
              </div>
            </Link>
          </h1>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav>
            <ul className="flex gap-8 items-center">
              <li>
                <Link 
                  to="/about" 
                  className="text-bennett-slate hover:text-bennett-navy transition-all duration-300 font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bennett-gold focus:ring-opacity-50 rounded px-2 py-1"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  className="text-bennett-slate hover:text-bennett-navy transition-all duration-300 font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bennett-gold focus:ring-opacity-50 rounded px-2 py-1"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-bennett-slate hover:text-bennett-navy transition-all duration-300 font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bennett-gold focus:ring-opacity-50 rounded px-2 py-1"
                >
                  Blog
                </Link>
              </li>
              <li>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100/50 focus:bg-transparent data-[state=open]:bg-gray-100/50 text-bennett-slate hover:text-bennett-navy transition-all duration-300 font-medium text-base">
                        Resources
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[320px] gap-3 p-6 md:w-[450px] bg-white/95 backdrop-blur-md border border-gray-200/20 shadow-xl rounded-2xl">
                          <ListItem href="/identifying-solar-scams" title="Identifying Solar Panel Scams">
                            Learn how to spot common solar panel fraud tactics in Texas
                          </ListItem>
                          <ListItem href="/legal-rights-protections" title="Your Legal Rights & Protections">
                            Understand the laws that protect Texas consumers from solar fraud
                          </ListItem>
                          <ListItem href="/reporting-seeking-help" title="Reporting Fraud & Seeking Help">
                            Step-by-step guide on reporting fraud and getting legal assistance
                          </ListItem>
                          <ListItem href="/prevention-guide" title="Prevention Guide: Protect Yourself">
                            Practical tips to avoid falling victim to solar panel scams
                          </ListItem>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-bennett-slate hover:text-bennett-navy transition-all duration-300 font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bennett-gold focus:ring-opacity-50 rounded px-2 py-1"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
          <div className="flex items-center gap-4">
            {/*
            <Button 
              className="bg-bennett-gold hover:bg-bennett-gold/90 text-bennett-navy font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bennett-navy focus:ring-opacity-50 flex items-center gap-2"
              onClick={openCal}
            >
              <Calendar className="h-4 w-4" />
              Schedule Free Consultation
            </Button>
            */}
            <Button
              data-cal-namespace="client-interviews"
              data-cal-link="ana/client-interviews"
              data-cal-origin="https://calendar.bennettlegal.com"
              data-cal-config='{"layout":"month_view"}'
              className="bg-bennett-gold hover:bg-bennett-gold/90 text-bennett-navy font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bennett-navy focus:ring-opacity-50 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule Free Consultation
            </Button>
            <Button 
              asChild
              className="bg-bennett-navy hover:bg-navy/90 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bennett-gold focus:ring-opacity-50 flex items-center gap-2"
            >
              <a href="tel:2144735897">
                <Avatar className="w-6 h-6 bg-bennett-navy">
                  <AvatarImage src="/lovable-uploads/b9eed837-d3e3-4439-9e6d-a416f2c12d78.png" alt="Charles Bennett" />
                  <AvatarFallback className="text-xs text-white font-serif">CB</AvatarFallback>
                </Avatar>
                <Phone className="h-4 w-4" /> (214) 473-5897
              </a>
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-gray-100/50 rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/20 shadow-lg">
          <nav className="container mx-auto py-6">
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/about" 
                  className="block text-bennett-slate hover:text-bennett-navy transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-100/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  className="block text-bennett-slate hover:text-bennett-navy transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-100/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="block text-bennett-slate hover:text-bennett-navy transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-100/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
              </li>
              <li>
                <div className="px-4 py-2">
                  <div className="text-bennett-slate font-medium mb-2">Resources</div>
                  <ul className="space-y-2 ml-4">
                    <li>
                      <Link 
                        to="/identifying-solar-scams" 
                        className="block text-sm text-bennett-slate hover:text-bennett-navy transition-colors py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Identifying Solar Panel Scams
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/legal-rights-protections" 
                        className="block text-sm text-bennett-slate hover:text-bennett-navy transition-colors py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Your Legal Rights & Protections
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/reporting-seeking-help" 
                        className="block text-sm text-bennett-slate hover:text-bennett-navy transition-colors py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Reporting Fraud & Seeking Help
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/prevention-guide" 
                        className="block text-sm text-bennett-slate hover:text-bennett-navy transition-colors py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Prevention Guide
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="block text-bennett-slate hover:text-bennett-navy transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-100/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
              </li>
              <li className="px-4 pt-4 space-y-3">
                <Button 
                  className="w-full bg-bennett-gold hover:bg-bennett-gold/90 text-bennett-navy font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                  onClick={openCal}
                >
                  <Calendar className="h-4 w-4" />
                  Schedule Free Consultation
                </Button>
                <Button className="w-full bg-bennett-navy hover:bg-bennett-navy/90 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                  <Avatar className="w-6 h-6 bg-bennett-navy">
                    <AvatarImage src="/lovable-uploads/b9eed837-d3e3-4439-9e6d-a416f2c12d78.png" alt="Charles Bennett" />
                    <AvatarFallback className="text-xs text-white font-serif">CB</AvatarFallback>
                  </Avatar>
                  <Phone className="h-4 w-4" /> (214) 473-5897
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-2 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-gradient-to-r hover:from-bennett-gold/10 hover:to-bennett-navy/5 hover:scale-105 border border-transparent hover:border-bennett-gold/20 focus:outline-none focus:ring-2 focus:ring-bennett-gold focus:ring-opacity-50",
            className
          )}
          {...props}
        >
          <div className="text-base font-semibold leading-none text-bennett-navy">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-bennett-slate">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Header;
