
import React from 'react';
import { ExternalLink } from 'lucide-react';

const GrowingProblem = () => {
  return (
    <section id="growing-problem" className="scroll-mt-16">
      <h2>The Growing Problem of Solar Panel Fraud in Texas</h2>
      
      <div className="article-body">
        <p>
          Texas has emerged as a leading state for solar energy adoption, with installations growing by over 40% annually in recent years. 
          This boom in solar energy has unfortunately been accompanied by a concerning rise in solar panel fraud in Texas, targeting homeowners eager to embrace renewable energy solutions.
        </p>
        
        <p>
          According to the Texas Attorney General's Office, complaints about Texas solar scams have increased by 45% since 2019, with hundreds of Texas homeowners reporting issues ranging from misleading sales tactics to outright fraud.
        </p>
        
        <h3>Common Tactics Used by Texas Solar Scammers</h3>
        
        <ul>
          <li>
            <strong>Misleading Financial Claims:</strong> Exaggerating potential savings or tax incentives, promising unrealistic reductions in utility bills, or misrepresenting the cost-benefit analysis of solar installation.
          </li>
          <li>
            <strong>High-Pressure Sales Techniques:</strong> Creating false urgency by claiming limited-time government incentives or using aggressive door-to-door sales tactics to push immediate contract signing without proper review.
          </li>
          <li>
            <strong>Installation and Quality Issues:</strong> Installing substandard equipment, failing to obtain proper permits, or performing improper installations that could damage your home or create safety hazards.
          </li>
          <li>
            <strong>Contract Misrepresentation:</strong> Using confusing contract language or outright lies about terms, warranty coverage, or the transferability of solar agreements when selling your home.
          </li>
          <li>
            <strong>Abandonment After Sale:</strong> Companies that collect payments but then disappear without completing the installation or that go out of business shortly after installation, leaving warranty claims unfulfilled.
          </li>
        </ul>
        
        <div className="mt-4 mb-8">
          <a href="/identifying-solar-scams" className="text-bennett-navy hover:text-bennett-gold inline-flex items-center font-medium">
            Learn more about identifying solar panel scams in Texas <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
        
        <h3>Impact on Victims of Solar Fraud in Texas</h3>
        
        <p>
          Victims of solar panel fraud in Texas often face devastating financial consequences. In many cases, homeowners are left with:
        </p>
        
        <ul>
          <li>Non-functioning or underperforming solar systems</li>
          <li>Damaged roofs requiring costly repairs</li>
          <li>Unexpected liens placed on their homes</li>
          <li>Obligations to continue payments on equipment that doesn't work as promised</li>
          <li>Difficulty selling their homes due to problematic solar contracts</li>
          <li>Legal battles with solar companies or financing entities</li>
        </ul>
        
        <blockquote>
          "Many Texas homeowners report being trapped in contracts that leave them paying for systems that never delivered the promised savings, while simultaneously dealing with damaged roofs and increased utility bills."
        </blockquote>
        
        <p>
          The financial impact can be severe—with many Texas families facing losses of $15,000 to $30,000 or more—while also dealing with the stress of uncertain energy costs and potential home damage.
        </p>
      </div>
    </section>
  );
};

export default GrowingProblem;
