import React from 'react';
import {
  MapPin,
  Award,
  BookOpen,
  MessageCircle,
  ExternalLink,
  Instagram,
  Facebook,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CertificationPartner } from '@/content/certification/certificationsData';

interface CertificationPartnerCardProps {
  partner: CertificationPartner;
  className?: string;
}

export const CertificationPartnerCard: React.FC<CertificationPartnerCardProps> = ({
  partner,
  className = '',
}) => {
  const whatsappUrl = `https://wa.me/${partner.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hola ${partner.leadPerson}, vi su información en el Directorio de Certificaciones de camadepilates.com y quisiera solicitar informes sobre sus cursos de certificación de Pilates.`
  )}`;

  return (
    <article
      className={`group relative flex flex-col justify-between bg-white rounded-2xl border border-[#2A2624]/10 p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-[#2A2624]/20 transition-all duration-300 ${className}`}
    >
      <div>
        {/* Top Header: Badge & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3E2723]/10 text-[#3E2723] text-[11px] font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>{partner.city}</span>
            </span>

            {partner.isFlagship && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D9865B]/15 text-[#D9865B] text-[10px] font-bold uppercase tracking-wider border border-[#D9865B]/30">
                <Sparkles className="w-3 h-3" />
                <span>Sede Destacada</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#5D5550] font-light">
            <MapPin className="w-3.5 h-3.5 text-[#3E2723]" />
            <span className="truncate max-w-[180px]">{partner.state}</span>
          </div>
        </div>

        {/* Studio & Master Trainer Title */}
        <h3 className="text-2xl font-serif italic text-[#2A2624] mb-1 group-hover:text-[#3E2723] transition-colors">
          {partner.partnerName}
        </h3>

        <div className="flex items-center gap-2 text-sm text-[#3E2723] font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D9865B]"></span>
          <span>{partner.leadPerson}</span>
          <span className="text-[#5D5550]/60">·</span>
          <span className="text-xs text-[#5D5550] font-light">{partner.roleTitle}</span>
        </div>

        {/* Featured Badges / Accreditations */}
        {partner.featuredBadges && partner.featuredBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {partner.featuredBadges.map((badge, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-[#F5F4F0] border border-[#2A2624]/5 text-[#2A2624] text-[10px] font-mono uppercase tracking-wider"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Credentials & Bio */}
        <div className="mb-5 pb-5 border-b border-[#2A2624]/10">
          <h4 className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-[#5D5550] mb-2">
            Trayectoria y Avales
          </h4>
          <p className="text-sm text-[#5D5550] font-light leading-relaxed">
            {partner.aboutCredentials}
          </p>
        </div>

        {/* Certifications Offered */}
        <div className="mb-5 pb-5 border-b border-[#2A2624]/10">
          <h4 className="flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-[#2A2624] mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[#3E2723]" />
            <span>Programas y Certificaciones</span>
          </h4>
          <p className="text-sm text-[#2A2624] font-medium leading-relaxed bg-[#F9F8F6] p-3 rounded-lg border border-[#2A2624]/5">
            {partner.certificationsOffered}
          </p>
        </div>

        {/* Studio Location */}
        <div className="mb-6">
          <h4 className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-[#5D5550] mb-1.5">
            Ubicación de Sede
          </h4>
          <p className="text-xs text-[#5D5550] font-light leading-relaxed flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#3E2723] shrink-0 mt-0.5" />
            <span>{partner.studioLocations}</span>
          </p>
        </div>

        {/* B2B Equipment Fit Note */}
        {partner.partnershipFitAngle && (
          <div className="mb-6 p-3 rounded-lg bg-[#EAE8E4]/50 border-l-2 border-[#3E2723] text-xs text-[#5D5550] font-light italic">
            <span className="font-semibold text-[#2A2624] not-italic">Sinergia Edelweiss: </span>
            {partner.partnershipFitAngle}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="pt-4 border-t border-[#2A2624]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#2A2624] text-[#EAE8E4] text-xs font-semibold uppercase tracking-wider hover:bg-[#3E2723] transition-all shadow-sm active:scale-95"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>Contactar por WhatsApp</span>
        </a>

        <div className="flex items-center justify-center gap-2">
          {partner.website && (
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full border border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors"
              title="Sitio Web Oficial"
              aria-label={`Sitio web de ${partner.partnerName}`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {partner.instagram && (
            <a
              href={partner.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full border border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors"
              title="Perfil de Instagram"
              aria-label={`Instagram de ${partner.partnerName}`}
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}

          {partner.email && (
            <a
              href={`mailto:${partner.email}?subject=${encodeURIComponent(
                `Informes de Certificación Pilates — ${partner.partnerName}`
              )}`}
              className="p-2.5 rounded-full border border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors"
              title="Enviar Correo Electrónico"
              aria-label={`Enviar correo a ${partner.email}`}
            >
              <Mail className="w-4 h-4" />
            </a>
          )}

          {partner.phone && (
            <a
              href={`tel:${partner.phone.replace(/[^0-9+]/g, '')}`}
              className="p-2.5 rounded-full border border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors"
              title="Llamar por teléfono"
              aria-label={`Llamar a ${partner.phone}`}
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default CertificationPartnerCard;
