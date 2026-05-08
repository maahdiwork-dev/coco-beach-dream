import { MessageCircle } from "lucide-react";
type WhatsAppButtonProps = {
  lang: string;
};

const WhatsAppButton = ({ lang: _lang }: WhatsAppButtonProps) => (
  <a
    href="#contact"
    aria-label="Réserver via le formulaire"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-xl"
  >
    <MessageCircle size={28} style={{ color: "#fff" }} />
  </a>
);

export default WhatsAppButton;
