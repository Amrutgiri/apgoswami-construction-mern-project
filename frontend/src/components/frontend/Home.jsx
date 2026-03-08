import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ServiceImage1 from "../../assets/images/construction1.jpg";
import ServiceImage2 from "../../assets/images/construction2.jpg";
import ServiceImage3 from "../../assets/images/construction3.jpg";
import ServiceImage4 from "../../assets/images/engineer-4925135_1280.jpg";
import ServiceImage5 from "../../assets/images/construction8.jpg";
import ServiceImage6 from "../../assets/images/construction10.jpg";
import ProjectImage1 from "../../assets/images/construction11.jpg";
import ProjectImage2 from "../../assets/images/construction121.jpg";
import ProjectImage3 from "../../assets/images/construction5.jpg";
import ProjectImage4 from "../../assets/images/construction7.jpg";
import ChooseIcon1 from "../../assets/images/icon-1.svg";
import ChooseIcon2 from "../../assets/images/icon-2.svg";
import ChooseIcon3 from "../../assets/images/icon-3.svg";
import ChooseImage from "../../assets/images/engineer-4925140_1280.jpg";
import BlogImage1 from "../../assets/images/construction9.jpg";
import BlogImage2 from "../../assets/images/pexels-pixabay-220453.jpg";
import BlogImage3 from "../../assets/images/construction6.jpg";
import DefaultHeroImage from "../../assets/images/hero.jpg";
import Header from "../common/Header";
import Footer from "../common/Footer";
import About from "../common/About";

const defaultHeroContent = {
  preHeading: "Welcome to Somnath Construction",
  heading: "Crafting dreams with\nquality and trust",
  subHeading: "Building your dreams with quality and trust.",
  heroImage: "",
  primaryButtonText: "Contact Now",
  primaryButtonLink: "/contact-us",
  secondaryButtonText: "View Projects",
  secondaryButtonLink: "/projects",
  updatedAt: "",
};

