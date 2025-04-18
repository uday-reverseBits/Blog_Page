import { FC, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchBlogsByAuthorSlug } from '../store/blogSlice';
import Card from './card';

interface Author {
    id: number;
    name: string;
    avatar: {
        id?: number;
        documentId?: string;
        url?: string | null
    };
    linkedin_url?: string | null;
    medium_url?: string | null;
    dev_to_url?: string | null;
    author_intro?: string | null;
    slug?: string;
}

interface SocialLink {
    url: string;
    icon: JSX.Element;
    label: string;
}

const AuthorPage: FC = () => {
    const { authorSlug } = useParams<{ authorSlug: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { authorPosts, status, error } = useSelector((state: RootState) => state.blogs);
    const [author, setAuthor] = useState<Author | null>(null);
    const [attemptedLoad, setAttemptedLoad] = useState(false);

    useEffect(() => {
        if (authorSlug) {
            dispatch(fetchBlogsByAuthorSlug(authorSlug))
                .unwrap()
                .then((posts) => {
                    if (posts && posts.length > 0 && posts[0].blog_author) {
                        setAuthor(posts[0].blog_author);
                    }
                    setAttemptedLoad(true);
                })
                .catch(err => {
                    console.error("Error fetching author posts:", err);
                    setAttemptedLoad(true);
                });
        }
    }, [authorSlug, dispatch]);

    const getSocialLinks = (): SocialLink[] => {
        const links: SocialLink[] = [];

        if (author?.linkedin_url) {
            links.push({
                url: author.linkedin_url,
                icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                    </svg>
                ),
                label: "LinkedIn"
            });
        }

        if (author?.medium_url) {
            links.push({
                url: author.medium_url,
                icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                    </svg>
                ),
                label: "Medium"
            });
        }

        if (author?.dev_to_url) {
            links.push({
                url: author.dev_to_url,
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

    // Redirect after a short delay if author is still not found after loading attempt
    useEffect(() => {
        let timer: number;
        if (attemptedLoad && !author && status !== 'loading') {
            timer = window.setTimeout(() => {
                navigate('/');
            }, 5000);
        }
        return () => {
            if (timer) window.clearTimeout(timer);
        };
    }, [attemptedLoad, author, status, navigate]);

    if (status === 'loading' && !attemptedLoad) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <Link to="/" className="bg-[#FFE4E6] text-black px-4 py-2 hover:bg-opacity-80 transition-colors">
                    Back to Blog
                </Link>
            </div>
        );
    }

    if (!author && attemptedLoad) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-gray-500 mb-6">Author not found. Redirecting to homepage in 5 seconds...</div>
                <Link to="/" className="bg-[#FFE4E6] text-black px-4 py-2 hover:bg-opacity-80 transition-colors">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                {author && (
                    <>
                        {/* Author Profile */}
                        <div className="flex flex-col items-center mb-16 text-center">
                            <img
                                src={`http://192.168.1.6:1337${author.avatar.url}`}
                                alt={author.name}
                                className="w-32 h-32 rounded-full object-cover mb-6"
                            />
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{author.name}</h1>

                            {/* Social Links */}
                            <div className="flex justify-center space-x-4 mb-6">
                                {getSocialLinks().map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 hover:text-red-500 transition-colors"
                                        title={link.label}
                                    >
                                        {link.icon}
                                    </a>
                                ))}
                            </div>

                            {/* Author Description */}
                            {author.author_intro && (
                                <div className="max-w-2xl mx-auto mb-8 text-gray-600">
                                    <p className="text-lg leading-relaxed">{author.author_intro}</p>
                                </div>
                            )}

                            <div className="flex space-x-4">
                                <Link to="/" className="bg-gray-200 text-black px-4 py-2 hover:bg-gray-300 transition-colors">
                                    Back to Blog
                                </Link>
                            </div>
                        </div>

                        {/* Author's Posts */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts by {author.name}</h2>

                            {authorPosts.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 text-lg">No posts found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {authorPosts.map((post) => (
                                        <Card
                                            key={post.id}
                                            author={{
                                                name: author.name,
                                                image: author.avatar?.url ? `http://192.168.1.6:1337${author.avatar.url}` : '/default-avatar.png'
                                            }}
                                            date={new Date(post.publishedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                            title={post.title.replace(/^#\s+/, '')}
                                            description=""
                                            image={post.cover_image?.url ? `http://192.168.1.6:1337${post.cover_image.url}` : '/default-cover.jpg'}
                                            categories={post.categories.map(cat => cat.title)}
                                            slug={post.slug}
                                            authorId={author.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthorPage; 