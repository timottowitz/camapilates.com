
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import Store from "./pages/Store";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogCategory from "./pages/BlogCategory";
import BlogTag from "./pages/BlogTag";
import IdentifySolarScams from "./pages/resources/IdentifySolarScams";
import LegalRights from "./pages/resources/LegalRights";
import ReportingFraud from "./pages/resources/ReportingFraud";
import PreventionGuide from "./pages/resources/PreventionGuide";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/store" element={<Store />} />
            <Route path="/services" element={<Services />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/blog/category/:category" element={<BlogCategory />} />
            <Route path="/blog/tag/:tag" element={<BlogTag />} />
            
            {/* Resource Pages */}
            <Route path="/identifying-solar-scams" element={<IdentifySolarScams />} />
            <Route path="/legal-rights-protections" element={<LegalRights />} />
            <Route path="/reporting-seeking-help" element={<ReportingFraud />} />
            <Route path="/prevention-guide" element={<PreventionGuide />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
