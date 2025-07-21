// src/features/shared/FeaturePageLayout.jsx
import React, { useContext } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import BackButton from '../../components/shared/BackButton';

const FeaturePageLayout = ({ pageTitle, pageSubtitle, children, backButtonPath }) => {
    const { language } = useContext(LanguageContext);
    const backPath = backButtonPath ? `/${language}${backButtonPath}` : `/${language}`;

    return (
        <div>
            <div className="mb-6">
                <BackButton to={backPath} />
            </div>

            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    {pageTitle}
                </h1>
                <p className="text-lg text-gray-500 mb-12">
                    {pageSubtitle}
                </p>

                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FeaturePageLayout;