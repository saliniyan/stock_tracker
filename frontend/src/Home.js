// Home.js
import React, { Suspense } from 'react';
import Navbar from './Navbar';
import './home.css';

const Analytics = React.lazy(() => import('./Analytics'));

function Home() {

  return (
    <div>
      <Navbar />
      <main>
        <header>
            <h1 style={{ margin: 0 }}>Product Management</h1>
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
            <li>Customer Support</li>
          </ul>
        </section>

        <Suspense fallback={<div>Loading analytics...</div>}>
          <Analytics />
        </Suspense>
      </main>
    </div>
  );
}

export default Home;
