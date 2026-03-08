import React from "react";
import { Link } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import AboutPage from "../common/About";
import TeamImage1 from "../../assets/images/author-2.jpg";
import TeamImage2 from "../../assets/images/engineer-4925135_1280.jpg";
import TeamImage3 from "../../assets/images/engineer-4925140_1280.jpg";
import TeamImage4 from "../../assets/images/pexels-sindre-fs-1040880.jpg";
import HeroSection from "../common/HeroSection";
const About = () => {
  const teamMembers = [
    {
      name: "Jayesh Patel",
      role: "Founder & Project Director",
      image: TeamImage1,
      bio: "Leads project strategy and ensures delivery quality across residential and commercial developments.",
    },
    {
      name: "Rohit Mehta",
      role: "Senior Civil Engineer",
      image: TeamImage2,
      bio: "Specialized in structural planning, technical supervision, and site-level execution standards.",
    },
    {
      name: "Nisha Shah",
      role: "Design & Planning Head",
      image: TeamImage3,
      bio: "Transforms client requirements into practical construction plans with modern design insights.",
    },
    {
      name: "Karan Trivedi",
      role: "Execution Manager",
      image: TeamImage4,
      bio: "Coordinates site teams, timelines, and quality checkpoints for smooth project completion.",
    },
  ];

  return (
    <>
      <Header />
      <main>
        <HeroSection preHeading={'Quality, Integrity, Value'} heading={'About Us - Building Your Dreams with Quality and Trust'} text={'Building your dreams with quality and trust.'} />
        <AboutPage />

        {/* Our Team */}
        <section className="section-9">
          <div className="container py-5">
            <div className="team-header text-center mx-auto">
              <span className="section-tag">Our Team</span>
              <h2>Meet The Experts Behind Every Successful Project</h2>
              <p>
                Our team combines field experience, engineering precision, and
                client-first collaboration to deliver construction excellence.
              </p>
            </div>

            <div className="row g-4 mt-1">
              {teamMembers.map((member) => (
                <div className="col-12 col-md-6 col-lg-3" key={member.name}>
                  <article className="team-card">
                    <div className="team-image-wrap">
                      <img src={member.image} alt={member.name} />
                    </div>
                    <div className="team-content">
                      <h4>{member.name}</h4>
                      <span>{member.role}</span>
                      <p>{member.bio}</p>
                      <Link to="/contact-us" className="team-link">
                        Connect
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
