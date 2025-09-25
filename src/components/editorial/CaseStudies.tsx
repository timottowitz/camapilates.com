
import React from 'react';
import { ExternalLink } from 'lucide-react';

const CaseStudies = () => {
  return (
    <section id="case-studies" className="scroll-mt-16">
      <h2>Case Studies & Scenarios: Recognizing Solar Fraud Patterns</h2>
      
      <div className="article-body">
        <p>
          The following scenarios represent composite cases based on real experiences of Texas homeowners. While specific details have been altered to protect privacy, these examples illustrate common patterns of solar fraud and how legal intervention can help.
        </p>
        
        <div className="bg-white shadow-md border-l-4 border-bennett-gold p-6 rounded-r-lg mb-8">
          <h3 className="text-xl mb-3">Scenario 1: The Disappearing Contractor</h3>
          <p className="mb-4">
            <strong>The Situation:</strong> The Rodriguez family in San Antonio paid a $15,000 deposit to a solar company after being promised their system would eliminate their electricity bill and pay for itself within 5 years. The company installed panels that never functioned properly, and when the family attempted to contact them about the issues, they discovered the company had closed its offices and disconnected its phone lines.
          </p>
          <p className="mb-4">
            <strong>The Impact:</strong> The family was left with non-functioning solar panels, a damaged roof from improper installation, and no way to contact the company for repairs or to honor the warranty. They continued paying their full electricity bill while also making payments on the solar financing.
          </p>
          <p>
            <strong>The Resolution:</strong> Through legal action under the Texas DTPA, the family was able to pursue the company's bonding agent and eventually secured compensation for the faulty system and roof repairs. An attorney helped them negotiate with the financing company to adjust their loan terms based on the fraudulent circumstances.
          </p>
        </div>
        
        <div className="bg-white shadow-md border-l-4 border-bennett-gold p-6 rounded-r-lg mb-8">
          <h3 className="text-xl mb-3">Scenario 2: The Misrepresented Savings</h3>
          <p className="mb-4">
            <strong>The Situation:</strong> Mr. Johnson, a retired teacher in Houston, invested in solar panels after being shown elaborate spreadsheets projecting a 70% reduction in his electricity costs. The salesperson emphasized government incentives that would make the system "practically free" after tax credits. Upon installation, Mr. Johnson discovered his actual savings were less than 20%, and many of the tax incentives he was told about didn't apply to his situation.
          </p>
          <p className="mb-4">
            <strong>The Impact:</strong> Mr. Johnson found himself making substantial monthly payments on a system that would never deliver the promised return on investment. The financial strain was significant on his fixed retirement income.
          </p>
          <p>
            <strong>The Resolution:</strong> Legal counsel helped Mr. Johnson document the specific misrepresentations made during the sales process. Based on the evidence of deceptive trade practices, they negotiated a settlement that included a partial refund and adjustment to the remaining payment terms.
          </p>
        </div>
        
        <div className="bg-white shadow-md border-l-4 border-bennett-gold p-6 rounded-r-lg mb-8">
          <h3 className="text-xl mb-3">Scenario 3: The Undisclosed Lien</h3>
          <p className="mb-4">
            <strong>The Situation:</strong> The Garcia family in Austin decided to sell their home two years after installing a solar system. During the sale process, they discovered the solar company had placed a UCC filing (effectively a lien) on their home without clearly disclosing this during the contract signing. The lien complicated the sale, as potential buyers were concerned about assuming the solar agreement.
          </p>
          <p className="mb-4">
            <strong>The Impact:</strong> The home sale was delayed for months, forcing the family to carry two mortgages simultaneously. When they finally sold, they had to reduce their asking price significantly to account for the solar system complications.
          </p>
          <p>
            <strong>The Resolution:</strong> Through legal action, it was demonstrated that the solar company had violated Texas law by not properly disclosing the UCC filing and its implications. The family was able to recover damages based on the difference between their home's market value without the complications and the reduced price they were forced to accept.
          </p>
        </div>
        
        <div className="mt-4 mb-8">
          <a href="/reporting-seeking-help" className="text-bennett-navy hover:text-bennett-gold inline-flex items-center font-medium">
            Read more case studies and learn how to take action <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
        
        <h3>Common Threads in Solar Fraud Cases</h3>
        
        <p>
          While these scenarios represent different types of solar fraud, several common elements frequently appear across cases:
        </p>
        
        <ul>
          <li>
            <strong>Verbal promises</strong> that differ significantly from written contract terms
          </li>
          <li>
            <strong>Misrepresentation</strong> of potential savings, energy production, or applicable incentives
          </li>
          <li>
            <strong>Obscure contract language</strong> that conceals important obligations or limitations
          </li>
          <li>
            <strong>Poor quality installations</strong> that don't meet industry standards or local building codes
          </li>
          <li>
            <strong>Inadequate response</strong> to consumer concerns after the sale is complete
          </li>
        </ul>
        
        <p>
          These case studies highlight the importance of seeking qualified legal counsel when dealing with potential solar fraud. Even in situations that might initially seem hopeless—such as when a company has disappeared—legal remedies may still be available through various consumer protection mechanisms.
        </p>
      </div>
    </section>
  );
};

export default CaseStudies;
