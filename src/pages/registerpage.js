import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { client } from '../lib/sanity';
import emailjs from '@emailjs/browser';

export default function RegistrationPage() {
  const { slug, sheet } = useParams();
  const [eventName, setEventName] = useState('');
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    registrationNumber: '',
    department: '',
    phoneNumber: '',
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const query = `*[_type == "event" && slug.current == $slug][0]{
      title
    }`;
    client.fetch(query, { slug }).then((data) => {
      if (data?.title) {
        setEventName(data.title);
      }
    });
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    emailjs.init("fdNEB1c-Ij09l8LoD");
  }, []);

  const sendEmail = async () => {
    try {
      // Create the template parameters object
      const templateParams = {
        to_email: formData.email, // The recipient's email
        to_name: formData.studentName,
        from_name: 'Campus Life(E&T) SRMIST',
        event_name: eventName,
        message: `You have successfully registered for ${eventName}!`,
        reply_to: formData.email, // Optional: For reply-to functionality
      };
      

      const result = await emailjs.send(
        'service_hsvxhjh',
        'template_maqknvd',
        templateParams
      );

      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('loading');

    try {
      // First submit to Google Sheets
      const response = await fetch(
        `https://script.google.com/macros/s/${sheet}/exec`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            eventName,
            registrationDate: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        // If Google Sheets submission is successful, send confirmation email
        const emailSent = await sendEmail();
        
        if (emailSent) {
          setStatus('success');
          setFormData({
            studentName: '',
            email: '',
            registrationNumber: '',
            department: '',
            phoneNumber: '',
          });
        } else {
          // If email fails but sheet submission succeeded
          setStatus('partial');
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!eventName) {
    return <div>Loading event details...</div>;
  }

  return (
    <div className="registration-container">
      <div className="registration-header">
        <h1>{eventName} Registration</h1>
        <p>Please fill in your details to register</p>
      </div>

      <form className="registration-form" onSubmit={handleSubmit} ref={formRef}>
        <div className="form-group">
          <input
            type="text"
            name="studentName"
            placeholder="Student Name"
            value={formData.studentName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="registrationNumber"
            placeholder="Registration Number"
            value={formData.registrationNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Complete Registration'}
        </button>
      </form>

      {status && (
        <div className={`status-message ${status}`}>
          {status === 'loading' && <span>Submitting registration...</span>}
          {status === 'success' && 'Registration completed successfully! Please check your email for confirmation.'}
          {status === 'partial' && 'Registration completed, but confirmation email could not be sent.'}
          {status === 'error' && 'Registration failed. Please try again later.'}
        </div>
      )}
    </div>
  );
}