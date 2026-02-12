import Carousel from "../components/Carousel";
import Particles from "../components/Particles";

import imag1 from "../assets/img/astero/imag1.jpg";
import imag2 from "../assets/img/astero/imag2.jpg";
import imag3 from "../assets/img/astero/imag3.jpg";
import imag4 from "../assets/img/astero/imag4.jpg";
import imag5 from "../assets/img/astero/imag5.jpg";
import imag6 from "../assets/img/astero/imag6.jpg";
import imag7 from "../assets/img/astero/imag7.jpg";

function SlideGallery() {
    const slides = [imag1, imag2, imag3, imag4, imag5, imag6, imag7];

    return (
        <div className="relative w-full h-screen bg-black flex justify-center items-center overflow-hidden">

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
            
            <div className="w-300 m-auto pt-20 p-10">
            <Carousel slides={slides} />
            </div>
        </div>
    );
}

export default SlideGallery;