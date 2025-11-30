import React from "react";

export default function WhatsappButton() {
  return (
    <a
      href="https://wa.me/34614469886" // 
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg flex items-center justify-center w-36 h-12 transition-all duration-200"
      aria-label="Contactar por WhatsApp"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)", fontSize: "1.1rem", fontWeight: 600 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="28"
        height="28"
        fill="currentColor"
        className="mr-2"
      >
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.66 1.934 6.66L4 29l7.49-1.934A12.96 12.96 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.91-.52-5.6-1.51l-.4-.23-4.45 1.15 1.18-4.34-.26-.41A9.97 9.97 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.36-.26.29-1 1-.97 2.43.03 1.43.98 2.81 1.12 3 .14.19 2.04 3.12 5.02 4.25.7.24 1.25.38 1.68.49.71.18 1.36.16 1.87.1.57-.07 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z" />
      </svg>
      WhatsApp
    </a>
  );
}
