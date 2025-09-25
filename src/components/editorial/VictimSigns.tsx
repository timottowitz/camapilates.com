
import React from 'react';
import { ExternalLink } from 'lucide-react';

const VictimSigns = () => {
  return (
    <section id="victim-signs" className="scroll-mt-16">
      <h2>Am I a Victim? Identifying the Signs of a Solar Panel Scam</h2>
      
      <div className="article-body">
        <p>
          Determining whether you've been victimized by solar panel fraud isn't always straightforward. Solar energy systems are complex, and many homeowners lack the technical expertise to evaluate if their system is operating as promised. Here are key warning signs to help you identify if you may have been defrauded:
        </p>
        
        <h3>Red Flags During the Sales Process</h3>
        
        <ul>
          <li>
            <strong>Unsolicited contact</strong> from companies using high-pressure tactics to make immediate decisions
          </li>
          <li>
            <strong>Refusal to provide clear, written estimates</strong> or being vague about total costs
          </li>
          <li>
            <strong>Promises of "free solar panels"</strong> or claims that seem too good to be true
          </li>
          <li>
            <strong>Guarantees of specific savings amounts</strong> without a professional home energy assessment
          </li>
          <li>
            <strong>Claims about government programs</strong> that sound unusual or time-limited
          </li>
          <li>
            <strong>Salespeople claiming affiliation</strong> with government agencies, utility companies, or well-known brands without verification
          </li>
        </ul>
        
        <h3>Post-Installation Warning Signs</h3>
        
        <ul>
          <li>
            <strong>System underperformance:</strong> Your electric bills remain high despite promises of significant reduction
          </li>
          <li>
            <strong>Installation issues:</strong> Panels that are improperly mounted, leaking roofs, or electrical problems
          </li>
          <li>
            <strong>Monitoring discrepancies:</strong> The energy production reported is significantly different from what you were promised
          </li>
          <li>
            <strong>Communication breakdown:</strong> The company becomes difficult to reach after installation or payment
          </li>
          <li>
            <strong>Unexpected costs:</strong> Surprise charges appearing after the system is installed
          </li>
          <li>
            <strong>Permitting problems:</strong> Discovering the company didn't obtain proper permits or inspections
          </li>
        </ul>
        
        <div className="mt-4 mb-8">
          <a href="/identifying-solar-scams" className="text-bennett-navy hover:text-bennett-gold inline-flex items-center font-medium">
            See our detailed guide on solar panel scam identification <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
        
        <h3>Contract and Financial Red Flags</h3>
        
        <ul>
          <li>
            <strong>Different terms</strong> than what was verbally promised during sales discussions
          </li>
          <li>
            <strong>Escalator clauses</strong> that significantly increase your payments over time
          </li>
          <li>
            <strong>Ownership confusion:</strong> Unclear terms about who actually owns the solar panels
          </li>
          <li>
            <strong>Unauthorized credit checks</strong> or financing applications submitted without your clear consent
          </li>
          <li>
            <strong>Difficulty understanding</strong> the financial terms and total cost of the system
          </li>
          <li>
            <strong>Unexpected liens</strong> placed on your property
          </li>
        </ul>
        
        <div className="bg-bennett-lightGold p-6 rounded-lg my-8">
          <h3 className="text-bennett-navy mt-0 mb-4">Self-Assessment Checklist</h3>
          <p className="italic mb-4">
            Ask yourself these questions to determine if you might be a victim of solar panel fraud:
          </p>
          <ul className="space-y-2 !list-none">
            <li>□ Were the financial benefits of your solar system clearly explained and documented?</li>
            <li>□ Did your utility bills decrease as promised after installation?</li>
            <li>□ Is your solar system producing the amount of electricity you were promised?</li>
            <li>□ Can you easily contact the company that installed your system?</li>
            <li>□ Were all permits properly obtained and is your system correctly inspected?</li>
            <li>□ Is your roof free from damage caused by the solar installation?</li>
            <li>□ Do you fully understand the terms of your solar contract?</li>
          </ul>
          <p className="mt-4">
            If you answered "No" to any of these questions, you may want to consult with a legal professional who specializes in solar energy fraud.
          </p>
        </div>
        
        <p>
          If you recognize several of these warning signs in your experience with a solar installation company, it's important to take action quickly. Documenting your concerns, gathering all relevant paperwork, and seeking legal advice can help protect your rights and potentially recover damages.
        </p>
      </div>
    </section>
  );
};

export default VictimSigns;
