





export enum Page {
  Dashboard = 'Dashboard',
  Patients = 'Patients',
  PatientRegistration = 'Register National',
  PatientDetail = 'PatientDetail',
  Appointments = 'Appointments',
  Telemedicine = 'Telemedicine',
  Laboratory = 'Laboratory',
  Radiology = 'Radiology',
  Pharmacy = 'Pharmacy',
  Surgery = 'Surgery',
  Maternity = 'Maternity',
  Pediatrics = 'Pediatrics',
  Emergency = 'Emergency',
  Oncology = 'Oncology',
  Cardiology = 'Cardiology',
  AIAssistant = 'AI Assistant',
  Billing = 'Billing',
  Bank = 'Bank',
  Inventory = 'Inventory',
  BedManagement = 'Bed Management',
  Logistics = 'Logistics',
  Canteen = 'Canteen',
  Mortuary = 'Mortuary',
  BloodBank = 'Blood Bank',
  Staff = 'Staff Management',
  HumanResources = 'Human Resources',
  UserManagement = 'User Management',
  Reports = 'Reports',
  Settings = 'Settings',
  NHISClaims = 'NHIS Claims',
  ForeignerRegistration = 'Register Foreigner',
  OPD = 'OPD',
  ICU = 'ICU',
  Physiotherapy = 'Physiotherapy',
  RoboticSurgery = 'Robotic Surgery',
  VideoGeneration = 'Video Generation',
  Genomics = 'Genomics',
  DrugInteraction = 'Drug Interaction Checker',
  MentalHealth = 'Mental Health',
  About = 'About the System',
}

export type DietPlan = 'Standard' | 'Diabetic' | 'Low Sodium' | 'Soft Foods' | 'Liquid';

export interface DischargeSummary {
  date: string;
  summary: string;
  doctor: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: string;
  patientType: 'National' | 'Foreigner';
  
  // National specific
  ghanaCardId?: string;
  ghanaCardStatus?: 'Verified' | 'Unverified';
  nhisId?: string;

  // Foreigner specific
  nationality?: string;
  passportId?: string;
  visaType?: string;
  visaExpiry?: string;

  phone: string;
  address: string;
  avatarUrl: string;
  lastVisit: string;
  allergies: string[];
  medicalHistory: MedicalRecord[];
  appointments: Appointment[];
  vitals: VitalSign[];
  dietaryPlan?: DietPlan;
  dischargeSummaries?: DischargeSummary[];
  // Maternity fields
  gestationalAge?: number; // in weeks
  expectedDueDate?: string;
  riskLevel?: 'Normal' | 'High';
  antenatalHistory?: AntenatalVisit[];
  // Pediatrics fields
  vaccinations?: Vaccination[];
  // Oncology fields
  oncologyProfile?: OncologyProfile;
  // Cardiology fields
  cardiologyProfile?: CardiologyProfile;
  // Physiotherapy fields
  physiotherapyProfile?: PhysiotherapyProfile;
  // Genomics fields
  genomicProfile?: GenomicProfile;
  // Mental Health fields
  mentalHealthProfile?: MentalHealthProfile;
}

export interface MedicalRecord {
  date: string;
  diagnosis: string;
  treatment: string;
  doctor: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  type: 'Virtual' | 'In-Person';
}

export interface VitalSign {
    date: string;
    temperature: string;
    bloodPressure: string;
    heartRate: string;
    respiratoryRate: string;
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
}

export type BillableItemStatus = 'Unbilled' | 'Billed';

export interface BillableItem {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  description: string;
  amount: number;
  status: BillableItemStatus;
}


export type LabTestStatus = 'Pending' | 'In Progress' | 'Completed';

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  orderDate: string;
  status: LabTestStatus;
  results?: string;
  isCritical: boolean;
  aiInterpretation?: string;
  icd10Code?: string;
}

export type RadiologyOrderStatus = 'Pending' | 'In Progress' | 'Completed';

