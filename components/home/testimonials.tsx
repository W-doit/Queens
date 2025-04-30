"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

// Mock data
const testimonials = [
  {
    id: 1,
    name: "Sofía García",
    role: "Cliente Habitual",
    image: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    quote: "La calidad de las prendas de Queens es excepcional. Cada vez que uso algo de su colección, recibo elogios. El vestidor virtual me ha ayudado a encontrar piezas que realmente me favorecen.",
    rating: 5,
  },
  {
    id: 2,
    name: "Elena Martínez",
    role: "Influencer de Moda",
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    quote: "Como creadora de contenido de moda, valoro marcas que ofrecen tanto estilo como calidad. Queens sobresale en ambos aspectos. Sus diseños son únicos y el servicio al cliente es impecable.",
    rating: 5,
  },
  {
    id: 3,
    name: "Laura Fernández",
    role: "Estilista Profesional",
    image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    quote: "Trabajo con muchas marcas, pero Queens siempre es mi primera elección para mis clientas que buscan elegancia. La atención al detalle en cada prenda es simplemente incomparable.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [visibleTestimonials, setVisibleTestimonials] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-id"));
            setVisibleTestimonials((prev) => [...prev, id]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".testimonial-card");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section className="bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            Lo Que Dicen Nuestras Clientas
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Descubre por qué nuestras clientas eligen Queens para sus momentos especiales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className={`testimonial-card bg-gray-900 border-gray-800 p-6 h-full flex flex-col ${
                visibleTestimonials.includes(testimonial.id) ? "animate-fade-in" : "opacity-0"
              }`}
              style={{ transitionDelay: `${testimonial.id * 200}ms` }}
              data-id={testimonial.id}
            >
              <Quote className="text-primary h-10 w-10 mb-4" />
              
              <p className="text-gray-300 italic mb-6 flex-grow">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating ? "text-primary fill-primary" : "text-gray-500"
                    }`}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}