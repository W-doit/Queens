"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, Image as ImageIcon, RefreshCw, Check } from "lucide-react";

// Mock data for products
const products = [
  {
    id: 1,
    name: "Vestido Dorado Elegante",
    image: "https://images.pexels.com/photos/7319464/pexels-photo-7319464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Vestidos",
  },
  {
    id: 2,
    name: "Blusa Negra Satinada",
    image: "https://images.pexels.com/photos/9464654/pexels-photo-9464654.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Blusas",
  },
  {
    id: 3,
    name: "Falda Plisada Elegante",
    image: "https://images.pexels.com/photos/1385472/pexels-photo-1385472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Faldas",
  },
  {
    id: 4,
    name: "Conjunto Formal Dorado",
    image: "https://images.pexels.com/photos/8386668/pexels-photo-8386668.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Conjuntos",
  },
];

export default function VirtualFittingRoom() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset states
      setSelectedProduct(null);
      setIsComplete(false);
      
      // In a real app, we would upload the file to the server
      // For now, create a temporary URL
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      
      toast({
        title: "Imagen cargada con éxito",
        description: "Ahora puedes seleccionar una prenda para probar.",
      });
    }
  };

  const handleTakePhoto = () => {
    // In a real app, this would open the camera
    toast({
      title: "Función en desarrollo",
      description: "La captura de fotos estará disponible próximamente.",
    });
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProduct(productId);
    setIsComplete(false);
  };

  const handleTryOn = () => {
    if (!uploadedImage || selectedProduct === null) {
      toast({
        title: "Se requiere información",
        description: "Por favor, sube una imagen y selecciona una prenda para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      
      toast({
        title: "¡Prueba virtual lista!",
        description: "Puedes ver cómo te queda la prenda seleccionada.",
      });
    }, 2000);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setSelectedProduct(null);
    setIsComplete(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Side - Upload Photo */}
      <div className="lg:col-span-1">
        <Card className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-semibold mb-4 font-playfair">Tu Foto</h2>
          
          {!uploadedImage ? (
            <div className="flex-grow flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-lg p-12">
              <div className="text-center space-y-4">
                <div className="bg-primary/10 rounded-full p-4 inline-block">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium">Sube una foto tuya</h3>
                <p className="text-muted-foreground text-sm">
                  Para mejores resultados, usa una foto de cuerpo entero con un fondo simple
                </p>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    className="relative overflow-hidden"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Seleccionar Imagen
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleTakePhoto}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Tomar Foto
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col">
              <div className="relative flex-grow rounded-lg overflow-hidden mb-4 bg-gray-100">
                <Image
                  src={uploadedImage}
                  alt="Tu foto"
                  fill
                  className="object-contain"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Cambiar Foto
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Middle - Selected Product and Result */}
      <div className="lg:col-span-1">
        <Card className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-semibold mb-4 font-playfair">Resultado</h2>
          
          {!isComplete ? (
            <div className="flex-grow flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-lg p-12">
              <div className="text-center space-y-4">
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p>Procesando tu imagen...</p>
                  </>
                ) : (
                  <>
                    <p>
                      {!uploadedImage 
                        ? "Sube una foto para empezar" 
                        : !selectedProduct 
                        ? "Selecciona una prenda para probar" 
                        : "¡Haz clic en 'Probar ahora' para ver el resultado!"}
                    </p>
                    {uploadedImage && selectedProduct !== null && (
                      <Button 
                        className="btn-gold"
                        onClick={handleTryOn}
                      >
                        Probar Ahora
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col">
              <div className="relative flex-grow rounded-lg overflow-hidden mb-4 bg-gray-100">
                {/* In a real app, this would be the processed image */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                  <p className="text-sm text-center p-4">
                    Vista previa simulada - En una implementación real, se mostraría la prenda superpuesta en tu imagen usando IA.
                  </p>
                </div>
           {uploadedImage && (
  <Image
    src={uploadedImage}
    alt="Resultado"
    fill
    className="object-contain opacity-80"
  />
)}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-grow"
                  onClick={handleReset}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reiniciar
                </Button>
                <Button 
                  size="sm"
                  className="flex-grow btn-gold"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Añadir al Carrito
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Right Side - Product Selection */}
      <div className="lg:col-span-1">
        <Card className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-semibold mb-4 font-playfair">Selecciona una Prenda</h2>
          
          <Tabs defaultValue="vestidos" className="flex-grow">
            <TabsList className="grid grid-cols-4 w-full mb-4">
              <TabsTrigger value="vestidos">Vestidos</TabsTrigger>
              <TabsTrigger value="blusas">Blusas</TabsTrigger>
              <TabsTrigger value="faldas">Faldas</TabsTrigger>
              <TabsTrigger value="conjuntos">Conjuntos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vestidos" className="flex-grow">
              <div className="grid grid-cols-2 gap-4">
                {products
                  .filter(p => p.category === "Vestidos")
                  .map(product => (
                    <div 
                      key={product.id}
                      className={`cursor-pointer group relative rounded-lg overflow-hidden border ${
                        selectedProduct === product.id 
                          ? 'border-primary ring-2 ring-primary' 
                          : 'border-border hover:border-primary'
                      }`}
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      {/* <div className="aspect-[3/4] relative"> */}
                      <div className="relative overflow-hidden aspect-[3/4] flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400 text-6xl">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <path d="M8 17l4-4 4 4" strokeWidth="2" />
      <circle cx="9" cy="9" r="2" strokeWidth="2" />
    </svg>
  </span>
                        {/* <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        /> */}
                        {selectedProduct === product.id && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-center text-sm truncate">
                        {product.name}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="blusas" className="flex-grow">
              <div className="grid grid-cols-2 gap-4">
                {products
                  .filter(p => p.category === "Blusas")
                  .map(product => (
                    <div 
                      key={product.id}
                      className={`cursor-pointer group relative rounded-lg overflow-hidden border ${
                        selectedProduct === product.id 
                          ? 'border-primary ring-2 ring-primary' 
                          : 'border-border hover:border-primary'
                      }`}
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      {/* <div className="aspect-[3/4] relative">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        /> */}
                                            <div className="relative overflow-hidden aspect-[3/4] flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400 text-6xl">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <path d="M8 17l4-4 4 4" strokeWidth="2" />
      <circle cx="9" cy="9" r="2" strokeWidth="2" />
    </svg>
  </span>
                        {selectedProduct === product.id && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-center text-sm truncate">
                        {product.name}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="faldas" className="flex-grow">
              <div className="grid grid-cols-2 gap-4">
                {products
                  .filter(p => p.category === "Faldas")
                  .map(product => (
                    <div 
                      key={product.id}
                      className={`cursor-pointer group relative rounded-lg overflow-hidden border ${
                        selectedProduct === product.id 
                          ? 'border-primary ring-2 ring-primary' 
                          : 'border-border hover:border-primary'
                      }`}
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      {/* <div className="aspect-[3/4] relative">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        /> */}
                                            <div className="relative overflow-hidden aspect-[3/4] flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400 text-6xl">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <path d="M8 17l4-4 4 4" strokeWidth="2" />
      <circle cx="9" cy="9" r="2" strokeWidth="2" />
    </svg>
  </span>
                        {selectedProduct === product.id && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-center text-sm truncate">
                        {product.name}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="conjuntos" className="flex-grow">
              <div className="grid grid-cols-2 gap-4">
                {products
                  .filter(p => p.category === "Conjuntos")
                  .map(product => (
                    <div 
                      key={product.id}
                      className={`cursor-pointer group relative rounded-lg overflow-hidden border ${
                        selectedProduct === product.id 
                          ? 'border-primary ring-2 ring-primary' 
                          : 'border-border hover:border-primary'
                      }`}
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      {/* <div className="aspect-[3/4] relative">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        /> */}
                                            <div className="relative overflow-hidden aspect-[3/4] flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400 text-6xl">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
      <path d="M8 17l4-4 4 4" strokeWidth="2" />
      <circle cx="9" cy="9" r="2" strokeWidth="2" />
    </svg>
  </span>
                        {selectedProduct === product.id && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-center text-sm truncate">
                        {product.name}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// Import missing component
import { ShoppingCart } from "lucide-react";