export interface RadiologyOrder {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  orderDate: string;
  status: RadiologyOrderStatus;
  results?: string;
  imageUrl?: string;
  isUrgent: boolean;
  aiAnalysis?: string;
}


export interface Medication {
  id: string;
  name: string;
  stockLevel: number;
  unit: string; // e.g., 'mg', 'ml', 'tabs'
  lowStockThreshold: number;
  unitPrice: number;
  description: string;
  manufacturer: string;
  sideEffects: string[];
}

export type PrescriptionStatus = 'Pending' | 'Dispensed' | 'Cancelled';

export interface PrescriptionItem {
  medicationId: string;
  dosage: string; // e.g., '500mg', '1 tablet'
  quantity: number;
}
export interface PrescriptionReviewSuggestion {
    dosageWarnings: string[];
    redundancyAlerts: string[];
    alternativeSuggestions: { original: string; suggested: string; reason: string }[];
    clarityFlags: string[];
    overallAssessment: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  date: string;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  aiReview?: PrescriptionReviewSuggestion;
}

export type InventoryCategory = 'Medical Supplies' | 'Equipment' | 'Pharmaceuticals' | 'General';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string; // e.g., 'boxes', 'units', 'bottles'
  reorderLevel: number;
  supplier: string;
  lastUpdated: string;
  unitPrice?: number;
}

export type StaffRoleName = 'Doctor' | 'Nurse' | 'Administrator' | 'Pharmacist' | 'Lab Technician' | 'Developer' | 'Visitor' | 'User';
export type StaffStatus = 'Active' | 'On Leave';

export type Permission = 
  // Patient Management
  | 'patient:read'
  | 'patient:write'
  | 'patient:register'
  // Clinical Modules
  | 'clinical:telemedicine'
  | 'clinical:laboratory'
  | 'clinical:radiology'
  | 'clinical:pharmacy'
  | 'clinical:surgery'
  | 'clinical:maternity'
  | 'clinical:pediatrics'
  | 'clinical:emergency'
  | 'clinical:oncology'
  | 'clinical:cardiology'
  | 'clinical:blood_bank'
  | 'clinical:opd'
  | 'clinical:icu'
  | 'clinical:physiotherapy'
  | 'clinical:mental_health'
  // Developer Modules
  | 'developer:robotic_surgery'
  | 'developer:video_generation'
  | 'developer:genomics'
  | 'developer:drug_interaction'
  // Financial Modules
  | 'finance:billing'
  | 'finance:bank'
  | 'finance:nhis'
  // Operations Modules
  | 'operations:inventory'
  | 'operations:bed_management'
  | 'operations:logistics'
  | 'operations:canteen'
  | 'operations:mortuary'
  // Admin Modules
  | 'admin:staff'
  | 'admin:hr'
  | 'admin:users'
  | 'admin:reports'
  | 'admin:settings'
  | 'admin:ai_assistant';


export interface StaffRole {
    id: string;
    name: StaffRoleName;
    permissions: Permission[];
}

export interface StaffMember {
    // Basic Info
    id: string; // Staff ID
    username: string;
    name: string;
    avatarUrl: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth: string;
    homeTown: string;
    digitalAddress: string;

    // Employment Info
    role: StaffRole;
    designation: string;
    rank: string;
    department: string;
    status: StaffStatus;
    
    // Professional Details
    licenseNumber?: string;
    registrationNumber?: string;
    academicQualifications: string[];
    professionalQualifications: string[];

    // Employment History
    firstAppointmentDate: string;
    currentStationPostDate: string;
    promotionDate: string;

    // Contact & Financial
    phone: string;
    email: string;
    password?: string;
    ssnitId: string;
    bankName: string;
    accountNumber: string;

    // Emergency Contact
    nextOfKin: string;
    nextOfKinContact: string;
}


export interface ReorderSuggestion {
    itemId: string;
    itemName: string;
    currentQuantity: number;
    reorderLevel: number;
    suggestedQuantity: number;
    supplier: string;
    reasoning: string;
}

export type BedStatus = 'Available' | 'Occupied' | 'Cleaning';

