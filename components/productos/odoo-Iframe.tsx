// import React, { useEffect, useState } from 'react';

// const OdooIframe: React.FC = () => {
//   const [iframeUrl, setIframeUrl] = useState<string | null>(null);

//   useEffect(() => {
//     // simulate an API call to get the Odoo URL
//     setIframeUrl("/api/odoo-login");
//   }, []);

//   return (
//     <div style={{ position: "relative", height: "800px" }}>
//       {!iframeUrl && <p>Cargando Odoo...</p>}
//       {iframeUrl && (
//         <iframe
//           src={iframeUrl}
//           width="100%"
//           height="800"
//           style={{ border: "none" }}
//         />
//       )}
//     </div>
//   );
// };

// export default OdooIframe;