import React from "react";

const HeroSection = ({preHeading,heading,text}) => {
  return (
    <>
      <section className="section-8">
        <div className="hero d-flex align-items-center">
          <div className="container">
            <div className="text-left">
              <span>{preHeading}</span>
              <h3>{heading}</h3>
              <p>{text}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