export interface Bed {
  id: string;
  ward: string;
  status: BedStatus;
  patientId?: string | null;
  patientName?: string | null;
}

export type SurgeryStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Postponed';

export interface PreOpChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface Surgery {
    id: string;
    patientId: string;
    patientName: string;
    procedure: string;
    surgeon: string;
    operatingRoom: string;
    date: string;
    time: string;
    status: SurgeryStatus;
    preOpChecklist: PreOpChecklistItem[];
    notes?: string;
}

export interface CanteenItem {
    id: string;
    name: string;
    quantity: number;
    unit: string; // e.g., 'kg', 'liters', 'units'
    reorderLevel: number;
}

export type VehicleStatus = 'Available' | 'In Use' | 'Maintenance';

export interface Vehicle {
  id: string;
  type: 'Ambulance' | 'Staff Car' | 'Supply Van';
  licensePlate: string;
  driver: string;
  status: VehicleStatus;
}

export type TransportRequestStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface TransportRequest {
  id: string;
  patientId: string;
  patientName: string;
  origin: string;
  destination: string;
  requestTime: string;
  status: TransportRequestStatus;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  assignedVehicleId?: string;
}

export type Department = 'General Ward' | 'Maternity' | 'ICU' | 'Pediatrics' | 'Surgery' | 'Laboratory' | 'Pharmacy';
export type RequisitionStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected';

export interface RequisitionItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

export interface SupplyRequisition {
  id: string;
  requestingDepartment: Department;
  requestDate: string; // ISO date string
  items: RequisitionItem[];
  status: RequisitionStatus;
  urgency: 'Routine' | 'Urgent';
  fulfilledBy?: string;
  fulfilledDate?: string;
}

export interface Newborn {
  id: string;
  motherId: string;
  motherName: string;
  timeOfBirth: string; // ISO string
  gender: 'Male' | 'Female';
  weightKg: number;
  apgarScore: number;
}

export type VaccinationStatus = 'Upcoming' | 'Administered' | 'Overdue';

export interface Vaccination {
  id: string;
  patientId: string;
  patientName: string;
  vaccineName: string;
  dueDate: string;
  administeredDate?: string;
  status: VaccinationStatus;
}

export interface AntenatalVisit {
  date: string;
  weeksOfGestation: number;
  weightKg: number;
  bloodPressure: string;
  notes: string;
  doctor: string;
}

export type DeceasedStatus = 'In Storage' | 'Released';

export interface DeceasedRecord {
  id: string;
  patientId: string | null;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dateOfDeath: string;
  timeOfDeath: string;
  dateAdmitted: string;
  status: DeceasedStatus;
  storageBay: string;
  releasedToName?: string;
  dateReleased?: string;
}

export type TriageLevel = 'Resuscitation (I)' | 'Emergent (II)' | 'Urgent (III)' | 'Non-urgent (IV)';

export interface TriageSuggestion {
    suggestedLevel: TriageLevel;
    rationale: string;
}

export type ERStatus = 'Waiting for Triage' | 'In Triage' | 'In Treatment' | 'Awaiting Labs' | 'Awaiting Admission' | 'Discharged' | 'Admitted';

export interface EmergencyVisit {
  id: string;
  patientId: string;
  patientName: string;
  avatarUrl: string;
  arrivalTime: string; // ISO string
  chiefComplaint: string;
  triageLevel?: TriageLevel;
  status: ERStatus;
  notes?: string;
}

export type BloodUnitStatus = 'Available' | 'Reserved' | 'Transfused' | 'Expired';

export interface BloodUnit {
  id: string;
  bloodType: string; // O+, A-, etc.
  donorId: string;
  donorName: string;
  donationDate: string; // ISO string date
  expiryDate: string; // ISO string date
  status: BloodUnitStatus;
  assignedPatientId?: string;
  assignedPatientName?: string;
}

