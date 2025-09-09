import React, { useState } from 'react';
import GhanaCardVerificationModal from './GhanaCardVerificationModal';
import type { Patient } from '../types';
import { useLanguage } from '../services/localization';

interface PatientRegistrationProps {
    onAddPatient: (patientData: Omit<Patient, 'id' | 'avatarUrl' | 'lastVisit' | 'medicalHistory' | 'appointments' | 'vitals'>) => void;
}

const initialFormData = {
    fullName: '',
    dob: '',
    gender: 'Other',
    phone: '',
    address: '',
    ghanaCardId: '',
    nhisId: '',
    bloodType: 'O+',
    allergies: '',
};

const PatientRegistration: React.FC<PatientRegistrationProps> = ({ onAddPatient }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVerificationSuccess = (verifiedData: { name: string; dob: string }) => {
        setFormData(prev => ({
            ...prev,
            fullName: verifiedData.name,
            dob: verifiedData.dob
        }));
        setIsVerificationModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.dob || !formData.phone) {
            setErrorMessage('Please fill in all required fields: Full Name, Date of Birth, and Phone.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');
        
        // Simulate API call
        setTimeout(() => {
            onAddPatient({
                patientType: 'National',
                name: formData.fullName,
                age: new Date().getFullYear() - new Date(formData.dob).getFullYear(), // Simple age calculation
                gender: formData.gender as 'Male' | 'Female' | 'Other',
                phone: formData.phone,
                address: formData.address,
                ghanaCardId: formData.ghanaCardId,
                ghanaCardStatus: 'Unverified',
                nhisId: formData.nhisId,
                bloodType: formData.bloodType,
                allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
            });
            // The App component will handle navigation and state update.
            // We can show a temporary success message here before navigation.
            setSuccessMessage(`Patient "${formData.fullName}" is being registered...`);
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">{t('patientRegistration.title')}</h2>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-md space-y-6 dark:bg-slate-800 dark:border dark:border-slate-700">
                
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
                        <p className="font-bold">Success</p>
                        <p>{successMessage}</p>
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{errorMessage}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.fullName')} *</label>
                            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.dob')} *</label>
                            <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.gender')} *</label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.phone')} *</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.address')}</label>
                            <textarea id="address" name="address" rows={3} value={formData.address} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"></textarea>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="ghanaCardId" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.ghanaCardId')}</label>
                            <div className="flex items-center space-x-2">
                                <input type="text" id="ghanaCardId" name="ghanaCardId" value={formData.ghanaCardId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                                <button type="button" onClick={() => setIsVerificationModalOpen(true)} disabled={!formData.ghanaCardId} className="bg-secondary text-primary-dark px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-semibold text-sm whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-slate-600">
                                    {t('patientRegistration.verify')}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="nhisId" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.nhisId')}</label>
                            <input type="text" id="nhisId" name="nhisId" value={formData.nhisId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label htmlFor="bloodType" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.bloodType')}</label>
                            <select id="bloodType" name="bloodType" value={formData.bloodType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                                <option>O+</option><option>O-</option>
                                <option>A+</option><option>A-</option>
                                <option>B+</option><option>B-</option>
                                <option>AB+</option><option>AB-</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="allergies" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.allergies')}</label>
                            <textarea id="allergies" name="allergies" rows={3} placeholder={t('patientRegistration.allergiesPlaceholder')} value={formData.allergies} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"></textarea>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4 flex justify-end dark:border-slate-700">
                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 flex items-center justify-center"
                    >
                         {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('patientRegistration.registering')}
                            </>
                        ) : t('patientRegistration.register')}
                    </button>
                </div>
            </form>
            <GhanaCardVerificationModal
                isOpen={isVerificationModalOpen}
                onClose={() => setIsVerificationModalOpen(false)}
                ghanaCardId={formData.ghanaCardId}
                onVerifySuccess={handleVerificationSuccess}
            />
        </div>
    );
};

export default PatientRegistration;
