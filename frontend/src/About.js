
// src/components/About.js
import React from 'react';
import Navbar from './Navbar';
import './styles.css';

function About() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container">
        <div className="content-card">
          <h1 className="page-title">About Sri Madhura Engineering</h1>
          
          <div className="intro-text">
            <p>
              Sri Madhura Engineering is a leading manufacturer and supplier of high-quality electrical and mechanical components, including electric motors, control panels, door closers, and metal fittings. Located in Hosur, Tamil Nadu, we serve industries with durable, efficient, and affordable solutions tailored to modern needs.
            </p>
          </div>
          
          <div className="two-column-grid">
            <div className="info-card">
              <h2 className="section-title">Our Mission</h2>
              <p>
                To deliver reliable, innovative, and cost-effective industrial and automotive components while maintaining the highest standards of quality and service.
              </p>
            </div>
            
            <div className="info-card">
              <h2 className="section-title">Our Vision</h2>
              <p>
                To be recognized as a trusted partner in industrial solutions, known for exceptional quality, innovation, and customer satisfaction across South India and beyond.
              </p>
            </div>
          </div>
          
          <div className="section">
            <h2 className="section-title">What We Do</h2>
            <div className="list-card">
              <ul className="feature-list">
                <li>Manufacturing of single and three-phase electric motors for industrial and commercial applications</li>
                <li>Production of control panels, switchboards, and generators with advanced safety features</li>
                <li>Design and fabrication of automatic door closers and metal fittings for residential and commercial use</li>
                <li>Custom solutions for industrial and commercial clients with specialized requirements</li>
                <li>Technical consultation and after-sales support for all our products</li>
              </ul>
            </div>
          </div>
          
          <div className="section">
            <h2 className="section-title">Our Expertise</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">8+</div>
                <div className="stat-label">Years of Experience</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">200+</div>
                <div className="stat-label">Projects Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">150+</div>
                <div className="stat-label">Satisfied Clients</div>
              </div>
            </div>
          </div>
          
          <div className="section">
            <h2 className="section-title">Core Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <h3 className="value-title">Integrity</h3>
                <p>We act with honesty and transparency in all our business dealings and relationships.</p>
              </div>
              <div className="value-card">
                <h3 className="value-title">Customer-Centricity</h3>
                <p>Every decision is made with our customers in mind, focusing on their needs and satisfaction.</p>
              </div>
              <div className="value-card">
                <h3 className="value-title">Innovation</h3>
                <p>Embracing technology and modern processes to deliver cutting-edge solutions.</p>
              </div>
              <div className="value-card">
                <h3 className="value-title">Sustainability</h3>
                <p>Reducing environmental impact with thoughtful practices throughout our manufacturing process.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;