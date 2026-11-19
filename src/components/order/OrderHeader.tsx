import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/lib/contact';

type Props = {
  homeTo: string;
  homeLabel: string;
  helpMessage: string;
  // Shown between the logo and the help link on wide screens (the step list).
  children?: React.ReactNode;
};

// The slim top bar of the order pages: no site navigation, one way to ask for help.
export function OrderHeader({ homeTo, homeLabel, helpMessage, children }: Props) {
  return (
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
      <Link to={homeTo} className="flex items-baseline gap-0.5" aria-label={homeLabel}>
        <span className="font-serif text-xl italic tracking-tight sm:text-2xl">Edelweiss</span>
        <span className="mb-0.5 h-1.5 w-1.5 rounded-full bg-[#EB4C42]" />
      </Link>

      {children}

      <a
        href={whatsappUrl(helpMessage)}
        target="_blank"
        rel="noopener noreferrer"
        data-rybbit-event="click_order_help_whatsapp"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366] hover:text-white"
      >
        <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">¿Dudas?</span> WhatsApp
      </a>
    </div>
  );
}

export default OrderHeader;
