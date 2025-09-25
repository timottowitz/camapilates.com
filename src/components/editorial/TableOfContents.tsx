
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TableOfContents = () => {
  return (
    <aside className="bg-bennett-lightBlue p-6 rounded-lg mb-8">
      <h3 className="text-lg font-semibold mb-4 text-bennett-navy">In This Article</h3>
      <ul className="space-y-3 [&_li>a]:items-start">
        <li>
          <a href="#growing-problem" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center">
            <span className="mr-2">•</span>
            <span>The Growing Problem of Solar Panel Fraud in Texas</span>
          </a>
        </li>
        <li>
          <a href="#victim-signs" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center">
            <span className="mr-2">•</span>
            <span>Am I a Victim? Identifying the Signs of a Solar Panel Scam</span>
          </a>
        </li>
        <li>
          <a href="#consumer-rights" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center">
            <span className="mr-2">•</span>
            <span>Your Rights as a Texas Consumer</span>
          </a>
        </li>
        <li>
          <a href="#case-studies" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center">
            <span className="mr-2">•</span>
            <span>Case Studies & Scenarios</span>
          </a>
        </li>
        <li>
          <a href="#prevention" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center">
            <span className="mr-2">•</span>
            <span>Preventing Solar Panel Fraud</span>
          </a>
        </li>
        <li>
          <a href="#how-we-help" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center">
            <span className="mr-2">•</span>
            <span>How Bennett Legal Fights for Victims of Solar Fraud</span>
          </a>
        </li>
        <li>
          <a href="#faq" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center">
            <span className="mr-2">•</span>
            <span>Frequently Asked Questions</span>
          </a>
        </li>
      </ul>
      
      <div className="mt-6 pt-6 border-t border-bennett-navy/20">
        <h4 className="text-sm font-semibold mb-3 text-bennett-navy">Detailed Guides:</h4>
        <ul className="space-y-2">
          <li>
            <Link to="/identifying-solar-scams" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center text-sm">
              <ArrowRight className="mr-1 h-4 w-4" />
              <span>Identifying Solar Panel Scams in Texas</span>
            </Link>
          </li>
          <li>
            <Link to="/legal-rights-protections" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center text-sm">
              <ArrowRight className="mr-1 h-4 w-4" />
              <span>Your Legal Rights & Protections</span>
            </Link>
          </li>
          <li>
            <Link to="/reporting-seeking-help" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center text-sm">
              <ArrowRight className="mr-1 h-4 w-4" />
              <span>Reporting Fraud & Seeking Legal Help</span>
            </Link>
          </li>
          <li>
            <Link to="/prevention-guide" className="text-bennett-navy hover:text-bennett-gold transition-colors flex items-center text-sm">
              <ArrowRight className="mr-1 h-4 w-4" />
              <span>Prevention Guide: Protect Yourself</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default TableOfContents;
