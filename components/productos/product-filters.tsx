"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

const categories = [
  { id: "vestidos", label: "Vestidos" },
  { id: "blusas", label: "Blusas" },
  { id: "faldas", label: "Faldas" },
  { id: "pantalones", label: "Pantalones" },
  { id: "chaquetas", label: "Chaquetas" },
  { id: "accesorios", label: "Accesorios" },
];

const sizes = [
  { id: "xs", label: "XS" },
  { id: "s", label: "S" },
  { id: "m", label: "M" },
  { id: "l", label: "L" },
  { id: "xl", label: "XL" },
];

const colors = [
  { id: "negro", label: "Negro", color: "bg-black" },
  { id: "blanco", label: "Blanco", color: "bg-white" },
  { id: "dorado", label: "Dorado", color: "bg-amber-500" },
  { id: "plateado", label: "Plateado", color: "bg-gray-300" },
  { id: "rojo", label: "Rojo", color: "bg-red-600" },
  { id: "azul", label: "Azul", color: "bg-blue-600" },
];

export default function ProductFilters({
  filters,
  setFilters,
}: {
  filters: {
    categories: string[];
    sizes: string[];
    colors: string[];
    priceRange: [number, number];
  };
  setFilters: React.Dispatch<React.SetStateAction<typeof filters>>;
}) {

const handleCategoryChange = (category: string) => {
  setFilters((prev) => ({
    ...prev,
    categories: prev.categories.includes(category)
      ? prev.categories.filter((c) => c !== category)
      : [...prev.categories, category],
  }));
};

  const handleSizeChange = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleColorChange = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

    const handlePriceChange = (range: [number, number]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: range,
    }));
  };

  const handleReset = () => {
    setFilters({
      categories: [],
      sizes: [],
      colors: [],
      priceRange: [0, 300],
    });
  };


  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Filtros</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReset}
        >
          Restablecer
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["category", "price", "size", "color"]}>
        <AccordionItem value="category">
          <AccordionTrigger className="text-base font-medium py-2">Categorías</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 mt-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <Checkbox 
                    id={category.id} 
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => handleCategoryChange(category.id)}                  
                    />
                  <label 
                    htmlFor={category.id} 
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium py-2">Precio</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-2">
              <Slider
                defaultValue={[0, 300]}
                max={300}
                step={10}
                   value={filters.priceRange}
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm">€{filters.priceRange[0]}</span>
                <span className="text-sm">€{filters.priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger className="text-base font-medium py-2">Talla</AccordionTrigger>
       <AccordionContent>
            <div className="flex flex-wrap gap-2 mt-2">
              {sizes.map((size) => (
                <div 
                  key={size.id}
                  className={`size-box border border-border rounded-md flex items-center justify-center w-10 h-10 cursor-pointer hover:border-primary transition-colors 
                    ${filters.sizes.includes(size.id) ? 'bg-primary text-black border-primary' : 'bg-background'}`}
                  onClick={() => handleSizeChange(size.id)}
                >
                  {size.label}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color">
          <AccordionTrigger className="text-base font-medium py-2">Color</AccordionTrigger>
   <AccordionContent>
            <div className="flex flex-wrap gap-2 mt-2">
              {colors.map((color) => (
                <div 
                  key={color.id} 
                  className={`color-box rounded-full w-8 h-8 cursor-pointer transition-transform ${color.color} border ${
                    filters.colors.includes(color.id) 
                      ? 'scale-110 shadow-md border-primary' 
                      : 'border-gray-300 hover:scale-110'
                  }`}
                  title={color.label}
                  onClick={() => handleColorChange(color.id)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="w-full mt-6 btn-gold" onClick={() => {}}>Aplicar Filtros</Button>
    </div>
  );
}