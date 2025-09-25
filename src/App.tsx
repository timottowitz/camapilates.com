
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ShoprocketBasket, ShoprocketLoader } from "@/integrations/shoprocket";
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
          {/* Shoprocket loader and floating basket (configure publishable key or store ID) */}
          <ShoprocketLoader>
            <ShoprocketBasket
              config={{
                publishable_key: 'sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c',
                options: { basket_style: 'bubble', basket_position: 'bottom-right' },
                includes: {
                  show_pop_up_adding_item_to_cart: '1',
                  show_image_thumbnails: '1',
                  show_select_quantity: '1',
                  show_overlay_when_open: '1',
                  show_cart_count: '1',
                  show_cart_total: '0'
                },
                styles: {
                  basket_background: '#ffffff',
                  basket_color: '#000000',
                  basket_text_color: '#000000',
                  basket_counter_background: '#000000',
                  basket_counter_color: '#ffffff',
                  cart_background: '#ffffff',
                  cart_text_color: '#666666',
                  cart_button_background: '#233642',
                  cart_button_color: '#ffffff',
                  cart_links_text_color: '#808b97',
                  cart_border_color: '#ececec'
                }
              }}
            />
          </ShoprocketLoader>
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
