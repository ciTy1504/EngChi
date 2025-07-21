// src/components/shared/Accordion.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Accordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-gray-50 border rounded-lg overflow-hidden">
            <button
                type="button" 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 font-semibold cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors"
                aria-expanded={isOpen}
            >
                <span>{title}</span>
                <motion.span
                    className="text-gray-500"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 border-t border-gray-200">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};