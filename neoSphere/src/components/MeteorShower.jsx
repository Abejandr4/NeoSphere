import React, { useEffect, useState } from 'react';

const MeteorShower = () => {
  const [meteors, setMeteors] = useState([]);
  // Increased limit since they are now spread across a larger area
  const maxMeteors = 6; 

  useEffect(() => {
    const interval = setInterval(() => {
      setMeteors((prevMeteors) => {
        if (prevMeteors.length >= maxMeteors) return prevMeteors;

        const id = Date.now();
        const fallDuration = Math.random() * 2 + 1.5; 
        const fallDelay = Math.random() * 2;
        // Changed from 50% to 100% to cover the whole height
        const topPosition = Math.random() * 100; 

        const newMeteor = {
          id,
          style: {
            top: `${topPosition}%`,
            right: '-800px',
            animationDuration: `${fallDuration}s`,
            animationDelay: `${fallDelay}s`,
          },
        };

        setTimeout(() => {
          setMeteors((current) => current.filter((m) => m.id !== id));
        }, (fallDuration + fallDelay + 1) * 1000);

        return [...prevMeteors, newMeteor];
      });
    }, 400); // Slightly faster spawn rate for a "fuller" feel

    return () => clearInterval(interval);
  }, []);

  return (
    /* Changed 'absolute' to 'fixed' to lock it to the browser window */
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes fall {
          0% {
            transform: translateX(0) translateY(0) rotate(-35deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            /* Increased distance to ensure they clear large screens */
            transform: translateX(-3500px) translateY(1800px) rotate(-35deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>

      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          style={meteor.style}
          className="absolute h-0.75 w-150 bg-linear-to-l from-transparent via-blue-100/50 to-white 
                     animate-fall drop-shadow-[0_0_15px_rgba(255,255,255,1)]"
        />
      ))}
    </div>
  );
};

export default MeteorShower;