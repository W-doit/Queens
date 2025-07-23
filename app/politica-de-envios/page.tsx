export default function PoliticaDeEnviosPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Política de Envíos y Devoluciones</h1>
      <h2 className="text-xl font-semibold mb-4">Envíos</h2>
      <p className="mb-6">
        Realizamos envíos a toda España peninsular. Los pedidos se procesan en un plazo de 24-48 horas laborables y el tiempo de entrega estimado es de 2 a 5 días laborables, dependiendo de la ubicación. Los gastos de envío se calculan al finalizar la compra y pueden variar según el destino y el peso del pedido.
      </p>
      <h2 className="text-xl font-semibold mb-4">Devoluciones</h2>
      <p className="mb-2">
        Si no quedas satisfecho/a con tu compra, puedes solicitar la devolución de los productos en un plazo de 14 días naturales desde la recepción del pedido. Para ello, los productos deben estar en perfecto estado, sin usar y con su embalaje original.
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li>El cliente es responsable de los gastos de envío de la devolución, salvo error o defecto en el producto.</li>
        <li>Una vez recibida y revisada la mercancía, se procederá al reembolso del importe correspondiente en un plazo máximo de 7 días laborables.</li>
        <li>No se aceptan devoluciones de productos personalizados o usados.</li>
      </ul>
      <p className="mb-2">
        Para gestionar una devolución, contacta con nosotros a través del correo <a href="mailto:contactaqueens@gmail.com" className="text-primary underline">contactaqueens@gmail.com</a> indicando tu número de pedido y el motivo de la devolución.
      </p>
      <p>
        Para más información, consulta nuestros Términos y Condiciones o ponte en contacto con nuestro equipo de atención al cliente.
      </p>
    </div>
  );
}
