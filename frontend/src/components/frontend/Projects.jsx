import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import HeroSection from '../common/HeroSection';
import ProjectImage1 from '../../assets/images/construction11.jpg';
import ProjectImage2 from '../../assets/images/construction121.jpg';
import ProjectImage3 from '../../assets/images/construction5.jpg';
import ProjectImage4 from '../../assets/images/construction7.jpg';
import ProjectImage5 from '../../assets/images/construction10.jpg';
import ProjectImage6 from '../../assets/images/construction8.jpg';
import ProjectImage7 from '../../assets/images/construction9.jpg';
import ProjectImage8 from '../../assets/images/construction3.jpg';

const fallbackImages = [
  ProjectImage1,
  ProjectImage2,
  ProjectImage3,
  ProjectImage4,
  ProjectImage5,
  ProjectImage6,
  ProjectImage7,
  ProjectImage8,
];

const defaultProjects = [
  {
    title: 'Skyline Residency',
    type: 'Residential',
    location: 'Ahmedabad',
    year: '2025',
    imageUrl: ProjectImage1,
    featured: true,
    status: 'Completed',
    updatedAt: '',
  },
  {
    title: 'Prime Business Hub',
    type: 'Commercial',
    location: 'Gandhinagar',
    year: '2026',
    imageUrl: ProjectImage2,
    status: 'Ongoing',
    updatedAt: '',
  },
  {
    title: 'Green Valley Villas',
    type: 'Luxury Housing',
    location: 'Vadodara',
    year: '2024',
    imageUrl: ProjectImage3,
    status: 'Completed',
    updatedAt: '',
  },
  {
    title: 'Metro Retail Plaza',
    type: 'Retail',
    location: 'Surat',
    year: '2026',
    imageUrl: ProjectImage4,
    status: 'Upcoming',
    updatedAt: '',
  },
];

const withVersion = (url, version) => {
  if (!url || !version) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
};

const Projects = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [projects, setProjects] = useState(defaultProjects);
  const [activeFilter, setActiveFilter] = useState('All');

  const executionSteps = [
    {
      title: 'Project Discovery',
      text: 'Understanding site scope, objective, approvals, and phased execution priorities.',
    },
    {
      title: 'Technical Planning',
      text: 'Detailed layout strategy, material planning, timeline chart, and cost checkpoints.',
    },
    {
      title: 'Site Delivery',
      text: 'High-quality execution with compliance, supervision, and milestone audits.',
    },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/public`);
        const result = await response.json();
        if (response.ok && result?.success && Array.isArray(result.data) && result.data.length > 0) {
          setProjects(
            result.data.map((item, index) => ({
              title: item.title,
              type: item.type,
              location: item.location,
              year: item.year,
              imageUrl: item.imageUrl || fallbackImages[index % fallbackImages.length],
              featured: Boolean(item.featured),
              status: item.status,
              updatedAt: item.updatedAt || '',
            })),
          );
        }
      } catch {
        // Keep default projects if API is unavailable.
      }
    };

    fetchProjects();
  }, [API_BASE_URL]);

  const projectStats = useMemo(() => {
    const completed = projects.filter((item) => item.status === 'Completed').length;
    const ongoing = projects.filter((item) => item.status === 'Ongoing').length;
    const years = projects
      .map((item) => Number(item.year))
      .filter((value) => Number.isFinite(value) && value > 0);
    const latestYear = years.length ? Math.max(...years) : new Date().getFullYear();
    const earliestYear = years.length ? Math.min(...years) : latestYear;
    const experienceYears = Math.max(1, latestYear - earliestYear + 1);
    const locations = new Set(projects.map((item) => item.location).filter(Boolean)).size;

    return [
      { value: `${projects.length}+`, label: 'Completed Projects' },
      { value: `${ongoing}+`, label: 'Ongoing Sites' },
      { value: `${experienceYears}+`, label: 'Years Experience' },
      { value: `${locations}`, label: 'Cities Served' },
    ];
  }, [projects]);

  const typeFilters = useMemo(() => {
    const types = Array.from(new Set(projects.map((item) => item.type).filter(Boolean)));
    return ['All', ...types];
  }, [projects]);

  const visibleProjects = useMemo(() => {
    if (activeFilter === 'All') {
      return projects;
    }
    return projects.filter((project) => project.type === activeFilter);
  }, [projects, activeFilter]);

  return (
    <>
      <Header />
      <main className="projects-page">
        <HeroSection
          preHeading="Our Portfolio"
          heading="Showcasing Excellence in Construction Projects"
          text="Explore our diverse range of completed projects, each reflecting our commitment to quality, innovation, and client satisfaction."
        />

        <section className="projects-overview">
          <div className="container py-5">
            <div className="overview-head text-center mx-auto">
              <span className="section-tag">Project Highlights</span>
              <h2>Projects That Define Quality And Trust</h2>
              <p>
                We build residential, commercial, and mixed-use developments
                with a strong focus on engineering quality and timely delivery.
              </p>
            </div>
            <div className="row g-3 mt-2">
              {projectStats.map((item) => (
                <div className="col-6 col-lg-3" key={item.label}>
                  <div className="project-stat-card">
                    <h3>{item.value}</h3>
                    <p>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="project-gallery">
          <div className="container pb-5">
            <div className="gallery-top d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div className="gallery-filters">
                {typeFilters.slice(0, 4).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={activeFilter === filter ? 'active' : ''}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-primary">
                Request Portfolio PDF
              </button>
            </div>

            <div className="row g-4 mt-1">
              {visibleProjects.map((project, index) => (
                <div
                  className={project.featured ? 'col-12 col-lg-6' : 'col-12 col-md-6 col-lg-3'}
                  key={`${project.title}-${index}`}
                >
                  <article className={`portfolio-card ${project.featured ? 'featured' : ''}`}>
                    <img src={withVersion(project.imageUrl, project.updatedAt)} alt={project.title} />
                    <div className="portfolio-overlay">
                      <span>{project.type}</span>
                      <h4>{project.title}</h4>
                      <p>
                        {project.location} | {project.year}
                      </p>
                      <Link to="/projects">View Project</Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="project-process">
          <div className="container py-5">
            <div className="process-head text-center mx-auto">
              <span className="section-tag">Execution Framework</span>
              <h2>How We Deliver Complex Projects Successfully</h2>
            </div>
            <div className="row g-4 mt-1">
              {executionSteps.map((step, index) => (
                <div className="col-12 col-md-6 col-lg-4" key={step.title}>
                  <article className="execution-card">
                    <span className="execution-index">0{index + 1}</span>
                    <h4>{step.title}</h4>
                    <p>{step.text}</p>
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

export default Projects;
