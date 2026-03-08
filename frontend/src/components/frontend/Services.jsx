import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../common/Header'
import Footer from '../common/Footer'
import HeroSection from '../common/HeroSection'
import ServiceImage1 from "../../assets/images/construction1.jpg";
import ServiceImage2 from "../../assets/images/construction2.jpg";
import ServiceImage3 from "../../assets/images/construction3.jpg";
import ServiceImage4 from "../../assets/images/construction10.jpg";
import ServiceImage5 from "../../assets/images/construction11.jpg";
import ServiceImage6 from "../../assets/images/construction8.jpg";
import Icon1 from "../../assets/images/icon-1.svg";
import Icon2 from "../../assets/images/icon-2.svg";
import Icon3 from "../../assets/images/icon-3.svg";

const Services = () => {
  const serviceCards = [
    {
      title: "Residential Construction",
      text: "From villas to apartment blocks, we deliver homes with premium structural quality and thoughtful planning.",
      image: ServiceImage1,
      icon: Icon1,
    },
    {
      title: "Commercial Development",
      text: "Smart office, retail, and mixed-use spaces designed for business performance and long-term value.",
      image: ServiceImage2,
      icon: Icon2,
    },
    {
      title: "Renovation & Expansion",
      text: "Modernize and expand existing structures with better utility, safer layouts, and durable finishes.",
      image: ServiceImage3,
      icon: Icon3,
    },
    {
      title: "Turnkey Project Delivery",
      text: "Single-window execution from design coordination to final handover with full accountability.",
      image: ServiceImage4,
      icon: Icon1,
    },
    {
      title: "Structural Engineering",
      text: "Strong foundation and framework execution aligned with technical standards and site safety.",
      image: ServiceImage5,
      icon: Icon2,
    },
    {
      title: "Project Management",
      text: "Milestone tracking, cost control, and transparent updates to keep projects on-time and on-budget.",
      image: ServiceImage6,
      icon: Icon3,
    },
  ];

  const process = [
    {
      step: "01",
      title: "Consultation & Planning",
      text: "We understand your goals, site conditions, budget, and expectations before execution starts.",
    },
    {
      step: "02",
      title: "Design & Technical Review",
      text: "Our engineering team finalizes practical designs, BOQ, timelines, and project strategy.",
    },
    {
      step: "03",
      title: "Construction Execution",
      text: "Dedicated site supervision ensures material quality, workmanship standards, and safety.",
    },
    {
      step: "04",
      title: "Handover & Support",
      text: "Final quality checks, documentation, and post-handover assistance for complete peace of mind.",
    },
  ];

  return (
    <>
    <Header />
    <main className="services-page">
     <HeroSection preHeading={'Our Expertise, Your Vision'} heading={'Comprehensive Construction Services Tailored to Your Needs'} text={'From concept to completion, we provide end-to-end construction solutions that bring your vision to life with quality and precision.'} />

      <section className="services-overview">
        <div className="container py-5">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <span className="section-tag">What We Deliver</span>
              <h2>Complete Construction Solutions Under One Roof</h2>
              <p>
                We bring design coordination, civil execution, quality control,
                and delivery management together for a seamless construction
                experience.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="overview-stats">
                <div className="overview-stat">
                  <h3>120+</h3>
                  <p>Projects Delivered</p>
                </div>
                <div className="overview-stat">
                  <h3>15+</h3>
                  <p>Years Of Expertise</p>
                </div>
                <div className="overview-stat">
                  <h3>98%</h3>
                  <p>Client Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="services-grid-section">
        <div className="container pb-5">
          <div className="row g-4">
            {serviceCards.map((service) => (
              <div className="col-12 col-md-6 col-lg-4" key={service.title}>
                <article className="service-detail-card">
                  <div className="service-thumb">
                    <img src={service.image} alt={service.title} />
                  </div>
                  <div className="service-detail-body">
                    <div className="service-icon">
                      <img src={service.icon} alt="" />
                    </div>
                    <h4>{service.title}</h4>
                    <p>{service.text}</p>
                    <Link to="/services" className="service-detail-link">Explore Service</Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services-process">
        <div className="container py-5">
          <div className="process-header text-center mx-auto">
            <span className="section-tag">Our Work Process</span>
            <h2>Clear Steps. Reliable Execution.</h2>
            <p>
              A disciplined process helps us maintain consistency in quality,
              timelines, and project communication.
            </p>
          </div>
          <div className="row g-4 mt-1">
            {process.map((item) => (
              <div className="col-12 col-md-6 col-lg-3" key={item.step}>
                <article className="process-card">
                  <span className="process-step">{item.step}</span>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services-cta">
        <div className="container py-5">
          <div className="cta-box text-center">
            <h2>Need A Reliable Team For Your Next Project?</h2>
            <p>
              Let us discuss your requirements and build a practical execution
              plan for your project goals.
            </p>
            <Link to="/contact-us" className="btn btn-secondary">Schedule Consultation</Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}

export default Services
