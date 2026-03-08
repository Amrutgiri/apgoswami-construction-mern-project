import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import HeroSection from '../common/HeroSection';
import BlogImage1 from '../../assets/images/construction9.jpg';
import BlogImage2 from '../../assets/images/pexels-pixabay-220453.jpg';
import BlogImage3 from '../../assets/images/construction6.jpg';
import BlogImage4 from '../../assets/images/construction10.jpg';
import BlogImage5 from '../../assets/images/construction3.jpg';
import BlogImage6 from '../../assets/images/construction8.jpg';

const fallbackImages = [BlogImage1, BlogImage2, BlogImage3, BlogImage4, BlogImage5, BlogImage6];

const defaultBlogs = [
  {
    title: 'How Smart Planning Reduces Construction Delays And Cost Overruns',
    slug: 'how-smart-planning-reduces-construction-delays-and-cost-overruns',
    excerpt:
      'A strong planning phase aligns timeline, manpower, and procurement. This article explains practical techniques to avoid common execution bottlenecks.',
    imageUrl: BlogImage1,
    category: 'Project Management',
    publishDate: '2026-02-18',
    readMinutes: 8,
    isFeatured: true,
    tags: ['Planning', 'Execution', 'Quality'],
    updatedAt: '',
  },
  {
    title: '5 Modern Materials That Improve Building Durability',
    slug: '5-modern-materials-that-improve-building-durability',
    excerpt:
      'Explore high-performance materials that increase structure life and reduce long-term maintenance costs.',
    imageUrl: BlogImage2,
    category: 'Materials',
    publishDate: '2026-02-10',
    readMinutes: 6,
    isFeatured: false,
    tags: ['Materials'],
    updatedAt: '',
  },
];

const withVersion = (url, version) => {
  if (!url || !version) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const Blog = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [blogs, setBlogs] = useState(defaultBlogs);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blogs/public`);
        const result = await response.json();
        if (response.ok && result?.success && Array.isArray(result.data) && result.data.length > 0) {
          setBlogs(result.data);
        }
      } catch {
        // Keep default blogs if API is unavailable.
      }
    };

    fetchBlogs();
  }, [API_BASE_URL]);

  const featuredPost = useMemo(
    () => blogs.find((item) => item.isFeatured) || blogs[0],
    [blogs],
  );

  const blogPosts = useMemo(
    () => blogs.filter((item) => item.slug !== featuredPost?.slug),
    [blogs, featuredPost],
  );

  const categories = useMemo(() => {
    const values = Array.from(new Set(blogs.map((item) => item.category).filter(Boolean)));
    return ['All', ...values];
  }, [blogs]);

  const visiblePosts = useMemo(() => {
    if (activeCategory === 'All') {
      return blogPosts;
    }
    return blogPosts.filter((item) => item.category === activeCategory);
  }, [blogPosts, activeCategory]);

  return (
    <>
      <Header />
      <main className="blog-page">
        <HeroSection preHeading="Latest Updates" heading="Our Blog" text="Insights, news, and updates from our construction world." />

        {featuredPost && (
          <section className="blog-featured">
            <div className="container py-5">
              <article className="featured-post">
                <div className="row g-0">
                  <div className="col-lg-6">
                    <div className="featured-image-wrap">
                      <img
                        src={withVersion(featuredPost.imageUrl || fallbackImages[0], featuredPost.updatedAt)}
                        alt={featuredPost.title}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="featured-content">
                      <div className="featured-meta">
                        <span>{featuredPost.category}</span>
                        <span>{formatDate(featuredPost.publishDate)}</span>
                        <span>{featuredPost.readMinutes || 6} min read</span>
                      </div>
                      <h2>{featuredPost.title}</h2>
                      <p>{featuredPost.excerpt}</p>
                      <Link to={`/blogs/${featuredPost.slug}`} className="btn btn-primary">
                        Read Full Article
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>
        )}

        <section className="blog-listing">
          <div className="container pb-5">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="row g-4">
                  {visiblePosts.map((post, index) => (
                    <div className="col-12 col-md-6" key={post.slug || `${post.title}-${index}`}>
                      <article className="blog-list-card">
                        <div className="blog-list-image">
                          <img
                            src={withVersion(post.imageUrl || fallbackImages[index % fallbackImages.length], post.updatedAt)}
                            alt={post.title}
                          />
                        </div>
                        <div className="blog-list-content">
                          <div className="blog-list-meta">
                            <span>{post.category}</span>
                            <span>{formatDate(post.publishDate)}</span>
                          </div>
                          <h4>{post.title}</h4>
                          <p>{post.excerpt}</p>
                          <Link to={`/blogs/${post.slug}`} className="blog-read-link">
                            Continue Reading
                          </Link>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-lg-4">
                <aside className="blog-sidebar">
                  <div className="sidebar-card">
                    <h4>Categories</h4>
                    <ul>
                      {categories.map((item) => (
                        <li key={item}>
                          <button type="button" className="blog-category-button" onClick={() => setActiveCategory(item)}>
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="sidebar-card">
                    <h4>Subscribe</h4>
                    <p>Get practical construction insights directly in your inbox.</p>
                    <form className="sidebar-newsletter">
                      <input type="email" className="form-control" placeholder="Enter your email" />
                      <button type="button" className="btn btn-secondary w-100 mt-2">
                        Subscribe
                      </button>
                    </form>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Blog;
