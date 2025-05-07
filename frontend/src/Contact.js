// src/components/Contact.js
import React, { useState } from 'react';
import Navbar from './Navbar';

function Contact() {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Message Sent:', message);
  };

  return (
    <div>
        <Navbar />
        <br />
      
      <div>
        <h2>Contact Information</h2>
        <p>Email: info@smengineering.com</p>
        <p>Phone: +91 123 456 7890</p>
        <p>Address: 123, Industrial Area, Hosur, Tamil Nadu, India</p>
      </div>
    </div>
  );
}

export default Contact;
