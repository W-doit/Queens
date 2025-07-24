import Image from "next/image";

export default function VestidorVirtualPage() {
  return (
    <section className="virtual-fitting-section py-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative animate-slide-in-left">
            <div className="relative h-[500px] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Vestidor Virtual"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            </div>
            <div className="absolute top-4 right-4 w-40 h-40 border-4 border-primary rounded-full -rotate-12" />
            <div className="absolute bottom-4 left-4 w-24 h-24 border-2 border-primary rounded-full rotate-12" />
          </div>
          <div className="space-y-6 animate-slide-in-right">
            <h2 className="text-3xl md:text-4xl font-bold font-playfair">
              Vestidor Virtual
            </h2>
            <div className="w-24 h-1 bg-primary"></div>
            <p className="text-lg text-muted-foreground">
              Prueba nuestras prendas desde la comodidad de tu hogar con nuestra
              innovadora tecnología de vestidor virtual.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center mr-3 mt-0.5">
                  1
                </div>
                <p className="text-muted-foreground">
                  Sube una foto tuya de cuerpo completo
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center mr-3 mt-0.5">
                  2
                </div>
                <p className="text-muted-foreground">
                  Selecciona las prendas que quieras probar
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center mr-3 mt-0.5">
                  3
                </div>
                <p className="text-muted-foreground">
                  ¡Visualiza cómo te quedarían y compra tus favoritas!
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}