import React from "react";
import { useNavigate } from "react-router-dom";
import { HoverBorderGradient } from "../components/hover-border-gradient";

// CORRECCIÓN 1: El nombre del componente debe ser con mayúscula inicial (PascalCase).
const Astronomy1 = () => {
  const navigate = useNavigate();

  // La función onEmpezarClick no se usa, pero la mantenemos por si la necesitas.
  const onEmpezarClick = () => {
    navigate("/");
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        backgroundColor: "#808080", // Fondo gris
      }}
    >
      <DomeGallery openedImageWidth="80vw" openedImageHeight="80vh" />

      {/* CORRECCIÓN 2: Se usa 'left-1/2' para centrar horizontalmente y 
        se añade 'z-10' para asegurar que el botón esté sobre la galería.
      */}
      <div className="absolute bottom-40 left-11/25 transform -translate-x-1/2 z-10">
        <HoverBorderGradient
          containerClassName="rounded-lg transition flex items-center justify-center px-10 py-4 text-xl min-w-[200px] bg-black border-2 border-gray-500 hover:bg-[#FFDD0F]"
          as="button"
          onClick={() => navigate("/orbita")}
        >
          Orbits
        </HoverBorderGradient>
      </div>
    </div>
  );
};

export default Astronomy1;
