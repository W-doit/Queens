"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

const recoverySchema = z.object({
  email: z.string().email({
    message: "Por favor, introduce un correo electrónico válido",
  }),
});

type RecoveryFormValues = z.infer<typeof recoverySchema>;

export default function PasswordRecoveryForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: RecoveryFormValues) {
    setIsLoading(true);

    try {
      // Here you would normally implement your password recovery logic
      // For demo purposes, we'll simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Recovery email:", data.email);
      
      // Mark form as submitted
      setIsSubmitted(true);
      
    } catch (error) {
      console.error("Recovery error:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "No pudimos procesar tu solicitud. Por favor, intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <Card className="p-8 border-primary/20 text-center">
        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Mail className="text-primary h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold mb-4 font-playfair">Correo Enviado</h2>
        <p className="text-muted-foreground mb-6">
          Hemos enviado un correo con las instrucciones para recuperar tu contraseña a{" "}
          <strong>{form.getValues().email}</strong>. Por favor, revisa tu bandeja de entrada.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Si no recibes el correo en unos minutos, revisa tu carpeta de spam o solicita un nuevo correo.
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => setIsSubmitted(false)} 
            variant="outline" 
            className="w-full"
          >
            Volver a intentar
          </Button>
          <Button asChild className="w-full">
            <Link href="/login" className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Iniciar Sesión
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-primary/20">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="tu@ejemplo.com"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full btn-gold" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Instrucciones"
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Recordaste tu contraseña?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </Card>
  );
}