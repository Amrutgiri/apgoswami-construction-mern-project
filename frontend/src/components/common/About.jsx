import React, { useEffect, useState } from "react";
import AboutUsImage from "../../assets/images/about-us.jpg";

const defaultAboutData = {
  sectionTag: "About Us",
  heading: "Your Trusted Construction Partner",
  paragraph1:
    "Somnath Construction is built on trust, quality workmanship, and long-term client relationships. We focus on creating safe and durable spaces that add real value.",
  paragraph2:
    "From planning to final handover, our team maintains clear communication, honest timelines, and strong engineering standards in every stage of work.",
  imageUrl: "",
  badgeTitle: "Trusted By 500+ Clients",
  badgeText: "Reliable quality with transparent delivery.",
  stat1Value: "120+",
  stat1Label: "Projects Completed",
  stat2Value: "15+",
  stat2Label: "Years Experience",
  stat3Value: "98%",
  stat3Label: "On-Time Delivery",
  highlight1Title: "Our Mission",
  highlight1Text:
    "To deliver dependable construction solutions with a strong focus on quality, safety, and client satisfaction.",
  highlight2Title: "Our Vision",
  highlight2Text:
    "To be recognized as a trusted construction brand known for transparency, innovation, and lasting structures.",
  highlight3Title: "Our Commitment",
  highlight3Text:
    "We are committed to timely delivery, ethical work, and consistent quality in every project we undertake.",
  updatedAt: "",
};

const withVersion = (url, version) => {
  if (!url || !version) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(version)}`;
};

const About = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const [aboutData, setAboutData] = useState(defaultAboutData);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/about-section/public`);
        const result = await response.json();
        if (response.ok && result?.success && result?.data) {
          setAboutData(result.data);
        }
      } catch {
        // Keep default data if API is unavailable.
      }
    };

    fetchAboutData();
  }, [API_BASE_URL]);

  const stats = [
    { value: aboutData.stat1Value, label: aboutData.stat1Label },
    { value: aboutData.stat2Value, label: aboutData.stat2Label },
    { value: aboutData.stat3Value, label: aboutData.stat3Label },
  ];

  const highlights = [
    { title: aboutData.highlight1Title, text: aboutData.highlight1Text },
    { title: aboutData.highlight2Title, text: aboutData.highlight2Text },
    { title: aboutData.highlight3Title, text: aboutData.highlight3Text },
  ];

  return (
    <section className="section-2">
      <div className="container py-5">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <span className="section-tag">{aboutData.sectionTag}</span>
            <h2>{aboutData.heading}</h2>
            <p>{aboutData.paragraph1}</p>
            <p>{aboutData.paragraph2}</p>
            <div className="project-stats">
              {stats.map((item) => (
                <div className="stat-box" key={item.label}>
                  <h3>{item.value}</h3>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="about-visual">
              <img
                src={aboutData.imageUrl ? withVersion(aboutData.imageUrl, aboutData.updatedAt) : AboutUsImage}
                alt="About Somnath Construction"
              />
              <div className="about-badge">
                <strong>{aboutData.badgeTitle}</strong>
                <span>{aboutData.badgeText}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="project-highlights">
          {highlights.map((item) => (
            <div className="highlight-card" key={item.title}>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
