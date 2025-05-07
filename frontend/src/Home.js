// Home.js
import React from 'react';
import Navbar from './Navbar';
import './home.css';

function Home() {
  return (
    <div>
      <Navbar />
      <main>
      <div>
      <header>
        <h1>Sri Madhura Engineering</h1>
        <p>Your trusted partner for high-quality car spare parts</p>
      </header>

      <section>
        <h2>Featured Categories</h2>
        <ul>
          <li>Engine Parts</li>
          <li>Braking Systems</li>
          <li>Electrical Components</li>
          <li>Suspension & Steering</li>
          <li>Body Parts</li>
        </ul>
      </section>

      <section>
        <h2>Why Choose Us?</h2>
        <ul>
          <li>Wide Selection of Parts</li>
          <li>Quality Assurance</li>
          <li>Fast Delivery</li>
          <li>Customer Support</li>
        </ul>
      </section>
    </div>
      </main>
    </div>
  );
}

export default Home;