export interface BloodDonor {
  id: string;
  name: string;
  bloodType: string;
  lastDonationDate: string; // ISO string date
  phone: string;
  totalDonations: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  balance: number;
}

export type MobileMoneyProvider = 'MTN Mobile Money' | 'Vodafone Cash' | 'AirtelTigo Money';
export type TransactionType = 'Deposit' | 'Withdrawal' | 'Transfer' | 'Mobile Money Deposit' | 'International Transfer';
export type ReconciliationStatus = 'Reconciled' | 'Pending';

export interface BankTransaction {
  id: string;
  date: string; // ISO string
  description: string;
  type: TransactionType;
  amount: number; // Always in GHS
  accountId: string;
  status: ReconciliationStatus;
  reconciliationId?: string; 
  
  // MoMo specific
  momoProvider?: MobileMoneyProvider;
  momoTransactionId?: string;
  senderNumber?: string;
  
  // International Transfer specific
  senderCountry?: string;
  originalAmount?: number;
  originalCurrency?: string;
  swiftCode?: string;
}

export interface Payroll {
  staffId: string;
  staffName: string;
  role: StaffRoleName;
  monthlySalary: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Maternity' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
    id: string;
    staffId: string;
    staffName: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveStatus;
}

export type ReviewStatus = 'Scheduled' | 'Completed';

export interface PerformanceReview {
    id: string;
    staffId: string;
    staffName: string;
    reviewerName: string;
    reviewDate: string;
    status: ReviewStatus;
    summary?: string;
}

export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: StaffRoleName;
  status: UserStatus;
  lastLogin: string; // ISO string
  avatarUrl: string;
}

export type NHISClaimStatus = 'Submitted' | 'Approved' | 'Rejected' | 'Queried';

export interface NHISClaimItem {
  id: string;
  description: string;
  code: string; // e.g., C401
  amount: number;
}

export interface NHISClaim {
  id: string;
  patientId: string;
  patientName: string;
  nhisId: string;
  submissionDate: string; // ISO string date
  totalAmount: number;
  status: NHISClaimStatus;
  items: NHISClaimItem[];
  rejectionReason?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  itemCount: number; // calculated field
}

export type PurchaseOrderStatus = 'Draft' | 'Sent' | 'Partially Fulfilled' | 'Fulfilled' | 'Cancelled';

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number; // in GHS
  total: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  orderDate: string; // ISO date
  expectedDeliveryDate: string; // ISO date
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  totalCost: number;
}

// Oncology Types
export type CancerType = 'Breast' | 'Prostate' | 'Lung' | 'Cervical' | 'Colorectal' | 'Other';
export type CancerStage = 'I' | 'II' | 'III' | 'IV' | 'Unknown';
export type TreatmentType = 'Chemotherapy' | 'Radiation Therapy' | 'Surgery' | 'Targeted Therapy' | 'Palliative Care';

export interface OncologyProfile {
  cancerType: CancerType;
  cancerStage: CancerStage;
  diagnosisDate: string;
  treatmentPlan: TreatmentCycle[];
}

export interface TreatmentCycle {
  id: string;
  type: TreatmentType;
  startDate: string;
  endDate: string;
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'On Hold';
  drugsAdministered?: string[]; // For Chemotherapy
  notes?: string;
}

// Cardiology Types
export interface CardiologyProfile {
  knownConditions: string[];
  riskFactors: string[];
}

export type CardiologyOrderStatus = 'Pending' | 'In Progress' | 'Completed';
export type CardiologyTestType = 'ECG' | 'Echocardiogram' | 'Stress Test' | 'Holter Monitor';

export interface CardiologyOrder {
  id: string;
  patientId: string;
  patientName: string;
  testName: CardiologyTestType;
  orderDate: string;
  status: CardiologyOrderStatus;
  results?: string; // Interpretation report
  imageUrl?: string; // For ECG trace, Echo image
  isUrgent: boolean;
}

// ICU Types
export interface ICUBed extends Bed {
    ward: 'ICU';
    vitals: {
        heartRate: number;
        bloodPressure: string;
        spO2: number;
        respiratoryRate: number;
    } | null;
}

