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
  showOnDesktop = false,
}) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-24 right-4 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:bg-[#128C7E] transition-all hover:scale-110 ${showOnDesktop ? '' : 'md:hidden'}`}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
    </a>
  );
};

export default FloatingWhatsApp;
