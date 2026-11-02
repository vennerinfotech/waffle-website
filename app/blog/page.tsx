"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import Footer from "../components/Footer";
import { blogPosts, BlogPost } from "./data";
import { createClient } from "@/lib/db/client";
import "./blog.css";

export default function BlogPage() {
  const [postsList, setPostsList] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDatabasePosts() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching blog posts from database:", error);
          setPostsList(blogPosts);
          return;
        }

        if (data) {
          const mapped = data.map((item) => ({
            slug: item.slug,
            title: item.title,
            category: item.category,
            date: item.date,
            readTime: item.read_time,
            author: item.author,
            authorRole: item.author_role,
            image: item.image_url || "/images/waffle-main.png",
            excerpt: item.excerpt,
            content: item.content,
          }));
          setPostsList(mapped);
        }
      } catch (err) {
        console.error("Failed to load blog posts from database:", err);
        setPostsList(blogPosts);
      } finally {
        setLoading(false);
      }
    }
    fetchDatabasePosts();
  }, []);

  // Filter posts based on search query and category (always all posts now)
  const gridPosts = useMemo(() => {
    return postsList;
  }, [postsList]);

  // Featured post logic: only display at index 0 when posts are available
  const featuredPost = useMemo(() => {
    if (loading || gridPosts.length === 0) {
      return null;
    }
    return gridPosts[0];
  }, [loading, gridPosts]);

  const displayPosts = useMemo(() => {
    return featuredPost ? gridPosts.slice(1) : gridPosts;
  }, [featuredPost, gridPosts]);

  return (
    <main className="blog-page">
      <div className="blog-container">
        {/* Hero Banner Section */}
        <section className="blog-hero">
          <span className="section-pill">Our Blog</span>
          <h1>
            Waffle Wisdom & <span>Sweet Stories</span>
          </h1>
          <p>
            Welcome to the official Waffle Castle blog. Step inside our world of culinary craftsmanship,
            sweet history, event diaries, and secret dessert pairings.
          </p>
        </section>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "30vh", padding: "40px 0" }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(43, 18, 6, 0.1)",
              borderTop: "4px solid #f6a52a",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <>
            {/* Featured Post (Only show on main landing, when search/filter is not active) */}
            {featuredPost && (
              <section className="featured-section">
                <Link href={`/blog/${featuredPost.slug}`} style={{ textDecoration: "none" }}>
                  <div className="featured-blog-card">
                    <div className="featured-image-wrap">
                      <img src={featuredPost.image} alt={featuredPost.title} />
                    </div>
                    <div className="featured-content">
                      <span className="badge-featured">Featured Post</span>
                      <div className="featured-meta">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={13} /> {featuredPost.date}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={13} /> {featuredPost.readTime}
                        </span>
                      </div>
                      <h2>{featuredPost.title}</h2>
                      <p>{featuredPost.excerpt}</p>
                      <div className="author-meta">
                        <div className="author-avatar">
                          {featuredPost.author.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="author-details">
                          <h4>{featuredPost.author}</h4>
                          <span>{featuredPost.authorRole}</span>
                        </div>
                      </div>
                      <span className="read-more-btn">
                        Read Article <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Main Grid Section */}
            {displayPosts.length > 0 && (
              <section className="grid-section">
                <motion.div className="blog-grid" layout>
                  <AnimatePresence mode="popLayout">
                    {displayPosts.map((post, index) => (
                      <motion.article
                        key={post.slug}
                        className="blog-card"
                        layout
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05,
                          layout: { duration: 0.3 }
                        }}
                      >
                        <div className="card-image-wrap">
                          <img src={post.image} alt={post.title} />
                          <span className="card-tag">{post.category}</span>
                        </div>
                        <div className="card-body">
                          <div className="card-meta">
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={13} /> {post.date}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock size={13} /> {post.readTime}
                            </span>
                          </div>
                          <h3>{post.title}</h3>
                          <p>{post.excerpt}</p>

                          <div className="card-footer">
                            <div className="card-author">
                              <div className="card-author-avatar">
                                {post.author.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <span className="card-author-name">{post.author}</span>
                            </div>
                            <Link href={`/blog/${post.slug}`} className="card-link">
                              Read <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            )}

            {gridPosts.length === 0 && (
              <div className="no-results">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" style={{ display: "block" }} />
                <h3>No Articles Found</h3>
                <p>We couldn't find any articles matching your search query. Try another keyword or filter!</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
