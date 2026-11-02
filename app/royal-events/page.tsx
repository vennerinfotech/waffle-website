"use client";

import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import "./events.css";
import { motion } from "framer-motion";
import { Camera, Heart, Music, Moon, Star, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/db/client";

interface PastEvent {
  id?: string;
  title: string;
  spotlight_text: string;
  description: string;
  image_url: string;
  tags: string[];
}

export default function RoyalEventsPage() {
  const [eventsList, setEventsList] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDatabaseEvents() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("past_events")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching past events from database:", error);
          return;
        }

        if (data) {
          setEventsList(data);
        }
      } catch (err) {
        console.error("Failed to load past events from database:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDatabaseEvents();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    eventType: "Table Reservation",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "events", ...formData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSubmitted(true);
      setFormData({ name: "", phone: "", email: "", eventType: "Table Reservation", message: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moments = [
    {
      title: "Instagrammable Setups",
      desc: "Every corner of our kingdom is designed to look as good as our waffles taste.",
      icon: <Camera size={28} />,
    },
    {
      title: "Made with Love",
      desc: "Our waffles come loaded with rich toppings, smooth sauces, and bold flavors.",
      icon: <Heart size={28} />,
    },
    {
      title: "Music Always Playing",
      desc: "Good vibes and great tunes to complement every bite of your royal dessert.",
      icon: <Music size={28} />,
    },
    {
      title: "Open Late Nights",
      desc: "Midnight cravings? The castle doors stay open late for your sweet tooth.",
      icon: <Moon size={28} />,
    },
    {
      title: "Royal Service",
      desc: "Experience top-tier hospitality where every guest is treated like royalty.",
      icon: <Star size={28} />,
    },
    {
      title: "Crispy Every Time",
      desc: "Flipping golden waffles to perfection, crispy on the outside, fluffy inside.",
      icon: <Star size={28} />,
    },
  ];

  return (
    <main className="events-page">
      <div className="events-container">

        {/* Hero Section */}
        <section className="events-hero">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            We didn’t open a cafe.<br />
            <span>We built a kingdom.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            When you step into Waffle Castle, you’re entering a world where every moment is savored.
            From casual gatherings to late-night cravings, every waffle is part of a celebration.
          </motion.p>
        </section>

        {/* The Royal Experience / Moments Gallery */}
        <section className="moments-section">
          <div className="section-header">
            <span className="section-pill">Experience the Royal Treatment</span>
            <h2>The Royal <span>Experience</span></h2>
            <p style={{ color: "rgba(43, 18, 6, 0.7)", fontSize: "1.1rem" }}>
              Make Every Moment Delicious at Waffle Castle
            </p>
          </div>

          <div className="moments-grid">
            {moments.map((moment, index) => (
              <div className="moment-card" key={index}>
                <div className="moment-icon">{moment.icon}</div>
                <h3>{moment.title}</h3>
                <p>{moment.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Event Spotlight */}
        <section className="spotlight-section">
          <div className="section-header">
            <span className="section-pill">Events</span>
            <h2>Past <span>Events</span></h2>
          </div>

          {loading ? (
            <div className="events-loading">
              <div className="spinner"></div>
              <p>Loading royal events...</p>
            </div>
          ) : eventsList.length === 0 ? (
            <div className="empty-events-state">
              <CalendarDays size={48} className="empty-icon" />
              <h3>No spotlight events yet</h3>
              <p>Check back later or reserve your spot below to stay updated!</p>
            </div>
          ) : (
            eventsList.map((event, index) => (
              <div
                className="spotlight-card"
                key={event.id || index}
                style={{ marginBottom: index < eventsList.length - 1 ? "40px" : "0" }}
              >
                <div className="spotlight-content section-title">
                  {event.spotlight_text && (
                    <span className="section-pill">{event.spotlight_text}</span>
                  )}
                  <h2>{event.title}</h2>
                  <p>{event.description}</p>
                  {event.tags && event.tags.length > 0 && (
                    <div className="spotlight-tags">
                      {event.tags.map((tag, tIdx) => (
                        <span key={tIdx}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="spotlight-image">
                  <img src={event.image_url} alt={event.title} />
                </div>
              </div>
            ))
          )}
        </section>


        {/* Reservation Form */}
        <section className="reservation-section">
          <div className="reservation-grid">
            {/* Left Info Content */}
            <motion.div
              className="reservation-info"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2>Reserve Your <br /><span>Royal Spot</span></h2>
              <p>
                Whether you want to lock in your seat for an upcoming event, ask about a concert night, or just find out what’s dropping next — drop us a note. The castle doors are always open.
              </p>

              <ul className="brand-points">
                <li>
                  <Star size={20} className="point-icon" />
                  <span>Multiple locations across India — Find your nearest castle</span>
                </li>
                <li>
                  <Heart size={20} className="point-icon" />
                  <span>Tag @wafflecastle.in to be featured on our Royal Moments wall</span>
                </li>
                <li>
                  <CalendarDays size={20} className="point-icon" />
                  <span>We'll get back within 24 hours of your submission</span>
                </li>
              </ul>
            </motion.div>

            {/* Right Form Content */}
            <motion.div
              className="reservation-form-container"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="reservation-form">
                {submitted ? (
                  <div className="success-state">
                    <CalendarDays size={60} color="#f6a52a" className="success-icon" />
                    <h3>Request Received!</h3>
                    <p>
                      The castle doors are open. Our team will get back to you within 24 hours to confirm your reservation.
                    </p>
                    <button onClick={() => setSubmitted(false)} className="reset-btn">Send Another Request</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Enter your phone"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter your email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Reservation Type</label>
                        <select
                          className="form-control"
                          value={formData.eventType}
                          onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        >
                          <option>Table Reservation</option>
                          <option>Private Party</option>
                          <option>Concert Night Query</option>
                          <option>Creator Collab</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Message / Special Requests</label>
                      <textarea
                        className="form-control"
                        placeholder="Tell us about your royal gathering..."
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      ></textarea>
                    </div>

                    {error && (
                      <p style={{ color: "#c0392b", marginBottom: "12px", fontSize: "14px" }}>
                        ⚠ {error}
                      </p>
                    )}
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? "Sending…" : "Reserve My Spot"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </section>

      </div>
      <Footer />
    </main>
  );
}
