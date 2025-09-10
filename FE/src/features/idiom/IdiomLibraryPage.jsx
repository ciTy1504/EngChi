// src/features/idiom/IdiomLibraryPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import { apiService } from '../../api/apiService';
import BackButton from '../../components/shared/BackButton';
import IdiomCard from './IdiomCard';

const TableOfContents = ({ categories, onSelect, activeCategory }) => {
    return (
        <nav className="p-2 bg-white rounded-lg shadow-md h-full overflow-y-auto">
            <ul className="space-y-1">
                {categories.map(cat => (
                    <li key={cat.categoryTitle}>
                        <a
                            href={`#category-${cat.categoryTitle}`} 
                            onClick={(e) => { e.preventDefault(); onSelect(cat.categoryTitle); }}
                            className={`block p-3 rounded-md text-lg font-bold transition-colors ${
                                activeCategory === cat.categoryTitle
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {cat.categoryTitle} 
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

// Component cho danh sách idioms bên phải
const IdiomListViewer = ({ categories, viewerRef }) => {
    return (
        <div ref={viewerRef} className="bg-gray-50 p-6 lg:p-8 h-full overflow-y-auto rounded-lg">
            {categories.length > 0 ? (
                categories.map(cat => (
                    <section key={cat.categoryTitle} id={`category-${cat.categoryTitle}`} className="mb-12"> 
                        <h2 className="text-4xl font-extrabold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
                            {cat.categoryTitle} 
                        </h2>
                        <div className="space-y-4">
                            {(cat.idioms || []).map(idiom => ( 
                                <IdiomCard key={idiom._id} idiom={idiom} />
                            ))}
                        </div>
                    </section>
                ))
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-lg">No idioms found for this language.</p>
                </div>
            )}
        </div>
    );
};

const IdiomLibraryPage = () => {
    const { language } = useContext(LanguageContext);
    const t = useTranslations();
    const [categories, setCategories] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('');
    const viewerRef = useRef(null);

    useEffect(() => {
        const fetchLibrary = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiService(`/idioms?language=${language}`);
                setCategories(response.data); 
                if (response.data && response.data.length > 0) {
                    setActiveCategory(response.data[0].categoryTitle); 
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLibrary();
    }, [language]);

    const handleSelectCategory = (title) => {
        setActiveCategory(title);
        const element = document.getElementById(`category-${title}`);
        if (viewerRef.current && element) {
            const topPos = element.offsetTop - viewerRef.current.offsetTop;
            viewerRef.current.scrollTo({
                top: topPos,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading) return <div className="text-center p-10">{t.loading}</div>;
    if (error) return <div className="text-center p-10 text-red-500">{t.error_prefix}: {error}</div>;

    return (
        <div className="flex flex-col h-screen max-w-screen-2xl mx-auto p-4 md:p-6">
            <div className="mb-6 flex-shrink-0">
                <BackButton to={`/${language}`} />
            </div>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                <div className="lg:col-span-3 h-full overflow-hidden">
                    <TableOfContents
                        categories={categories} 
                        onSelect={handleSelectCategory}
                        activeCategory={activeCategory}
                    />
                </div>
                <div className="lg:col-span-9 h-full overflow-hidden">
                    <IdiomListViewer categories={categories} viewerRef={viewerRef} />
                </div>
            </div>
        </div>
    );
};

export default IdiomLibraryPage;