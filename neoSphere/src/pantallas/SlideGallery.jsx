import Carousel from "../components/Carousel";

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
        <div className="w-300 m-auto pt-20 p-10">
            <Carousel slides={slides} />
        </div>
    );
}

export default SlideGallery;