
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense, lazy, ComponentType } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from "@/components/ui/scroll-to-top";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import StudiosLanding from './pages/estudios-de-pilates/StudiosLanding';
import CityDirectory from './pages/estudios-de-pilates/CityDirectory';
import StudioDetail from './pages/estudios-de-pilates/StudioDetail';

// Retry wrapper for lazy imports - handles chunk loading failures after deployments
function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 2
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await importFn();
      } catch (error: any) {
        const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module') ||
                             error?.message?.includes('Loading chunk') ||
                             error?.message?.includes('Loading CSS chunk');
        if (isChunkError && attempt < retries) {
          // Wait briefly then retry
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          continue;
        }
        // If still failing after retries, reload the page to get fresh chunks
        if (isChunkError) {
          window.location.reload();
          // Return a placeholder while reloading
          return { default: (() => null) as unknown as T };
        }
        throw error;
      }
    }
    throw new Error('Failed to load module after retries');
  });
}

const Compare = lazyWithRetry(() => import('./pages/Compare'));
const Shop = lazyWithRetry(() => import('./pages/Shop'));
const ShopCategory = lazyWithRetry(() => import('./pages/ShopCategory'));
const Blog = lazyWithRetry(() => import('./pages/Blog'));
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost'));
const BlogCategory = lazyWithRetry(() => import('./pages/BlogCategory'));
const BlogTag = lazyWithRetry(() => import('./pages/BlogTag'));
const AdminBlogWriter = lazyWithRetry(() => import('./pages/AdminBlogWriter'));
const Admin = lazyWithRetry(() => import('./pages/Admin'));
const AdminPlaceholders = lazyWithRetry(() => import('./pages/AdminPlaceholders'));
const AdminSettings = lazyWithRetry(() => import('./pages/AdminSettings'));
const AdminBlogList = lazyWithRetry(() => import('./pages/AdminBlogList'));
const AdminBlogEditor = lazyWithRetry(() => import('./pages/AdminBlogEditor'));
const AdminTeacherClaims = lazyWithRetry(() => import('./pages/AdminTeacherClaims'));
const AdminTeacherLinks = lazyWithRetry(() => import('./pages/AdminTeacherLinks'));
const AdminTeacherSeeds = lazyWithRetry(() => import('./pages/AdminTeacherSeeds'));
const Product = lazyWithRetry(() => import('./pages/Product'));
const Products = lazyWithRetry(() => import('./pages/Products'));
const CamaDePilatesEnVenta = lazyWithRetry(() => import('./pages/CamaDePilatesEnVenta'));
const CamaDePilatesPrecio = lazyWithRetry(() => import('./pages/CamaDePilatesPrecio'));
const StudioPack = lazyWithRetry(() => import('./pages/StudioPack'));
const CamaDePilatesHub = lazyWithRetry(() => import('./pages/CamaDePilatesHub'));
const ReformerParaCasa = lazyWithRetry(() => import('./pages/ReformerParaCasa'));
const PilatesReformerCDMX = lazyWithRetry(() => import('./pages/PilatesReformerCDMX'));
const CertificacionPilates = lazyWithRetry(() => import('./pages/CertificacionPilates'));
const CertificacionPilatesCity = lazyWithRetry(() => import('./pages/CertificacionPilatesCity'));
const LegalTerms = lazyWithRetry(() => import('./pages/LegalTerms'));
const LegalPrivacy = lazyWithRetry(() => import('./pages/LegalPrivacy'));
const Support = lazyWithRetry(() => import('./pages/Support'));
const ClaimStudio = lazyWithRetry(() => import('./pages/ClaimStudio'));
const TeachersLanding = lazyWithRetry(() => import('./pages/instructores-pilates/TeachersLanding'));
const CityTeachers = lazyWithRetry(() => import('./pages/instructores-pilates/CityTeachers'));
const ClaimTeacher = lazyWithRetry(() => import('./pages/instructores-pilates/ClaimTeacher'));
const TeacherDetail = lazyWithRetry(() => import('./pages/instructores-pilates/TeacherDetail'));
const SetupCuenta = lazyWithRetry(() => import('./pages/instructores-pilates/SetupCuenta'));
const MiPerfil = lazyWithRetry(() => import('./pages/instructores-pilates/MiPerfil'));
const EditarPerfil = lazyWithRetry(() => import('./pages/instructores-pilates/EditarPerfil'));
const ResetPassword = lazyWithRetry(() => import('./pages/instructores-pilates/ResetPassword'));

