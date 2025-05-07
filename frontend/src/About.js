// src/components/About.js
import React from 'react';
import Navbar from './Navbar';


function About() {
  return (
    <div>
    <Navbar />
    <br />
      <h1>About Us</h1>
      <p>Sri Madhura Engineering specializes in high-quality car spare parts. We offer a wide range of products, ensuring your vehicle stays in top condition.</p>
      
      <h2>Mission</h2>
      <p>Our mission is to provide top-quality auto parts at affordable prices with exceptional customer service.</p>

      <h2>Our Values</h2>
      <ul>
        <li>Integrity</li>
        <li>Customer-Centricity</li>
        <li>Innovation</li>
        <li>Sustainability</li>
      </ul>
    </div>
  );
}

export default About;
