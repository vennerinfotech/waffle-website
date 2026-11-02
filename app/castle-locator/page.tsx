"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { MapPin, Navigation, ShoppingBag } from "lucide-react";
import Footer from "../components/Footer";
import "./locator.css";
import { createClient } from "@/lib/db/client";
import fallbackStores from "./fallback_stores.json";

export default function CastleLocator() {
  const supabase = useMemo(() => createClient(), []);
  const [storeData, setStoreData] = useState<{ city: string, stores: { name: string, address: string, link: string, directions_link?: string }[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadStores() {
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("*")
          .eq("is_active", true)
          .order("city", { ascending: true })
          .order("name", { ascending: true });

        if (error || !data || data.length === 0) {
          if (error) {
            console.error("Error loading stores from Supabase, using fallback:", error);
          }
          setStoreData(fallbackStores);
          return;
        }

        const grouped: { [city: string]: { name: string, address: string, link: string, directions_link?: string }[] } = {};
        data.forEach(item => {
          if (!grouped[item.city]) {
            grouped[item.city] = [];
          }
          grouped[item.city].push({
            name: item.name,
            address: item.address,
            link: item.link || "",
            directions_link: item.directions_link || ""
          });
        });

        const formatted = Object.keys(grouped).map(city => ({
          city,
          stores: grouped[city]
        }));

        setStoreData(formatted);
      } catch (e) {
        console.error("Failed to load stores, using fallback:", e);
        setStoreData(fallbackStores);
      } finally {
        setLoading(false);
      }
    }
    loadStores();
  }, [supabase]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const cities = ["All", ...storeData.map(d => d.city)];

  // Flatten the array to easily map through it and filter
  const allStores = useMemo(() => {
    const flatStores: { city: string, name: string, address: string, link: string, directions_link?: string }[] = [];
    storeData.forEach(cityGroup => {
      cityGroup.stores.forEach(store => {
        flatStores.push({
          city: cityGroup.city,
          name: store.name,
          address: store.address,
          link: store.link,
          directions_link: store.directions_link
        });
      });
    });
    return flatStores;
  }, [storeData]);

  const filteredStores = useMemo(() => {
    return allStores.filter(store => {
      const matchesCity = activeCity === "All" || store.city === activeCity;
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [activeCity, searchQuery, allStores]);

  return (
    <>
      <main className="locator-page">
        <div className="locator-container">

          <div className="locator-hero-split">
            <div className="locator-header">
              <span className="section-pill">Our Locations</span>
              <h1>Find Your <span>Nearest Castle</span></h1>
              <p>Visit your nearest Waffle Castle and indulge in a world of irresistible flavors, handcrafted premium waffles, rich signature desserts, creamy shakes, and delightful sweet treats made to satisfy every craving. From perfectly crisp golden waffles loaded with toppings to decadent chocolate creations and refreshing beverages, every bite is crafted for a memorable dessert experience. Whether you're planning a casual hangout, a family outing, or a late-night sweet escape, Waffle Castle offers the perfect blend of taste, comfort, and indulgence in every visit.</p>
            </div>

            <div className="locator-hero-image">
              <img src="/images/BRAND_AWARNESS_WEB.jpg" alt="Waffle Castle Locations" />
            </div>
          </div>

          <div className="locator-search">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by city or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="city-filters" ref={scrollRef}>
            {cities.map((city) => (
              <button
                key={city}
                className={`city-filter-btn ${activeCity === city ? 'active' : ''}`}
                onClick={() => setActiveCity(city)}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="stores-grid">
            {loading ? (
              <div className="locator-loading">
                <div className="spinner"></div>
                <p>Loading castles...</p>
              </div>
            ) : filteredStores.length > 0 ? (
              filteredStores.map((store, index) => (
                <div className="store-card" key={index}>
                  <div className="store-content">
                    <div className="store-city-badge">{store.city}</div>
                    <div className="store-info">
                      <h3 className="store-name">Waffle Castle - {store.name}</h3>
                      <div className="store-address">
                        <MapPin size={18} />
                        <span>{store.address}</span>
                      </div>
                    </div>

                    <div className="store-actions">
                      <a
                        href={store.directions_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Waffle Castle ${store.name} ${store.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn btn-directions"
                      >
                        <Navigation size={18} />
                        Directions
                      </a>
                      {store.link && (
                        <a
                          href={store.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-btn btn-order"
                        >
                          <ShoppingBag size={18} />
                          Order Now
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No castles found matching your search.</p>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