// Physiotherapy Types
export type TherapyStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface TherapySession {
    id: string;
    patientId: string;
    patientName: string;
    therapist: string;
    sessionType: string;
    date: string;
    time: string;
    status: TherapyStatus;
    progressNotes?: string;
}

export interface PhysiotherapyProfile {
    sessions: TherapySession[];
}

// Robotic Surgery Types
export type RobotStatus = 'Available' | 'In Use' | 'Maintenance';

export interface RoboticSurgeryRobot {
    id: string;
    name: string;
    model: string;
    status: RobotStatus;
    lastMaintenance: string;
}

export interface RoboticSurgeryProcedure {
    id: string;
    patientId: string;
    patientName: string;
    procedure: string;
    surgeon: string;
    robotId: string;
    robotName: string;
    date: string;
    time: string;
}

export interface SurgicalAssistantMessage {
  sender: 'user' | 'ai';
  text: string;
}

// Genomics Types
export type GenomicSampleStatus = 'Sample Collected' | 'Sequencing' | 'Analysis Complete' | 'Report Generated';

export interface GenomicSample {
    id: string;
    patientId: string;
    patientName: string;
    sampleType: 'Blood' | 'Tissue' | 'Saliva';
    collectionDate: string;
    status: GenomicSampleStatus;
}

export interface GeneticMarker {
    id: string;
    gene: string; // e.g., BRCA1, EGFR
    variant: string; // e.g., c.5266dupC
    classification: 'Pathogenic' | 'Likely Pathogenic' | 'Benign' | 'Variant of Uncertain Significance';
    implication: string; // Clinical implication
}

export interface GenomicProfile {
    reportId: string;
    analysisDate: string;
    summary: string;
    markers: GeneticMarker[];
}

export interface DrugInteractionResult {
  drugsInvolved: string[];
  severity: 'Minor' | 'Moderate' | 'Severe';
  explanation: string;
}

export interface PillIdentificationResult {
  pillName: string;
  dosage: string;
  commonUses: string;
  sideEffects: string[];
  confidence: 'High' | 'Medium' | 'Low' | 'Uncertain';
  disclaimer: string;
}

export type NotificationType = 'lab' | 'appointment' | 'inventory' | 'billing' | 'claim' | 'crisis';

export interface NotificationLink {
    page: Page;
    patientId?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  timestamp: string; // ISO string
  link?: NotificationLink;
  userId: string; // To associate notification with a user/role
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// Mental Health Types
export type TherapyType = 'CBT' | 'Psychodynamic' | 'Group Therapy' | 'Counseling';

export interface MentalHealthSession {
  id: string;
  patientId: string;
  patientName?: string;
  therapist: string;
  type: TherapyType;
  date: string;
  time: string;
  notes: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface MoodEntry {
  date: string;
  rating: number; // 1-10 scale
  notes?: string;
}

export interface WellbeingAssessment {
  id: string;
  date: string;
  type: 'GAD-7' | 'PHQ-9'; // Anxiety and Depression scales
  score: number;
  interpretation: string; // e.g., 'Mild anxiety'
}

export interface MentalHealthProfile {
  diagnosis: string;
  therapist: string;
  treatmentPlan: string;
  sessions: MentalHealthSession[];
  moodHistory: MoodEntry[];
  assessments: WellbeingAssessment[];
}

export interface CrisisAnalysisResult {
    isCrisis: boolean;
    reason: string;
}

export type VideoGenerationStatus = 'Queued' | 'Processing' | 'Completed' | 'Failed';

export interface VideoGenerationJob {
  id: string; // Will use operation name from Gemini API
  prompt: string;
  status: VideoGenerationStatus;
  inputImageUrl?: string; // a base64 data url for the input image
  videoUrl?: string; // A blob URL for the generated video
  progressMessage?: string;
  creationTime: string; // ISO string
  operation?: any; // To store the operation object for polling
}

export type SystemMode = 'live' | 'demo';