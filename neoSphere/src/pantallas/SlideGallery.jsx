import Carousel from "../components/Carousel";
import Particles from "../components/Particles";

import imag1 from "../assets/img/astero/imag1.jpg";
import imag2 from "../assets/img/astero/imag2.jpg";
import imag3 from "../assets/img/astero/imag3.jpg";
import imag4 from "../assets/img/astero/imag4.jpg";
import imag5 from "../assets/img/astero/imag5.jpg";
import imag6 from "../assets/img/astero/imag6.jpg";
import imag7 from "../assets/img/astero/imag7.jpg";
import { useNavigate } from "react-router-dom";
import { HoverBorderGradient } from "../components/hover-border-gradient";

function SlideGallery() {
    const slides = [imag1, imag2, imag3, imag4, imag5, imag6, imag7];
    const navigate = useNavigate();

    return (
        <div className="relative w-full h-screen bg-black flex justify-center items-center overflow-y-auto">

             <div className="absolute inset-0 z-0">
                <Particles
                particleColors={["#ffffff", "#ffffff"]}
                particleCount={600}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover={true}
                alphaParticles={false}
                disableRotation={false}
                />
            </div>
            
        <div className="relative z-10 flex flex-col items-center text-white p-10">
            <div className="w-300 m-auto pt-20 p-5">
                <Carousel slides={slides} />
            </div>
            <HoverBorderGradient 
                as="button"
                onClick={() => navigate("/orbita")}>
                Órbitas de los asteroides
            </HoverBorderGradient>
        </div>

        </div>
    );
}

export default SlideGallery;