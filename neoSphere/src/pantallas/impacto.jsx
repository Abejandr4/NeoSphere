// src/pantallas/Impacto.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import { simulateAsteroidImpact } from "../utils/Operaciones";

const IMPACT_POSITION = [19.0413, -98.2062];
const MAP_ZOOM = 9;
const MAX_DISTANCE_KM = 500;

// --- CONFIGURACIÓN DE ESTILOS POR EFECTO ---
const effectStyles = {
  "Cráter": {
    text: "text-violet-500",
    bg: "bg-violet-500",
    accent: "accent-violet-500",
    border: "border-violet-500",
    hex: "#8b5cf6" // Para Leaflet (Circle)
  },
  "Onda de Choque": {
    text: "text-yellow-500",
    bg: "bg-yellow-500",
    accent: "accent-yellow-500",
    border: "border-yellow-500",
    hex: "#eab308"
  },
  "Retorno de eyecciones": {
    text: "text-green-500",
    bg: "bg-green-500",
    accent: "accent-green-500",
    border: "border-green-500",
    hex: "#22c55e"
  },
  "Radiación Térmica": {
    text: "text-pink-500",
    bg: "bg-pink-500",
    accent: "accent-pink-500",
    border: "border-pink-500",
    hex: "#ec4899"
  },
};

const headerTextsByEffect = {
  "Cráter": "Este es el efecto del cráter. ¡Puedes ver en el mapa un círculo que representa el diámetro del impacto!",
  "Onda de Choque": "¡La onda de choque expansiva es destructiva! Se propaga a través de la atmósfera causando daños estructurales.",
  "Retorno de eyecciones": "El material eyectado por el impacto es lanzado a la atmósfera y regresa al suelo cubriendo grandes áreas.",
  "Radiación Térmica": "La radiación térmica se propaga a la velocidad de la luz y puede provocar incendios y quemaduras instantáneas.",
};

