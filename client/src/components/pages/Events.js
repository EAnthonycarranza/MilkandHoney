import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const eventTypeLabels = {
    wedding: 'Wedding',
    church: 'Church Event',
    corporate: 'Corporate',
    birthday: 'Birthday',
    community: 'Community',
    fundraiser: 'Fundraiser',
    'pop-up': 'Pop-Up',
    other: 'Event',
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date(new Date().toDateString()));
  const pastEvents = events.filter(e => new Date(e.date) < new Date(new Date().toDateString()));

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1>Our Events</h1>
          <p className="subtitle">See where Milk & Honey Coffee Cart will be serving next</p>
          <p className="verse">"For where two or three gather in my name, there am I with them." — Matthew 18:20</p>
        </div>
      </section>

      <section className="section">
        {loading ? (
          <div className="loading-spinner">Loading events...</div>
        ) : (
          <>
            {upcomingEvents.length > 0 && (
              <>
                <h2 className="section-title">Upcoming Events</h2>
                <p className="section-subtitle">Come visit us at one of these upcoming events!</p>
                <div className="events-grid">
                  {upcomingEvents.map(event => (
                    <div key={event._id} className="event-card">
                      {event.image ? (
                        <div className="event-card-image">
                          <img src={event.image} alt={event.title} />
                          <span className="event-type-badge">{eventTypeLabels[event.eventType] || 'Event'}</span>
                        </div>
                      ) : (
                        <div className="event-card-image">
                          <span className="placeholder">&#9749;</span>
                          <span className="event-type-badge">{eventTypeLabels[event.eventType] || 'Event'}</span>
                        </div>
                      )}
                      <div className="event-card-body">
                        <h3>{event.title}</h3>
                        <div className="event-card-meta">
                          <span>&#128197; {formatDate(event.date)}</span>
                          {event.time && <span>&#128336; {event.time}</span>}
                          <span>&#128205; {event.location}</span>
                        </div>
                        <p>{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {pastEvents.length > 0 && (
              <div style={{ marginTop: upcomingEvents.length > 0 ? '4rem' : 0 }}>
                <h2 className="section-title">Past Events</h2>
                <p className="section-subtitle">A look back at where we've been</p>
                <div className="events-grid past-events">
                  {pastEvents.map(event => (
                    <div key={event._id} className="event-card past">
                      {event.image ? (
                        <div className="event-card-image">
                          <img src={event.image} alt={event.title} />
                          <span className="event-type-badge">{eventTypeLabels[event.eventType] || 'Event'}</span>
                        </div>
                      ) : (
                        <div className="event-card-image">
                          <span className="placeholder">&#9749;</span>
                          <span className="event-type-badge">{eventTypeLabels[event.eventType] || 'Event'}</span>
                        </div>
                      )}
                      <div className="event-card-body">
                        <h3>{event.title}</h3>
                        <div className="event-card-meta">
                          <span>&#128197; {formatDate(event.date)}</span>
                          {event.time && <span>&#128336; {event.time}</span>}
                          <span>&#128205; {event.location}</span>
                        </div>
                        <p>{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {events.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h3 style={{ color: 'var(--gold-dark)' }}>No Events Yet</h3>
                <p style={{ color: 'var(--gray)', marginTop: '0.5rem' }}>Check back soon for upcoming events!</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Want Us at Your Event?</h2>
        <p>Book the Milk & Honey Coffee Cart for your next gathering</p>
        <Link to="/quote" className="btn btn-primary">Request a Free Quote</Link>
      </section>
    </div>
  );
};

export default Events;
