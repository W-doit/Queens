import React from "react";

export default function FAQPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Preguntas Frecuentes</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">¿Cuánto tarda en llegar mi pedido?</h2>
          <p>El tiempo de entrega habitual es de 24 a 72 horas laborables en España peninsular. Los envíos internacionales pueden tardar más dependiendo del destino.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">¿Cómo puedo hacer el seguimiento de mi pedido?</h2>
          <p>Recibirás un correo electrónico con el número de seguimiento una vez que tu pedido haya sido enviado. También puedes consultar el estado en tu cuenta.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">¿Puedo cambiar o cancelar mi pedido?</h2>
          <p>Puedes solicitar cambios o cancelaciones antes de que el pedido sea enviado. Contáctanos lo antes posible para gestionar tu solicitud.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">¿Cuál es la política de devoluciones?</h2>
          <p>Dispones de 14 días naturales desde la recepción del pedido para solicitar una devolución. El producto debe estar en perfectas condiciones y con su embalaje original.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">¿Qué métodos de pago aceptan?</h2>
          <p>Aceptamos tarjetas de crédito/débito, PayPal y otros métodos seguros de pago online.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">¿Cómo contacto con atención al cliente?</h2>
          <p>Puedes escribirnos a <a href="mailto:contactaqueens@gmail.com" className="text-primary underline">contactaqueens@gmail.com</a> o llamarnos al <a href="tel:+34614469886" className="text-primary underline">+34 614 46 98 86</a>.</p>
        </div>
      </div>
    </main>
  );
}
