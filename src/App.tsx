
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/scroll-to-top";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
const Store = lazy(() => import('./pages/Store'));
const Shop = lazy(() => import('./pages/Shop'));
const ShopCategory = lazy(() => import('./pages/ShopCategory'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogCategory = lazy(() => import('./pages/BlogCategory'));
const BlogTag = lazy(() => import('./pages/BlogTag'));
const AdminBlogWriter = lazy(() => import('./pages/AdminBlogWriter'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const Product = lazy(() => import('./pages/Product'));
const Products = lazy(() => import('./pages/Products'));
const CamaDePilatesEnVenta = lazy(() => import('./pages/CamaDePilatesEnVenta'));
const CamaDePilatesPrecio = lazy(() => import('./pages/CamaDePilatesPrecio'));
const StudioPack = lazy(() => import('./pages/StudioPack'));
const CamaDePilatesHub = lazy(() => import('./pages/CamaDePilatesHub'));
const CertificacionPilates = lazy(() => import('./pages/CertificacionPilates'));
const CertificacionPilatesCity = lazy(() => import('./pages/CertificacionPilatesCity'));
const LegalTerms = lazy(() => import('./pages/LegalTerms'));
const LegalPrivacy = lazy(() => import('./pages/LegalPrivacy'));
const Support = lazy(() => import('./pages/Support'));
const IdentifySolarScams = lazy(() => import('./pages/resources/IdentifySolarScams'));
const LegalRights = lazy(() => import('./pages/resources/LegalRights'));
const ReportingFraud = lazy(() => import('./pages/resources/ReportingFraud'));
const PreventionGuide = lazy(() => import('./pages/resources/PreventionGuide'));
import GAListener from "@/components/analytics/GAListener";
import FloatingCart21 from "@/components/commerce21/FloatingCart21";
import AdminGuard from "@/components/auth/AdminGuard";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <GAListener />
          {/* Shoprocket embeds are placed directly in pages via embed blocks */}
          <Suspense fallback={<div className="container mx-auto px-4 py-12 text-muted-foreground">Cargando…</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/store" element={<Store />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/category/:slug" element={<ShopCategory />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cama-de-pilates/en-venta" element={<CamaDePilatesEnVenta />} />
            <Route path="/cama-de-pilates/precio" element={<CamaDePilatesPrecio />} />
            <Route path="/packs/estudio" element={<StudioPack />} />
            <Route path="/cama-de-pilates" element={<CamaDePilatesHub />} />
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
            {/* Admin panel (dev/internal) */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/blog-writer" element={<AdminGuard><AdminBlogWriter /></AdminGuard>} />
            <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
            <Route path="/product/:slug" element={<Product />} />
            
            {/* Resource Pages */}
            <Route path="/identifying-solar-scams" element={<IdentifySolarScams />} />
            <Route path="/legal-rights-protections" element={<LegalRights />} />
            <Route path="/reporting-seeking-help" element={<ReportingFraud />} />
            <Route path="/prevention-guide" element={<PreventionGuide />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <Footer />
          <FloatingCart21 />
          <ScrollToTop />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
