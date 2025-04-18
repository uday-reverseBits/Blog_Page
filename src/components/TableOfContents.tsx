import { FC, useEffect, useState, useRef } from 'react';
import { Link } from 'react-scroll';

interface TableOfContentsProps {
    headings: Array<{
        id: string;
        title: string;
        level: number;
    }>;
}

const TableOfContents: FC<TableOfContentsProps> = ({ headings }) => {
    const [activeId, setActiveId] = useState<string>('');
    const observerRef = useRef<IntersectionObserver | null>(null);
    const headingElementsRef = useRef<{ [key: string]: IntersectionObserverEntry }>({});

    // Filter to only show h2 headings (level 2)
    const h2Headings = headings.filter(heading => heading.level === 2);

    useEffect(() => {
        // Clean up old observers
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        if (h2Headings.length === 0) return;

        // Set up intersection observer for each heading
        const callback: IntersectionObserverCallback = (entries) => {
            // Store all entries
            entries.forEach(entry => {
                headingElementsRef.current[entry.target.id] = entry;
            });

            // Get all headings that are currently visible
            const visibleHeadings = Object.values(headingElementsRef.current)
                .filter(entry => entry.isIntersecting);

            if (visibleHeadings.length > 0) {
                // Sort by their position on the page (top to bottom)
                const sortedVisibleHeadings = visibleHeadings.sort(
                    (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
                );

                // Get the ID of the first visible heading
                const firstVisibleHeadingId = sortedVisibleHeadings[0].target.id;

                if (firstVisibleHeadingId && firstVisibleHeadingId !== activeId) {
                    setActiveId(firstVisibleHeadingId);
                }
            } else if (h2Headings.length > 0 && !activeId) {
                // If no headings are visible but we have headings, use the first one
                setActiveId(h2Headings[0].id);
            }
        };

        // Configure the observer with more sensitive threshold values
        const options: IntersectionObserverInit = {
            rootMargin: '-20px 0px -70% 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };

        // Create and store the observer
        observerRef.current = new IntersectionObserver(callback, options);

        // Add padding to headings and observe them
        h2Headings.forEach(heading => {
            const element = document.getElementById(heading.id);
            if (element) {
                // Add padding to improve detection
                element.style.scrollMarginTop = '100px';
                element.style.paddingTop = '20px';

                // Observe the heading
                observerRef.current?.observe(element);
            }
        });

        // Set initial active heading
        if (h2Headings.length > 0 && !activeId) {
            setActiveId(h2Headings[0].id);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [h2Headings]);

    if (h2Headings.length === 0) {
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4 bg-black text-white p-4">Table of contents</h2>
            <nav
                className="max-h-[calc(100vh-200px)] overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-2 
                [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
                <ul className="space-y-1">
                    {h2Headings.map((heading) => (
                        <li key={heading.id} className="relative">
                            <Link
                                to={heading.id}
                                spy={true}
                                smooth={true}
                                offset={-100}
                                duration={300}
                                isDynamic={true}
                                className={`block py-2 pl-4 cursor-pointer transition-colors duration-300 text-gray-600 hover:text-gray-900 relative ${activeId === heading.id ? 'text-red-600 font-bold' : ''}`}
                                activeClass="!text-red-600 font-bold before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-red-600"
                                hashSpy={true}
                                spyThrottle={50}
                            >
                                {heading.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default TableOfContents; 