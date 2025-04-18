import { FC, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchBlogBySlug, resetBlogState } from '../store/blogSlice';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';
import TableOfContents from './TableOfContents';

const TagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="-ms-1 me-1.5 size-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6h.008v.008H6V6z"
    />
  </svg>
);

interface Heading {
  id: string;
  title: string;
  level: number;
}

interface SocialLink {
  url: string;
  icon: JSX.Element;
  label: string;
}

const CodeBlock: FC<{ language: string; value: string }> = ({ language, value }) => {
  return (
    <Highlight
      theme={themes.nightOwl}
      code={value}
      language={language || 'typescript'}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className="rounded-lg p-4 my-4 overflow-x-auto" style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="text-gray-500 mr-4 text-sm select-none">{i + 1}</span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

const BlogDetail: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentPost: post, status, error } = useSelector((state: RootState) => state.blogs);
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    // Reset blog state to ensure clean state between navigations
    dispatch(resetBlogState());

    if (slug) {
      console.log('Fetching blog for slug:', slug);
      // Fetch the blog post using the slug from URL
      dispatch(fetchBlogBySlug(slug))
        .unwrap()
        .then(data => {
          console.log('Successfully fetched blog data:', data);
        })
        .catch(err => {
          console.error('Error fetching blog data:', err);
        });
    }

    // Cleanup on unmount
    return () => {
      dispatch(resetBlogState());
    };
  }, [slug, dispatch]);

  useEffect(() => {
    if (post?.content) {
      // Extract headings from content
      const extractedHeadings: Heading[] = [];
      const lines = post.content.split('\n');
      lines.forEach((line) => {
        // Updated regex to handle optional whitespace before the heading markers
        const match = line.trim().match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const title = match[2].trim();
          const id = title.toLowerCase().replace(/[^\w]+/g, '-');
          extractedHeadings.push({ id, title, level });
        }
      });
      setHeadings(extractedHeadings);
    }
  }, [post?.content]);

  const getSocialLinks = (): SocialLink[] => {
    if (!post?.blog_author) return [];

    const links: SocialLink[] = [];

    if (post.blog_author.linkedin_url) {
      links.push({
        url: post.blog_author.linkedin_url,
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
        ),
        label: "LinkedIn"
      });
    }

    if (post.blog_author.medium_url) {
      links.push({
        url: post.blog_author.medium_url,
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
          </svg>
        ),
        label: "Medium"
      });
    }

    if (post.blog_author.dev_to_url) {
      links.push({
        url: post.blog_author.dev_to_url,
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.826 10.083a.784.784 0 00-.468-.175h-.701v4.198h.701a.786.786 0 00.469-.175c.155-.117.233-.292.233-.525v-2.798c.001-.233-.079-.408-.234-.525zM19.236 3H4.764C3.791 3 3.002 3.787 3 4.76v14.48c.002.973.791 1.76 1.764 1.76h14.473c.973 0 1.762-.787 1.764-1.76V4.76A1.765 1.765 0 0019.236 3zM9.195 13.414c0 .755-.466 1.901-1.942 1.898H5.389V8.665h1.903c1.424 0 1.902 1.144 1.903 1.899v2.85zm4.045-3.562H11.1v1.544h1.309v1.188H11.1v1.543h2.142v1.188h-2.498a.813.813 0 01-.833-.792V9.497a.813.813 0 01.792-.832h2.539l-.002 1.187zm4.165 4.632c-.531 1.235-1.481.99-1.906 0l-1.548-5.818h1.309l1.193 4.569 1.188-4.569h1.31l-1.546 5.818z" />
          </svg>
        ),
        label: "DEV.to"
      });
    }

    return links;
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <p className="text-gray-700 mb-6">There was an error loading this blog post.</p>
        <Link to="/" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Return to Blog Listing
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-700 text-xl mb-4">Blog post not found</div>
        <p className="text-gray-600 mb-6">The blog post you're looking for could not be found.</p>
        <Link to="/" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Return to Blog Listing
        </Link>
      </div>
    );
  }

  // Ensure we have all required data before rendering
  if (post && (!post.title || !post.blog_author)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">Invalid Blog Data</div>
        <p className="text-gray-700 mb-6">The blog post data is incomplete or corrupted.</p>
        <Link to="/" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Return to Blog Listing
        </Link>
      </div>
    );
  }

  const components: Components = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <CodeBlock
          language={match[1]}
          value={String(children).replace(/\n$/, '')}
          {...props}
        />
      ) : (
        <code className="bg-gray-100 px-1 py-0.5 rounded" {...props}>
          {children}
        </code>
      );
    },
    img: ({ src, alt, ...props }) => (
      <div className="my-6">
        <img
          src={src?.startsWith('http') ? src : `http://192.168.1.6:1337${src}`}
          alt={alt || ""}
          className="rounded-lg max-w-full h-auto mx-auto"
          {...props}
        />
      </div>
    ),
    h1: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
      return (
        <h1 id={id} className="text-4xl font-bold mb-6 mt-10">
          {children}
        </h1>
      );
    },
    h2: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
      return (
        <h2 id={id} className="text-3xl font-bold mb-4 mt-8">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
      return (
        <h3 id={id} className="text-2xl font-bold mb-3 mt-6">
          {children}
        </h3>
      );
    },
    p: ({ children }) => (
      <p className="mb-4 leading-relaxed whitespace-pre-wrap">{children}</p>
    ),
    pre: ({ children }) => (
      <pre className="whitespace-pre-wrap overflow-x-auto">{children}</pre>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#FF4D62] pl-4 italic my-6 text-gray-700">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-8 border-gray-200" />,
    a: ({ href, children }) => (
      <a href={href} className="text-red-500 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),
  };

  const socialLinks = getSocialLinks();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
        {/* Table of Contents - Desktop */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <TableOfContents headings={headings} />
          </div>
        </div>

        <article className="relative">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title.replace(/^#\s+/, '')}
            </h1>
            {/* Author and Date */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center">
                <Link to={`/author/${post.blog_author.slug}`}>
                  {post?.blog_author?.avatar?.url ? (
                    <img
                      src={`http://192.168.1.6:1337${post.blog_author.avatar.url}`}
                      alt={post.blog_author.name}
                      className="w-12 h-12 rounded-full mr-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parentElement = target.parentElement;
                        if (parentElement) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3';
                          placeholder.textContent = post.blog_author.name.charAt(0).toUpperCase();
                          parentElement.insertBefore(placeholder, target);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3">
                      {post.blog_author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div>
                  <Link to={`/author/${post.blog_author.slug}`} className="text-gray-800 font-medium block hover:text-red-500">
                    {post.blog_author.name}
                  </Link>
                  <div className="text-gray-500 text-sm">
                    {post.updatedAt ? (
                      <>Updated: {new Date(post.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</>
                    ) : (
                      <>Published: {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex justify-center gap-2 mb-8">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center justify-center px-3 py-1 bg-[#FFE4E6] text-black"
                >
                  <TagIcon />
                  <p className="text-sm whitespace-nowrap capitalize">
                    {category.title}
                  </p>
                </span>
              ))}
            </div>
          </header>

          {/* Table of Contents - Mobile */}
          <div className="lg:hidden mb-8">
            <TableOfContents headings={headings} />
          </div>

          {/* Featured Image */}
          <div className="rounded-xl overflow-hidden mb-12">
            <img
              src={post.cover_image?.url ? `http://192.168.1.6:1337${post.cover_image.url}` : ''}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {post.content || ''}
            </ReactMarkdown>
          </div>

          {/* Social Share and Author Links */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-500">Tags:</span>
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  #{category.title}
                </span>
              ))}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title={link.label}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail; 