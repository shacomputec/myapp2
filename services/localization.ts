


import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'en' | 'ak';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

// Central dictionary for all translatable strings
const translations: Translations = {
    // Sidebar Groups
    'sidebar.group.main': { en: 'Main', ak: 'Mfidiepono' },
    'sidebar.group.clinical': { en: 'Clinical', ak: 'Ayaresa mu Nsɛm' },
    'sidebar.group.developer': { en: 'Developer', ak: 'Developer' },
    'sidebar.group.operations': { en: 'Operations', ak: 'Nnwuma a Wɔyɛ' },
    'sidebar.group.finance': { en: 'Finance', ak: 'Sikasɛm' },
    'sidebar.group.admin': { en: 'Administration', ak: 'Nnwuma so Hwɛ' },
    // Page Titles
    'page.dashboard': { en: 'Dashboard', ak: 'Mfidiepono' },
    'page.patients': { en: 'Patients', ak: 'Ayarfoɔ' },
    'page.registerNational': { en: 'Register National', ak: 'Kyerɛw ɔman ba din' },
    'page.registerForeigner': { en: 'Register Foreigner', ak: 'Kyerɛw ɔhɔhoɔ din' },
    'page.appointments': { en: 'Appointments', ak: 'Nhyiamu' },
    'page.telemedicine': { en: 'Telemedicine', ak: 'Ayaresa a ɛwɔ Akyirikyiri' },
    'page.laboratory': { en: 'Laboratory', ak: 'Aduruyɛdan' },
    'page.radiology': { en: 'Radiology', ak: 'Mfoni a Wɔtwe' },
    'page.pharmacy': { en: 'Pharmacy', ak: 'Aduruyɛtɔnbea' },
    'page.surgery': { en: 'Surgery', ak: 'Opirehyɛn' },
    'page.maternity': { en: 'Maternity', ak: 'Awoɔ' },
    'page.pediatrics': { en: 'Pediatrics', ak: 'Mmofra Ayaresa' },
    'page.emergency': { en: 'Emergency', ak: 'Nkaakra' },
    'page.oncology': { en: 'Oncology', ak: 'Kokoram Ayaresa' },
    'page.cardiology': { en: 'Cardiology', ak: 'Akomayare Ayaresa' },
    'page.bloodBank': { en: 'Blood Bank', ak: 'Mogya Akoraeɛ' },
    'page.inventory': { en: 'Inventory', ak: 'Nneɛma a ɛwɔ hɔ' },
    'page.bedManagement': { en: 'Bed Management', ak: 'Mpa so Hwɛ' },
    'page.logistics': { en: 'Logistics', ak: 'Nneɛma a Wɔde Fa' },
    'page.canteen': { en: 'Canteen', ak: 'Adidibea' },
    'page.mortuary': { en: 'Mortuary', ak: 'Funudua' },
    'page.billing': { en: 'Billing', ak: 'Sika Tɔ' },
    'page.bank': { en: 'Bank', ak: 'Sikakorabea' },
    'page.nhisClaims': { en: 'NHIS Claims', ak: 'NHIS Sika Gye' },
    'page.staffManagement': { en: 'Staff Management', ak: 'Adwumayɛfoɔ so Hwɛ' },
    'page.humanResources': { en: 'Human Resources', ak: 'Adwumayɛfoɔ Nsɛm' },
    'page.userManagement': { en: 'User Management', ak: 'Sɔfoɔ so Hwɛ' },
    'page.reports': { en: 'Reports', ak: 'Ammaneɛbɔ' },
    'page.aiAssistant': { en: 'AI Assistant', ak: 'AI Mmoafoɔ' },
    'page.settings': { en: 'Settings', ak: 'Nhyehyɛeɛ' },
    'page.opd': { en: 'OPD', ak: 'OPD' },
    'page.icu': { en: 'ICU', ak: 'ICU' },
    'page.physiotherapy': { en: 'Physiotherapy', ak: 'Nipadua mu Ayaresa' },
    'page.roboticSurgery': { en: 'Robotic Surgery', ak: 'Opirehyɛn a Wɔde Robɔt Yɛ' },
    'page.videoGeneration': { en: 'Video Generation', ak: 'Video Yɛ' },
    'page.genomics': { en: 'Genomics', ak: 'Awo Nsɛm' },
    'page.drugInteraction': { en: 'Drug Interaction', ak: 'Nnuro Nkitahodi' },
    'page.mentalHealth': { en: 'Mental Health', ak: 'Adwenemyare Ayaresa' },
    'page.about': { en: 'About the System', ak: 'Mfiri no ho Nsɛm' },
    // Dashboard
    'dashboard.welcome': { en: 'Welcome back, Dr. Adjei!', ak: 'Akwaaba bio, Oduruyɛfo Adjei!' },
    'dashboard.totalPatients': { en: 'Total Patients', ak: 'Ayarfoɔ nyinaa dodoɔ' },
    'dashboard.appointmentsToday': { en: 'Appointments Today', ak: 'Nhyiamu a ɛwɔ hɔ nnɛ' },
    'dashboard.surgeriesScheduled': { en: 'Surgeries Scheduled', ak: 'Opirehyɛn a wɔahyehyɛ' },
    'dashboard.bedsAvailable': { en: 'Beds Available', ak: 'Mpa a ɛda hɔ' },
    // Header
    'header.role.gp': { en: 'General Practitioner', ak: 'Oduruyɛfo Panyin' },
    // Settings Page
    'settings.title': { en: 'Settings', ak: 'Nhyehyɛeɛ' },
    'settings.preferences': { en: 'System Preferences', ak: 'Mfiri no mu nhyehyɛeɛ' },
    'settings.languageSupport': { en: 'Language Support', ak: 'Kasa Mmoa' },
    'settings.languageDescription': { en: 'Change the display language of the system interface.', ak: 'Sesa kasa a wɔde kyerɛ nsɛm wɔ mfiri no so.' },

    // Patient List
    'patientList.title': { en: 'Patient Records', ak: 'Ayarfoɔ Nkrataa' },
    'patientList.searchPlaceholder': { en: 'Search by name, patient ID, or Ghana Card...', ak: 'Hwehwɛ din, yarefoɔ ID, anaa Ghana Kaadi...' },
    'patientList.table.id': { en: 'Patient ID', ak: 'Yarefoɔ ID' },
    'patientList.table.name': { en: 'Name', ak: 'Din' },
    'patientList.table.age': { en: 'Age', ak: 'Mfeɛ' },
    'patientList.table.gender': { en: 'Gender', ak: 'Bɔbeasu' },
    'patientList.table.lastVisit': { en: 'Last Visit', ak: 'Nsrahwɛ a Etwa Toɔ' },
    'patientList.table.actions': { en: 'Actions', ak: 'Nneyɛeɛ' },
    'patientList.viewDetails': { en: 'View Details', ak: 'Hwɛ Nsɛm Pii' },

    // Patient Detail
    'patientDetail.generateSummary': { en: 'Generate AI Summary', ak: 'Yɛ AI Nsɛmti Tiawa' },
    'patientDetail.generating': { en: 'Generating...', ak: 'Ɛreyɛ...' },
    'patientDetail.addRecord': { en: 'Add Record', ak: 'Fa Nkrataa Foforɔ Ka Ho' },
    'patientDetail.recordVitals': { en: 'Record Vitals', ak: 'Kyerɛw Ahoɔden Nsɛnkyerɛnne' },
    'patientDetail.shareRecord': { en: 'Share Record', ak: 'Kyɛ Nkrataa' },
    'patientDetail.pill.patientId': { en: 'Patient ID', ak: 'Yarefoɔ ID' },
    'patientDetail.pill.ghanaCard': { en: 'Ghana Card', ak: 'Ghana Kaadi' },
    'patientDetail.pill.verificationStatus': { en: 'Verification Status', ak: 'Nnyinasoɔ' },
    'patientDetail.pill.nhisId': { en: 'NHIS ID', ak: 'NHIS ID' },
    'patientDetail.pill.bloodType': { en: 'Blood Type', ak: 'Mogya Su' },
    'patientDetail.pill.nationality': { en: 'Nationality', ak: 'Ɔman A Wɔfri Mu' },
    'patientDetail.pill.passportId': { en: 'Passport ID', ak: 'Passport ID' },
    'patientDetail.pill.visaType': { en: 'Visa Type', ak: 'Visa Su' },
    'patientDetail.pill.dietaryPlan': { en: 'Dietary Plan', ak: 'Aduane Nhyehyɛeɛ' },
    'patientDetail.verifyIdNow': { en: 'Verify ID Now', ak: 'Sɔ ID Hwɛ Seesei' },
    'patientDetail.tab.history': { en: 'History', ak: 'Abakɔsɛm' },
    'patientDetail.tab.appointments': { en: 'Appointments', ak: 'Nhyiamu' },
    'patientDetail.tab.vitals': { en: 'Vitals', ak: 'Ahoɔden Nsɛnkyerɛnne' },
    'patientDetail.tab.lab results': { en: 'Lab Results', ak: 'Aduruyɛdan Nsunsuansoɔ' },
    'patientDetail.tab.radiology': { en: 'Radiology', ak: 'Mfoni a Wɔtwe' },
    'patientDetail.tab.prescriptions': { en: 'Prescriptions', ak: 'Nnuro a Wɔakyerɛw' },
    'patientDetail.tab.discharge': { en: 'Discharge', ak: 'Fie Akwamma' },
    'patientDetail.tab.billing': { en: 'Billing', ak: 'Sika Tɔ' },
    'patientDetail.tab.oncology': { en: 'Oncology', ak: 'Kokoram Nsɛm' },
    'patientDetail.tab.cardiology': { en: 'Cardiology', ak: 'Akomayare Nsɛm' },
    'patientDetail.tab.maternity': { en: 'Maternity', ak: 'Awoɔ Nsɛm' },
    'patientDetail.tab.pediatrics': { en: 'Pediatrics', ak: 'Mmofra Nsɛm' },
    'patientDetail.tab.physiotherapy': { en: 'Physiotherapy', ak: 'Nipadua mu Ayaresa' },
    'patientDetail.tab.genomics': { en: 'Genomics', ak: 'Awo Nsɛm' },
    'patientDetail.maternity.gestationalAge': { en: 'Gestational Age', ak: 'Afunumu Nna' },
    'patientDetail.maternity.weeks': { en: 'weeks', ak: 'nnawɔtwe' },
    'patientDetail.maternity.dueDate': { en: 'Expected Due Date', ak: 'Da a Wɔhwɛ Kwan Sɛ Ɔbɛwo' },
    'patientDetail.maternity.riskLevel': { en: 'Risk Level', ak: 'Asiane a Ɛwɔ Mu' },
    'patientDetail.maternity.antenatalVisits': { en: 'Antenatal Visits', ak: 'Afunumu Mu Nsrahwɛ' },
    'patientDetail.maternity.noVisits': { en: 'No antenatal visit records found.', ak: 'Wɔnnhunuu afunumu mu nsrahwɛ nkrataa biara.' },
    'patientDetail.pediatrics.vaccinationSchedule': { en: 'Vaccination Schedule', ak: 'Abɔfra Nnurobɔ Nhyehyɛeɛ' },
    'patientDetail.pediatrics.vaccine': { en: 'Vaccine', ak: 'Abɔfra nnuro' },
    'patientDetail.pediatrics.dueDate': { en: 'Due Date', ak: 'Da a Ɛsɛ Sɛ Wɔde Ma' },
    'patientDetail.pediatrics.status': { en: 'Status', ak: 'Sɛdeɛ Ɛteɛ' },
    'patientDetail.pediatrics.administeredOn': { en: 'Administered On', ak: 'Da a Wɔde Maeɛ' },
    'patientDetail.pediatrics.logVaccination': { en: 'Log New Vaccination', ak: 'Kyerɛw Abɔfra Nnuro Foforɔ' },
    'patientDetail.pediatrics.noRecords': { en: 'No vaccination records found for this patient.', ak: 'Wɔnnhunuu abɔfra nnurobɔ nkrataa biara ma yarefoɔ yi.' },
    'patientDetail.physiotherapy.title': { en: 'Physiotherapy Sessions', ak: 'Nipadua mu Ayaresa Nhyiamu' },
    'patientDetail.physiotherapy.schedule': { en: 'Schedule New Session', ak: 'Hyehyɛ Nhyiamu Foforɔ' },
    'patientDetail.physiotherapy.noRecords': { en: 'No physiotherapy sessions recorded for this patient.', ak: 'Wɔnnhunuu nipadua mu ayaresa nhyiamu biara ma yarefoɔ yi.' },

    // Patient Registration
    'patientRegistration.title': { en: 'New National Patient Registration', ak: 'Ɔman Ba Yarefoɔ Foforɔ Din Kyerɛw' },
    'patientRegistration.fullName': { en: 'Full Name', ak: 'Din Pɛpɛɛpɛ' },
    'patientRegistration.dob': { en: 'Date of Birth', ak: 'Awo Da' },
    'patientRegistration.gender': { en: 'Gender', ak: 'Bɔbeasu' },
    'patientRegistration.phone': { en: 'Phone Number', ak: 'Telefon Nɔma' },
    'patientRegistration.address': { en: 'Address', ak: 'Beaeɛ a Wote' },
    'patientRegistration.ghanaCardId': { en: 'Ghana Card ID', ak: 'Ghana Kaadi ID' },
    'patientRegistration.nhisId': { en: 'NHIS ID', ak: 'NHIS ID' },
    'patientRegistration.bloodType': { en: 'Blood Type', ak: 'Mogya Su' },
    'patientRegistration.allergies': { en: 'Known Allergies', ak: 'Nneɛma a Ɛyɛ Wo Yare' },
    'patientRegistration.allergiesPlaceholder': { en: 'e.g., Peanuts, Penicillin', ak: 'Nhwɛsoɔ, Nkateɛ, Penicillin' },
    'patientRegistration.verify': { en: 'Verify', ak: 'Sɔ Hwɛ' },
    'patientRegistration.register': { en: 'Register Patient', ak: 'Kyerɛw Yarefoɔ Din' },
    'patientRegistration.registering': { en: 'Registering...', ak: 'Ɛrekyerɛw din...' },

    // Foreigner Registration
    'foreignerRegistration.title': { en: 'Foreign National Patient Registration', ak: 'Ɔhɔhoɔ Yarefoɔ Din Kyerɛw' },
    'foreignerRegistration.personalInfo': { en: 'Personal & Travel Information', ak: 'Ankorankoro & Akwantuo Nsɛm' },
    'foreignerRegistration.nationality': { en: 'Nationality', ak: 'Ɔman A Wɔfri Mu' },
    'foreignerRegistration.passportId': { en: 'Passport ID', ak: 'Passport ID' },
    'foreignerRegistration.visaType': { en: 'Visa Type', ak: 'Visa Su' },
    'foreignerRegistration.visaExpiry': { en: 'Visa Expiry Date', ak: 'Visa Bere a Ɛbɛkɔ Awiei' },
    'foreignerRegistration.contactInfo': { en: 'Contact & Medical Information', ak: 'Nkitahodi & Ayaresa Nsɛm' },
    'foreignerRegistration.phoneGhana': { en: 'Contact Phone (Ghana)', ak: 'Telefon Nɔma (Ghana)' },
    'foreignerRegistration.addressGhana': { en: 'Address (Ghana)', ak: 'Beaeɛ a Wote (Ghana)' },
    'foreignerRegistration.register': { en: 'Register Foreign Patient', ak: 'Kyerɛw Ɔhɔhoɔ Yarefoɔ Din' },

    // AI Assistant
    'aiAssistant.title': { en: 'AI Clinical Assistant', ak: 'AI Ayaresa Mmoafoɔ' },
    'aiAssistant.patientInfo': { en: 'Patient Information', ak: 'Yarefoɔ Nsɛm' },
    'aiAssistant.selectPatient': { en: 'Select Patient', ak: 'Yi Yarefoɔ' },
    'aiAssistant.symptoms': { en: 'Symptoms & Observations', ak: 'Yare Nsɛnkyerɛnne & Nhwehwɛmu' },
    'aiAssistant.symptomsPlaceholder': { en: 'e.g., Patient presents with high fever (39°C), severe headache, and joint pain for 3 days...', ak: 'Nhwɛsoɔ, Yarefoɔ no anya hura kɛse (39°C), tiyɛ kɛse, ne nnompe mu yaw nna 3 ni...' },
    'aiAssistant.getAnalysis': { en: 'Get AI Analysis', ak: 'Nya AI Nhwehwɛmu' },
    'aiAssistant.analyzing': { en: 'Analyzing...', ak: 'Ɛrehwɛ mu...' },
    'aiAssistant.suggestions': { en: 'Clinical Suggestions', ak: 'Ayaresa Afutuo' },
    'aiAssistant.suggestionsAppearHere': { en: 'The AI-generated analysis will appear here.', ak: 'AI-nhwehwɛmu no bɛba ha.' },
    // Billing
    'billing.title': { en: 'Billing & Invoicing', ak: 'Sika Tɔ ne Nkrataa a Wɔde Kyerɛ' },
    'billing.revenue': { en: 'Total Revenue (Paid)', ak: 'Sika a Wɔanya nyinaa (Wɔatua)' },
    'billing.outstanding': { en: 'Outstanding Payments', ak: 'Sika a Wɔnntuaeɛ' },
    'billing.invoicesSent': { en: 'Invoices Sent (All Time)', ak: 'Nkrataa a Wɔde Amana (Bere nyinaa)' },
    'billing.searchPlaceholder': { en: 'Search by invoice ID or patient name...', ak: 'Hwehwɛ invoice ID anaa yarefoɔ din...' },
    'billing.createNew': { en: 'Create New Invoice', ak: 'Yɛ Invoice Foforɔ' },
    'billing.table.id': { en: 'Invoice ID', ak: 'Invoice ID' },
    'billing.table.patient': { en: 'Patient', ak: 'Yarefoɔ' },
    'billing.table.date': { en: 'Date', ak: 'Da' },
    'billing.table.amount': { en: 'Amount', ak: 'Sika Dodoɔ' },
    'billing.table.status': { en: 'Status', ak: 'Sɛdeɛ Ɛteɛ' },
    'billing.table.actions': { en: 'Actions', ak: 'Nneyɛeɛ' },
    'billing.table.view': { en: 'View', ak: 'Hwɛ' },
    'billing.table.pay': { en: 'Pay', ak: 'Tua' },
    'billing.create.title': { en: 'Create New Invoice', ak: 'Yɛ Invoice Foforɔ' },
    'billing.create.patient': { en: 'Patient', ak: 'Yarefoɔ' },
    'billing.create.selectPatient': { en: 'Select a patient', ak: 'Yi yarefoɔ' },
    'billing.create.dueDate': { en: 'Due Date', ak: 'Da a Ɛsɛ sɛ Wotua' },
    'billing.create.items': { en: 'Invoice Items', ak: 'Nneɛma a ɛwɔ Invoice mu' },
    'billing.create.description': { en: 'Description', ak: 'Nkyerɛkyerɛmu' },
    'billing.create.qty': { en: 'Qty', ak: 'Dodoɔ' },
    'billing.create.unitPrice': { en: 'Unit Price', ak: 'Boɔ Baako' },
    'billing.create.addItem': { en: '+ Add Item', ak: '+ Fa Biribi Ka Ho' },
    'billing.create.total': { en: 'Total', ak: 'Dodoo nyinaa' },
    'billing.create.save': { en: 'Save Invoice', ak: 'Sie Invoice' },
    'billing.detail.title': { en: 'Invoice', ak: 'Invoice' },
    'billing.detail.for': { en: 'For', ak: 'Ma' },
    'billing.detail.explaining': { en: 'Explaining...', ak: 'Ɛrekyerɛkyerɛ mu...' },
    'billing.detail.explain': { en: 'Explain Charges with AI', ak: 'Fa AI Kyerɛkyerɛ Sika mu' },
    'billing.detail.item': { en: 'Item Description', ak: 'Nneɛma Nkyerɛkyerɛmu' },
    'billing.detail.qty': { en: 'Qty', ak: 'Dodoɔ' },
    'billing.detail.unitPrice': { en: 'Unit Price', ak: 'Boɔ Baako' },
    'billing.detail.total': { en: 'Total', ak: 'Dodoo nyinaa' },
    'billing.detail.grandTotal': { en: 'Grand Total', ak: 'Dodoo Kɛseɛ' },
    'billing.detail.aiExplanation': { en: 'AI-Powered Explanation', ak: 'AI-Nkyerɛkyerɛmu' },
    'billing.detail.generating': { en: 'Generating a simple explanation of your bill...', ak: 'Ɛreyɛ wo sika nkyerɛkyerɛmu a ɛnyɛ den...' },
    'billing.payment.title': { en: 'Process Payment for', ak: 'Tua Sika Ma' },
    'billing.payment.amount': { en: 'Amount', ak: 'Sika Dodoɔ' },
    'billing.payment.method': { en: 'Payment Method', ak: 'Sika Tua Kwan' },
    'billing.payment.provider': { en: 'Provider', ak: 'Deɛ ɔde ma' },
    'billing.payment.phone': { en: 'Phone Number', ak: 'Telefon Nɔma' },
    'billing.payment.awaiting': { en: 'Awaiting authorization. Please check your phone for a payment prompt and enter your PIN to approve the transaction.', ak: 'Yɛretwɛn kwan. Yɛsrɛ wo, hwɛ wo telefon so na fa wo PIN hyɛ mu na ama yɛatumi de sika no amena.' },
    'billing.payment.success': { en: 'Payment successful!', ak: 'Sika no atua yie!' },
    'billing.payment.processing': { en: 'Processing', ak: 'Ɛreyɛ adwuma' },
    'billing.payment.pay': { en: 'Pay', ak: 'Tua' },

    // About Page
    'about.title': { en: 'About the Ghana Hospital Management System', ak: 'Ghana Ayaresabea Sohwɛ Mfiri no ho Nsɛm' },
    'about.description': { en: 'A modern, user-friendly Hospital Management System (HMS) designed to meet the specific needs of Ghanaian healthcare facilities, featuring patient management, a doctor\'s dashboard, and an AI-powered clinical assistant.', ak: 'Ayaresabea Sohwɛ Mfiri (HMS) a ɛyɛ foforo na ɛyɛ mmerɛw a wɔayɛ no sɛnea ɛbɛboa Ghana apɔwmudenbea ahorow, a ɛwɔ ayarefo hwɛ, oduruyɛfo dashboard, ne AI mmoa a ɛboa wɔ ayaresa mu.' },
    'about.features.title': { en: 'Key Features', ak: 'Nneɛma Titiriw a Ɛwom' },
    'about.tech.title': { en: 'Our Technology', ak: 'Yɛn Mfiridwuma' },
    'about.tech.description': { en: 'This system is built with a modern technology stack to ensure a reliable, secure, and fast experience for all users. We leverage the power of Google\'s Gemini API to provide cutting-edge AI assistance for clinical decision support, data analysis, and workflow automation.', ak: 'Wɔde mfiridwuma foforo na ɛyɛɛ mfiri yi na ama ayɛ nea wotumi de ho to so, ahobammɔ wom, na ayɛ ntɛm ama wɔn a wɔde di dwuma nyinaa. Yɛde Google Gemini API no tumi di dwuma de ma AI mmoa a ɛkorɔn a ɛboa wɔ ayaresa mu gyinaesi, data mu nhwehwɛmu, ne adwumayɛ a ɛma ɛyɛ mmerɛw mu.' },
    'about.support.title': { en: 'Support & Development', ak: 'Mmoa & Nkɔsoɔ' },
    'about.support.description': { en: 'This application is proudly developed and maintained by Sha Computec. For technical support or inquiries, please contact:', ak: 'Sha Computec na ɛyɛɛ application yi na ɛhwɛ so. Sɛ wohia mfiridwuma mu mmoa anaa nsɛmmisa bi a, yɛsrɛ wo, fa nkitahodi kɔ:' },
    'about.support.contact': { en: 'Developer Contact', ak: 'Developer Nkitahodi' },

};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return React.createElement(LanguageContext.Provider, {
    value: { language, setLanguage, t },
    children,
  });
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};