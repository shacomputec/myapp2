import React, { useState } from 'react';
import type { Patient } from '../types';
import { useLanguage } from '../services/localization';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.ghanaCardId && patient.ghanaCardId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
      <h2 className="text-2xl font-bold text-dark-text mb-4 dark:text-slate-200">{t('patientList.title')}</h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('patientList.searchPlaceholder')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-light-bg dark:bg-slate-700">
            <tr>
              <th className="p-3 font-semibold text-light-text dark:text-slate-300">{t('patientList.table.id')}</th>
              <th className="p-3 font-semibold text-light-text dark:text-slate-300">{t('patientList.table.name')}</th>
              <th className="p-3 font-semibold text-light-text dark:text-slate-300">{t('patientList.table.age')}</th>
              <th className="p-3 font-semibold text-light-text dark:text-slate-300">{t('patientList.table.gender')}</th>
              <th className="p-3 font-semibold text-light-text dark:text-slate-300">{t('patientList.table.lastVisit')}</th>
              <th className="p-3 font-semibold text-light-text dark:text-slate-300">{t('patientList.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="dark:text-slate-400">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="p-3">{patient.id}</td>
                <td className="p-3 font-medium text-dark-text dark:text-slate-200 flex items-center">
                    <img src={patient.avatarUrl} alt={patient.name} className="w-8 h-8 rounded-full mr-3" />
                    {patient.name}
                </td>
                <td className="p-3">{patient.age}</td>
                <td className="p-3">{patient.gender}</td>
                <td className="p-3">{patient.lastVisit}</td>
                <td className="p-3">
                  <button 
                    onClick={() => onSelectPatient(patient)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {t('patientList.viewDetails')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;