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
      Reach Us
<br />
  Sf No 7/52,Rajeswari Layout,Hosur,Krishnagiri, Unnamed Road, 
  <br />
  Hosur-635126, Tamil Nadu, India
<br />

  Manimegalai Madhavan
<br />
  Call 08044458747 
      </div>
    </div>
  );
}

export default Contact;
