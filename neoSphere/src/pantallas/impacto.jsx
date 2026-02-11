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
      console.error("Simulation parameters are missing. Redirecting.");
      navigate("/skyfallx-game");
    }
  }, [initialResults, inputs, navigate]);

  const [distanceSliderValue, setDistanceSliderValue] = useState(20);
  const [selectedEffect, setSelectedEffect] = useState("Crater");

  // --- NUEVO: Estado para el texto del header ---
  const [headerText, setHeaderText] = useState(["Text typing effect"]);

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
        <p className="text-xl">Loading simulation data...</p>
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
    scenario !== "Airburst" && crater.finalDiameter_m
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
      type: crater.type,
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
    if (scenario === "Airburst") {
      if (selectedEffect === "Crater")
        return (
          <p className="text-base font-medium mt-2 text-white">
            No crater is formed. Airburst at {(burstAltitude / 1000).toFixed(1)}{" "}
            km altitude.
          </p>
        );
      if (selectedEffect === "Return of ejections")
        return (
          <p className="text-base font-medium mt-2 text-white">
            There are no significant ejections due to the airburst.
          </p>
        );
    }

    switch (selectedEffect) {
      case "Crater":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="font-medium text-red-500 text-lg">
              !!Red circle on the map is the size of the crater!!
            </p>
            <p className="font-medium">
              Final Diameter:{" "}
              <span className="font-bold text-white text-base">
                {displayData.craterDetails.finalDiameter}
              </span>
            </p>
            <p className="font-medium">
              Transient Diameter:{" "}
              <span className="font-bold text-white text-base">
                {displayData.craterDetails.transientDiameter}
              </span>
            </p>
            <p className="font-medium">
              Type:{" "}
              <span className="font-bold text-white text-base">
                {displayData.craterDetails.type}
              </span>
            </p>
          </div>
        );
      case "AirBlast":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="text-lg font-bold text-red-400">
              {airBlast.overpressure_Pa.toLocaleString()} Pa
            </p>
            <p className="font-medium">
              Arrival time:{" "}
              <span className="font-bold text-white text-base">
                {airBlast.arrival_time_s.toFixed(1)} s
              </span>
            </p>
            <p className="font-medium">
              Wind speed:{" "}
              <span className="font-bold text-white text-base">
                {airBlast.wind_velocity_ms.toFixed(1)} m/s
              </span>
            </p>
            <p className="text-sm mt-2 text-red-400 font-bold">
              Expected Damage: {airBlast.damageDescription}
            </p>
          </div>
        );
      case "Thermal Radiation":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="text-lg font-bold text-red-400">
              {thermalRadiation.thermalExposure_Jm2.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{" "}
              J/m²
            </p>
            <p className="font-medium">
              Fireball radius:{" "}
              <span className="font-bold text-white text-base">
                {thermalRadiation.fireballRadius_km.toFixed(2)} km
              </span>
            </p>
            <p className="text-sm mt-2 text-red-400 font-bold">
              Ignition Effects: {thermalRadiation.ignitionEffects}
            </p>
          </div>
        );
      case "Return of ejections":
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
              Layer thickness:{" "}
              <span className="font-bold text-white text-base">
                {(ejecta.thickness_m * 1000).toFixed(2)} mm
              </span>
            </p>
            <p className="font-medium">
              Average fragment size:{" "}
              <span className="font-bold text-white text-base">
                {ejecta.meanFragmentSize_mm.toFixed(2)} mm
              </span>
            </p>
          </div>
        );
      default:
        return (
          <p className="text-base font-medium mt-2 text-white">
            Select an effect to view details.
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
    { name: "Crater", label: "Crater" },
    { name: "AirBlast", label: "AirBlast" },
    { name: "Return of ejections", label: "Return of ejections" },
    { name: "Thermal Radiation", label: "Thermal Radiation" },
  ];

  // --- NUEVO: Textos para el header según el botón ---
  const headerTextsByEffect = {
    Crater: [
      "This is the crater effect, You can see in the map a red circle thats the diameter of the Crater!!",
    ],
    AirBlast: ["Air blast is destructive!"],
    "Return of ejections": ["Ejected material returns to the ground."],
    "Thermal Radiation": ["Thermal radiation can ignite fires."],
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
            Skyfall X | Results
          </h1>

          <p className="mt-2 text-2xl">
            <TextType
              text={[
                "Small impactors are disrupted in the atmosphere and form no crater, while larger objects retain their kinetic energy and, upon impact, create large craters. The impact releases energy that generates high pressures and temperatures, forming a shock wave that fractures the target and excavates a transient crater, which then collapses under gravity to form the final crater. ",
                "The impact ejects rock debris that covers the surrounding terrain and disperses as dust and larger bombs that may form small secondary craters. In addition, the energy is converted into thermal energy, seismic energy, and kinetic energy of the target and atmosphere, producing a fireball, ground shaking, high air pressures, and violent winds. ",
              ]}
              typingSpeed={35}
              pauseDuration={7000}
              showCursor={true}
              cursorCharacter="|"
            />
          </p>
        </header>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Columna 1: Mapa y Energía */}
          <div className="col-span-1 space-y-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
              <h2 className="text-xl font-bold mb-3 text-violet-500">
                Impact Zone:{" "}
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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {scenario !== "Airburst" && craterRadiusMeters > 0 ? (
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
                        Estimated impact crater (Diameter:{" "}
                        {((craterRadiusMeters * 2) / 1000).toFixed(2)} km)
                      </Popup>
                    </Circle>
                  ) : (
                    <Marker position={IMPACT_POSITION}>
                      <Popup>
                        {scenario === "Airburst"
                          ? "Airburst over Puebla."
                          : "Surface Impact."}
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
              <h2 className="text-xl font-bold mb-2 text-violet-500">
                Total Energy Released:
              </h2>
              <p className="text-4xl font-extrabold text-white">
                {displayData.totalEnergy}
              </p>
            </div>
          </div>

          {/* Columna 2: Detalles del Impacto */}
          <div className="col-span-1 space-y-5 bg-gray-800 p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold text-violet-500">
              Details of the Impact at a Distance
            </h2>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xl font-medium">
                  Distance from the observer
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
              <p className="text-xl font-medium">Selected effect</p>
              <p className="text-3xl font-bold text-violet-500">
                {selectedEffect}
              </p>
            </div>

            <div className="min-h-30">{renderEffectDetails()}</div>

            <div className="space-y-2 pt-4 border-t border-gray-700">
              <h3 className="text-xl font-bold text-violet-500">
                Seismic Effects (a {displayData.currentDistanceKm} km)
              </h3>
              <p className="text-4xl font-extrabold text-red-500">
                MAG: {displayData.seismicDetails.magnitude}
              </p>
              <p className="text-base text-gray-400">
                Seismic magnitude (Richter scale):{" "}
                <span className="font-bold">
                  {displayData.seismicDetails.richterScale}
                </span>
              </p>
              <p className="text-base text-gray-400">
                Modified Mercalli Intensity:{" "}
                <span className="font-bold">
                  {displayData.seismicDetails.mercalliIntensity}
                </span>
              </p>
            </div>
          </div>

          {/* Columna 3: Botones de Fenómeno */}
          <div className="col-span-1 flex flex-col space-y-4 bg-gray-800 p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold text-violet-500">
              See Details by Phenomenon
            </h2>

            <div className="space-y-4">
              {effectButtons.map(renderEffectButton)}
            </div>

            <button
              className="mt-6 p-5 text-2xl font-extrabold rounded-xl shadow-2xl transition-all bg-gray-700 hover:bg-gray-600 text-white"
              onClick={() => navigate("/result")}
            >
              Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impacto;
