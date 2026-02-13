// src/pantallas/Impacto.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import TextType from "../components/TextType";

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

const Impacto = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { simulationResults: initialResults, inputParameters: inputs } =
    location.state || {};

  useEffect(() => {
    if (!initialResults || !inputs) {
      console.error("Faltan los parámetros de simulación. Redirigiendo.");
      navigate("/skyfallx-game");
    }
  }, [initialResults, inputs, navigate]);

  const [distanceSliderValue, setDistanceSliderValue] = useState(20);
  const [selectedEffect, setSelectedEffect] = useState("Cráter");

  // --- NUEVO: Estado para el texto del header ---
  const [headerText, setHeaderText] = useState(["Efecto de escritura de texto"]);

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
      <div className="bg-blue-950 text-violet-500 min-h-screen p-5 text-center flex items-center justify-center">
        <p className="text-xl">Cargando datos de la simulación...</p>
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
          <p className="text-base font-medium mt-2 text-white">
            No se forma cráter. Explosión aérea a {(burstAltitude / 1000).toFixed(1)}{" "}
            km de altitud.
          </p>
        );
      if (selectedEffect === "Retorno de eyecciones")
        return (
          <p className="text-base font-medium mt-2 text-white">
            No hay eyecciones significativas debido a la explosión aérea.
          </p>
        );
    }

    switch (selectedEffect) {
      case "Cráter":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="font-medium text-red-500 text-lg">
              ¡El círculo rojo en el mapa es el tamaño del cráter!
            </p>
            <p className="font-medium">
              Diámetro Final:{" "}
              <span className="font-bold text-white text-base">
                {displayData.craterDetails.finalDiameter}
              </span>
            </p>
            <p className="font-medium">
              Diámetro Transitorio:{" "}
              <span className="font-bold text-white text-base">
                {displayData.craterDetails.transientDiameter}
              </span>
            </p>
            <p className="font-medium">
              Tipo:{" "}
              <span className="font-bold text-white text-base">
                {displayData.craterDetails.type}
              </span>
            </p>
          </div>
        );
      case "Onda de Choque":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="text-lg font-bold text-red-400">
              {airBlast.overpressure_Pa.toLocaleString()} Pa
            </p>
            <p className="font-medium">
              Tiempo de llegada:{" "}
              <span className="font-bold text-white text-base">
                {airBlast.arrival_time_s.toFixed(1)} s
              </span>
            </p>
            <p className="font-medium">
              Velocidad del viento:{" "}
              <span className="font-bold text-white text-base">
                {airBlast.wind_velocity_ms.toFixed(1)} m/s
              </span>
            </p>
            <p className="text-sm mt-2 text-red-400 font-bold">
              Daño Esperado: {airBlast.damageDescription}
            </p>
          </div>
        );
      case "Radiación Térmica":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="text-lg font-bold text-red-400">
              {thermalRadiation.thermalExposure_Jm2.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{" "}
              J/m²
            </p>
            <p className="font-medium">
              Radio de la bola de fuego:{" "}
              <span className="font-bold text-white text-base">
                {thermalRadiation.fireballRadius_km.toFixed(2)} km
              </span>
            </p>
            <p className="text-sm mt-2 text-red-400 font-bold">
              Efectos de Ignición: {thermalRadiation.ignitionEffects}
            </p>
          </div>
        );
      case "Retorno de eyecciones":
        if (
          typeof ejecta.thickness_m === "undefined" ||
          ejecta.thickness_m === 0
        )
          return (
            <p className="text-base font-medium mt-2 text-white">
              {ejecta.message}
            </p>
          );

        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="font-medium">
              Grosor de la capa:{" "}
              <span className="font-bold text-white text-base">
                {(ejecta.thickness_m * 1000).toFixed(2)} mm
              </span>
            </p>
            <p className="font-medium">
              Tamaño promedio de fragmentos:{" "}
              <span className="font-bold text-white text-base">
                {ejecta.meanFragmentSize_mm.toFixed(2)} mm
              </span>
            </p>
          </div>
        );
      default:
        return (
          <p className="text-base font-medium mt-2 text-white">
            Selecciona un efecto para ver los detalles.
          </p>
        );
    }
  }, [
    selectedEffect,
    scenario,
    crater,
    airBlast,
    thermalRadiation,
    ejecta,
    burstAltitude,
    displayData,
  ]);

  const effectButtons = [
    { name: "Cráter", label: "Cráter" },
    { name: "Onda de Choque", label: "Onda de Choque" },
    { name: "Retorno de eyecciones", label: "Retorno de eyecciones" },
    { name: "Radiación Térmica", label: "Radiación Térmica" },
  ];

  // --- NUEVO: Textos para el header según el botón ---
  const headerTextsByEffect = {
    "Cráter": [
      "Este es el efecto del cráter. ¡Puedes ver en el mapa un círculo rojo que representa el diámetro del impacto!",
    ],
    "Onda de Choque": ["¡La onda de choque expansiva es destructiva!"],
    "Retorno de eyecciones": ["El material eyectado regresa al suelo."],
    "Radiación Térmica": ["La radiación térmica puede provocar incendios."],
  };

  const renderEffectButton = ({ name, label }) => (
    <button
      key={name}
      className={`p-3 text-lg font-semibold rounded-xl transition-all shadow-md w-full 
        ${
          selectedEffect === name
            ? "bg-violet-500 text-black"
            : "bg-gray-800 hover:bg-gray-700 text-white"
        }
      `}
      onClick={() => {
        setSelectedEffect(name);
        setHeaderText(headerTextsByEffect[name]); // 👈 Cambia el texto del header
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="h-screen overflow-y-auto bg-blue-950 text-white font-sans p-4 sm:p-6">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6">
        {/* Header con texto dinámico */}
        <header className="px-0 sm:px-10 py-10 border-b border-gray-800 mb-1">
          <h1 className="text-3xl font-bold tracking-widest text-violet-500">
            Resultados de la simulación
          </h1>

          <div className="mt-2 text-2xl">
            <p>Los impactores pequeños se desintegran en la atmósfera y no forman cráteres, mientras que los objetos más grandes conservan su energía cinética y, al impactar, crean grandes cráteres. El impacto libera energía que genera altas presiones y temperaturas, formando una onda de choque que fractura el objetivo y excava un cráter transitorio, que luego colapsa bajo la gravedad para formar el cráter final.</p>
          </div>
        </header>

        {/* Grid vertical */}
        <div className="flex-row h-full w-full grid-cols-3">
            {/* Columna 3: Botones de Fenómeno */}
            <div className="col-span-1 flex flex-col space-y-4 bg-gray-800 p-6 rounded-xl shadow-xl">
              <h2 className="text-xl font-bold text-violet-500">
                Ver Detalles por Fenómeno
              </h2>

              <div className="space-y-4">
                {effectButtons.map(renderEffectButton)}
              </div>
            </div>

          {/* Grid horizontal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Columna 1: Mapa y Energía */}
            <div className="col-span-1 space-y-6">
              <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
                <h2 className="text-xl font-bold mb-3 text-violet-500">
                  Zona de Impacto:{" "}
                  <span className="text-white text-2xl">{displayData.zone}</span>
                </h2>
                <div className="h-96 rounded-lg overflow-hidden border border-red-500/50 shadow-md">
                  <MapContainer
                    center={displayData.mapCenter}
                    zoom={displayData.mapZoom}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {(scenario !== "Airburst" && scenario !== "Explosión Aérea") && craterRadiusMeters > 0 ? (
                      <Circle
                        center={IMPACT_POSITION}
                        radius={craterRadiusMeters}
                        pathOptions={{
                          color: "red",
                          fillColor: "#f03",
                          fillOpacity: 0.5,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          Cráter de impacto estimado (Diámetro:{" "}
                          {((craterRadiusMeters * 2) / 1000).toFixed(2)} km)
                        </Popup>
                      </Circle>
                    ) : (
                      <Marker position={IMPACT_POSITION}>
                        <Popup>
                          {scenario === "Explosión Aérea" || scenario === "Airburst"
                            ? "Explosión aérea sobre Puebla."
                            : "Impacto en superficie."}
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
                <h2 className="text-xl font-bold mb-2 text-violet-500">
                  Energía Total Liberada:
                </h2>
                <p className="text-4xl font-extrabold text-white">
                  {displayData.totalEnergy}
                </p>
              </div>
            </div>

            {/* Columna 2: Detalles del Impacto */}
            <div className="col-span-1 space-y-5 bg-gray-800 p-6 rounded-xl shadow-xl">
              <h2 className="text-xl font-bold text-violet-500">
                Detalles del Impacto a Distancia
              </h2>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-medium">
                    Distancia del observador
                  </span>
                  <span className="text-3xl font-bold text-violet-500">
                    {displayData.currentDistanceKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={distanceSliderValue}
                  onChange={(e) => setDistanceSliderValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1 pt-3 border-t border-gray-700">
                <p className="text-xl font-medium">Efecto seleccionado</p>
                <p className="text-3xl font-bold text-violet-500">
                  {selectedEffect}
                </p>
              </div>

              <div className="min-h-30">{renderEffectDetails()}</div>

              <div className="space-y-2 pt-4 border-t border-gray-700">
                <h3 className="text-xl font-bold text-violet-500">
                  Efectos Sísmicos (a {displayData.currentDistanceKm} km)
                </h3>
                <p className="text-4xl font-extrabold text-red-500">
                  MAG: {displayData.seismicDetails.magnitude}
                </p>
                <p className="text-base text-gray-400">
                  Magnitud sísmica (Escala Richter):{" "}
                  <span className="font-bold">
                    {displayData.seismicDetails.richterScale}
                  </span>
                </p>
                <p className="text-base text-gray-400">
                  Intensidad Mercalli Modificada:{" "}
                  <span className="font-bold">
                    {displayData.seismicDetails.mercalliIntensity}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/*Boton de resumen final */}
          <div>
             <button
                className="mt-6 p-5 text-2xl font-extrabold rounded-xl shadow-2xl transition-all bg-gray-700 hover:bg-gray-600 text-white"
                onClick={() => navigate("/result")}
              >
                Resumen Final
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impacto;