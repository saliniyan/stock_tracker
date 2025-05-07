// src/components/Contact.js
import React, { useState } from 'react';
import Navbar from './Navbar';
import './styles.css';

function Contact() {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Message Sent:', { name, email, subject, message });
    alert('Your message has been sent. Thank you!');
    setMessage('');
    setName('');
    setEmail('');
    setSubject('');
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container">
        <div className="content-card">
          <h1 className="page-title">Contact Us</h1>
          
          <div className="two-column-grid">
            <div className="contact-info">
              <div className="info-card">
                <h2 className="section-title">Our Information</h2>
                
                <div className="info-group">
                  <h3 className="info-title">Address</h3>
                  <address>
                    Sri Madhura Engineering<br />
                    Sf No 7/52, Rajeswari Layout, Unnamed Road,<br />
                    Hosur – 635126, Krishnagiri District,<br />
                    Tamil Nadu, India
                  </address>
                </div>
                
                <div className="info-group">
                  <h3 className="info-title">Contact Person</h3>
                  <p>Manimegalai Madhavan</p>
                </div>
                
                <div className="info-group">
                  <h3 className="info-title">Phone</h3>
                  <p>
                    <a href="tel:08044458747" className="link">
                      080-4445-8747
                    </a>
                  </p>
                </div>
                
                <div className="info-group">
                  <h3 className="info-title">Email</h3>
                  <p>
                    <a href="mailto:info@srimadhuraengg.com" className="link">
                      info@srimadhuraengg.com
                    </a>
                  </p>
                </div>
                
                <div className="info-group">
                  <h3 className="info-title">Business Hours</h3>
                  <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
            
            <div className="contact-form">
              <h2 className="section-title">Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="btn">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
