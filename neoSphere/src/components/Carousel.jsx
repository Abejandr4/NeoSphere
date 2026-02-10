import { useState } from "react";

import { FaArrowCircleLeft } from "react-icons/fa";
import { FaArrowCircleRight } from "react-icons/fa";

export default function Carousel({slides}) {

    let [current, setCurrent] = useState(0);

    let previousSlide = () => {
        if (current===0) setCurrent(slides.length-1);
        else setCurrent(current - 1)
    }

    let nextSlide = () => {
        if (current===slides.length-1) setCurrent(0);
        else setCurrent(current + 1)
    }

    return(
        <div className="overflow-hidden relative m-auto">
            <div className={`h-80 flex transition ease-in-out duration-100`}
            style={{
                transform: `translateX(-${current*100}%)`,
            }}>
                {slides.map((s)=>{
                return <img src={s}/>;
            })}
            </div>

            <div className="flex absolute top-0 h-full w-full justify-between items-center text-blue-700 px-10 text-5xl">
                <button onClick={previousSlide}>
                    <FaArrowCircleLeft />
                </button>
                <button onClick={nextSlide}>
                    <FaArrowCircleRight />
                </button>
            </div>
        </div>
    );
}