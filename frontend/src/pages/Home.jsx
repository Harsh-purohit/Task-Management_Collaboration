import React from "react";
import HomeContent from "../components/HomePage/HomeContent";
import Features from "../components/HomePage/Features";
import WhyChoose from "../components/HomePage/WhyChoose";

const Home = () => {
  return (
    <div>
      <HomeContent />
      <Features/>
      <WhyChoose/>
    </div>
  );
};

export default Home;
