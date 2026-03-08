import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
     <footer className="footer-main">
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="footer-brand">
                <h4>
                  <span>Somnath </span>Construction
                </h4>
                <p>
                  We build reliable residential and commercial spaces with
                  quality engineering, transparent timelines, and long-term
                  value.
                </p>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-6 col-lg-2">
              <div className="footer-widget">
                <h5>Quick Links</h5>
                <ul className="list-unstyled mb-0">
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/about">About Us</Link>
                  </li>
                  <li>
                    <Link to="/services">Services</Link>
                  </li>
                  <li>
                    <Link to="/projects">Projects</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-md-6 col-lg-3">
              <div className="footer-widget">
                <h5>Contact</h5>
                <ul className="list-unstyled mb-0">
                  <li>
                    <a href="tel:+919999999999">+91 99999 99999</a>
                  </li>
                  <li>
                    <a href="mailto:info@somnathconstruction.com">
                      info@somnathconstruction.com
                    </a>
                  </li>
                  <li>Ahmedabad, Gujarat</li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="footer-widget">
                <h5>Newsletter</h5>
                <p className="mb-3">
                  Get latest project updates and construction insights.
                </p>
                <form className="footer-newsletter">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary w-100 mt-2"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-2 mb-md-0">
              (c) 2026 Somnath Construction. All Rights Reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/about">Privacy Policy</Link>
              <Link to="/contact-us">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
  )
}

export default Footer
