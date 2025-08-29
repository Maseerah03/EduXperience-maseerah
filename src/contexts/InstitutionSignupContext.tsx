import React, { createContext, useContext, useState, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'

// Basic Information (Page 1)
export interface BasicInformation {
  institutionName: string
  institutionType: string
  registrationNumber: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  ownerName: string
  ownerPhone: string
}

// Facilities & Details (Page 2)
export interface FacilitiesDetails {
  totalClassrooms: number
  classroomCapacity?: number
  libraryAvailable: boolean
  computerLab: boolean
  wifiAvailable: boolean
  parkingAvailable: boolean
  cafeteriaCanteen: boolean
  airConditioning: boolean
  cctvSecurity: boolean
  wheelchairAccessible: boolean
  projectorsSmartBoards: boolean
  audioSystem: boolean
  laboratoryFacilities: string[]
  sportsFacilities: string[]
  transportationProvided: boolean
  hostelFacility: boolean
  studyMaterialProvided: boolean
  onlineClasses: boolean
  recordedSessions: boolean
  mockTestsAssessments: boolean
  careerCounseling: boolean
  jobPlacementAssistance: boolean
  photos: PhotoMetadata[]
}

// Photos (Page 2)
export interface PhotoFile {
  file: File
  preview: string
  type: 'main_building' | 'classroom' | 'laboratory' | 'facilities' | 'achievement_certificate'
  order: number
}

// Serializable version for localStorage
export interface PhotoMetadata {
  name: string
  size: number
  type: string
  preview: string
  photoType: 'main_building' | 'classroom' | 'laboratory' | 'facilities' | 'achievement_certificate'
  order: number
}

// Academic Programs (Page 3 - Courses & Programs)
interface CourseCategory {
  category: string
  subjects: string[]
  classLevels: string[]
  batchSizes: string
  duration: string
  certification: boolean
  feeStructure: string
}

interface AcademicPrograms {
  courseCategories: string[]
  totalCurrentStudents: number
  averageBatchSize: number
  studentTeacherRatio: string
  classTimings: string[]
  admissionTestRequired: boolean
  minimumQualification: string
  ageRestrictions?: string
  admissionFees: number
  securityDeposit?: number
  refundPolicy: string
}

// Financial Information (Page 4)
interface FinancialInformation {
  feeStructure: string
  paymentOptions: string[]
  scholarshipsAvailable: boolean
  installmentPlans: boolean
  additionalFees: string[]
}

// Results & Achievements (Page 5)
export interface AcademicResult {
  year: string
  passPercentage: number
  distinctionPercentage?: number
  topScorerName?: string
  topScorerMarks?: number
}

// Fee Structure & Policies (Page 6)
export interface FeeStructure {
  courseSubjectName: string
  oneTimeAdmissionFee: number
  monthlyFee: number
  quarterlyFee?: number
  annualFee?: number
  materialBookCharges?: number
  examFee?: number
  otherCharges?: string
  otherChargesAmount?: number
}

// Contact & Verification (Page 7 - FINAL PAGE)
export interface ContactVerification {
  // Contact Information
  primaryContactPerson: string
  designation: string
  directPhoneNumber: string
  emailAddress: string
  whatsappNumber?: string
  bestTimeToContact: string
  
  // Social Media & Online Presence
  facebookPage?: string
  instagramAccount?: string
  youtubeChannel?: string
  linkedinProfile?: string
  googleMyBusiness?: string
  
  // Emergency Contacts
  emergencyContactPerson: string
  emergencyContactPhone: string
  localPoliceStationContact?: string
  nearestHospitalContact?: string
  fireDepartmentContact?: string
  
  // Document Verification (uploads)
  businessRegistrationCertificate?: File
  educationBoardAffiliationCertificate?: File
  fireSafetyCertificate?: File
  buildingPlanApproval?: File
  panCard?: File
  gstCertificate?: File
  bankAccountDetails?: File
  institutionPhotographs: File[]
  
  // Optional Documents
  insuranceDocuments?: File[]
  accreditationCertificates?: File[]
  awardCertificates?: File[]
  facultyQualificationCertificates?: File[]
  safetyComplianceCertificates?: File[]
  
  // Final Verification
  mobileOtpVerified: boolean
  emailVerified: boolean
  documentVerificationStatus: 'pending' | 'approved' | 'rejected'
  physicalVerificationRequired: boolean
  backgroundCheckConsent: boolean
  
  // Final Submission
  termsAccepted: boolean
  submittedForReview: boolean
  emailConfirmationSent: boolean
  accountActivated: boolean
  reviewTimeline: string
  verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected'
}

export interface FeePolicies {
  // Detailed Fee Structure (repeatable per Course/Subject)
  feeStructures: FeeStructure[]
  
  // Payment Options
  paymentModesAccepted: string[]
  paymentSchedule: string
  
  // Fee Policies
  latePaymentPenalty: string
  refundPolicy: string
  scholarshipAvailable: boolean
  scholarshipCriteria?: string
  discountForMultipleCourses: boolean
  siblingDiscount: boolean
  earlyBirdDiscount: boolean
  
  // Financial Aid
  educationLoanAssistance: boolean
  installmentFacility: boolean
  hardshipSupport: boolean
}

export interface CompetitiveExamResult {
  examType: string
  year: string
  totalStudentsAppeared: number
  qualifiedStudents: number
  topRanksAchieved: string
  successPercentage: number
}

export interface SportsAchievement {
  sport: string
  achievement: string
  year: string
  level: string
  participants: number
}

export interface CulturalAchievement {
  category: string
  achievement: string
  year: string
  level: string
  participants: number
}

export interface CommunityService {
  activity: string
  description: string
  year: string
  participants: number
  impact: string
}

export interface ResultsAchievements {
  // Academic Results (last 3 years)
  academicResults: AcademicResult[]
  
  // Competitive Exam Results
  competitiveExamResults: CompetitiveExamResult[]
  
  // Sports & Cultural Achievements
  sportsAchievements: SportsAchievement[]
  culturalAchievements: CulturalAchievement[]
  
  // Community Service
  communityService: CommunityService[]
  
  // Awards & Recognition
  institutionAwards: string[]
  studentAchievements: string[]
  awardsReceived: string[]
  
  // Media & Recognition
  mediaRecognition: boolean
  
  // Accreditations
  governmentAccreditation: boolean
  boardAffiliationDetails: string
  universityAffiliation?: string
  professionalBodyMembership?: string
  qualityCertifications?: string
  certificateDocuments?: File[]
  
  // Success Stories
  alumniSuccessStories?: string
  placementRecords?: string
  higherStudiesAdmissions?: string
  scholarshipRecipients?: string
  alumniSuccess?: string
  futureGoals?: string
}

// Staff & Faculty (Page 4 - Faculty & Staff Information)
export interface DepartmentHead {
  name: string
  department: string
  qualification: string
  experience: number
  photo?: File
  specialization?: string
}

export interface StaffFaculty {
  // Faculty Details
  totalTeachingStaff: number
  totalNonTeachingStaff: number
  averageFacultyExperience: string
  
  // Principal/Director Information
  principalName: string
  principalQualification: string
  principalExperience: number
  principalPhoto?: File
  principalBio: string
  
  // Head of Departments
  departmentHeads: DepartmentHead[]
  
  // Faculty Qualifications
  phdHolders: number
  postGraduates: number
  graduates: number
  professionalCertified: number
  
  // Faculty Achievements
  awardsReceived: string
  publications: string
  industryExperience: string
  trainingProgramsAttended: string
}

// Final Review & Terms (Page 7)
interface FinalReviewTerms {
  agreeTerms: boolean
  agreeBackgroundVerification: boolean
  agreeDataAccuracy: boolean
  agreePrivacyPolicy: boolean
}

// Complete form data
interface InstitutionSignupData {
  // Step 0: Account Creation (handled separately)
  accountCreated: boolean
  emailVerified: boolean
  
  // Step 1-7: Profile Forms
  basicInformation: BasicInformation
  facilitiesDetails: FacilitiesDetails
  photos: PhotoFile[]
  academicPrograms: AcademicPrograms
  financialInformation: FinancialInformation
  staffFaculty: StaffFaculty
  resultsAchievements: ResultsAchievements
  feePolicies: FeePolicies
  contactVerification: ContactVerification
  finalReviewTerms: FinalReviewTerms
}

interface InstitutionSignupContextType {
  formData: InstitutionSignupData
  currentPage: number
  totalPages: number
  
  // Step 0: Account Management
  updateAccountStatus: (data: Partial<{ accountCreated: boolean; emailVerified: boolean }>) => void
  
  // Step 1-7: Profile Updates
  updateBasicInformation: (data: Partial<BasicInformation>) => void
  updateFacilitiesDetails: (data: Partial<FacilitiesDetails>) => void
  updatePhotos: (photos: PhotoFile[]) => void
  updateAcademicPrograms: (data: Partial<AcademicPrograms>) => void
  updateFinancialInformation: (data: Partial<FinancialInformation>) => void
  updateStaffFaculty: (data: Partial<StaffFaculty>) => void
  updateResultsAchievements: (data: Partial<ResultsAchievements>) => void
  updateFeePolicies: (data: Partial<FeePolicies>) => void
  updateContactVerification: (data: Partial<ContactVerification>) => void
  updateFinalReviewTerms: (data: Partial<FinalReviewTerms>) => void
  
  // Navigation
  nextPage: () => void
  goToNextPage: () => void
  previousPage: () => void
  goToPage: (page: number) => void
  resetToPage: (page: number) => void
  isPageComplete: (page: number) => boolean
  resetForm: () => void
  checkVerificationStatus: () => boolean
}

const defaultFormData: InstitutionSignupData = {
  // Step 0: Account Status
  accountCreated: false,
  emailVerified: false,
  
  // Step 1: Basic Information
  basicInformation: {
    institutionName: '',
    institutionType: '',
    registrationNumber: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    ownerName: '',
    ownerPhone: ''
  },
  facilitiesDetails: {
    totalClassrooms: 1,
    classroomCapacity: undefined,
    libraryAvailable: false,
    computerLab: false,
    wifiAvailable: false,
    parkingAvailable: false,
    cafeteriaCanteen: false,
    airConditioning: false,
    cctvSecurity: false,
    wheelchairAccessible: false,
    projectorsSmartBoards: false,
    audioSystem: false,
    laboratoryFacilities: [],
    sportsFacilities: [],
    transportationProvided: false,
    hostelFacility: false,
    studyMaterialProvided: false,
    onlineClasses: false,
    recordedSessions: false,
    mockTestsAssessments: false,
    careerCounseling: false,
    jobPlacementAssistance: false,
    photos: []
  },
  photos: [],
  academicPrograms: {
    courseCategories: [],
    totalCurrentStudents: 0,
    averageBatchSize: 0,
    studentTeacherRatio: '',
    classTimings: [],
    admissionTestRequired: false,
    minimumQualification: '',
    ageRestrictions: '',
    admissionFees: 0,
    securityDeposit: 0,
    refundPolicy: ''
  },
  financialInformation: {
    feeStructure: '',
    paymentOptions: [],
    scholarshipsAvailable: false,
    installmentPlans: false,
    additionalFees: []
  },
  staffFaculty: {
    // Faculty Details
    totalTeachingStaff: 0,
    totalNonTeachingStaff: 0,
    averageFacultyExperience: '',
    
    // Principal/Director Information
    principalName: '',
    principalQualification: '',
    principalExperience: 0,
    principalPhoto: undefined,
    principalBio: '',
    
    // Head of Departments
    departmentHeads: [],
    
    // Faculty Qualifications
    phdHolders: 0,
    postGraduates: 0,
    graduates: 0,
    professionalCertified: 0,
    
    // Faculty Achievements
    awardsReceived: '',
    publications: '',
    industryExperience: '',
    trainingProgramsAttended: ''
  },
  resultsAchievements: {
    academicResults: [],
    competitiveExamResults: [],
    sportsAchievements: [],
    culturalAchievements: [],
    communityService: [],
    institutionAwards: [],
    studentAchievements: [],
    awardsReceived: [],
    mediaRecognition: false,
    governmentAccreditation: false,
    boardAffiliationDetails: '',
    universityAffiliation: '',
    professionalBodyMembership: '',
    qualityCertifications: '',
    certificateDocuments: [],
    alumniSuccessStories: '',
    placementRecords: '',
    higherStudiesAdmissions: '',
    scholarshipRecipients: '',
    alumniSuccess: '',
    futureGoals: ''
  },
  feePolicies: {
    feeStructures: [],
    paymentModesAccepted: [],
    paymentSchedule: '',
    latePaymentPenalty: '',
    refundPolicy: '',
    scholarshipAvailable: false,
    scholarshipCriteria: '',
    discountForMultipleCourses: false,
    siblingDiscount: false,
    earlyBirdDiscount: false,
    educationLoanAssistance: false,
    installmentFacility: false,
    hardshipSupport: false
  },
  contactVerification: {
    primaryContactPerson: '',
    designation: '',
    directPhoneNumber: '',
    emailAddress: '',
    whatsappNumber: '',
    bestTimeToContact: '',
    facebookPage: '',
    instagramAccount: '',
    youtubeChannel: '',
    linkedinProfile: '',
    googleMyBusiness: '',
    emergencyContactPerson: '',
    emergencyContactPhone: '',
    localPoliceStationContact: '',
    nearestHospitalContact: '',
    fireDepartmentContact: '',
    businessRegistrationCertificate: undefined,
    educationBoardAffiliationCertificate: undefined,
    fireSafetyCertificate: undefined,
    buildingPlanApproval: undefined,
    panCard: undefined,
    gstCertificate: undefined,
    bankAccountDetails: undefined,
    institutionPhotographs: [],
    insuranceDocuments: [],
    accreditationCertificates: [],
    awardCertificates: [],
    facultyQualificationCertificates: [],
    safetyComplianceCertificates: [],
    mobileOtpVerified: false,
    emailVerified: false,
    documentVerificationStatus: 'pending',
    physicalVerificationRequired: false,
    backgroundCheckConsent: false,
    termsAccepted: false,
    submittedForReview: false,
    emailConfirmationSent: false,
    accountActivated: false,
    reviewTimeline: '5-7 business days',
    verificationStatus: 'pending'
  },
  finalReviewTerms: {
    agreeTerms: false,
    agreeBackgroundVerification: false,
    agreeDataAccuracy: false,
    agreePrivacyPolicy: false
  }
}

const InstitutionSignupContext = createContext<InstitutionSignupContextType | undefined>(undefined)

export const useInstitutionSignup = () => {
  const context = useContext(InstitutionSignupContext)
  if (context === undefined) {
    throw new Error('useInstitutionSignup must be used within an InstitutionSignupProvider')
  }
  return context
}

interface InstitutionSignupProviderProps {
  children: ReactNode
}

export const InstitutionSignupProvider: React.FC<InstitutionSignupProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<InstitutionSignupData>(defaultFormData)
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = 8

  // Check for existing verification status and restore context on mount
  React.useEffect(() => {
    console.log('InstitutionSignupProvider: checking for existing verification status')
    
    // Check if user has already verified their email
    const accountCreation = localStorage.getItem('institution_account_creation')
    if (accountCreation) {
      try {
        const accountData = JSON.parse(accountCreation)
        // If we have account creation data, check if user is signed in
        // First check localStorage for verification status
        if (accountData.emailVerified === true) {
          console.log('Email verified in localStorage, moving to Step 1')
          setFormData(prev => ({
            ...prev,
            accountCreated: true,
            emailVerified: true
          }))
          setCurrentPage(1)
          return
        }
        
        // If not verified in localStorage, check Supabase session
        const checkUserStatus = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user && user.email_confirmed_at) {
              // User is verified, move to Step 1
              console.log('User already verified, moving to Step 1')
              setFormData(prev => ({
                ...prev,
                accountCreated: true,
                emailVerified: true
              }))
    setCurrentPage(1)
            } else if (user && !user.email_confirmed_at) {
              // User exists but not verified, stay at Step 0
              console.log('User exists but not verified, staying at Step 0')
              setFormData(prev => ({
                ...prev,
                accountCreated: true,
                emailVerified: false
              }))
              setCurrentPage(0)
            } else {
              // No user session, start fresh
              console.log('No user session, starting fresh at Step 0')
              setCurrentPage(0)
            }
          } catch (error) {
            console.error('Error checking user status:', error)
            // On error, start fresh at Step 0
            setCurrentPage(0)
          }
        }
        checkUserStatus()
      } catch (error) {
        console.error('Error parsing account creation data:', error)
        setCurrentPage(0)
      }
    } else {
      // No account creation data, start fresh
      console.log('No account creation data, starting fresh at Step 0')
      setCurrentPage(0)
    }
  }, [])

  const updateAccountStatus = (data: Partial<{ accountCreated: boolean; emailVerified: boolean }>) => {
    setFormData(prev => {
      const newData = { ...prev, ...data }
      
      // Store verification status in localStorage for persistence
      if (data.emailVerified !== undefined) {
        const accountCreation = localStorage.getItem('institution_account_creation')
        if (accountCreation) {
          try {
            const accountData = JSON.parse(accountCreation)
            accountData.emailVerified = data.emailVerified
            localStorage.setItem('institution_account_creation', JSON.stringify(accountData))
          } catch (error) {
            console.error('Error updating localStorage:', error)
          }
        }
        
        // Also store in separate localStorage key for easier access
        localStorage.setItem('institution_email_verified', data.emailVerified.toString())
      }
      
      return newData
    })
  }

  const checkVerificationStatus = () => {
    // Check localStorage for verification status
    const emailVerified = localStorage.getItem('institution_email_verified') === 'true'
    const accountCreation = localStorage.getItem('institution_account_creation')
    
    if (emailVerified && accountCreation) {
      try {
        const accountData = JSON.parse(accountCreation)
        setFormData(prev => ({
          ...prev,
          accountCreated: true,
          emailVerified: true
        }))
        setCurrentPage(1)
        console.log('✅ Verification status restored from localStorage, moving to Step 1')
        return true
      } catch (error) {
        console.error('Error parsing account creation data:', error)
      }
    }
    
    return false
  }

  const updateBasicInformation = (data: Partial<BasicInformation>) => {
    setFormData(prev => ({
      ...prev,
      basicInformation: { ...prev.basicInformation, ...data }
    }))
  }

  const updateFacilitiesDetails = (data: Partial<FacilitiesDetails>) => {
    setFormData(prev => ({
      ...prev,
      facilitiesDetails: { ...prev.facilitiesDetails, ...data }
    }))
  }

  const updatePhotos = (photos: PhotoFile[]) => {
    setFormData(prev => ({ ...prev, photos }))
  }

  const updateAcademicPrograms = (data: Partial<AcademicPrograms>) => {
    setFormData(prev => ({
      ...prev,
      academicPrograms: { ...prev.academicPrograms, ...data }
    }))
  }

  const updateFinancialInformation = (data: Partial<FinancialInformation>) => {
    setFormData(prev => ({
      ...prev,
      financialInformation: { ...prev.financialInformation, ...data }
    }))
  }

  const updateStaffFaculty = (data: Partial<StaffFaculty>) => {
    setFormData(prev => ({
      ...prev,
      staffFaculty: { ...prev.staffFaculty, ...data }
    }))
  }

  const updateResultsAchievements = (data: Partial<ResultsAchievements>) => {
    setFormData(prev => ({
      ...prev,
      resultsAchievements: { ...prev.resultsAchievements, ...data }
    }))
  }

  const updateFeePolicies = (data: Partial<FeePolicies>) => {
    setFormData(prev => ({
      ...prev,
      feePolicies: { ...prev.feePolicies, ...data }
    }))
  }

  const updateContactVerification = (data: Partial<ContactVerification>) => {
    setFormData(prev => ({
      ...prev,
      contactVerification: { ...prev.contactVerification, ...data }
    }))
  }

  const updateFinalReviewTerms = (data: Partial<FinalReviewTerms>) => {
    setFormData(prev => ({
      ...prev,
      finalReviewTerms: { ...prev.finalReviewTerms, ...data }
    }))
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      console.log('nextPage: moving from', currentPage, 'to', currentPage + 1)
      setCurrentPage(currentPage + 1)
    }
  }

  const goToNextPage = () => {
    console.log('🔍 goToNextPage called:')
    console.log('  - currentPage:', currentPage)
    console.log('  - totalPages:', totalPages)
    console.log('  - can move next:', currentPage < totalPages - 1)
    
    if (currentPage < totalPages - 1) {
      console.log('✅ goToNextPage: moving from', currentPage, 'to', currentPage + 1)
      setCurrentPage(currentPage + 1)
    } else {
      console.log('❌ goToNextPage: cannot move next - already at last page or beyond')
    }
  }

  const previousPage = () => {
    if (currentPage > 0) {
      console.log('previousPage: moving from', currentPage, 'to', currentPage - 1)
      setCurrentPage(currentPage - 1)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Function to reset to a specific page
  const resetToPage = (page: number) => {
    if (page >= 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const isPageComplete = (page: number): boolean => {
    // Only validate on the final page (Page 7) - all other pages allow free navigation
    if (page === 7) {
      // Check all mandatory fields across all pages
      const basic = formData.basicInformation
      const facilities = formData.facilitiesDetails
      const academic = formData.academicPrograms
      const financial = formData.financialInformation
             const staff = formData.staffFaculty
       const results = formData.resultsAchievements
       const fees = formData.feePolicies
       const contact = formData.contactVerification
       const terms = formData.finalReviewTerms
      
      // Basic Information (Page 1) - Mandatory
      const basicComplete = !!(
        basic.institutionName &&
        basic.institutionType &&
        basic.registrationNumber &&
        basic.email &&
        basic.phone &&
        basic.address &&
        basic.city &&
        basic.state &&
        basic.pincode &&
        basic.ownerName &&
        basic.ownerPhone
      )
      
      // Facilities (Page 2) - Mandatory
      const facilitiesComplete = !!(
        facilities.totalClassrooms >= 1 &&
        facilities.totalClassrooms <= 100 &&
        formData.photos.some(p => p.type === 'main_building')
      )
      
      // Academic Programs (Page 3) - Mandatory
      const academicComplete = !!(
        academic.courseCategories.length > 0 &&
        academic.totalCurrentStudents > 0 &&
        academic.averageBatchSize > 0 &&
        academic.studentTeacherRatio &&
        academic.classTimings.length > 0 &&
        academic.minimumQualification &&
        academic.admissionFees > 0
      )
      
      // Financial Information (Page 4) - Mandatory
      const financialComplete = !!(
        financial.feeStructure &&
        financial.paymentOptions.length > 0
      )
      
             // Staff & Faculty (Page 4) - Mandatory
       const staffComplete = !!(
         staff.totalTeachingStaff > 0 &&
         staff.averageFacultyExperience &&
         staff.principalName &&
         staff.principalQualification &&
         staff.principalExperience > 0 &&
         staff.departmentHeads.length > 0
       )
      
      // Terms & Conditions (Page 7) - Mandatory
      const termsComplete = !!(
        terms.agreeTerms &&
        terms.agreeBackgroundVerification &&
        terms.agreeDataAccuracy &&
        terms.agreePrivacyPolicy
      )
      
             // Results & Achievements (Page 5) - Mandatory
       const resultsComplete = !!(
         results.academicResults.length > 0 &&
         results.boardAffiliationDetails
       )
       
       // Fee Structure & Policies (Page 6) - Mandatory
       const feesComplete = !!(
         fees.feeStructures.length > 0 &&
         fees.paymentModesAccepted.length > 0 &&
         fees.paymentSchedule &&
         fees.refundPolicy
       )
       
       // Contact & Verification (Page 7) - Mandatory
       const contactComplete = !!(
         contact.primaryContactPerson &&
         contact.designation &&
         contact.directPhoneNumber &&
         contact.emailAddress &&
         contact.bestTimeToContact &&
         contact.emergencyContactPerson &&
         contact.emergencyContactPhone &&
         contact.businessRegistrationCertificate &&
         contact.educationBoardAffiliationCertificate &&
         contact.fireSafetyCertificate &&
         contact.buildingPlanApproval &&
         contact.panCard &&
         contact.bankAccountDetails &&
         contact.institutionPhotographs.length >= 5 &&
         contact.backgroundCheckConsent &&
         contact.termsAccepted
       )
       
       return basicComplete && facilitiesComplete && academicComplete && financialComplete && staffComplete && resultsComplete && feesComplete && contactComplete && termsComplete
    }
    
    // For all other pages, allow navigation (return true)
    return true
  }

  const resetForm = () => {
    setFormData(defaultFormData)
    setCurrentPage(0)
  }
  


  const value: InstitutionSignupContextType = {
    formData,
    currentPage,
    totalPages,
    updateAccountStatus,
    updateBasicInformation,
    updateFacilitiesDetails,
    updatePhotos,
    updateAcademicPrograms,
    updateFinancialInformation,
    updateStaffFaculty,
    updateResultsAchievements,
    updateFeePolicies,
    updateContactVerification,
    updateFinalReviewTerms,
    nextPage,
    goToNextPage,
    previousPage,
    goToPage,
    resetToPage,
    isPageComplete,
    resetForm,
    checkVerificationStatus
  }

  return (
    <InstitutionSignupContext.Provider value={value}>
      {children}
    </InstitutionSignupContext.Provider>
  )
}
