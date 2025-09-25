
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-bennett-navy text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Bennett Legal</h3>
            <p className="text-gray-300 mb-4">
              Protecting Texans from consumer fraud and deceptive business practices.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/BennettInjuryLaw" className="text-white hover:text-bennett-gold transition-colors">
                <span className="sr-only">Facebook</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://twitter.com/BennettLegal_" className="text-white hover:text-bennett-gold transition-colors">
                <span className="sr-only">Twitter</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/bennettlegal" className="text-white hover:text-bennett-gold transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Contact</h3>
            <p className="text-gray-300 mb-2">12770 Coit Rd Suite 720</p>
            <p className="text-gray-300 mb-2">Dallas, TX 75215</p>
            <p className="text-gray-300 mb-2">Phone: (214) 473-5897</p>
            <p className="text-gray-300 mb-2">Email: cbennett@bennettlegal.com</p>
            
            <div className="mt-4 h-48 rounded-lg overflow-hidden">
              <iframe 
                title="Bennett Legal Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3355.2775948!2d-96.8044!3d32.7471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864e99de08d4e8a7%3A0x5e4c0c65771099b1!2s1409%20S%20Lamar%20St%20Suite%2024%2C%20Dallas%2C%20TX%2075215!5e0!3m2!1sen!2sus!4v1715709135170!5m2!1sen!2sus"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/about" className="hover:text-bennett-gold transition-colors">About Us</a></li>
              <li><a href="/services" className="hover:text-bennett-gold transition-colors">Practice Areas</a></li>
              <li><a href="#" className="hover:text-bennett-gold transition-colors">Client Resources</a></li>
              <li><a href="#contact" className="hover:text-bennett-gold transition-colors">Free Consultation</a></li>
              <li><a href="#" className="hover:text-bennett-gold transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="!text-gray-200">&copy; {new Date().getFullYear()} Bennett Legal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
