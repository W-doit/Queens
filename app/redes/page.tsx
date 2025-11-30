"use client";

import React, { useEffect, useRef } from "react";

export default function RedesPage() {
  const widgetRef = useRef(null);

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
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6 animate-slide-in-right">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair">Redes Sociales</h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">
            Síguenos en Instagram para ver nuestras últimas colecciones y novedades
          </p>
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
    </section>
  );
}
