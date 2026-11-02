"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Link2,
  Check,
  ArrowRight
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import Footer from "../../components/Footer";
import { blogPosts, BlogPost } from "../data";
import { createClient } from "@/lib/db/client";
import "../blog.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  // In Next.js 15+/16, params is a Promise. We resolve it using React's use() hook.
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPostDetail() {
      try {
        const supabase = createClient();
        
        // 1. Fetch current post
        const { data: dbPost, error: postError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (postError || !dbPost) {
          console.warn("Post not found in database, trying static fallback:", postError);
          // Try static fallback
          const staticPost = blogPosts.find((p) => p.slug === slug);
          if (staticPost) {
            setPost(staticPost);
            // Get related posts from static data
            const staticRelated = blogPosts
              .filter((p) => p.slug !== staticPost.slug)
              .slice(0, 2);
            setRelatedPosts(staticRelated);
          } else {
            setPost(null);
          }
          return;
        }

        // Map database fields to BlogPost structure
        const mappedPost: BlogPost = {
          slug: dbPost.slug,
          title: dbPost.title,
          category: dbPost.category,
          date: dbPost.date,
          readTime: dbPost.read_time,
          author: dbPost.author,
          authorRole: dbPost.author_role,
          image: dbPost.image_url || "/images/waffle-main.png",
          excerpt: dbPost.excerpt,
          content: dbPost.content,
        };
        setPost(mappedPost);

        // 2. Fetch related posts (same category first, excluding current slug, limit to 2)
        const { data: dbRelated, error: relatedError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("is_published", true)
          .eq("category", mappedPost.category)
          .neq("slug", slug)
          .limit(2);

        let relatedList = dbRelated || [];

        // If not enough related posts in the same category, fetch other posts
        if (relatedList.length < 2) {
          const { data: dbBackups } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("is_published", true)
            .neq("slug", slug)
            .neq("category", mappedPost.category)
            .limit(2 - relatedList.length);
          if (dbBackups) {
            relatedList = [...relatedList, ...dbBackups];
          }
        }

        if (relatedList.length > 0) {
          const mappedRelated = relatedList.map((item) => ({
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
          setRelatedPosts(mappedRelated);
        } else {
          // fallback to static related
          const staticRelated = blogPosts
            .filter((p) => p.slug !== mappedPost.slug)
            .slice(0, 2);
          setRelatedPosts(staticRelated);
        }
      } catch (err) {
        console.error("Error in fetchPostDetail:", err);
        // Catch-all static fallback
        const staticPost = blogPosts.find((p) => p.slug === slug);
        if (staticPost) {
          setPost(staticPost);
          const staticRelated = blogPosts
            .filter((p) => p.slug !== staticPost.slug)
            .slice(0, 2);
          setRelatedPosts(staticRelated);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPostDetail();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = post ? post.title : "Read this amazing blog post!";

  // Handle case where loading
  if (loading) {
    return (
      <main className="blog-detail-page">
        <div className="blog-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
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
        <Footer />
      </main>
    );
  }

  // Handle case where post is not found
  if (!post) {
    return (
      <main className="blog-page">
        <div className="blog-container text-center py-20" style={{ textAlign: "center", padding: "80px 0" }}>
          <h2 className="text-2xl font-bold mb-4" style={{ fontSize: "2rem", marginBottom: "16px" }}>Article Not Found</h2>
          <p className="mb-8" style={{ marginBottom: "32px", opacity: 0.8 }}>The royal chronicles do not contain this article.</p>
          <Link href="/blog" className="blog-back-btn">
            <ArrowLeft size={16} /> Return to Blog
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="blog-detail-page">
      <div className="blog-container">
        {/* Back Link */}
        <Link href="/blog" className="blog-back-btn">
          <ArrowLeft size={16} /> Back to Chronicles
        </Link>

        <article className="article-wrapper">
          {/* Header */}
          <header className="article-header">
            <span className="section-pill">{post.category}</span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {post.title}
            </motion.h1>

            <div className="article-header-meta">
              <div className="article-author-card">
                <div className="article-author-avatar">
                  {post.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="article-author-info">
                  <h4>{post.author}</h4>
                  <span>{post.authorRole}</span>
                </div>
              </div>

              <span className="article-meta-item">
                <Calendar size={16} /> {post.date}
              </span>

              <span className="article-meta-item">
                <Clock size={16} /> {post.readTime}
              </span>
            </div>
          </header>

          {/* Banner Image */}
          <motion.div 
            className="article-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img src={post.image} alt={post.title} />
          </motion.div>

          {/* Body Content */}
          <div className="article-body-wrapper">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Footer / Share actions */}
            <footer className="article-footer">
              <div className="article-share-links">
                <span>Share this article:</span>
                <a 
                  className="share-btn" 
                  title="Share on Facebook" 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebookF size={16} />
                </a>
                <a 
                  className="share-btn" 
                  title="Share on X" 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaXTwitter size={16} />
                </a>
                <a 
                  className="share-btn" 
                  title="Share on Instagram" 
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={16} />
                </a>
                <a 
                  className="share-btn" 
                  title="Share on LinkedIn" 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedinIn size={16} />
                </a>
                <button 
                  className="share-btn" 
                  title={copied ? "Copied!" : "Copy Link"} 
                  type="button"
                  onClick={handleCopyLink}
                  style={copied ? { borderColor: "var(--gold)", color: "var(--gold)" } : {}}
                >
                  {copied ? <Check size={16} /> : <Link2 size={16} />}
                </button>
              </div>
            </footer>
          </div>
        </article>

        {/* Read Next Section */}
        {relatedPosts.length > 0 && (
          <section className="related-section">
            <h2>Read Next</h2>
            <div className="blog-grid">
              {relatedPosts.map((rPost) => (
                <article key={rPost.slug} className="blog-card">
                  <div className="card-image-wrap">
                    <img src={rPost.image} alt={rPost.title} />
                    <span className="card-tag">{rPost.category}</span>
                  </div>
                  <div className="card-body">
                    <div className="card-meta">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={13} /> {rPost.date}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} /> {rPost.readTime}
                      </span>
                    </div>
                    <h3>{rPost.title}</h3>
                    <p>{rPost.excerpt}</p>
                    <div className="card-footer">
                      <div className="card-author">
                        <div className="card-author-avatar">
                          {rPost.author.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="card-author-name">{rPost.author}</span>
                      </div>
                      <Link href={`/blog/${rPost.slug}`} className="card-link">
                        Read <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  );
}
