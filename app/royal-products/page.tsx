"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Sparkles,
  Star,
  ThumbsUp,
  Zap,
  Heart,
} from "lucide-react";
import Footer from "../components/Footer";
import { createClient } from "@/lib/db/client";
import "./royal-products.css";

const categories = [
  "Waffle",
  "Mini Pancake",
  "Shakes & Beverages",
  "Waffle Stick",
  "Sizzling Sweet Deals",
  "Waffle Cake",
];

const features = [
  {
    title: "Royal Variety",
    desc: "A curated selection of 6 premium categories, each offering a unique flavor journey.",
    icon: <Crown size={28} />,
  },
  {
    title: "Freshly Crafted",
    desc: "We use only the finest ingredients, prepared fresh daily to ensure royal quality.",
    icon: <Zap size={28} />,
  },
  {
    title: "Made for Sharing",
    desc: "From individual treats to celebration boxes, our menu is designed for every occasion.",
    icon: <Heart size={28} />,
  },
];

export default function RoyalProductsPage() {
  const [activeCategory, setActiveCategory] = useState("Waffle");
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDatabaseProducts() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching products from database:", error);
          return;
        }

        const mapped = (data || []).map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          image: item.image_url,
        }));

        setProductsList(mapped);
      } catch (err) {
        console.error("Failed to load products from database:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDatabaseProducts();
  }, []);

  const visibleProducts = useMemo(
    () => productsList.filter((item) => item.category === activeCategory),
    [productsList, activeCategory]
  );

  const signatureProduct = useMemo(
    () => visibleProducts[0] || productsList[0] || null,
    [visibleProducts, productsList]
  );

  return (
    <main className="royal-products-page">
      <section className="products-hero">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="section-pill">Our Royal Menu</span>
          <h1>Experience the <span>Taste of Royalty.</span></h1>
          <p>
            Dive into a world of decadent waffles, soft mini pancakes, and
            rich shakes. Every bite is a celebration of flavor and craftsmanship.
          </p>
          <div className="category-tabs">
            {categories.map((category) => (
              <button
                key={category}
                className={category === activeCategory ? "tab active" : "tab"}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="hero-visual">
          <AnimatePresence mode="wait">
            {signatureProduct?.image && (
              <motion.div
                key={activeCategory}
                className="hero-image-container"
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                whileHover={{
                  scale: 1.05,
                  rotate: 2,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="image-glow"></div>
                <img src={signatureProduct.image} alt={signatureProduct.title || "Royal Product"} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="product-gallery" id="products">

        <motion.div
          className="product-grid"
          layout
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Display a premium loading state / skeleton cards
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="product-card skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line category"></div>
                    <div className="skeleton-line title"></div>
                  </div>
                </div>
              ))
            ) : visibleProducts.length === 0 ? (
              <motion.div
                key="empty-state"
                className="empty-products-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "80px 20px",
                  color: "var(--text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "48px" }}>🍽️</span>
                <h3 style={{ color: "var(--primary-gold)", fontSize: "20px", fontWeight: 600 }}>No Products Found</h3>
                <p style={{ maxWidth: "300px", margin: "0 auto", fontSize: "14px", opacity: 0.8 }}>
                  We are currently preparing royal recipes for this category. Check back soon!
                </p>
              </motion.div>
            ) : (
              visibleProducts.map((product, index) => (
                <motion.article
                  key={product.id || product.title}
                  className="product-card"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    layout: { duration: 0.3 }
                  }}
                >
                  <div className="card-image">
                    <img src={product.image} alt={product.title} />
                  </div>
                  <div className="card-content">
                    <span className="card-category">{product.category}</span>
                    <h3 className="card-title">{product.title}</h3>
                  </div>
                </motion.article>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      <section className="product-benefits">
        <div className="benefits-grid">
          {features.map((feature, index) => (
            <motion.div
              className="benefit-card"
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="benefit-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
