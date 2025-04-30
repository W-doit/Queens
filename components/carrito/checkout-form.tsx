"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Truck, MapPin, Building } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(2, "El nombre es demasiado corto"),
  lastName: z.string().min(2, "El apellido es demasiado corto"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(9, "Número de teléfono demasiado corto"),
  address: z.string().min(5, "Dirección demasiado corta"),
  city: z.string().min(2, "Ciudad demasiado corta"),
  postalCode: z.string().min(5, "Código postal inválido"),
  country: z.string().min(2, "País demasiado corto"),
  deliveryMethod: z.enum(["standard", "express"]),
  notes: z.string().optional(),
});

export default function CheckoutForm() {
  const [activeTab, setActiveTab] = useState("shipping");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "España",
      deliveryMethod: "standard",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setActiveTab("payment");
  }

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="shipping" className="flex items-center justify-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Envío</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center justify-center">
            <Truck className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Entrega</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center justify-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Pago</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipping">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="María" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="García" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="maria.garcia@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="+34 612 345 678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle Gran Vía, 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input placeholder="Madrid" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input placeholder="28001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instrucciones especiales para la entrega"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-gold px-6 py-2 rounded-md"
                >
                  Continuar a Entrega
                </button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="delivery">
          <div className="space-y-6">
            <div className="text-lg font-semibold mb-4">Método de Entrega</div>

            <RadioGroup defaultValue="standard" className="space-y-4">
              <div className="flex items-center space-x-2 border p-4 rounded-md hover:border-primary">
                <RadioGroupItem value="standard" id="standard" />
                <div className="grid gap-1.5 ml-2 leading-none flex-grow">
                  <label
                    htmlFor="standard"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Envío Estándar (3-5 días laborables)
                  </label>
                  <p className="text-sm text-muted-foreground">
                    €4.99
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-md hover:border-primary">
                <RadioGroupItem value="express" id="express" />
                <div className="grid gap-1.5 ml-2 leading-none flex-grow">
                  <label
                    htmlFor="express"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Envío Exprés (1-2 días laborables)
                  </label>
                  <p className="text-sm text-muted-foreground">
                    €9.99
                  </p>
                </div>
              </div>
            </RadioGroup>

            <div className="text-lg font-semibold mt-8 mb-4">Dirección de Entrega</div>
            <div className="p-4 border rounded-md">
              <div className="flex items-start">
                <Building className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p>María García</p>
                  <p className="text-muted-foreground text-sm">
                    Calle Gran Vía, 123<br />
                    Madrid, 28001<br />
                    España<br />
                    +34 612 345 678
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                className="border border-primary text-primary px-6 py-2 rounded-md hover:bg-primary/10"
                onClick={() => setActiveTab("shipping")}
              >
                Volver a Envío
              </button>
              <button
                type="button"
                className="btn-gold px-6 py-2 rounded-md"
                onClick={() => setActiveTab("payment")}
              >
                Continuar a Pago
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <div className="space-y-6">
            <div className="text-lg font-semibold mb-4">Método de Pago</div>

            <div className="p-4 border border-primary rounded-md text-center">
              <p className="mb-4">Integración con Stripe para pago seguro</p>
              <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto mb-4">
                <div className="bg-gray-100 rounded p-2 flex items-center justify-center">
                  <span className="text-xs">Visa</span>
                </div>
                <div className="bg-gray-100 rounded p-2 flex items-center justify-center">
                  <span className="text-xs">MasterCard</span>
                </div>
                <div className="bg-gray-100 rounded p-2 flex items-center justify-center">
                  <span className="text-xs">AMEX</span>
                </div>
                <div className="bg-gray-100 rounded p-2 flex items-center justify-center">
                  <span className="text-xs">PayPal</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Serás redirigido a la pasarela de pago segura de Stripe para completar tu compra.
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                className="border border-primary text-primary px-6 py-2 rounded-md hover:bg-primary/10"
                onClick={() => setActiveTab("delivery")}
              >
                Volver a Entrega
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}