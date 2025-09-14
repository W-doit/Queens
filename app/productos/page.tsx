"use client";

import React, { useEffect, useRef, useState } from "react";

const introText = [
  "Puedes hacer tus compras por WhatsApp: mándanos un mensaje con lo que te guste y gestionamos el envío.",
  "También puedes reservar una videollamada para ver todo lo que tenemos en tienda y recibir nuestro asesoramiento en directo.",
];

export default function ShopPage() {
  const widgetRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!document.getElementById("EmbedSocialHashtagScript")) {
      const script = document.createElement("script");
      script.id = "EmbedSocialHashtagScript";
      script.src = "https://embedsocial.com/cdn/ht.js";
      document.head.appendChild(script);
    }
  }, []);

  return (
    <section className="py-16 relative overflow-hidden w-full">
      {/* Optional: Add a subtle background pattern for style */}
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6 animate-slide-in-right">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair">Tienda</h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
          {introText.map((line, i) => (
            <p key={i} className="text-lg text-muted-foreground">
              {line}
            </p>
          ))}
          <button
            className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow hover:bg-primary/90 transition"
            onClick={() => setShowModal(true)}
          >
            Reserva videollamada
          </button>
        </div>
        <div className="mt-10 flex justify-center">
          <div ref={widgetRef} className="w-full">
            <div
              className="embedsocial-hashtag"
              data-ref="70e39397eb347a8664ab742138713e7a592a12f5"
            >
              <a
                className="feed-powered-by-es feed-powered-by-es-feed-img es-widget-branding"
                href="https://embedsocial.com/social-media-aggregator/"
                target="_blank"
                title="Instagram widget"
              >
                <img
                  src="https://embedsocial.com/cdn/icon/embedsocial-logo.webp"
                  alt="EmbedSocial"
                />
                <div className="es-widget-branding-text">Instagram widget</div>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for Calendly */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Cerrar"
            >
              &times;
            </button>
            <iframe
              src="https://calendly.com/contactaqueens/30min"
              title="Reserva videollamada"
              width="100%"
              height="500"
              frameBorder="0"
              className="rounded-xl w-full"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}