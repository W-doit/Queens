import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  productName: string;
}

export default function WhatsAppButton({ productName }: WhatsAppButtonProps) {
  const phone = "+34614469886";
  const msg = `¡Hola! Me interesa el producto "${productName}".`;
  const link = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    return (
    <Button
      onClick={() => window.open(link, "_blank")}
      variant="outline"
      className="flex items-center gap-2 border-green-600 text-green-700 hover:bg-green-50"
    >
      <MessageCircle className="w-4 h-4" />
      Me interesa
    </Button>
  );
}