import GAListener from "@/components/analytics/GAListener";
import FloatingCart21 from "@/components/commerce21/FloatingCart21";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import ShoprocketLoader from "@/components/commerce21/ShoprocketLoader";
import AdminGuard from "@/components/auth/AdminGuard";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

// Loading fallback component - matches LuxuryLayout design system
const PageLoader = () => (
  <div className="min-h-screen bg-[#EAE8E4] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2A2624] mx-auto mb-4"></div>
      <p className="text-[#5D5550] text-sm font-light tracking-wide">Cargando...</p>
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
          <ShoprocketLoader />
          <GAListener />
          <ScrollToTop />
          {/* Shoprocket embeds are placed directly in pages via embed blocks */}
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/compare" element={<Suspense fallback={<PageLoader />}><Compare /></Suspense>} />
              <Route path="/shop" element={<Suspense fallback={<PageLoader />}><Shop /></Suspense>} />
              <Route path="/shop/category/:slug" element={<Suspense fallback={<PageLoader />}><ShopCategory /></Suspense>} />
              <Route path="/products" element={<Suspense fallback={<PageLoader />}><Products /></Suspense>} />
              <Route path="/cama-de-pilates/en-venta" element={<Suspense fallback={<PageLoader />}><CamaDePilatesEnVenta /></Suspense>} />
              <Route path="/cama-de-pilates/precio" element={<Suspense fallback={<PageLoader />}><CamaDePilatesPrecio /></Suspense>} />
              <Route path="/packs/estudio" element={<Suspense fallback={<PageLoader />}><StudioPack /></Suspense>} />
              <Route path="/cama-de-pilates" element={<Suspense fallback={<PageLoader />}><CamaDePilatesHub /></Suspense>} />
              <Route path="/reformer-para-casa" element={<Suspense fallback={<PageLoader />}><ReformerParaCasa /></Suspense>} />
              <Route path="/pilates-reformer-cdmx" element={<Suspense fallback={<PageLoader />}><PilatesReformerCDMX /></Suspense>} />
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
              <Route path="/admin/blogs" element={<Suspense fallback={<PageLoader />}><AdminGuard><AdminBlogList /></AdminGuard></Suspense>} />
              <Route path="/admin/blogs/:slug" element={<Suspense fallback={<PageLoader />}><AdminGuard><AdminBlogEditor /></AdminGuard></Suspense>} />
              <Route path="/admin/teacher-links" element={<Suspense fallback={<PageLoader />}><AdminGuard><AdminTeacherLinks /></AdminGuard></Suspense>} />
              <Route path="/admin/teacher-seeds" element={<Suspense fallback={<PageLoader />}><AdminGuard><AdminTeacherSeeds /></AdminGuard></Suspense>} />
              <Route path="/admin/instructor-claims" element={<Suspense fallback={<PageLoader />}><AdminGuard><AdminTeacherClaims /></AdminGuard></Suspense>} />
              <Route path="/product/:slug" element={<Suspense fallback={<PageLoader />}><Product /></Suspense>} />

              {/* Studio Directory Routes */}
              <Route path="/estudios-de-pilates" element={<Suspense fallback={<PageLoader />}><StudiosLanding /></Suspense>} />
              <Route path="/estudios-de-pilates/:city/:studio" element={<Suspense fallback={<PageLoader />}><StudioDetail /></Suspense>} />
              <Route path="/estudios-de-pilates/:city" element={<Suspense fallback={<PageLoader />}><CityDirectory /></Suspense>} />
              <Route path="/claim-studio" element={<Suspense fallback={<PageLoader />}><ClaimStudio /></Suspense>} />
              <Route path="/claim-teacher" element={<Suspense fallback={<PageLoader />}><ClaimTeacher /></Suspense>} />

              <Route path="/instructores-pilates" element={<Suspense fallback={<PageLoader />}><TeachersLanding /></Suspense>} />
              <Route path="/instructores-pilates/:city/:slug" element={<Suspense fallback={<PageLoader />}><TeacherDetail /></Suspense>} />
              <Route path="/instructores-pilates/:city" element={<Suspense fallback={<PageLoader />}><CityTeachers /></Suspense>} />

              {/* Instructor Account Routes */}
              <Route path="/setup-cuenta" element={<Suspense fallback={<PageLoader />}><SetupCuenta /></Suspense>} />
              <Route path="/mi-perfil" element={<Suspense fallback={<PageLoader />}><MiPerfil /></Suspense>} />
              <Route path="/mi-perfil/editar" element={<Suspense fallback={<PageLoader />}><EditarPerfil /></Suspense>} />
              <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
          <FloatingCart21 />
          <FloatingWhatsApp />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