const withVersion = (url, version) => {
  if (!url || !version) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(version)}`;
};

const Home = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const defaultServices = [
    {
      title: "Residential Construction",
      description:
        "Premium home and apartment projects with strong quality standards and timely delivery.",
      image: ServiceImage1,
    },
    {
      title: "Commercial Projects",
      description:
        "Office, showroom, and retail spaces designed for performance and professional appearance.",
      image: ServiceImage2,
    },
    {
      title: "Renovation & Remodeling",
      description:
        "Upgrade existing spaces with modern layouts, better utility, and refined finishing.",
      image: ServiceImage3,
    },
    {
      title: "Project Planning",
      description:
        "Detailed planning, budgeting, and scheduling for smooth construction execution.",
      image: ServiceImage4,
    },
    {
      title: "Structural Work",
      description:
        "Durable foundation and framework execution with strict safety compliance.",
      image: ServiceImage5,
    },
    {
      title: "Turnkey Solutions",
      description:
        "Complete design-to-handover service from one trusted construction partner.",
      image: ServiceImage6,
    },
  ];

  const defaultProjects = [
    {
      title: "Skyline Residency",
      category: "Residential",
      location: "Ahmedabad",
      image: ProjectImage1,
      status: "Completed",
      updatedAt: "",
    },
    {
      title: "Prime Business Hub",
      category: "Commercial",
      location: "Gandhinagar",
      image: ProjectImage2,
      status: "In Progress",
      updatedAt: "",
    },
    {
      title: "Green Valley Villas",
      category: "Luxury Housing",
      location: "Vadodara",
      image: ProjectImage3,
      status: "Completed",
      updatedAt: "",
    },
    {
      title: "Metro Retail Plaza",
      category: "Retail",
      location: "Surat",
      image: ProjectImage4,
      status: "Upcoming",
      updatedAt: "",
    },
  ];

  const choosePoints = [
    {
      title: "Experienced Team",
      description:
        "Qualified engineers, planners, and on-site experts with proven project execution skills.",
      icon: ChooseIcon1,
    },
    {
      title: "Quality Materials",
      description:
        "Only trusted material partners and quality checks at every stage of construction.",
      icon: ChooseIcon2,
    },
    {
      title: "On-Time Delivery",
      description:
        "Structured timelines and milestone tracking to ensure smooth and timely project handover.",
      icon: ChooseIcon3,
    },
    {
      title: "Transparent Process",
      description:
        "Regular updates, clear costing, and complete visibility during project lifecycle.",
      icon: ChooseIcon1,
    },
    {
      title: "Safety First Approach",
      description:
        "Strict site safety standards and compliance practices for workers and project environments.",
      icon: ChooseIcon2,
    },
    {
      title: "Client-Centric Service",
      description:
        "Personalized construction solutions based on client goals, budget, and design preferences.",
      icon: ChooseIcon3,
    },
  ];

  const defaultTestimonials = [
    {
      name: "Rajesh Patel",
      role: "Home Owner, Ahmedabad",
      text: "Somnath Construction handled our villa project with total professionalism. Quality and finishing were outstanding.",
      rating: 5,
      avatarUrl: "",
      updatedAt: "",
    },
    {
      name: "Nikita Shah",
      role: "Retail Business Owner",
      text: "Their team delivered our showroom exactly on schedule. Communication was clear and every detail was managed well.",
      rating: 5,
      avatarUrl: "",
      updatedAt: "",
    },
    {
      name: "Amit Desai",
      role: "Project Consultant",
      text: "Strong planning, on-site discipline, and excellent execution. One of the most dependable construction teams we worked with.",
      rating: 5,
      avatarUrl: "",
      updatedAt: "",
    },
    {
      name: "Krunal Mehta",
      role: "Commercial Client",
      text: "From budgeting to completion, everything was transparent. The final build quality exceeded our expectations.",
      rating: 5,
      avatarUrl: "",
      updatedAt: "",
    },
    {
      name: "Priya Trivedi",
      role: "Residential Client",
      text: "They transformed our design concept into a beautiful home with premium material quality and timely handover.",
      rating: 5,
      avatarUrl: "",
      updatedAt: "",
    },
    {
      name: "Vishal Rana",
      role: "Site Supervisor",
      text: "Safety compliance and work standards were consistently maintained. Coordination across teams was very efficient.",
      rating: 5,
      avatarUrl: "",
      updatedAt: "",
    },
  ];
  const defaultWhyChooseData = {
    sectionTag: "Why Choose Us",
    heading: "Reliable Expertise For Every Construction Need",
    description:
      "We combine engineering precision, transparent project management, and quality craftsmanship to deliver spaces that perform for years.",
    imageUrl: "",
    badgeTitle: "15+ Years",
    badgeText: "of trusted construction excellence.",
    points: choosePoints.map((item, index) => ({
      ...item,
      iconKey: index % 3 === 0 ? "icon-1" : index % 3 === 1 ? "icon-2" : "icon-3",
      sortOrder: index,
    })),
    updatedAt: "",
  };

  const defaultBlogPosts = [
    {
      title: "Top 7 Construction Trends Shaping Modern Projects in 2026",
      excerpt:
        "From sustainable materials to smart-site monitoring, discover the key trends transforming construction quality and efficiency.",
      image: BlogImage1,
      category: "Industry Update",
      publishDate: "2026-02-12",
      slug: "top-7-construction-trends-shaping-modern-projects-in-2026",
      updatedAt: "",
    },
    {
      title: "How To Plan Your Residential Project Budget The Right Way",
      excerpt:
        "A practical guide to construction budgeting, hidden costs, and milestone-based payment planning for homeowners.",
      image: BlogImage2,
      category: "Project Planning",
      publishDate: "2026-02-03",
      slug: "how-to-plan-your-residential-project-budget-the-right-way",
      updatedAt: "",
    },
    {
      title: "5 Quality Checks Every Site Should Complete Before Handover",
      excerpt:
        "Ensure durable and safe delivery with structural, finishing, and service quality checks before final project closure.",
      image: BlogImage3,
      category: "Construction Tips",
      publishDate: "2026-01-26",
      slug: "5-quality-checks-every-site-should-complete-before-handover",
      updatedAt: "",
    },
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroContent, setHeroContent] = useState(defaultHeroContent);
  const [services, setServices] = useState(defaultServices);
  const [projects, setProjects] = useState(defaultProjects);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [blogPosts, setBlogPosts] = useState(defaultBlogPosts);
  const [whyChooseData, setWhyChooseData] = useState(defaultWhyChooseData);

  const testimonialSlides = [];
  for (let i = 0; i < testimonials.length; i += 3) {
    testimonialSlides.push(testimonials.slice(i, i + 3));
  }

  useEffect(() => {
    if (testimonialSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonialSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonialSlides.length]);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/home/hero/public`);
        const result = await response.json();
        if (response.ok && result?.success && result?.data) {
          setHeroContent(result.data);
        }
      } catch {
        // Keep default hero content if API is unavailable.
      }
    };

    fetchHeroContent();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/public`);
        const result = await response.json();
        if (response.ok && result?.success && Array.isArray(result.data) && result.data.length > 0) {
          setProjects(
            result.data.map((item) => ({
              title: item.title,
              category: item.type,
              location: item.location,
              image: withVersion(item.imageUrl, item.updatedAt),
              status: item.status,
              updatedAt: item.updatedAt || "",
            })),
          );
        }
      } catch {
        // Keep default projects if API is unavailable.
      }
    };

    fetchProjects();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/services/public`);
        const result = await response.json();
        if (response.ok && result?.success && Array.isArray(result.data) && result.data.length > 0) {
          setServices(
            result.data.map((item) => ({
              title: item.title,
              description: item.description,
              image: item.imageUrl,
            })),
          );
        }
      } catch {
        // Keep default services if API is unavailable.
      }
    };

    fetchServices();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/testimonials/public`);
        const result = await response.json();
        if (response.ok && result?.success && Array.isArray(result.data) && result.data.length > 0) {
          setTestimonials(
            result.data.map((item) => ({
              name: item.name,
              role: item.role,
              text: item.text,
              rating: item.rating || 5,
              avatarUrl: item.avatarUrl ? withVersion(item.avatarUrl, item.updatedAt) : "",
              updatedAt: item.updatedAt || "",
            })),
          );
        }
      } catch {
        // Keep default testimonials if API is unavailable.
      }
    };

    fetchTestimonials();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blogs/public`);
        const result = await response.json();
        if (response.ok && result?.success && Array.isArray(result.data) && result.data.length > 0) {
          setBlogPosts(
            result.data.slice(0, 3).map((item) => ({
              title: item.title,
              excerpt: item.excerpt,
              image: item.imageUrl ? withVersion(item.imageUrl, item.updatedAt) : BlogImage1,
              category: item.category,
              publishDate: item.publishDate,
              slug: item.slug,
              updatedAt: item.updatedAt || "",
            })),
          );
        }
      } catch {
        // Keep default blog posts if API is unavailable.
      }
    };

    fetchBlogs();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchWhyChooseData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/why-choose-us/public`);
        const result = await response.json();
        if (response.ok && result?.success && result?.data) {
          setWhyChooseData({
            sectionTag: result.data.sectionTag || defaultWhyChooseData.sectionTag,
            heading: result.data.heading || defaultWhyChooseData.heading,
            description: result.data.description || defaultWhyChooseData.description,
            imageUrl: result.data.imageUrl || "",
            badgeTitle: result.data.badgeTitle || defaultWhyChooseData.badgeTitle,
            badgeText: result.data.badgeText || defaultWhyChooseData.badgeText,
            points: Array.isArray(result.data.points) && result.data.points.length
              ? result.data.points
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                  .map((item) => ({
                    title: item.title,
                    description: item.description,
                    iconKey: item.iconKey || "icon-1",
                  }))
              : defaultWhyChooseData.points,
            updatedAt: result.data.updatedAt || "",
          });
        }
      } catch {
        // Keep default Why Choose Us data if API is unavailable.
      }
    };

    fetchWhyChooseData();
  }, [API_BASE_URL]);

  const headingLines = (heroContent.heading || defaultHeroContent.heading).split("\n");
  const heroImageUrl = heroContent.heroImage
    ? withVersion(heroContent.heroImage, heroContent.updatedAt)
    : DefaultHeroImage;
  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  const chooseImageUrl = whyChooseData.imageUrl
    ? withVersion(whyChooseData.imageUrl, whyChooseData.updatedAt)
    : ChooseImage;
  const chooseIconMap = {
    'icon-1': ChooseIcon1,
    'icon-2': ChooseIcon2,
    'icon-3': ChooseIcon3,
  };

  return (
    <>
     <Header />
      <main>
        {/* Hero section */}
        <section className="section-1">
          <div
            className="hero d-flex align-items-center"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0)), url(${heroImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="container-fluid">
                <div className="text-center">
                    <span>{heroContent.preHeading}</span>
                    <h1>
                      {headingLines.map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < headingLines.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </h1>
                    <p>{heroContent.subHeading}</p>
                    <Link to={heroContent.primaryButtonLink} className="btn btn-primary">{heroContent.primaryButtonText}</Link>
                    <Link to={heroContent.secondaryButtonLink} className="btn btn-secondary ms-2">{heroContent.secondaryButtonText}</Link>
                </div>
            </div>
          </div>
        </section>
        {/* About Section */}
       <About />
        {/* Our Services */}
        <section className="section-3">
          <div className="container py-5">
            <div className="services-header text-center mx-auto">
              <span className="section-tag">Our Services</span>
              <h2>Explore Our Premium Construction Services</h2>
              <p>
                Hover on each card to view service details with a clean
                interactive preview.
              </p>
            </div>

            <div className="row g-4 mt-1">
              {services.slice(0, 4).map((service) => (
                <div className="col-12 col-md-6 col-lg-3" key={service.title}>
                  <article className="service-card">
                    <img src={service.image} alt={service.title} />
                    <div className="service-title">
                      <h4>{service.title}</h4>
                    </div>
                    <div className="service-overlay">
                      <h4>{service.title}</h4>
                      <p>{service.description}</p>
                      <Link to="/services" className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link to="/services" className="btn btn-primary">
                View All
              </Link>
            </div>
          </div>
        </section>
        {/* Our Projects */}
        <section className="section-4">
          <div className="container py-5">
            <div className="projects-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3">
              <div>
                <span className="section-tag">Our Projects</span>
                <h2>Signature Projects We Are Proud To Build</h2>
                <p>
                  A curated selection of residential and commercial projects
                  delivered with engineering excellence and premium finishing.
                </p>
              </div>
              <Link to="/projects" className="btn btn-primary projects-btn">
                All Projects
              </Link>
            </div>

            <div className="row g-4 mt-1">
              {projects.slice(0, 4).map((project) => (
                <div className="col-12 col-md-6 col-lg-3" key={project.title}>
                  <article className="project-card">
                    <img src={project.image} alt={project.title} />
                    <span className="project-status">{project.status}</span>
                    <div className="project-overlay">
                      <p className="project-category">{project.category}</p>
                      <h4>{project.title}</h4>
                      <span className="project-location">{project.location}</span>
                      <Link to="/projects" className="project-link">
                        View Details
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Why Choose Us */}
        <section className="section-5">
          <div className="container py-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-5">
                <div className="choose-media">
                  <img src={chooseImageUrl} alt="Why choose Somnath Construction" />
                  <div className="choose-badge">
                    <h4>{whyChooseData.badgeTitle}</h4>
                    <p>{whyChooseData.badgeText}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="choose-header">
                  <span className="section-tag">{whyChooseData.sectionTag}</span>
                  <h2>{whyChooseData.heading}</h2>
                  <p>{whyChooseData.description}</p>
                </div>

                <div className="row g-3 mt-1">
                  {whyChooseData.points.map((item) => (
                    <div className="col-12 col-md-6" key={item.title}>
                      <article className="choose-card">
                        <div className="choose-icon">
                          <img src={chooseIconMap[item.iconKey] || ChooseIcon1} alt={item.title} />
                        </div>
                        <div>
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
                <div className="choose-cta mt-4">
                  <Link to="/contact-us" className="btn btn-primary">
                    Get Free Consultation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Testimonials */}
        <section className="section-6">
          <div className="container py-5">
            <div className="testimonials-header text-center mx-auto">
              <span className="section-tag">Testimonials</span>
              <h2>What Our Clients Say About Our Work</h2>
              <p>
                Trusted by homeowners and businesses for reliable project
                delivery, quality craftsmanship, and transparent communication.
              </p>
            </div>

            <div className="testimonial-slider">
              <div
                className="testimonial-track"
                style={{
                  transform: `translateX(-${activeTestimonial * 100}%)`,
                }}
              >
                {testimonialSlides.map((slide, slideIndex) => (
                  <div className="testimonial-slide" key={slideIndex}>
                    <div className="testimonial-grid">
                      {slide.map((item) => (
                        <article className="testimonial-card" key={item.name}>
                          <div
                            className="testimonial-stars"
                            aria-label="Rated 5 out of 5"
                          >
                            {Array.from({ length: item.rating || 5 }).map((_, index) => (
                              <span key={index}>&#9733;</span>
                            ))}
                          </div>
                          <p className="testimonial-text">"{item.text}"</p>
                          <div className="testimonial-user">
                            {item.avatarUrl ? (
                              <img
                                src={item.avatarUrl}
                                alt={item.name}
                                className="testimonial-avatar"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <span className="testimonial-avatar">
                                {item.name.charAt(0)}
                              </span>
                            )}
                            <div>
                              <h4>{item.name}</h4>
                              <p>{item.role}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="testimonial-dots">
              {testimonialSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === activeTestimonial ? "active" : ""}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`Go to testimonial slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
        {/* Blog & News */}
        <section className="section-7">
          <div className="container py-5">
            <div className="blog-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3">
              <div>
                <span className="section-tag">Blog & News</span>
                <h2>Latest Insights From Our Construction Experts</h2>
                <p>
                  Get practical guides, project updates, and industry knowledge
                  to make smarter construction decisions.
                </p>
              </div>
              <Link to="/blogs" className="btn btn-primary">
                View All Articles
              </Link>
            </div>

            <div className="row g-4 mt-1">
              {blogPosts.map((post) => (
                <div className="col-12 col-md-6 col-lg-4" key={post.title}>
                  <article className="blog-card">
                    <div className="blog-image-wrap">
                      <img src={post.image} alt={post.title} />
                    </div>
                    <div className="blog-content">
                      <div className="blog-meta">
                        <span>{post.category}</span>
                        <span>{formatDate(post.publishDate)}</span>
                      </div>
                      <h4>{post.title}</h4>
                      <p>{post.excerpt}</p>
                      <Link to={post.slug ? `/blogs/${post.slug}` : "/blogs"} className="blog-link">
                        Read More
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
    <Footer />
    </>
  );
};

export default Home;



