
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConsumerRights = () => {
  return (
    <section id="consumer-rights" className="scroll-mt-16">
      <h2>Your Rights as a Texas Consumer: Legal Avenues for Solar Fraud Victims</h2>
      
      <div className="article-body">
        <p>
          Texas consumers have specific legal protections against deceptive business practices and fraud, including those in the solar energy industry. Understanding these solar panel consumer protections in Texas is essential if you believe you've been victimized by a solar company.
        </p>
        
        <h3>Texas Consumer Protection Laws for Solar Panel Fraud</h3>
        
        <p>
          The Texas Deceptive Trade Practices-Consumer Protection Act (DTPA) is one of the most powerful tools available to consumers who have been victims of solar fraud in Texas. Under this law:
        </p>
        
        <ul>
          <li>
            <strong>Prohibition of False Claims:</strong> Companies cannot make false or misleading statements about their products or services, including solar panels and their performance.
          </li>
          <li>
            <strong>Warranty Protection:</strong> The law prohibits breaches of express or implied warranties, such as promises about the quality, performance, or durability of solar panel systems.
          </li>
          <li>
            <strong>Protection Against Unconscionable Actions:</strong> Businesses cannot take advantage of consumers' lack of knowledge or experience in a way that is grossly unfair.
          </li>
          <li>
            <strong>Remedies Available:</strong> Under the DTPA, consumers may be entitled to economic damages, mental anguish damages, and potentially triple damages in cases of knowing violations.
          </li>
        </ul>
        
        <h3>Federal Protections Against Texas Solar Scams</h3>
        
        <p>
          In addition to state laws, several federal protections may apply:
        </p>
        
        <ul>
          <li>
            <strong>The Federal Trade Commission Act:</strong> Prohibits unfair or deceptive practices affecting commerce.
          </li>
          <li>
            <strong>Truth in Lending Act:</strong> Requires clear disclosure of loan terms and costs if financing was involved in your solar panel purchase.
          </li>
          <li>
            <strong>Home Improvement Laws:</strong> Depending on how your solar installation was classified, additional home improvement contractor regulations may apply.
          </li>
        </ul>
        
        <div className="mt-4 mb-8">
          <Link to="/legal-rights-protections" className="text-bennett-navy hover:text-bennett-gold inline-flex items-center font-medium">
            Explore the full guide to your legal rights and protections for solar panel fraud in Texas <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <h3>Legal Recourse Options for Victims of Solar Fraud in Texas</h3>
        
        <p>
          If you believe you've been defrauded by a solar company in Texas, you have several legal avenues available:
        </p>
        
        <ul>
          <li>
            <strong>File a Complaint with the Texas Attorney General's Office:</strong> This can potentially trigger state investigation into the company's practices.
          </li>
          <li>
            <strong>Contact the Better Business Bureau:</strong> While not a legal remedy, this can create public record of complaints against the company.
          </li>
          <li>
            <strong>Consider Private Legal Action:</strong> Consulting with an attorney experienced in consumer protection law to pursue a private lawsuit against the company.
          </li>
          <li>
            <strong>Arbitration:</strong> Check your contract to determine if you're bound by arbitration clauses and what that means for your situation.
          </li>
          <li>
            <strong>Class Action:</strong> In cases where many homeowners have been affected by the same company using similar tactics, class action litigation may be appropriate.
          </li>
        </ul>
        
        <div className="bg-bennett-lightBlue p-6 rounded-lg my-8">
          <h3 className="text-bennett-navy mt-0 mb-4">Time Limitations: Act Quickly</h3>
          <p className="mb-0">
            It's important to note that the DTPA and other consumer protection laws have strict time limitations. In most cases under the DTPA, you must take action within two years from the date you discovered (or should have discovered) the deceptive practice. Waiting too long could result in losing your right to seek legal remedy.
          </p>
        </div>
        
        <h3>Documentation: The Key to a Strong Legal Case for Solar Fraud</h3>
        
        <p>
          If you suspect you've been victimized by solar fraud in Texas, begin documenting everything immediately:
        </p>
        
        <ul>
          <li>Gather all contracts, promotional materials, and correspondence</li>
          <li>Take photographs of installation issues or damage</li>
          <li>Save copies of your utility bills before and after installation</li>
          <li>Record details of all conversations with the company (including dates, names, and what was discussed)</li>
          <li>Obtain inspection reports or assessments from independent solar experts</li>
        </ul>
        
        <div className="mt-4 mb-8">
          <Link to="/reporting-seeking-help" className="text-bennett-navy hover:text-bennett-gold inline-flex items-center font-medium">
            Learn how to report Texas solar scams and seek legal help for solar panel fraud <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <p>
          Understanding your rights is the first step toward seeking justice if you've been defrauded. The legal system offers several protections for Texas consumers, but navigating these options often requires expertise and guidance from professionals who understand both consumer law and the technical aspects of solar energy systems.
        </p>
      </div>
    </section>
  );
};

export default ConsumerRights;
