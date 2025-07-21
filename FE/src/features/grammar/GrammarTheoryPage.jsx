// src/features/grammar/GrammarTheoryPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../api/apiService';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import BackButton from '../../components/shared/BackButton';


// --- COMPONENT ĐỆ QUY ĐÃ SỬA LỖI TRUYỀN PROPS ---
const TheoryNavItem = ({ item, onSelect, selectedTheoryId, onToggle, openItems, level = 0 }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = !hasChildren && selectedTheoryId === item._id;
    // Lấy trạng thái open của chính item này từ object openItems
    const isOpen = hasChildren && !!openItems[item._id];

    return (
        <li style={{ paddingLeft: `${level * 0.5}rem` }}>
            <button
                onClick={hasChildren ? () => onToggle(item._id) : () => onSelect(item)}
                className={`flex items-center justify-between w-full text-left p-3 rounded-md transition-colors ${
                    isSelected
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 font-medium'
                }`}
            >
                <span>{item.title}</span>
                {hasChildren && (
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </motion.span>
                )}
            </button>
            <AnimatePresence>
                {isOpen && ( // Dùng isOpen đã tính toán ở trên
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <ul className="pt-1 space-y-1">
                            {item.children
                                .sort((a, b) => a.order - b.order)
                                .map(child => (
                                    <TheoryNavItem
                                        key={child._id}
                                        item={child}
                                        onSelect={onSelect}
                                        selectedTheoryId={selectedTheoryId}
                                        level={level + 1}
                                        // SỬA LỖI: Truyền onToggle và openItems xuống cho con
                                        onToggle={onToggle}
                                        openItems={openItems}
                                    />
                                ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </li>
    );
};

// Component Navigator được cập nhật
const TheoryNavigator = ({ lessons, onSelect, selectedTheoryId, openItems, onToggle }) => {
    if (!lessons || lessons.length === 0) return <p className="p-4 text-gray-500">No theory topics available.</p>;

    return (
        <nav className="p-2 bg-white rounded-lg shadow-md h-full overflow-y-auto">
             <ul className="space-y-2">
                {lessons.map(lesson => (
                    <li key={lesson._id}>
                        <h3 className="font-bold text-xl text-gray-800 p-2">{lesson.title}</h3>
                        <ul className="space-y-1 mt-1 border-t pt-2">
                             {lesson.content.grammarTheory
                                ?.sort((a, b) => a.order - b.order)
                                .map(item => (
                                    <TheoryNavItem
                                        key={item._id}
                                        item={item}
                                        onSelect={onSelect}
                                        selectedTheoryId={selectedTheoryId}
                                        onToggle={onToggle} // Truyền thẳng hàm onToggle xuống
                                        openItems={openItems} // Truyền cả object openItems
                                    />
                                ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

// TheoryViewer, findTheoryAndParents, và findFirstLeaf giữ nguyên
const TheoryViewer = ({ item, viewerRef }) => {
    const t = useTranslations();
    return (
        <div ref={viewerRef} className="bg-white rounded-lg shadow-md p-6 lg:p-8 h-full overflow-y-auto">
            {!item ? ( <div className="flex items-center justify-center h-full"><p className="text-gray-500 text-lg">{t.grammar_theory_initial_prompt}</p></div>) 
            : ( <> <h2 className="text-3xl font-bold mb-4 border-b pb-2">{item.title}</h2> <div className="prose max-w-none prose-lg" dangerouslySetInnerHTML={{ __html: item.contentHTML }} /> </> )}
        </div>
    );
};
const findTheoryAndParents = (items, targetId, parentIds = []) => {
    for (const item of items) {
        if (item._id === targetId) return { foundItem: item, parentIds: parentIds };
        if (item.children && item.children.length > 0) {
            const result = findTheoryAndParents(item.children, targetId, [...parentIds, item._id]);
            if (result.foundItem) return result;
        }
    }
    return { foundItem: null, parentIds: [] };
};
const findFirstLeaf = (items) => {
    for (const item of items) {
        if (item.contentHTML) return item;
        if (item.children && item.children.length > 0) {
            const leaf = findFirstLeaf(item.children.sort((a, b) => a.order - b.order));
            if (leaf) return leaf;
        }
    }
    return null;
};


// Component chính được cập nhật để quản lý state đóng/mở
const GrammarTheoryPage = () => {
    const { language } = useContext(LanguageContext);
    const t = useTranslations();
    const [lessons, setLessons] = useState([]);
    const [selectedTheory, setSelectedTheory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const viewerRef = useRef(null);
    const [openItems, setOpenItems] = useState({});
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchGrammarLibrary = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiService(`/lessons/grammar/library?language=${language}`);
                const fetchedLessons = response.data;
                setLessons(fetchedLessons);
                const focusId = searchParams.get('focus');
                if (focusId) {
                    let foundResult = { foundItem: null, parentIds: [] };
                    for (const lesson of fetchedLessons) {
                        const result = findTheoryAndParents(lesson.content.grammarTheory || [], focusId);
                        if (result.foundItem) {
                            foundResult = result;
                            break;
                        }
                    }
                    if (foundResult.foundItem) {
                        setSelectedTheory(foundResult.foundItem);
                        const newOpenItems = {};
                        foundResult.parentIds.forEach(id => { newOpenItems[id] = true; });
                        setOpenItems(newOpenItems);
                        return;
                    }
                }
                if (fetchedLessons?.[0]?.content?.grammarTheory) {
                    const firstItemToShow = findFirstLeaf(fetchedLessons[0].content.grammarTheory.sort((a,b) => a.order - b.order));
                    setSelectedTheory(firstItemToShow);
                }
            } catch (err) { setError(err.message); } 
            finally { setIsLoading(false); }
        };
        fetchGrammarLibrary();
    }, [language, searchParams]);
    
    const handleToggleItem = (itemId) => {
        setOpenItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };
    const handleSelectTheory = (item) => {
        setSelectedTheory(item);
        if(viewerRef.current) viewerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) return <div className="text-center p-10">{t.loading}</div>;
    if (error) return <div className="text-center p-10 text-red-500">{t.error_prefix}: {error}</div>;

    return (
        <div className="flex flex-col h-screen max-w-screen-2xl mx-auto p-4 md:p-6">
            <div className="mb-6 flex-shrink-0">
                <BackButton to={`/${language}/grammar`} />
            </div>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                <div className="lg:col-span-4 xl:col-span-3 h-full overflow-hidden">
                    <TheoryNavigator 
                        lessons={lessons} 
                        onSelect={handleSelectTheory}
                        selectedTheoryId={selectedTheory?._id}
                        openItems={openItems}
                        onToggle={handleToggleItem}
                    />
                </div>
                <div className="lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
                    <TheoryViewer item={selectedTheory} viewerRef={viewerRef} />
                </div>
            </div>
        </div>
    );
};

export default GrammarTheoryPage;