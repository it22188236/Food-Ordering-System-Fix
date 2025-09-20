import React, { useState } from "react";
import "../styles/ImageSlider.css";

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      <button className="nav left" onClick={prevSlide}>
        &lt;
      </button>
      <img src={images[currentIndex]} alt="slide" className="slide-image" />
      <button className="nav right" onClick={nextSlide}>
        &gt;
      </button>
    </div>
  );
};

export default ImageSlider;
