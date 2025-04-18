import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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

interface BlogState {
    posts: BlogPost[];
    categories: Array<{
        id: number;
        documentId: string;
        title: string;
        order: number;
    }>;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    currentPost: BlogPost | null;
    authorPosts: BlogPost[];
    searchResults: BlogPost[];
}

const initialState: BlogState = {
    posts: [],
    categories: [],
    status: 'idle',
    error: null,
    currentPost: null,
    authorPosts: [],
    searchResults: []
};

export const fetchBlogs = createAsyncThunk(
    'blogs/fetchBlogs',
    async () => {
        const response = await axios.get('http://192.168.1.6:1337/api/blogs');
        return response.data.data || response.data;
    }
);

export const fetchCategories = createAsyncThunk(
    'blogs/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('http://192.168.1.6:1337/api/blog-categories');
            return response.data.data || response.data;
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue('Failed to fetch categories. Please try again.');
            }
        }
    }
);

export const fetchBlogBySlug = createAsyncThunk(
    'blogs/fetchBlogBySlug',
    async (slug: string, { rejectWithValue }) => {
        try {
            // First try with the /slug/ endpoint format
            try {
                const response = await axios.get(`http://192.168.1.6:1337/api/blogs/slug/${slug}`);
                const data = response.data.data || response.data;
                if (data) {
                    if (data.attributes) {
                        const normalizedData = {
                            ...data.attributes,
                            id: data.id,
                            blog_author: {
                                ...data.attributes.blog_author,
                                slug: data.attributes.blog_author.slug || data.attributes.blog_author.name.toLowerCase().replace(/[^\w]+/g, '-')
                            }
                        };
                        return normalizedData;
                    }
                    return data;
                }
            } catch (innerError) {
                console.log('First endpoint format failed, trying alternative format');
            }

            // If first attempt fails, try direct slug lookup (without /slug/ in path)
            const response = await axios.get(`http://192.168.1.6:1337/api/blogs/${slug}`);
            const data = response.data.data || response.data;

            if (!data) {
                return rejectWithValue('Blog post not found');
            }

            // Normalize the response structure
            if (data.attributes) {
                const normalizedData = {
                    ...data.attributes,
                    id: data.id,
                    blog_author: {
                        ...data.attributes.blog_author,
                        slug: data.attributes.blog_author.slug || data.attributes.blog_author.name.toLowerCase().replace(/[^\w]+/g, '-')
                    }
                };
                return normalizedData;
            }
            return data;
        } catch (error: any) {
            console.error('Error fetching blog by slug:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                if (error.response.data.message) {
                    return rejectWithValue(error.response.data.message);
                }
            }
            return rejectWithValue('Failed to fetch blog post');
        }
    }
);

export const fetchBlogsByCategory = createAsyncThunk(
    'blogs/fetchBlogsByCategory',
    async (categoryId: number) => {
        const response = await axios.get(`http://192.168.1.6:1337/api/blogs/category/${categoryId}`);
        return response.data.data || response.data;
    }
);

export const fetchBlogsByAuthor = createAsyncThunk(
    'blogs/fetchBlogsByAuthor',
    async (authorId: number, { rejectWithValue }) => {
        try {
            const response = await axios.get(`http://192.168.1.6:1337/api/blogs/author/${authorId}`);
            const data = response.data.data || response.data;

            if (Array.isArray(data) && data.length > 0) {
                return data;
            } else {
                return rejectWithValue('No posts found for this author');
            }
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue('Failed to fetch author posts. Please try again.');
            }
        }
    }
);

export const searchBlogs = createAsyncThunk(
    'blogs/searchBlogs',
    async (query: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`http://192.168.1.6:1337/api/blogs?title=${encodeURIComponent(query)}`);
            return response.data.data || response.data;
        } catch (error: any) {
            return rejectWithValue('Failed to search blogs');
        }
    }
);

export const fetchBlogsByTags = createAsyncThunk(
    'blogs/fetchBlogsByTags',
    async (tags: string[], { rejectWithValue }) => {
        try {
            const tagsQuery = tags.length > 0 ? `?tags=${tags.join(',')}` : '';
            const response = await axios.get(`http://192.168.1.6:1337/api/blogs${tagsQuery}`);
            return response.data.data || response.data;
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue('Failed to fetch blogs by tags');
        }
    }
);

export const fetchBlogsByAuthorSlug = createAsyncThunk(
    'blogs/fetchBlogsByAuthorSlug',
    async (authorSlug: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`http://192.168.1.6:1337/api/blogs?filters[blog_author][slug][$eq]=${authorSlug}`);
            const data = response.data.data || response.data;

            if (Array.isArray(data) && data.length > 0) {
                return data;
            } else {
                return rejectWithValue('No posts found for this author');
            }
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue('Failed to fetch author posts. Please try again.');
            }
        }
    }
);

const blogSlice = createSlice({
    name: 'blogs',
    initialState,
    reducers: {
        resetBlogState: (state) => {
            state.currentPost = null;
            state.status = 'idle';
            state.error = null;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBlogs.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload;
                state.error = null;
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch blogs';
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload.map((category: any) => {
                    if (category.attributes) {
                        return {
                            ...category.attributes,
                            id: category.id
                        };
                    }
                    return category;
                });
            })
            .addCase(fetchBlogBySlug.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (action.payload) {
                    state.currentPost = {
                        ...action.payload,
                        blog_author: {
                            ...action.payload.blog_author,
                            slug: action.payload.blog_author.slug || action.payload.blog_author.name.toLowerCase().replace(/[^\w]+/g, '-')
                        }
                    };
                }
                state.error = null;
            })
            .addCase(fetchBlogBySlug.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch blog';
                state.currentPost = null;
            })
            .addCase(fetchBlogsByCategory.fulfilled, (state, action) => {
                state.posts = action.payload.map((post: any) => {
                    if (post.attributes) {
                        return {
                            ...post.attributes,
                            id: post.id
                        };
                    }
                    return post;
                });
            })
            .addCase(fetchBlogsByAuthor.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.authorPosts = action.payload.map((post: any) => {
                    if (post.attributes) {
                        const blogAuthor = post.attributes.blog_author || {};
                        return {
                            ...post.attributes,
                            id: post.id,
                            blog_author: {
                                ...blogAuthor,
                                avtar: blogAuthor.avtar
                            }
                        };
                    }
                    return post;
                });
            })
            .addCase(searchBlogs.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(searchBlogs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload;
                state.error = null;
            })
            .addCase(searchBlogs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to search blogs';
                state.posts = [];
            })
            .addCase(fetchBlogsByTags.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchBlogsByTags.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload;
                state.error = null;
            })
            .addCase(fetchBlogsByTags.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch blogs by tags';
            })
            .addCase(fetchBlogsByAuthorSlug.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchBlogsByAuthorSlug.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.authorPosts = action.payload;
                state.error = null;
            })
            .addCase(fetchBlogsByAuthorSlug.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch author posts';
                state.authorPosts = [];
            });
    }
});

export const { resetBlogState, clearSearchResults } = blogSlice.actions;
export default blogSlice.reducer; 