import { MessageCircle } from "lucide-react";
import { useContent } from "@/hooks/useContent";

type WhatsAppButtonProps = {
  lang: string;
};

const WhatsAppButton = ({ lang: _lang }: WhatsAppButtonProps) => {
  const { data } = useContent();
  const phoneNumber = data?.site_text?.whatsapp_number ?? "";

  // Hide the button entirely if no WhatsApp number is configured
  if (!phoneNumber) return null;

  const cleanNumber = phoneNumber.replace(/[^0-9+]/g, "");
  const href = `https://wa.me/${cleanNumber}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Réserver via WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-xl"
    >
      <MessageCircle size={28} style={{ color: "#fff" }} />
    </a>
  );
};

export default WhatsAppButton;
