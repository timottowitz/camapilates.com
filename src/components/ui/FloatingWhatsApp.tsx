import React from 'react';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '525548468190';
const DEFAULT_MESSAGE = 'Hola, tengo una pregunta sobre sus productos de Pilates.';

interface FloatingWhatsAppProps {
  message?: string;
  showOnDesktop?: boolean;
}

const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  message = DEFAULT_MESSAGE,
  showOnDesktop = true,
}) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  return (
    <div
      className={`fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 flex items-center group ${
        showOnDesktop ? '' : 'md:hidden'
      }`}
    >
      <span className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 mr-3 bg-white/95 backdrop-blur-sm text-[#2A2624] text-xs font-semibold rounded-full shadow-lg border border-[#2A2624]/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl pointer-events-none select-none">
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        ¿Dudas? Chatea con nosotros
      </span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-rybbit-event="click_floating_whatsapp"
        className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:bg-[#20BA59] transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />
      </a>
    </div>
  );
};

export default FloatingWhatsApp;
