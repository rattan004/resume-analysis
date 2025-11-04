import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CircleCheck as CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
    
    // Clear general error when user makes changes
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Subject validation
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      errors.subject = 'Subject must be at least 3 characters';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors below');
      return;
    }
    
    submitForm();
  };

  const submitForm = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      setFieldErrors({});
      
      // Prepare data for API
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };
      
      await api.submitContact(contactData);
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (err) {
      console.error('Contact form error:', err);
      
      // Handle backend validation errors
      if (err.message && err.message.includes('Validation failed')) {
        // Extract field-specific errors from backend response
        try {
          const errorData = JSON.parse(err.message);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const backendErrors = {};
            errorData.errors.forEach(errorItem => {
              if (errorItem.path) {
                backendErrors[errorItem.path] = errorItem.msg;
              }
            });
            setFieldErrors(backendErrors);
            setError('Please check your input fields');
          } else {
            setError(errorData.message || 'Validation failed. Please check your input.');
          }
        } catch (parseError) {
          setError(err.message || 'Failed to send message. Please try again.');
        }
      } else if (err.message && err.message.includes('Too many')) {
        setError('Too many submission attempts. Please wait 15 minutes before trying again.');
      } else {
        setError(err.message || 'Failed to send message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="contact-page">
        <div className="container">
          <div className="success-message">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h1>Message Sent Successfully!</h1>
            <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setIsSubmitted(false)}
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>Get in Touch</h1>
          <p>Have questions about our AI resume screening tool? We'd love to hear from you.</p>
        </div>

        <div className="contact-content">
          <div className="contact-form-section">
            <div className="contact-form-card">
              <h2>Send us a Message</h2>
              
              {error && !Object.keys(fieldErrors).length && (
                <div className="form-error general-error">
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      className={fieldErrors.name ? 'error' : ''}
                    />
                    {fieldErrors.name && (
                      <span className="field-error">{fieldErrors.name}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      className={fieldErrors.email ? 'error' : ''}
                    />
                    {fieldErrors.email && (
                      <span className="field-error">{fieldErrors.email}</span>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What's this about?"
                    className={fieldErrors.subject ? 'error' : ''}
                  />
                  {fieldErrors.subject && (
                    <span className="field-error">{fieldErrors.subject}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us more about how we can help you..."
                    className={fieldErrors.message ? 'error' : ''}
                  ></textarea>
                  {fieldErrors.message && (
                    <span className="field-error">{fieldErrors.message}</span>
                  )}
                  <div className="character-count">
                    {formData.message.length}/10 minimum characters
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary submit-btn"
                  disabled={isSubmitting}
                >
                  <Send size={20} />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          <div className="contact-info-section">
            <div className="contact-info-card">
              <h3>Contact Information</h3>
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="info-icon">
                    <Mail />
                  </div>
                  <div className="info-content">
                    <h4>Email</h4>
                    <p>support@airesumescreening.com</p>
                  </div>
                </div>
                
                <div className="contact-info-item">
                  <div className="info-icon">
                    <Phone />
                  </div>
                  <div className="info-content">
                    <h4>Phone</h4>
                    <p>+91 12345 67890</p>
                  </div>
                </div>
                
                <div className="contact-info-item">
                  <div className="info-icon">
                    <MapPin />
                  </div>
                  <div className="info-content">
                    <h4>Address</h4>
                    <p>123 Tech Street<br /></p>
                  </div>
                </div>
                
                <div className="contact-info-item">
                  <div className="info-icon">
                    <Clock />
                  </div>
                  <div className="info-content">
                    <h4>Business Hours</h4>
                    <p>Mon - Fri: 9:00 AM - 6:00 PM IST<br />Sat - Sun: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="faq-link-card">
              <h3>Quick Answers</h3>
              <p>Looking for immediate answers? Check out our FAQ section for common questions and solutions.</p>
              <a href="/faq" className="btn btn-secondary">
                View FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;