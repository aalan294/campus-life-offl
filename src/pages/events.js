import { useEffect, useState } from 'react';
import { client } from '../lib/sanity';
import { useNavigate } from 'react-router-dom';
import '.././style.css'

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const query = `*[_type == "event" && (status == "upcoming" || status=="ongoing")]{
      _id,
      title,
      slug,
      eventImage{
        asset->{
          url
        }
      },
      startDate,
      endDate,
      description,
      venue,
      registrationRequired,
      registrationDeadline,
      maxParticipants,
      fee,
      status,
      sheet
    }`;

    client.fetch(query).then((data) => setEvents(data));
  }, []);

  const handleRegister = (slug, sheet) => {
    navigate(`/register/${slug}/${sheet}`);
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Upcoming Events</h1>
      </div>
      
      <div className="events-grid">
        {events.map((event) => (
          <div key={event._id} className="event-card">
            {event.eventImage && (
              <div className="event-image">
                <img src={event.eventImage.asset.url} alt={event.title} />
              </div>
            )}
            <div className="event-content">
              <h2 className="event-title">{event.title}</h2>
              <p className="event-description">{event.description}</p>
              
              <div className="event-details">
                <div className="event-detail">
                  <span>Date:</span> {new Date(event.startDate).toLocaleDateString()}
                </div>
                <div className="event-detail">
                  <span>Time:</span> {new Date(event.startDate).toLocaleTimeString()}
                </div>
                <div className="event-detail">
                  <span>Venue:</span> {event.venue}
                </div>
                  <div className="event-detail">
                    <span>Fee:</span> ₹{event.fee}
                  </div>
              </div>

              <button
                className="register-button"
                onClick={() => handleRegister(event.slug.current, event.sheet)}
              >
                Register Now
              </button>

              <div className="registration-info">
                <div>
                  {event.registrationRequired ? (
                    <>
                      Registration closes on{' '}
                      <span>
                        {new Date(event.registrationDeadline).toLocaleDateString()}
                      </span>
                    </>
                  ) : (
                    'No registration required'
                  )}
                </div>
                {event.maxParticipants && (
                  <div>
                    Max participants: <span>{event.maxParticipants}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}