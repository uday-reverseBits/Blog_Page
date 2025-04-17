import { FC } from 'react';

interface Category {
    id: number;
    documentId: string;
    title: string;
    order: number;
}

interface TagsProps {
    categories: Category[];
    selectedCategories: string[];
    onSelectCategory: (category: string) => void;
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

const Tags: FC<TagsProps> = ({ categories, selectedCategories, onSelectCategory }) => {
    const handleTagClick = (category: string) => {
        onSelectCategory(category);
    };

    return (
        <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleTagClick('')}
                    className={`inline-flex items-center justify-center px-3 py-2 transition-colors ${selectedCategories.length === 0
                        ? 'bg-[#FFE4E6] text-black'
                        : 'border border-[#FFE4E6] text-black hover:bg-[#FFE4E6]'
                        }`}
                >
                    <TagIcon />
                    <p className="text-sm whitespace-nowrap">All Posts</p>
                </button>

                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => handleTagClick(category.title)}
                        className={`inline-flex items-center justify-center px-3 py-2 transition-colors ${selectedCategories.includes(category.title)
                            ? 'bg-[#FFE4E6]'
                            : 'border border-[#FFE4E6] text-black hover:bg-[#FFE4E6]'
                            }`}
                    >
                        <TagIcon />
                        <p className="text-sm whitespace-nowrap capitalize">{category.title}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Tags;
