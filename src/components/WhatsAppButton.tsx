import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/21656530516?text=Bonjour%2C%20je%20souhaite%20r%C3%A9server%20%C3%A0%20VIP%20Coco%20Beach.%20Quelle%20est%20votre%20disponibilit%C3%A9%20%3F"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Nous contacter sur WhatsApp"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-xl"
  >
    <MessageCircle size={28} style={{ color: "#fff" }} />
  </a>
);

export default WhatsAppButton;
