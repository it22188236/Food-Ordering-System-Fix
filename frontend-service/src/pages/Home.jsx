import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

import ImageSlider from "../components/ImageSlider";

import image1 from '../assets/images/image1.jpg';
import image2 from '../assets/images/image2.jpg';
import image3 from '../assets/images/image3.jpg';
import image4 from '../assets/images/image4.jpg';
import image5 from '../assets/images/image5.jpg';

const Home = () => {

  const images = [image1,image2,image3,image4,image5];
  return (
    <div>
        <NavBar/>

        <ImageSlider images={images}/>

        <Footer/>
      
    </div>
  );
};

export default Home;
