import React from 'react';
import { useLanguage } from '../services/localization';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-light-bg dark:bg-slate-800 p-6 rounded-lg flex flex-col items-center text-center">
        <div className="bg-primary text-white rounded-full h-12 w-12 flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-dark-text dark:text-slate-200 mb-2">{title}</h3>
        <p className="text-sm text-light-text dark:text-slate-400">{description}</p>
    </div>
);

const About: React.FC = () => {
    const { t } = useLanguage();

    const features = [
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, title: t('page.patients'), description: "Comprehensive patient registration, record management, and detailed medical history tracking." },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, title: t('page.aiAssistant'), description: "Leverage Google Gemini for clinical decision support, symptom analysis, and data interpretation." },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, title: t('page.billing'), description: "Streamlined billing, invoicing, and NHIS claims management for efficient financial operations." },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, title: t('page.telemedicine'), description: "Conduct secure virtual consultations with patients, bridging distances and improving access to care." },
    ];

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center">
                <div className="inline-flex items-center justify-center bg-primary text-white rounded-full h-16 w-16 text-3xl font-bold mb-4">
                    GH
                </div>
                <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">{t('about.title')}</h2>
                <p className="mt-4 text-light-text dark:text-slate-400 max-w-2xl mx-auto">
                    {t('about.description')}
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md">
                <h3 className="text-2xl font-bold text-dark-text dark:text-slate-200 text-center mb-6">{t('about.features.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map(feature => (
                        <FeatureCard key={feature.title} {...feature} />
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md">
                 <h3 className="text-2xl font-bold text-dark-text dark:text-slate-200 text-center mb-6">{t('about.tech.title')}</h3>
                 <p className="text-light-text dark:text-slate-400 text-center max-w-3xl mx-auto">
                    {t('about.tech.description')}
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center">
                 <h3 className="text-2xl font-bold text-dark-text dark:text-slate-200 mb-4">{t('about.support.title')}</h3>
                 <p className="text-light-text dark:text-slate-400 max-w-2xl mx-auto">
                     {t('about.support.description')}
                 </p>
                 <div className="mt-4 inline-block bg-light-bg dark:bg-slate-700 p-3 rounded-lg">
                    <span className="font-semibold text-dark-text dark:text-slate-200">{t('about.support.contact')}: </span>
                    <a href="tel:+233530941750" className="text-primary font-bold hover:underline">+233530941750</a>
                 </div>
            </div>

             <div className="text-center text-xs text-light-text dark:text-slate-500">
                <p>Ghana HMS Version 1.0.0</p>
            </div>
        </div>
    );
};

export default About;
