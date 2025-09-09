import React, { useState } from 'react';
import type { Patient } from '../types';
import { useLanguage } from '../services/localization';

interface ForeignerRegistrationProps {
    onAddPatient: (patientData: Omit<Patient, 'id' | 'avatarUrl' | 'lastVisit' | 'medicalHistory' | 'appointments' | 'vitals'>) => void;
}

const initialFormData = {
    name: '',
    dob: '',
    gender: 'Other' as 'Male' | 'Female' | 'Other',
    phone: '',
    address: '',
    nationality: '',
    passportId: '',
    visaType: 'Tourist',
    visaExpiry: '',
    allergies: '',
    bloodType: 'O+',
};

const ForeignerRegistration: React.FC<ForeignerRegistrationProps> = ({ onAddPatient }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.dob || !formData.phone || !formData.passportId || !formData.nationality) {
            setErrorMessage('Please fill in all required fields: Name, DOB, Phone, Nationality, and Passport ID.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');
        
        // Simulate API call
        setTimeout(() => {
            onAddPatient({
                patientType: 'Foreigner',
                name: formData.name,
                age: new Date().getFullYear() - new Date(formData.dob).getFullYear(),
                gender: formData.gender,
                phone: formData.phone,
                address: formData.address,
                nationality: formData.nationality,
                passportId: formData.passportId,
                visaType: formData.visaType,
                visaExpiry: formData.visaExpiry,
                bloodType: formData.bloodType,
                allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
            });

            setSuccessMessage(`Foreign patient "${formData.name}" is being registered...`);
            setIsSubmitting(false);
        }, 1500);
    };

    return (
      <div className="space-y-6">
            <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">{t('foreignerRegistration.title')}</h2>
            
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

                <h3 className="text-lg font-semibold text-dark-text border-b pb-2 dark:text-slate-200 dark:border-slate-700">{t('foreignerRegistration.personalInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.fullName')} *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.dob')} *</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.gender')} *</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('foreignerRegistration.nationality')} *</label>
                        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('foreignerRegistration.passportId')} *</label>
                        <input type="text" name="passportId" value={formData.passportId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('foreignerRegistration.visaType')}</label>
                        <select name="visaType" value={formData.visaType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                            <option>Tourist</option>
                            <option>Business</option>
                            <option>Resident</option>
                             <option>Other</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('foreignerRegistration.visaExpiry')}</label>
                        <input type="date" name="visaExpiry" value={formData.visaExpiry} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-dark-text border-b pb-2 pt-4 dark:text-slate-200 dark:border-slate-700">{t('foreignerRegistration.contactInfo')}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('foreignerRegistration.phoneGhana')} *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('foreignerRegistration.addressGhana')}</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.bloodType')}</label>
                        <select name="bloodType" value={formData.bloodType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                            <option>O+</option><option>O-</option>
                            <option>A+</option><option>A-</option>
                            <option>B+</option><option>B-</option>
                            <option>AB+</option><option>AB-</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('patientRegistration.allergies')}</label>
                        <input type="text" name="allergies" placeholder={t('patientRegistration.allergiesPlaceholder')} value={formData.allergies} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                 </div>

                <div className="border-t pt-4 flex justify-end dark:border-slate-700">
                     <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400">
                         {isSubmitting ? t('patientRegistration.registering') : t('foreignerRegistration.register')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ForeignerRegistration;
