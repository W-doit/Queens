// // we're going to use this component to create a new product and edit an existing one in the future
// "use client";
// import { useForm } from "react-hook-form";
// import {
//     Form,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormControl,
//     FormMessage,
// }from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { useState } from "react";

// type ProductFormValues = {
//   name: string;
//   list_price: number;
//   type: string;
//   barcode: string;
//   image_1920: File | null;
//   categ_id: string;
//   description: string;
//   description_sale: string;
//   default_code: string;
// };

// // this function calculate de final price for the customer PVP
// function priceCalculator(price: number) {
//     const tax = price * 1.21;
//     const finalPvp = tax * 2;
//     return {
//         tax,
//         finalPvp,
//     }
// }

// export default function ProductForm() {
//     const { toast } = useToast();
//     const [price, setPrice] = useState(0);
//     const { tax, finalPvp } = priceCalculator(price);

//     const form = useForm<ProductFormValues>({
//         defaultValues: {
//             name: "",
//             list_price: 0,
//             type: "",
//             barcode: "",
//             image_1920: null,
//             categ_id: "",
//             description: "",
//             description_sale: "",
//             default_code: "",
//         },
//     });
    
//     const imageFile = form.watch("image_1920");

//     const onSubmit = (data: ProductFormValues) => {
//         console.log("Formulario", data);
//         alert("Mockup de producto creado");
//         // Handle form submission logic here
//     };


//   return (
//   <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto bg-white p-6 shadow rounded">
//         <FormField
//           control={form.control}
//           name="name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Nombre</FormLabel>
//               <FormControl>
//                 <Input {...field} placeholder="Nombre del producto" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//     <FormField
//           control={form.control}
//           name="list_price"
//           render={({ field }) => (
//       <FormItem>
//               <FormLabel>Precio base</FormLabel>
//               <FormControl>
//                 <Input
//                   type="number"
//                   step="0.01"
//                   {...field}
//                   onChange={e => {
//                     field.onChange(e);
//                     setPrice(Number(e.target.value));
//                   }}
//                 />
//               </FormControl>
//               <div className="flex items-center space-x-4 mt-2">
//                 <span className="text-xs text-gray-500">
//                   +21%: <b>€{tax.toFixed(2)}</b>
//                 </span>
//                 <span className="text-xs text-gray-700">
//                   PVP final: <b>€{finalPvp.toFixed(2)}</b>
//                 </span>
//               </div>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//             <FormField
//           control={form.control}
//           name="type"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Tipo</FormLabel>
//               <FormControl>
//                 <select {...field} className="w-full p-2 border rounded">
//                   <option value="consumable">Vestidos</option>
//                   <option value="service">Pantalones</option>
//                   <option value="product">Chaquetas</option>
//                 </select>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

       
//         <FormField
//           control={form.control}
//           name="barcode"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Código de Barras</FormLabel>
//               <FormControl>
//                 <Input {...field} placeholder="Ej: 7501234567890" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

// <FormItem>
//           <FormLabel>Imagen</FormLabel>
//           <FormControl>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) =>
//                 form.setValue("image_1920", e.target.files?.[0] || null)
//               }
//               className="w-full"
//             />
//        </FormControl>
//           {imageFile && (
//             <img
//               src={URL.createObjectURL(imageFile)}
//               alt="Vista previa"
//               className="w-32 h-32 object-cover mt-2 border rounded"
//             />
//           )}
//         </FormItem>

//           <FormField
//           control={form.control}
//           name="categ_id"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Categoría</FormLabel>
//               <FormControl>
//                 <Input {...field} placeholder="ID o nombre de la categoría" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//             <FormField
//           control={form.control}
//           name="description"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Descripción interna</FormLabel>
//               <FormControl>
//                 <Textarea {...field} placeholder="Uso interno" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//             <FormField
//           control={form.control}
//           name="description_sale"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Descripción para el cliente</FormLabel>
//               <FormControl>
//                 <Textarea {...field} placeholder="Lo que verá el cliente" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//      <FormField
//           control={form.control}
//           name="default_code"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Código interno (SKU)</FormLabel>
//               <FormControl>
//                 <Input {...field} placeholder="Ej: ABC123" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />


//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >   Enviar
//         </button>
//       </form>
//     </Form> 
//   );
// };