import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import HeroSection from '../common/HeroSection';
import BlogHeroImage from '../../assets/images/construction10.jpg';

const defaultBlog = {
  title: 'How Smart Planning Reduces Construction Delays',
  slug: 'how-smart-planning-reduces-construction-delays',
  category: 'Project Management',
  publishDate: '2026-02-18',
  readMinutes: 8,
  imageUrl: BlogHeroImage,
  tags: ['Planning', 'Execution', 'Quality Control'],
  content:
    'In construction, delays often begin before the first task starts on site.\n\nA structured planning stage aligns design intent, procurement schedules, labor deployment, and technical sequencing. This helps teams reduce rework and maintain predictable progress.\n\nStrong planning is not paperwork. It is a risk-control system that protects project quality, timeline, and cost.\n\nExecution Priorities We Follow:\n- Define realistic timelines with milestone checkpoints.\n- Freeze drawings and approvals before major execution.\n- Align procurement with phase-wise construction schedule.\n- Track progress through weekly technical reviews.\n\nFinal Takeaway:\nProjects succeed when planning is treated as an engineering process, not an administrative formality.',
  updatedAt: '',
};

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

const buildContentBlocks = (content) => {
  const text = String(content ?? '').trim();
  if (!text) return [];

  const cleanInlineTags = (value) => String(value ?? '').replace(/<[^>]+>/g, '').trim();

  try {
    const parsed = JSON.parse(text);
    if (parsed && Array.isArray(parsed.blocks)) {
      const blocks = parsed.blocks
        .map((block) => {
          if (block?.type === 'header') {
            return { type: 'heading', text: cleanInlineTags(block?.data?.text) };
          }
          if (block?.type === 'list') {
            const items = Array.isArray(block?.data?.items)
              ? block.data.items.map((item) => cleanInlineTags(item)).filter(Boolean)
              : [];
            return { type: 'list', items };
          }
          if (block?.type === 'paragraph') {
            return { type: 'paragraph', text: cleanInlineTags(block?.data?.text) };
          }
          if (block?.type === 'quote') {
            return { type: 'paragraph', text: cleanInlineTags(block?.data?.text) };
          }
          return null;
        })
        .filter(Boolean);

      if (blocks.length > 0) {
        return blocks;
      }
    }
  } catch {
    // Fallback to plain text parser.
  }

  return text.split(/\n\s*\n/).map((block) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.every((line) => line.startsWith('- '))) {
      return { type: 'list', items: lines.map((line) => line.slice(2).trim()) };
    }
    if (lines.length === 1 && lines[0].endsWith(':')) {
      return { type: 'heading', text: lines[0].slice(0, -1) };
    }
    return { type: 'paragraph', text: lines.join(' ') };
  });
};

const BlogDetails = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const { slug } = useParams();
  const [blog, setBlog] = useState(defaultBlog);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (slug) {
          const response = await fetch(`${API_BASE_URL}/api/blogs/public/${slug}`);
          const result = await response.json();
          if (response.ok && result?.success && result?.data) {
            setBlog(result.data);
            return;
          }
        }

        const listResponse = await fetch(`${API_BASE_URL}/api/blogs/public`);
        const listResult = await listResponse.json();
        if (listResponse.ok && listResult?.success && Array.isArray(listResult.data) && listResult.data.length > 0) {
          const first = listResult.data.find((item) => item.isFeatured) || listResult.data[0];
          setBlog(first);
        }
      } catch {
        // Keep fallback blog on API failure.
      }
    };

    fetchBlog();
  }, [API_BASE_URL, slug]);

  const contentBlocks = useMemo(() => buildContentBlocks(blog.content), [blog.content]);

  return (
    <>
      <Header />
      <main className="blog-details-page">
        <HeroSection
          preHeading="Blog Details"
          heading={blog.title}
          text={blog.excerpt || 'Practical execution strategies for better project delivery and quality control.'}
        />

        <section className="blog-details-section">
          <div className="container py-5">
            <article className="blog-article">
              <div className="article-banner">
                <img src={withVersion(blog.imageUrl || BlogHeroImage, blog.updatedAt)} alt={blog.title} />
              </div>

              <div className="article-meta">
                <span>{blog.category}</span>
                <span>{formatDate(blog.publishDate)}</span>
                <span>{blog.readMinutes || 6} min read</span>
              </div>

              <h2>{blog.title}</h2>

              {contentBlocks.map((block, index) => {
                if (block.type === 'heading') {
                  return <h3 key={`heading-${index}`}>{block.text}</h3>;
                }
                if (block.type === 'list') {
                  return (
                    <ul key={`list-${index}`}>
                      {block.items.map((item, itemIndex) => (
                        <li key={`li-${index}-${itemIndex}`}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={`p-${index}`}>{block.text}</p>;
              })}

              <div className="article-footer">
                <div className="article-tags">
                  {(Array.isArray(blog.tags) ? blog.tags : []).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <Link to="/blogs" className="btn btn-primary">
                  Back To Blogs
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BlogDetails;
