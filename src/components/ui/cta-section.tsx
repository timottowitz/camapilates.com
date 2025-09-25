import { Button } from "@/components/ui/button";
import { Calendar, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getCalApi } from "@calcom/embed-react";
import AirtableFormDialog from "@/components/ui/airtable-form-dialog";

interface CTASectionProps {
  title?: string;
  description?: string;
  variant?: "default" | "compact" | "inline";
  className?: string;
}

const CTASection = ({
  title = "Been Scammed by Solar Companies?",
  description = "Our experienced attorneys are ready to help you recover your losses and hold fraudulent companies accountable. Get in touch today to discuss your specific situation.",
  variant = "default",
  className = ""
}: CTASectionProps) => {
  
  // Using data attributes like the working implementation
  const calDataAttributes = {
    "data-cal-namespace": "client-interviews",
    "data-cal-link": "ana/client-interviews",
    "data-cal-origin": "https://calendar.bennettlegal.com",
    "data-cal-config": '{"layout":"month_view"}'
  };

  if (variant === "compact") {
    return (
      <div className={`bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 my-8 ${className}`}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">{description}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            size="sm" 
            {...calDataAttributes}
            className="bg-bennett-navy hover:bg-bennett-navy/90 text-white"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Consultation
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href="tel:(214)473-5897">
              <Phone className="mr-2 h-4 w-4" />
              Call Now
            </a>
          </Button>
          <AirtableFormDialog 
            title="Get Legal Help Now" 
            description="Tell us about your solar fraud case and we'll get back to you immediately"
          >
            <Button
              variant="outline"
              size="sm"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Get Legal Help
            </Button>
          </AirtableFormDialog>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8 my-12 ${className}`}>
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">{title}</h3>
          <p className="text-muted-foreground mb-6">{description}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              {...calDataAttributes}
              className="bg-bennett-navy hover:bg-bennett-navy/90 text-white"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Consultation
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="tel:(214)473-5897" className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Call (214) 473-5897
              </a>
            </Button>
            <AirtableFormDialog 
              title="Get Legal Help Now" 
              description="Tell us about your solar fraud case and we'll get back to you immediately"
            >
              <Button size="lg" variant="outline">
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Legal Help
              </Button>
            </AirtableFormDialog>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - full featured CTA
  return (
    <div className={`bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 rounded-xl p-8 my-12 shadow-lg ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Schedule Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="w-full mb-2 bg-bennett-navy hover:bg-bennett-navy/90 text-white"
              {...calDataAttributes}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Consultation
            </Button>
            <p className="text-sm text-muted-foreground">Book a free consultation</p>
          </div>

          {/* Call Button */}
          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="w-full mb-2"
              asChild
            >
              <a href="tel:(214)473-5897">
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </a>
            </Button>
            <p className="text-sm text-muted-foreground">Direct phone consultation</p>
          </div>

          {/* Get Legal Help Button */}
          <div className="text-center">
            <AirtableFormDialog 
              title="Get Legal Help Now" 
              description="Tell us about your solar fraud case and we'll get back to you immediately"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full mb-2"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Get Legal Help
              </Button>
            </AirtableFormDialog>
            <p className="text-sm text-muted-foreground">Submit your case details</p>
          </div>
        </div>

        {/* Additional Contact Info */}
        <div className="mt-6 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>
            <strong>Phone:</strong> (214) 473-5897 |
            <strong className="ml-2">Email:</strong> cbennett@bennettlegal.com
          </p>
          <p className="mt-1">Available Monday-Friday, 9 AM - 6 PM (CST)</p>
        </div>
      </div>
    </div>
  );
};

export default CTASection;