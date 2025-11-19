import { useLocation } from "react-router-dom";
import { useEffect } from "react";
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif italic text-[#2A2624] mb-4">404</h1>
          <p className="text-xl text-[#5D5550] mb-4 font-light">Oops! Page not found</p>
          <a href="/" className="text-[#3E2723] hover:opacity-70 underline text-xs uppercase tracking-widest">
            Return to Home
          </a>
        </div>
      </div>
    </LuxuryLayout>
  );
};

export default NotFound;
