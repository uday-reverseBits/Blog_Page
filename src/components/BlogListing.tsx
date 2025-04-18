import { FC, useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchBlogs, fetchCategories, searchBlogs, resetBlogState, fetchBlogsByTags } from '../store/blogSlice';
import Card from './card';
import Tags from './Tags';

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  createdAt: string;
  publishedAt: string;
  updatedAt?: string;
  slug: string;
  blog_author: {
    id: number;
    documentId: string;
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
    slug: string;
  };
  categories: Array<{
    id: number;
    documentId: string;
    title: string;
    order: number;
  }>;
  cover_image: {
    id?: number;
    documentId?: string;
    url?: string | null;
  };
  content?: string;
}

const BlogListing: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, categories, status, error } = useSelector((state: RootState) => state.blogs);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePosts, setVisiblePosts] = useState(6);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(resetBlogState());
    dispatch(fetchCategories());
    dispatch(fetchBlogs());

    return () => {
      dispatch(resetBlogState());
    };
  }, [dispatch]);

  const handleCategorySelect = (category: string) => {
    if (category === '') {
      // Clear all selections and fetch all blogs
      setSelectedCategories([]);
      dispatch(fetchBlogs());
      return;
    }

    setSelectedCategories(prev => {
      const newSelectedCategories = prev.includes(category)
        ? prev.filter(c => c !== category) // Remove if already selected
        : [...prev, category];             // Add if not selected

      // After updating the state, fetch blogs with the new tags
      if (newSelectedCategories.length > 0) {
        dispatch(fetchBlogsByTags(newSelectedCategories));
      } else {
        dispatch(fetchBlogs()); // If no tags selected, fetch all blogs
      }

      return newSelectedCategories;
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      dispatch(searchBlogs(searchQuery.trim()))
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      // If search query is empty, fetch all blogs
      dispatch(fetchBlogs());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    dispatch(fetchBlogs());
  };

  const displayedPosts = useMemo(() => {
    return posts || [];
  }, [posts]);

  const hasMorePosts = displayedPosts.length > visiblePosts;

  const loadMore = () => {
    setVisiblePosts(prev => prev + 6);
  };

  if (status === 'loading' && !isSearching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Blog Posts</h1>

      {/* Search Bar */}
      <div className="mb-8 max-w-xl mx-auto">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search blogs by title..."
            className="p-2 border border-gray-300 flex-grow focus:outline-none focus:border-red-300"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className={`bg-[#FFE4E6] text-black p-2 px-4 hover:bg-opacity-80 ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="bg-gray-200 text-black p-2 px-4 hover:bg-opacity-80"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search Results Count */}
      {searchQuery && (
        <div className="text-center mb-6">
          <p className="text-gray-600">
            {displayedPosts.length === 0
              ? 'No results found'
              : `Found ${displayedPosts.length} result${displayedPosts.length === 1 ? '' : 's'}`}
          </p>
        </div>
      )}

      {/* Mobile Categories */}
      <div className="lg:hidden mb-8">
        <Tags
          categories={categories}
          selectedCategories={selectedCategories}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Categories */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8">
            <Tags
              categories={categories}
              selectedCategories={selectedCategories}
              onSelectCategory={handleCategorySelect}
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="flex-1">
          {status === 'loading' ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">
                {searchQuery ? 'No match found' : 'No posts available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.slice(0, visiblePosts).map((post: BlogPost) => {
                console.log('Blog post slug:', post.slug);

                const avatarUrl = post.blog_author?.avatar?.url
                  ? `http://192.168.1.6:1337${post.blog_author.avatar.url}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.blog_author.name)}&background=FFE4E6&color=000`;

                const coverUrl = post.cover_image?.url
                  ? `http://192.168.1.6:1337${post.cover_image.url}`
                  : `https://placehold.co/600x400/FFE4E6/000000/png?text=${encodeURIComponent(post.title)}`;

                return (
                  <Card
                    key={post.id}
                    author={{
                      name: post.blog_author.name,
                      image: avatarUrl
                    }}
                    date={new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    title={post.title.replace(/^#\s+/, '')}
                    description=""
                    image={coverUrl}
                    categories={post.categories.map(cat => cat.title)}
                    slug={post.slug}
                    authorSlug={post.blog_author.slug}
                    blogData={post}
                    isFromBlogDetail={false}
                  />
                );
              })}
            </div>
          )}

          {hasMorePosts && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-[#FFE4E6] text-black hover:bg-opacity-80 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogListing; 