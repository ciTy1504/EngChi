// src/features/idiom/components/IdiomCard.jsx
import React from 'react';

const IdiomCard = ({ idiom }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-baseline">
                <h3 className="text-xl font-bold text-gray-800">{idiom.idiom}</h3>
                {idiom.pronounce && (
                    <span className="text-md font-mono text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                        {idiom.pronounce}
                    </span>
                )}
            </div>
            <p className="text-gray-600 mt-1">{idiom.meaning}</p>
            {idiom.example && (
                <div className="mt-3 pt-3 border-t border-dashed">
                    <p className="text-sm text-gray-500 italic">
                        <span className="font-semibold not-italic">Example:</span> "{idiom.example}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default IdiomCard;