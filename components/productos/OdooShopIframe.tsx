import React from "react";

const OdooShopIframe: React.FC = () => (
  <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 10 }}>
    <iframe
      src="https://queens6.odoo.com/shop"
      width="100%"
      height="100%"
      style={{ border: "none", width: "100vw", height: "100vh" }}
      loading="lazy"
      title="Tienda Odoo"
    />
  </div>
);

export default OdooShopIframe;