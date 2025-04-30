import VirtualFittingRoom from '@/components/vestidor-virtual/virtual-fitting-room';

export default function VestidorVirtualPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">Vestidor Virtual</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Prueba nuestras prendas virtualmente para encontrar tu estilo perfecto antes de comprar
        </p>
      </div>
      
      <VirtualFittingRoom />
    </div>
  );
}