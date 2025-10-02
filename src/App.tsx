
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
const AdminPlaceholders = lazy(() => import('./pages/AdminPlaceholders'));
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

// Studio Directory Pages
const StudiosLanding = lazy(() => import('./pages/estudios-de-pilates/StudiosLanding'));
const CityDirectory = lazy(() => import('./pages/estudios-de-pilates/CityDirectory'));
const StudioDetail = lazy(() => import('./pages/estudios-de-pilates/StudioDetail'));

import GAListener from "@/components/analytics/GAListener";
import FloatingCart21 from "@/components/commerce21/FloatingCart21";
import AdminGuard from "@/components/auth/AdminGuard";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <GAListener />
          <ScrollToTop />
          {/* Shoprocket embeds are placed directly in pages via embed blocks */}
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/store" element={<Suspense fallback={<PageLoader />}><Store /></Suspense>} />
            <Route path="/shop" element={<Suspense fallback={<PageLoader />}><Shop /></Suspense>} />
            <Route path="/shop/category/:slug" element={<Suspense fallback={<PageLoader />}><ShopCategory /></Suspense>} />
            <Route path="/products" element={<Suspense fallback={<PageLoader />}><Products /></Suspense>} />
            <Route path="/cama-de-pilates/en-venta" element={<Suspense fallback={<PageLoader />}><CamaDePilatesEnVenta /></Suspense>} />
            <Route path="/cama-de-pilates/precio" element={<Suspense fallback={<PageLoader />}><CamaDePilatesPrecio /></Suspense>} />
            <Route path="/packs/estudio" element={<Suspense fallback={<PageLoader />}><StudioPack /></Suspense>} />
            <Route path="/cama-de-pilates" element={<Suspense fallback={<PageLoader />}><CamaDePilatesHub /></Suspense>} />
            <Route path="/certificacion-pilates" element={<Suspense fallback={<PageLoader />}><CertificacionPilates /></Suspense>} />
            <Route path="/certificacion-pilates/:city" element={<Suspense fallback={<PageLoader />}><CertificacionPilatesCity /></Suspense>} />
            <Route path="/legal/terminos" element={<Suspense fallback={<PageLoader />}><LegalTerms /></Suspense>} />
            <Route path="/legal/privacidad" element={<Suspense fallback={<PageLoader />}><LegalPrivacy /></Suspense>} />
            <Route path="/soporte" element={<Suspense fallback={<PageLoader />}><Support /></Suspense>} />
            <Route path="/services" element={<Services />} />
            <Route path="/blog" element={<Suspense fallback={<PageLoader />}><Blog /></Suspense>} />
            <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>} />
            <Route path="/blog/category/:category" element={<Suspense fallback={<PageLoader />}><BlogCategory /></Suspense>} />
            <Route path="/blog/tag/:tag" element={<Suspense fallback={<PageLoader />}><BlogTag /></Suspense>} />
            {/* Admin panel (dev/internal) */}
            <Route path="/admin" element={<Suspense fallback={<PageLoader />}><Admin /></Suspense>} />
            <Route path="/admin/blog-writer" element={<Suspense fallback={<PageLoader />}><AdminGuard><AdminBlogWriter /></AdminGuard></Suspense>} />
            <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><AdminGuard><AdminSettings /></AdminGuard></Suspense>} />
            <Route path="/admin/placeholders" element={<Suspense fallback={<PageLoader />}><AdminGuard><AdminPlaceholders /></AdminGuard></Suspense>} />
            <Route path="/product/:slug" element={<Suspense fallback={<PageLoader />}><Product /></Suspense>} />

            {/* Resource Pages */}
            <Route path="/identifying-solar-scams" element={<Suspense fallback={<PageLoader />}><IdentifySolarScams /></Suspense>} />
            <Route path="/legal-rights-protections" element={<Suspense fallback={<PageLoader />}><LegalRights /></Suspense>} />
            <Route path="/reporting-seeking-help" element={<Suspense fallback={<PageLoader />}><ReportingFraud /></Suspense>} />
            <Route path="/prevention-guide" element={<Suspense fallback={<PageLoader />}><PreventionGuide /></Suspense>} />

            {/* Studio Directory Routes */}
            <Route path="/estudios-de-pilates" element={<Suspense fallback={<PageLoader />}><StudiosLanding /></Suspense>} />
            <Route path="/estudios-de-pilates/:city" element={<Suspense fallback={<PageLoader />}><CityDirectory /></Suspense>} />
            <Route path="/estudios-de-pilates/:city/:studio" element={<Suspense fallback={<PageLoader />}><StudioDetail /></Suspense>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
          <Footer />
          <FloatingCart21 />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
