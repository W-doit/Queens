"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const introText = [
  "Puedes hacer tus compras por WhatsApp: mándanos un mensaje con lo que te guste y gestionamos el envío.",
  "También puedes reservar una videollamada para ver todo lo que tenemos en tienda y recibir nuestro asesoramiento en directo."
];

export default function ContactoPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="py-16 relative overflow-hidden w-full">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6 animate-slide-in-right">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair">Contacto</h2>
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

        {/* Contact Details */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold font-playfair text-center mb-8">Nuestros Datos de Contacto</h3>
          <div className="space-y-6">
            <div className="flex items-start p-4 bg-card rounded-lg shadow">
              <MapPin className="h-6 w-6 text-primary mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Dirección</h4>
                <p className="text-muted-foreground">
                  Calle Camino Viejo de Málaga 14G, Vélez-Málaga, 29700
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-card rounded-lg shadow">
              <Phone className="h-6 w-6 text-primary mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Teléfono</h4>
                <a href="tel:+34614469886" className="text-muted-foreground hover:text-primary transition">
                  +34 614 46 98 86
                </a>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-card rounded-lg shadow">
              <Mail className="h-6 w-6 text-primary mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Email</h4>
                <a href="mailto:contactaqueens@gmail.com" className="text-muted-foreground hover:text-primary transition">
                  contactaqueens@gmail.com
                </a>
              </div>
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
