"use client";
import React from "react";

const MENU_HEIGHT_DESKTOP = 72; 
const MENU_HEIGHT_MOBILE = 72;

function getMenuHeight() {
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    return MENU_HEIGHT_MOBILE;
  }
  return MENU_HEIGHT_DESKTOP;
}

const OdooShopIframe: React.FC = () => {
  const [menuHeight, setMenuHeight] = React.useState(getMenuHeight());

  React.useEffect(() => {
    const handleResize = () => setMenuHeight(getMenuHeight());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: menuHeight,
        left: 0,
        width: "100vw",
        height: `calc(100vh - ${menuHeight}px)`,
        zIndex: 10,
      }}
    >
      <iframe
        src="https://queens6.odoo.com/shop"
        width="100%"
        height="100%"
        style={{ border: "none", width: "100vw", height: "100%" }}
        loading="lazy"
        title="Tienda Odoo"
      />
    </div>
  );
};

export default OdooShopIframe;