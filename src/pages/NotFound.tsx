import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LuxuryLayout from "@/components/layout/LuxuryLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <LuxuryLayout>
      <Helmet>
        <title>Página no encontrada | Edelweiss Pilates</title>
        <meta name="description" content="La página que buscas no existe o ha sido movida." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif italic text-[#2A2624] mb-4">404</h1>
          <p className="text-xl text-[#5D5550] mb-4 font-light">Página no encontrada</p>
          <a href="/" className="text-[#3E2723] hover:opacity-70 underline text-xs uppercase tracking-widest">
            Volver al inicio
          </a>
        </div>
      </div>
    </LuxuryLayout>
  );
};

export default NotFound;
