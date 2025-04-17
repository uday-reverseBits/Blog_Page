import { FC } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { BlogPost } from './BlogListing';

interface Author {
    name: string;
    image: string;
}

interface CardProps {
    author: Author;
    date: string;
    title: string;
    description: string;
    image: string;
    categories: string[];
    slug: string;
    authorId?: number;
    blogData?: BlogPost;
}

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

const Card: FC<CardProps> = ({ author, date, title, description, image, categories, slug, authorId, blogData }) => {
    const content = (
        <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105 h-full flex flex-col">
            <div className="relative h-48 w-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="text-gray-500 text-lg font-medium">No Image Available</div>
                )}
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                    <Link to={authorId ? `/author/${authorId}` : '#'} className="block">
                        {author.image ? (
                            <img
                                src={author.image}
                                alt={author.name}
                                className="w-10 h-10 rounded-full object-cover bg-gray-200"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parentElement = target.parentElement;
                                    if (parentElement) {
                                        const placeholder = document.createElement('div');
                                        placeholder.className = 'w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600';
                                        placeholder.textContent = author.name.charAt(0).toUpperCase();
                                        parentElement.appendChild(placeholder);
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                {author.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Link>
                    <div className="flex items-center space-x-2">
                        <Link to={authorId ? `/author/${authorId}` : '#'} className="text-gray-700 hover:text-red-500">
                            {author.name}
                        </Link>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{date}</span>
                    </div>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center justify-center px-3 py-1 text-black bg-[#FFE4E6]"
                        >
                            <TagIcon />
                            <p className="text-sm whitespace-nowrap capitalize">{category}</p>
                        </span>
                    ))}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-gray-700 transition-colors duration-200 line-clamp-2 h-14">
                    <ReactMarkdown
                        components={{
                            p: ({ children }) => <>{children}</>,
                            h1: ({ children }) => <>{children}</>,
                            h2: ({ children }) => <>{children}</>,
                            h3: ({ children }) => <>{children}</>,
                            strong: ({ children }) => <span className="font-bold">{children}</span>,
                            em: ({ children }) => <span className="italic">{children}</span>,
                            code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded">{children}</code>,
                        }}
                    >
                        {title}
                    </ReactMarkdown>
                </h3>
                {description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mt-auto">{description}</p>
                )}
            </div>
        </div>
    );

    return slug ? (
        <Link to={`/blog/${encodeURIComponent(slug)}`} className="block h-full">
            {content}
        </Link>
    ) : (
        content
    );
};

export default Card;