const Impacto = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { simulationResults: initialResults, inputParameters: inputs } =
    location.state || {};

  useEffect(() => {
    if (!initialResults || !inputs) {
      console.error("Faltan los parámetros de simulación. Redirigiendo...");
      navigate("/skyfallx-game");
    }
  }, [initialResults, inputs, navigate]);

  const [distanceSliderValue, setDistanceSliderValue] = useState(20);
  const [selectedEffect, setSelectedEffect] = useState("Cráter");
  const [headerText, setHeaderText] = useState(headerTextsByEffect["Cráter"]);

  // Obtenemos el estilo activo actual de forma memoizada
  const activeStyle = useMemo(() => 
    effectStyles[selectedEffect] || effectStyles["Cráter"], 
  [selectedEffect]);

  const currentDistanceKm = useMemo(
    () => (distanceSliderValue / 100) * MAX_DISTANCE_KM,
    [distanceSliderValue]
  );

  const recalculatedEffects = useMemo(() => {
    if (!inputs) return null;
    const currentInputs = {
      ...inputs,
      distance_from_impact_km: currentDistanceKm,
    };
    return simulateAsteroidImpact(currentInputs);
  }, [inputs, currentDistanceKm]);

  if (!inputs || !initialResults || !recalculatedEffects) {
    return (
      <div className="bg-blue-950 text-red-500 min-h-screen p-5 text-center flex items-center justify-center">
        <p className="text-xl font-bold">Cargando datos de la simulación...</p>
      </div>
    );
  }

  const {
    impactEnergyMegatons = 0,
    crater = { finalDiameter_m: 0, transientDiameter_m: 0, type: "N/A" },
    airBlast = {
      overpressure_Pa: 0,
      wind_velocity_ms: 0,
      arrival_time_s: 0,
      damageDescription: "N/A",
    },
    seismicEffects: rawSeismicEffects,
    thermalRadiation = {
      thermalExposure_Jm2: 0,
      fireballRadius_km: 0,
      ignitionEffects: "N/A",
    },
    ejecta: rawEjecta,
    scenario = "N/A",
    burstAltitude = 0,
  } = recalculatedEffects;

  const seismicEffects = rawSeismicEffects || {
    richterMagnitude: 0,
    mercalliIntensity: "N/A",
    effectiveMagnitude: 0,
    arrival_time_s: 0,
  };
  const ejecta = rawEjecta || {
    thickness_m: 0,
    meanFragmentSize_mm: 0,
    message: "No hay eyecciones.",
  };

  const craterRadiusMeters =
    scenario !== "Explosión Aérea" && crater.finalDiameter_m
      ? crater.finalDiameter_m / 2
      : 0;

  const displayData = {
    zone: "Puebla",
    totalEnergy: `${impactEnergyMegatons.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} MT`,
    craterDetails: {
      finalDiameter: `${(crater.finalDiameter_m / 1000).toFixed(2)} km`,
      transientDiameter: `${(crater.transientDiameter_m / 1000).toFixed(2)} km`,
      type: crater.type === "Simple" ? "Simple" : "Complejo",
    },
    seismicDetails: {
      magnitude: seismicEffects.richterMagnitude.toFixed(2),
      richterScale: seismicEffects.richterMagnitude.toFixed(2),
      mercalliIntensity: seismicEffects.mercalliIntensity,
    },
    impactCoordinates: IMPACT_POSITION,
    mapCenter: IMPACT_POSITION,
    mapZoom: MAP_ZOOM,
    currentDistanceKm: currentDistanceKm.toFixed(1),
  };

  const renderEffectDetails = useCallback(() => {
    if (scenario === "Explosión Aérea" || scenario === "Airburst") {
      if (selectedEffect === "Cráter")
        return (
          <p className="text-base font-medium mt-2 text-white italic">
            No se forma cráter. Explosión aérea a {(burstAltitude / 1000).toFixed(1)} km de altitud.
          </p>
        );
      if (selectedEffect === "Retorno de eyecciones")
        return (
          <p className="text-base font-medium mt-2 text-white italic">
            No hay eyecciones significativas debido a la explosión aérea.
          </p>
        );
    }

    switch (selectedEffect) {
      case "Cráter":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="font-medium text-red-500 text-lg">
              ¡El círculo de color en el mapa representa el cráter!
            </p>
            <p className="font-medium text-gray-300">
              Diámetro Final: <span className="font-bold text-white text-base">{displayData.craterDetails.finalDiameter}</span>
            </p>
            <p className="font-medium text-gray-300">
              Diámetro Transitorio: <span className="font-bold text-white text-base">{displayData.craterDetails.transientDiameter}</span>
            </p>
            <p className="font-medium text-gray-300">
              Tipo: <span className="font-bold text-white text-base">{displayData.craterDetails.type}</span>
            </p>
          </div>
        );
      case "Onda de Choque":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="text-lg font-bold text-yellow-400">{airBlast.overpressure_Pa.toLocaleString()} Pa</p>
            <p className="font-medium text-gray-300">
              Tiempo de llegada: <span className="font-bold text-white text-base">{airBlast.arrival_time_s.toFixed(1)} s</span>
            </p>
            <p className="font-medium text-gray-300">
              Velocidad del viento: <span className="font-bold text-white text-base">{airBlast.wind_velocity_ms.toFixed(1)} m/s</span>
            </p>
            <p className="text-sm mt-2 text-yellow-400 font-bold italic">Daño Esperado: {airBlast.damageDescription}</p>
          </div>
        );
      case "Radiación Térmica":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="text-lg font-bold text-pink-400">
              {thermalRadiation.thermalExposure_Jm2.toLocaleString(undefined, { maximumFractionDigits: 0 })} J/m²
            </p>
            <p className="font-medium text-gray-300">
              Radio de la bola de fuego: <span className="font-bold text-white text-base">{thermalRadiation.fireballRadius_km.toFixed(2)} km</span>
            </p>
            <p className="text-sm mt-2 text-pink-400 font-bold italic">Efectos de Ignición: {thermalRadiation.ignitionEffects}</p>
          </div>
        );
      case "Retorno de eyecciones":
        if (typeof ejecta.thickness_m === "undefined" || ejecta.thickness_m === 0)
          return <p className="text-base font-medium mt-2 text-white italic">{ejecta.message}</p>;

        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="font-medium text-gray-300">
              Grosor de la capa: <span className="font-bold text-white text-base">{(ejecta.thickness_m * 1000).toFixed(2)} mm</span>
            </p>
            <p className="font-medium text-gray-300">
              Tamaño promedio fragmentos: <span className="font-bold text-white text-base">{ejecta.meanFragmentSize_mm.toFixed(2)} mm</span>
            </p>
          </div>
        );
      default:
        return <p className="text-base font-medium mt-2 text-white">Selecciona un efecto.</p>;
    }
  }, [selectedEffect, scenario, crater, airBlast, thermalRadiation, ejecta, burstAltitude, displayData]);

  const effectButtons = [
    { name: "Cráter", label: "Cráter" },
    { name: "Onda de Choque", label: "Onda de Choque" },
    { name: "Retorno de eyecciones", label: "Retorno de eyecciones" },
    { name: "Radiación Térmica", label: "Radiación Térmica" },
  ];

  const renderEffectButton = ({ name, label }) => {
    const isActive = selectedEffect === name;
    const style = effectStyles[name];
    
    return (
      <button
        key={name}
        className={`p-3 flex-1 min-w-40 text-lg font-semibold rounded-xl transition-all shadow-md 
          ${isActive 
            ? `${style.bg} text-black transform scale-105` 
            : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          }
        `}
        onClick={() => {
          setSelectedEffect(name);
          setHeaderText(headerTextsByEffect[name]); 
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="h-screen overflow-y-auto bg-blue-950 text-white font-sans p-4 sm:p-6">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 max-w-7xl mx-auto">
        
        {/* Header con transición de color */}
        <header className="px-0 sm:px-10 py-10 border-b border-gray-800 mb-6 transition-all duration-500">
          <h1 className={`text-3xl font-bold tracking-widest transition-colors duration-500 ${activeStyle.text}`}>
            RESULTADOS DE LA SIMULACIÓN
          </h1>
          <div className="mt-4 text-xl text-gray-300 leading-relaxed min-h-12">
             <p>{headerText}</p>
          </div>
        </header>

        {/* Sección de Botones */}
        <div className="w-full bg-gray-800/50 p-6 rounded-xl shadow-xl mb-8 border border-gray-700">
          <h2 className={`text-xl font-bold mb-4 transition-colors duration-500 ${activeStyle.text}`}>
            Ver Detalles por Fenómeno
          </h2>
          <div className="flex flex-wrap gap-4">
            {effectButtons.map(renderEffectButton)}
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Columna Mapa */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
              <h2 className={`text-xl font-bold mb-3 transition-colors duration-500 ${activeStyle.text}`}>
                Zona de Impacto: <span className="text-white text-2xl ml-2">{displayData.zone}</span>
              </h2>
              <div className="h-96 rounded-lg overflow-hidden border border-gray-700 shadow-inner">
                <MapContainer center={displayData.mapCenter} zoom={displayData.mapZoom} scrollWheelZoom={false} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {(scenario !== "Airburst" && scenario !== "Explosión Aérea") && craterRadiusMeters > 0 ? (
                    <Circle 
                      center={IMPACT_POSITION} 
                      radius={craterRadiusMeters} 
                      pathOptions={{ 
                        color: activeStyle.hex, 
                        fillColor: activeStyle.hex, 
                        fillOpacity: 0.5, 
                        weight: 3 
                      }} 
                    />
                  ) : (
                    <Marker position={IMPACT_POSITION} />
                  )}
                </MapContainer>
              </div>
            </div>

            <div className="bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700">
              <h2 className={`text-xl font-bold mb-2 transition-colors duration-500 ${activeStyle.text}`}>Energía Total Liberada:</h2>
              <p className="text-4xl font-extrabold text-white">{displayData.totalEnergy}</p>
            </div>
          </div>

          {/* Columna Detalles Dinámicos */}
          <div className={`space-y-5 bg-gray-800 p-6 rounded-xl shadow-xl border-t-8 transition-all duration-500 ${activeStyle.border}`}>
            <h2 className={`text-xl font-bold transition-colors duration-500 ${activeStyle.text}`}>
              Detalles del Impacto a Distancia
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-lg font-medium text-gray-300">Distancia del observador</span>
                <span className={`text-3xl font-bold transition-colors duration-500 ${activeStyle.text}`}>
                  {displayData.currentDistanceKm} km
                </span>
              </div>
              <input
                type="range" min="0" max="100" value={distanceSliderValue}
                onChange={(e) => setDistanceSliderValue(Number(e.target.value))}
                className={`w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer ${activeStyle.accent}`}
              />
            </div>

            <div className="space-y-1 pt-3 border-t border-gray-700">
              <p className="text-sm uppercase tracking-tighter text-gray-400">Efecto seleccionado</p>
              <p className={`text-3xl font-bold transition-colors duration-500 ${activeStyle.text}`}>
                {selectedEffect}
              </p>
            </div>

            <div className="min-h-30 bg-black/20 p-4 rounded-lg border border-gray-700/50">
              {renderEffectDetails()}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-700">
              <h3 className={`text-xl font-bold transition-colors duration-500 ${activeStyle.text}`}>
                Efectos Sísmicos (a {displayData.currentDistanceKm} km)
              </h3>
              <p className="text-4xl font-extrabold text-red-500">MAG: {displayData.seismicDetails.magnitude}</p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <p className="text-sm text-gray-400 font-medium">Escala Richter: <br/><span className="text-lg text-white">{displayData.seismicDetails.richterScale}</span></p>
                <p className="text-sm text-gray-400 font-medium">Intensidad Mercalli: <br/><span className="text-lg text-white">{displayData.seismicDetails.mercalliIntensity}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            className="px-12 py-4 text-2xl font-extrabold rounded-xl shadow-2xl transition-all bg-gray-700 hover:bg-gray-600 hover:scale-105 text-white border-b-4 border-gray-900 active:border-b-0"
            onClick={() => navigate("/result")}
          >
            RESUMEN FINAL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Impacto;