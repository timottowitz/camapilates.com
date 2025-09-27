
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/scroll-to-top";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import Store from "./pages/Store";
import Shop from "./pages/Shop";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogCategory from "./pages/BlogCategory";
import BlogTag from "./pages/BlogTag";
import Product from "./pages/Product";
import Products from "./pages/Products";
import CamaDePilatesEnVenta from "./pages/CamaDePilatesEnVenta";
import CamaDePilatesPrecio from "./pages/CamaDePilatesPrecio";
import StudioPack from "./pages/StudioPack";
import CamaDePilatesHub from "./pages/CamaDePilatesHub";
import Accesorios from "./pages/Accesorios";
import Acabados from "./pages/Acabados";
import CertificacionPilates from "./pages/CertificacionPilates";
import CertificacionPilatesCity from "./pages/CertificacionPilatesCity";
import LegalTerms from "./pages/LegalTerms";
import LegalPrivacy from "./pages/LegalPrivacy";
import Support from "./pages/Support";
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
          <Header />
          {/* Shoprocket embeds are placed directly in pages via embed blocks */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/store" element={<Store />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cama-de-pilates/en-venta" element={<CamaDePilatesEnVenta />} />
            <Route path="/cama-de-pilates/precio" element={<CamaDePilatesPrecio />} />
            <Route path="/packs/estudio" element={<StudioPack />} />
            <Route path="/cama-de-pilates" element={<CamaDePilatesHub />} />
            <Route path="/accesorios" element={<Accesorios />} />
            <Route path="/acabados" element={<Acabados />} />
            <Route path="/certificacion-pilates" element={<CertificacionPilates />} />
            <Route path="/certificacion-pilates/:city" element={<CertificacionPilatesCity />} />
            <Route path="/legal/terminos" element={<LegalTerms />} />
            <Route path="/legal/privacidad" element={<LegalPrivacy />} />
            <Route path="/soporte" element={<Support />} />
            <Route path="/services" element={<Services />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/blog/category/:category" element={<BlogCategory />} />
            <Route path="/blog/tag/:tag" element={<BlogTag />} />
            <Route path="/product/:slug" element={<Product />} />
            
            {/* Resource Pages */}
            <Route path="/identifying-solar-scams" element={<IdentifySolarScams />} />
            <Route path="/legal-rights-protections" element={<LegalRights />} />
            <Route path="/reporting-seeking-help" element={<ReportingFraud />} />
            <Route path="/prevention-guide" element={<PreventionGuide />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <ScrollToTop />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
