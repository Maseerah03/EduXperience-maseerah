import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InstitutionFormData {
  // Basic Information
  institutionName: string;
  institutionType: string;
  establishmentYear: string;
  registrationNumber: string;
  panNumber: string;
  gstNumber: string;
  officialEmail: string;
  primaryContactNumber: string;
  secondaryContactNumber: string;
  websiteUrl: string;
  
  // Institution Details & Facilities
  totalClassrooms: string;
  classroomCapacity: string;
  libraryAvailable: boolean;
  computerLab: boolean;
  wifiAvailable: boolean;
  parkingAvailable: boolean;
  cafeteriaAvailable: boolean;
  airConditioning: boolean;
  cctvSecurity: boolean;
  wheelchairAccessible: boolean;
  projectorsSmartBoards: boolean;
  audioSystem: boolean;
  physicsLab: boolean;
  chemistryLab: boolean;
  biologyLab: boolean;
  languageLab: boolean;
  indoorGames: boolean;
  outdoorPlayground: boolean;
  gymnasium: boolean;
  swimmingPool: boolean;
  transportationProvided: boolean;
  hostelFacility: boolean;
  studyMaterialProvided: boolean;
  onlineClasses: boolean;
  recordedSessions: boolean;
  mockTestsAssessments: boolean;
  careerCounseling: boolean;
  jobPlacementAssistance: boolean;
  mainBuildingPhoto: File | null;
  classroomPhotos: File[];
  laboratoryPhotos: File[];
  facilitiesPhotos: File[];
  achievementPhotos: File[];
  
  // Courses & Programs
  cbse: boolean;
  icse: boolean;
  stateBoard: boolean;
  ibInternational: boolean;
  competitiveExams: boolean;
  professionalCourses: boolean;
  languageClasses: boolean;
  computerCourses: boolean;
  artsCrafts: boolean;
  musicDance: boolean;
  sportsTraining: boolean;
  subjectsOffered: string;
  beginner: boolean;
  intermediate: boolean;
  advanced: boolean;
  batchSizes: string;
  courseDuration: string;
  certificationProvided: boolean;
  courseFeeStructure: string;
  totalCurrentStudents: string;
  averageBatchSize: string;
  studentTeacherRatio: string;
  morningBatches: boolean;
  afternoonBatches: boolean;
  eveningBatches: boolean;
  weekendBatches: boolean;
  flexibleTimings: boolean;
  admissionTestRequired: boolean;
  minimumQualification: string;
  ageRestrictions: string;
  admissionFees: string;
  securityDeposit: string;
  refundPolicy: string;
  
  // Faculty & Staff Information
  totalTeachingStaff: string;
  totalNonTeachingStaff: string;
  averageFacultyExperience: string;
  principalName: string;
  principalQualification: string;
  principalExperience: string;
  principalPhoto: File | null;
  principalBio: string;
  departmentHeads: Array<{
    name: string;
    department: string;
    qualification: string;
    experience: string;
    photo: File | null;
    specialization: string;
  }>;
  phdHolders: string;
  postGraduates: string;
  graduates: string;
  professionalCertified: string;
  awardsReceived: string;
  publications: string;
  industryExperience: string;
  trainingProgramsAttended: string;
  
  // Results & Achievements
  boardExamResults: Array<{
    year: string;
    passPercentage: string;
    distinctionPercentage: string;
    topScorerName: string;
    topScorerMarks: string;
  }>;
  competitiveExamResults: Array<{
    examType: string;
    year: string;
    totalStudentsAppeared: string;
    qualifiedStudents: string;
    topRanksAchieved: string;
    successPercentage: string;
  }>;
  institutionAwards: string;
  studentAchievements: string;
  governmentAccreditation: boolean;
  boardAffiliationDetails: string;
  universityAffiliation: string;
  professionalBodyMembership: string;
  qualityCertifications: string;
  certificateDocuments: File[];
  alumniSuccessStories: string;
  placementRecords: string;
  higherStudiesAdmissions: string;
  scholarshipRecipients: string;
  
  // Fee Structure & Policies
  courseFeeStructures: Array<{
    courseSubjectName: string;
    admissionFee: string;
    monthlyFee: string;
    quarterlyFee: string;
    annualFee: string;
    materialCharges: string;
    examFee: string;
    otherCharges: string;
  }>;
  paymentModesAccepted: {
    cash: boolean;
    cheque: boolean;
    bankTransfer: boolean;
    onlinePayment: boolean;
    upi: boolean;
    creditDebitCards: boolean;
    emiAvailable: boolean;
  };
  paymentSchedule: string;
  latePaymentPenalty: string;
  scholarshipAvailable: boolean;
  scholarshipCriteria: string;
  discountMultipleCourses: boolean;
  siblingDiscount: boolean;
  earlyBirdDiscount: boolean;
  educationLoanAssistance: boolean;
  installmentFacility: boolean;
  hardshipSupport: boolean;
  
  // Contact & Verification
  primaryContactPerson: string;
  designation: string;
  directPhoneNumber: string;
  contactEmailAddress: string;
  whatsappNumber: string;
  bestTimeToContact: string;
  facebookPage: string;
  instagramAccount: string;
  youtubeChannel: string;
  linkedinProfile: string;
  googleMyBusiness: string;
  emergencyContactPerson: string;
  emergencyContactPhone: string;
  localPoliceStationContact: string;
  nearestHospitalContact: string;
  fireDepartmentContact: string;
  businessRegistrationCertificate: File | null;
  educationBoardAffiliationCertificate: File | null;
  fireSafetyCertificate: File | null;
  buildingPlanApproval: File | null;
  panCardDocument: File | null;
  gstCertificate: File | null;
  bankAccountDetails: File | null;
  institutionPhotographs: File[];
  insuranceDocuments: File[];
  accreditationCertificates: File[];
  awardCertificates: File[];
  facultyQualificationCertificates: File[];
  safetyComplianceCertificates: File[];
  mobileOtpVerified: boolean;
  emailVerified: boolean;
  backgroundCheckConsent: boolean;
  
  // Address Information
  completeAddress: string;
  city: string;
  state: string;
  pinCode: string;
  landmark: string;
  googleMapsLocation: string;
  
  // Legal Information
  ownerName: string;
  ownerContactNumber: string;
  businessLicense: File | null;
  registrationCertificate: File | null;
  
  // Terms
  agreeToTerms: boolean;
  agreeToBackgroundVerification: boolean;
  
  // Password
  password: string;
  confirmPassword: string;
}

const INSTITUTION_TYPES = [
  "School",
  "College",
  "University",
  "Training Institute",
  "Coaching Center",
  "Online Learning Platform",
  "Other"
];

const ESTABLISHMENT_YEARS = Array.from({ length: 50 }, (_, i) => (2024 - i).toString());

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const CITIES = [
  "Mumbai",
  "Delhi", 
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Surat",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Bhopal",
  "Patna",
  "Vadodara",
  "Chandigarh",
  "Coimbatore",
  "Kochi",
  "Other"
];

export default function InstitutionSignUp() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<InstitutionFormData>({
    institutionName: "",
    institutionType: "",
    establishmentYear: "",
    registrationNumber: "",
    panNumber: "",
    gstNumber: "",
    officialEmail: "",
    primaryContactNumber: "",
    secondaryContactNumber: "",
    websiteUrl: "",
    totalClassrooms: "",
    classroomCapacity: "",
    libraryAvailable: false,
    computerLab: false,
    wifiAvailable: false,
    parkingAvailable: false,
    cafeteriaAvailable: false,
    airConditioning: false,
    cctvSecurity: false,
    wheelchairAccessible: false,
    projectorsSmartBoards: false,
    audioSystem: false,
    physicsLab: false,
    chemistryLab: false,
    biologyLab: false,
    languageLab: false,
    indoorGames: false,
    outdoorPlayground: false,
    gymnasium: false,
    swimmingPool: false,
    transportationProvided: false,
    hostelFacility: false,
    studyMaterialProvided: false,
    onlineClasses: false,
    recordedSessions: false,
    mockTestsAssessments: false,
    careerCounseling: false,
    jobPlacementAssistance: false,
    mainBuildingPhoto: null,
    classroomPhotos: [],
    laboratoryPhotos: [],
    facilitiesPhotos: [],
    achievementPhotos: [],
    cbse: false,
    icse: false,
    stateBoard: false,
    ibInternational: false,
    competitiveExams: false,
    professionalCourses: false,
    languageClasses: false,
    computerCourses: false,
    artsCrafts: false,
    musicDance: false,
    sportsTraining: false,
    subjectsOffered: "",
    beginner: false,
    intermediate: false,
    advanced: false,
    batchSizes: "",
    courseDuration: "",
    certificationProvided: false,
    courseFeeStructure: "",
    totalCurrentStudents: "",
    averageBatchSize: "",
    studentTeacherRatio: "",
    morningBatches: false,
    afternoonBatches: false,
    eveningBatches: false,
    weekendBatches: false,
    flexibleTimings: false,
    admissionTestRequired: false,
    minimumQualification: "",
    ageRestrictions: "",
    admissionFees: "",
    securityDeposit: "",
    refundPolicy: "",
    totalTeachingStaff: "",
    totalNonTeachingStaff: "",
    averageFacultyExperience: "",
    principalName: "",
    principalQualification: "",
    principalExperience: "",
    principalPhoto: null,
    principalBio: "",
    departmentHeads: [{
      name: "",
      department: "",
      qualification: "",
      experience: "",
      photo: null,
      specialization: ""
    }],
    phdHolders: "",
    postGraduates: "",
    graduates: "",
    professionalCertified: "",
    awardsReceived: "",
    publications: "",
    industryExperience: "",
    trainingProgramsAttended: "",
    boardExamResults: [{
      year: "",
      passPercentage: "",
      distinctionPercentage: "",
      topScorerName: "",
      topScorerMarks: ""
    }],
    competitiveExamResults: [{
      examType: "",
      year: "",
      totalStudentsAppeared: "",
      qualifiedStudents: "",
      topRanksAchieved: "",
      successPercentage: ""
    }],
    institutionAwards: "",
    studentAchievements: "",
    governmentAccreditation: false,
    boardAffiliationDetails: "",
    universityAffiliation: "",
    professionalBodyMembership: "",
    qualityCertifications: "",
    certificateDocuments: [],
    alumniSuccessStories: "",
    placementRecords: "",
    higherStudiesAdmissions: "",
    scholarshipRecipients: "",
    courseFeeStructures: [{
      courseSubjectName: "",
      admissionFee: "",
      monthlyFee: "",
      quarterlyFee: "",
      annualFee: "",
      materialCharges: "",
      examFee: "",
      otherCharges: ""
    }],
    paymentModesAccepted: {
      cash: false,
      cheque: false,
      bankTransfer: false,
      onlinePayment: false,
      upi: false,
      creditDebitCards: false,
      emiAvailable: false
    },
    paymentSchedule: "",
    latePaymentPenalty: "",
    scholarshipAvailable: false,
    scholarshipCriteria: "",
    discountMultipleCourses: false,
    siblingDiscount: false,
    earlyBirdDiscount: false,
    educationLoanAssistance: false,
    installmentFacility: false,
    hardshipSupport: false,
    primaryContactPerson: "",
    designation: "",
    directPhoneNumber: "",
    contactEmailAddress: "",
    whatsappNumber: "",
    bestTimeToContact: "",
    facebookPage: "",
    instagramAccount: "",
    youtubeChannel: "",
    linkedinProfile: "",
    googleMyBusiness: "",
    emergencyContactPerson: "",
    emergencyContactPhone: "",
    localPoliceStationContact: "",
    nearestHospitalContact: "",
    fireDepartmentContact: "",
    businessRegistrationCertificate: null,
    educationBoardAffiliationCertificate: null,
    fireSafetyCertificate: null,
    buildingPlanApproval: null,
    panCardDocument: null,
    gstCertificate: null,
    bankAccountDetails: null,
    institutionPhotographs: [],
    insuranceDocuments: [],
    accreditationCertificates: [],
    awardCertificates: [],
    facultyQualificationCertificates: [],
    safetyComplianceCertificates: [],
    mobileOtpVerified: false,
    emailVerified: false,
    backgroundCheckConsent: false,
    completeAddress: "",
    city: "",
    state: "",
    pinCode: "",
    landmark: "",
    googleMapsLocation: "",
    ownerName: "",
    ownerContactNumber: "",
    businessLicense: null,
    registrationCertificate: null,
    agreeToTerms: false,
    agreeToBackgroundVerification: false,
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<Partial<InstitutionFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [submitCooldown, setSubmitCooldown] = useState(0);

  const handleInputChange = (field: keyof InstitutionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addDepartmentHead = () => {
    setFormData(prev => ({
      ...prev,
      departmentHeads: [...prev.departmentHeads, {
        name: "",
        department: "",
        qualification: "",
        experience: "",
        photo: null,
        specialization: ""
      }]
    }));
  };

  const removeDepartmentHead = (index: number) => {
    setFormData(prev => ({
      ...prev,
      departmentHeads: prev.departmentHeads.filter((_, i) => i !== index)
    }));
  };

  const updateDepartmentHead = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      departmentHeads: prev.departmentHeads.map((head, i) => 
        i === index ? { ...head, [field]: value } : head
      )
    }));
  };

  const addBoardExamResult = () => {
    setFormData(prev => ({
      ...prev,
      boardExamResults: [...prev.boardExamResults, {
        year: "",
        passPercentage: "",
        distinctionPercentage: "",
        topScorerName: "",
        topScorerMarks: ""
      }]
    }));
  };

  const removeBoardExamResult = (index: number) => {
    setFormData(prev => ({
      ...prev,
      boardExamResults: prev.boardExamResults.filter((_, i) => i !== index)
    }));
  };

  const updateBoardExamResult = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      boardExamResults: prev.boardExamResults.map((result, i) => 
        i === index ? { ...result, [field]: value } : result
      )
    }));
  };

  const addCompetitiveExamResult = () => {
    setFormData(prev => ({
      ...prev,
      competitiveExamResults: [...prev.competitiveExamResults, {
        examType: "",
        year: "",
        totalStudentsAppeared: "",
        qualifiedStudents: "",
        topRanksAchieved: "",
        successPercentage: ""
      }]
    }));
  };

  const removeCompetitiveExamResult = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competitiveExamResults: prev.competitiveExamResults.filter((_, i) => i !== index)
    }));
  };

  const updateCompetitiveExamResult = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      competitiveExamResults: prev.competitiveExamResults.map((result, i) => 
        i === index ? { ...result, [field]: value } : result
      )
    }));
  };

  const addCourseFeeStructure = () => {
    setFormData(prev => ({
      ...prev,
      courseFeeStructures: [...prev.courseFeeStructures, {
        courseSubjectName: "",
        admissionFee: "",
        monthlyFee: "",
        quarterlyFee: "",
        annualFee: "",
        materialCharges: "",
        examFee: "",
        otherCharges: ""
      }]
    }));
  };

  const removeCourseFeeStructure = (index: number) => {
    setFormData(prev => ({
      ...prev,
      courseFeeStructures: prev.courseFeeStructures.filter((_, i) => i !== index)
    }));
  };

  const updateCourseFeeStructure = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      courseFeeStructures: prev.courseFeeStructures.map((structure, i) => 
        i === index ? { ...structure, [field]: value } : structure
      )
    }));
  };

  const validatePage = (page: number): boolean => {
    const newErrors: Partial<InstitutionFormData> = {};

    if (page === 1) {
      if (!formData.institutionName.trim()) {
        newErrors.institutionName = "Institution name is required";
      }
      if (!formData.institutionType) {
        newErrors.institutionType = "Institution type is required";
      }
      if (!formData.establishmentYear) {
        newErrors.establishmentYear = "Establishment year is required";
      }
      if (!formData.registrationNumber.trim()) {
        newErrors.registrationNumber = "Registration number is required";
      }
      if (!formData.panNumber.trim()) {
        newErrors.panNumber = "PAN number is required";
      }
      if (!formData.officialEmail.trim()) {
        newErrors.officialEmail = "Official email is required";
      }
      if (!formData.primaryContactNumber.trim()) {
        newErrors.primaryContactNumber = "Primary contact number is required";
      }
      if (!formData.completeAddress.trim()) {
        newErrors.completeAddress = "Complete address is required";
      }
      if (!formData.city) {
        newErrors.city = "City is required";
      }
      if (!formData.state) {
        newErrors.state = "State is required";
      }
      if (!formData.pinCode.trim()) {
        newErrors.pinCode = "Pin code is required";
      }
      if (!formData.ownerName.trim()) {
        newErrors.ownerName = "Owner name is required";
      }
      if (!formData.ownerContactNumber.trim()) {
        newErrors.ownerContactNumber = "Owner contact number is required";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirm password is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "You must agree to terms and conditions";
      }
      if (!formData.agreeToBackgroundVerification) {
        newErrors.agreeToBackgroundVerification = "You must agree to background verification";
      }
    }

    if (page === 2) {
      if (!formData.totalClassrooms.trim()) {
        newErrors.totalClassrooms = "Total classrooms is required";
      }
      if (!formData.classroomCapacity.trim()) {
        newErrors.classroomCapacity = "Classroom capacity is required";
      }
      if (!formData.mainBuildingPhoto) {
        newErrors.mainBuildingPhoto = "Main building photo is required";
      }
    }

    if (page === 3) {
      if (!formData.totalCurrentStudents.trim()) {
        newErrors.totalCurrentStudents = "Total current students is required";
      }
      if (!formData.averageBatchSize.trim()) {
        newErrors.averageBatchSize = "Average batch size is required";
      }
      if (!formData.studentTeacherRatio.trim()) {
        newErrors.studentTeacherRatio = "Student-teacher ratio is required";
      }
      if (!formData.admissionFees.trim()) {
        newErrors.admissionFees = "Admission fees is required";
      }
      if (!formData.refundPolicy.trim()) {
        newErrors.refundPolicy = "Refund policy is required";
      }
    }

    if (page === 4) {
      if (!formData.totalTeachingStaff.trim()) {
        newErrors.totalTeachingStaff = "Total teaching staff is required";
      }
      if (!formData.averageFacultyExperience) {
        newErrors.averageFacultyExperience = "Average faculty experience is required";
      }
      if (!formData.principalName.trim()) {
        newErrors.principalName = "Principal name is required";
      }
      if (!formData.principalQualification.trim()) {
        newErrors.principalQualification = "Principal qualification is required";
      }
      if (!formData.principalExperience.trim()) {
        newErrors.principalExperience = "Principal experience is required";
      }
      if (!formData.principalPhoto) {
        newErrors.principalPhoto = "Principal photo is required";
      }
    }

    if (page === 5) {
      if (!formData.boardAffiliationDetails.trim()) {
        newErrors.boardAffiliationDetails = "Board affiliation details is required";
      }
    }

    if (page === 6) {
      if (!formData.refundPolicy.trim()) {
        newErrors.refundPolicy = "Refund policy is required";
      }
    }

    if (page === 7) {
      // Contact Information
      if (!formData.primaryContactPerson.trim()) {
        newErrors.primaryContactPerson = "Primary contact person is required";
      }
      if (!formData.designation) {
        newErrors.designation = "Designation is required";
      }
      if (!formData.directPhoneNumber.trim()) {
        newErrors.directPhoneNumber = "Direct phone number is required";
      }
      if (!formData.contactEmailAddress.trim()) {
        newErrors.contactEmailAddress = "Contact email address is required";
      }
      if (!formData.bestTimeToContact.trim()) {
        newErrors.bestTimeToContact = "Best time to contact is required";
      }
      
      // Emergency Contacts
      if (!formData.emergencyContactPerson.trim()) {
        newErrors.emergencyContactPerson = "Emergency contact person is required";
      }
      if (!formData.emergencyContactPhone.trim()) {
        newErrors.emergencyContactPhone = "Emergency contact phone is required";
      }
      
      // Required Documents
      if (!formData.businessRegistrationCertificate) {
        newErrors.businessRegistrationCertificate = "Business registration certificate is required";
      }
      if (!formData.educationBoardAffiliationCertificate) {
        newErrors.educationBoardAffiliationCertificate = "Education board affiliation certificate is required";
      }
      if (!formData.fireSafetyCertificate) {
        newErrors.fireSafetyCertificate = "Fire safety certificate is required";
      }
      if (!formData.buildingPlanApproval) {
        newErrors.buildingPlanApproval = "Building plan approval is required";
      }
      if (!formData.panCardDocument) {
        newErrors.panCardDocument = "PAN card document is required";
      }
      if (!formData.bankAccountDetails) {
        newErrors.bankAccountDetails = "Bank account details are required";
      }
      if (!formData.institutionPhotographs || formData.institutionPhotographs.length < 5) {
        newErrors.institutionPhotographs = "Minimum 5 institution photographs are required";
      }
      
      // Final Verification
      // Background check consent validation removed as requested
    }

    // Add detailed logging for debugging
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors found:', newErrors);
      console.log('Failed fields:', Object.keys(newErrors));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextPage = () => {
    if (validatePage(currentPage)) {
      setCurrentPage(prev => Math.min(prev + 1, 7));
    }
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const sendOTP = async () => {
    if (!formData.primaryContactNumber || formData.primaryContactNumber.length !== 10) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    // Simulate OTP sending
    setOtpSent(true);
    toast({
      title: "OTP Sent",
      description: `OTP sent to ${formData.primaryContactNumber}`,
    });
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    // Simulate OTP verification
    setOtpVerified(true);
    toast({
      title: "OTP Verified",
      description: "Phone number verified successfully",
    });
  };

  const handleFileUpload = (field: keyof InstitutionFormData, file: File | File[] | null) => {
    if (!file) {
      // If no file, just update the field with null
      handleInputChange(field, null);
      return;
    }

    if (Array.isArray(file)) {
      // Handle array of files
      for (const singleFile of file) {
        if (!singleFile || !singleFile.name) {
          toast({
            title: "Error",
            description: "Invalid file selected",
            variant: "destructive",
          });
          return;
        }

        if (singleFile.size > 5 * 1024 * 1024) {
          toast({
            title: "Error",
            description: "File size must be less than 5MB",
            variant: "destructive",
          });
          return;
        }
        
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
        const fileExtension = singleFile.name.toLowerCase().substring(singleFile.name.lastIndexOf('.'));
        if (!allowedTypes.includes(fileExtension)) {
          toast({
            title: "Error",
            description: "Only JPG, PNG, and PDF files are allowed",
            variant: "destructive",
          });
          return;
        }
      }
    } else {
      // Handle single file
      if (!file.name) {
        toast({
          title: "Error",
          description: "Invalid file selected",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Error",
          description: "Only JPG, PNG, and PDF files are allowed",
          variant: "destructive",
        });
        return;
      }
    }
    
    handleInputChange(field, file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check cooldown
    if (submitCooldown > 0) {
      toast({
        title: "Please Wait",
        description: `Please wait ${submitCooldown} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }
    
    console.log('Submit button clicked, current page:', currentPage);
    console.log('Form data:', formData);
    
    if (!validatePage(currentPage)) {
      console.log('Validation failed for page:', currentPage);
      return;
    }
    
    console.log('Validation passed, proceeding with submission...');

    setIsLoading(true);
    
    // Set cooldown timer
    setSubmitCooldown(20);
    const cooldownInterval = setInterval(() => {
      setSubmitCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.officialEmail,
        password: formData.password,
        phone: formData.primaryContactNumber,
      });

      if (authError) throw authError;

             if (authData.user) {
        // 2. Create profile
         const { error: profileError } = await supabase
           .from('profiles')
           .upsert({
             user_id: authData.user.id,
            full_name: formData.institutionName,
            email: formData.officialEmail,
             role: 'institution',
            phone: formData.primaryContactNumber,
            bio: `Institution Type: ${formData.institutionType}`
           }, {
             onConflict: 'user_id',
             ignoreDuplicates: false
           });

         if (profileError) throw profileError;

        // 3. Create comprehensive institution profile
         try {
           const { error: institutionError } = await supabase
             .from('institution_profiles')
             .upsert({
               // Basic Information
               user_id: authData.user.id,
               institution_name: formData.institutionName,
               institution_type: formData.institutionType,
               establishment_year: formData.establishmentYear,
               registration_number: formData.registrationNumber,
               pan_number: formData.panNumber,
               gst_number: formData.gstNumber,
               official_email: formData.officialEmail,
               primary_contact: formData.primaryContactNumber,
               secondary_contact: formData.secondaryContactNumber,
               website_url: formData.websiteUrl,
               
               // Infrastructure & Facilities
               total_classrooms: parseInt(formData.totalClassrooms) || 0,
               classroom_capacity: parseInt(formData.classroomCapacity) || 0,
               library_available: formData.libraryAvailable,
               computer_lab: formData.computerLab,
               wifi_available: formData.wifiAvailable,
               parking_available: formData.parkingAvailable,
               cafeteria_available: formData.cafeteriaAvailable,
               air_conditioning: formData.airConditioning,
               cctv_security: formData.cctvSecurity,
               wheelchair_accessible: formData.wheelchairAccessible,
               projectors_smart_boards: formData.projectorsSmartBoards,
               audio_system: formData.audioSystem,
               physics_lab: formData.physicsLab,
               chemistry_lab: formData.chemistryLab,
               biology_lab: formData.biologyLab,
               language_lab: formData.languageLab,
               indoor_games: formData.indoorGames,
               outdoor_playground: formData.outdoorPlayground,
               gymnasium: formData.gymnasium,
               swimming_pool: formData.swimmingPool,
               transportation_provided: formData.transportationProvided,
               hostel_facility: formData.hostelFacility,
               study_material_provided: formData.studyMaterialProvided,
               online_classes: formData.onlineClasses,
               recorded_sessions: formData.recordedSessions,
               mock_tests_assessments: formData.mockTestsAssessments,
               career_counseling: formData.careerCounseling,
               job_placement_assistance: formData.jobPlacementAssistance,
               
               // Address Information
               complete_address: formData.completeAddress,
               city: formData.city,
               state: formData.state,
               pin_code: formData.pinCode,
               landmark: formData.landmark,
               google_maps_location: formData.googleMapsLocation,
               
               // Legal Information
               owner_name: formData.ownerName,
               owner_contact: formData.ownerContactNumber,
               verified: false,
               
               // Courses & Programs
               cbse: formData.cbse,
               icse: formData.icse,
               state_board: formData.stateBoard,
               ib_international: formData.ibInternational,
               competitive_exams: formData.competitiveExams,
               professional_courses: formData.professionalCourses,
               language_classes: formData.languageClasses,
               computer_courses: formData.computerCourses,
               arts_crafts: formData.artsCrafts,
               music_dance: formData.musicDance,
               sports_training: formData.sportsTraining,
               subjects_offered: formData.subjectsOffered,
               beginner: formData.beginner,
               intermediate: formData.intermediate,
               advanced: formData.advanced,
               batch_sizes: formData.batchSizes,
               course_duration: formData.courseDuration,
               certification_provided: formData.certificationProvided,
               course_fee_structure: formData.courseFeeStructure,
               total_current_students: parseInt(formData.totalCurrentStudents) || 0,
               average_batch_size: parseInt(formData.averageBatchSize) || 0,
               student_teacher_ratio: formData.studentTeacherRatio,
               morning_batches: formData.morningBatches,
               afternoon_batches: formData.afternoonBatches,
               evening_batches: formData.eveningBatches,
               weekend_batches: formData.weekendBatches,
               flexible_timings: formData.flexibleTimings,
               admission_test_required: formData.admissionTestRequired,
               minimum_qualification: formData.minimumQualification,
               age_restrictions: formData.ageRestrictions,
               admission_fees: parseFloat(formData.admissionFees) || 0,
               security_deposit: parseFloat(formData.securityDeposit) || 0,
               refund_policy: formData.refundPolicy,
               
               // Faculty & Staff
               total_teaching_staff: parseInt(formData.totalTeachingStaff) || 0,
               total_non_teaching_staff: parseInt(formData.totalNonTeachingStaff) || 0,
               average_faculty_experience: formData.averageFacultyExperience,
               principal_name: formData.principalName,
               principal_qualification: formData.principalQualification,
               principal_experience: parseInt(formData.principalExperience) || 0,
               principal_bio: formData.principalBio,
               department_heads: formData.departmentHeads,
               phd_holders: parseInt(formData.phdHolders) || 0,
               post_graduates: parseInt(formData.postGraduates) || 0,
               graduates: parseInt(formData.graduates) || 0,
               professional_certified: parseInt(formData.professionalCertified) || 0,
               awards_received: formData.awardsReceived,
               publications: formData.publications,
               industry_experience: formData.industryExperience,
               training_programs_attended: formData.trainingProgramsAttended,
               
               // Results & Achievements
               board_exam_results: formData.boardExamResults,
               competitive_exam_results: formData.competitiveExamResults,
               institution_awards: formData.institutionAwards,
               student_achievements: formData.studentAchievements,
               government_accreditation: formData.governmentAccreditation,
               board_affiliation_details: formData.boardAffiliationDetails,
               university_affiliation: formData.universityAffiliation,
               professional_body_membership: formData.professionalBodyMembership,
               quality_certifications: formData.qualityCertifications,
               alumni_success_stories: formData.alumniSuccessStories,
               placement_records: formData.placementRecords,
               higher_studies_admissions: formData.higherStudiesAdmissions,
               scholarship_recipients: formData.scholarshipRecipients,
               
               // Fee Structure & Policies
               course_fee_structures: formData.courseFeeStructures,
               payment_modes_accepted: formData.paymentModesAccepted,
               payment_schedule: formData.paymentSchedule,
               late_payment_penalty: formData.latePaymentPenalty,
               refund_policy_detailed: formData.refundPolicy,
               scholarship_available: formData.scholarshipAvailable,
               scholarship_criteria: formData.scholarshipCriteria,
               discount_multiple_courses: formData.discountMultipleCourses,
               sibling_discount: formData.siblingDiscount,
               early_bird_discount: formData.earlyBirdDiscount,
               education_loan_assistance: formData.educationLoanAssistance,
               installment_facility: formData.installmentFacility,
               hardship_support: formData.hardshipSupport,
               
               // Contact & Verification
               primary_contact_person: formData.primaryContactPerson,
               designation: formData.designation,
               direct_phone_number: formData.directPhoneNumber,
               contact_email_address: formData.contactEmailAddress,
               whatsapp_number: formData.whatsappNumber,
               best_time_to_contact: formData.bestTimeToContact,
               facebook_page: formData.facebookPage,
               instagram_account: formData.instagramAccount,
               youtube_channel: formData.youtubeChannel,
               linkedin_profile: formData.linkedinProfile,
               google_my_business: formData.googleMyBusiness,
               emergency_contact_person: formData.emergencyContactPerson,
               emergency_contact_phone: formData.emergencyContactPhone,
               local_police_station_contact: formData.localPoliceStationContact,
               nearest_hospital_contact: formData.nearestHospitalContact,
               fire_department_contact: formData.fireDepartmentContact,
               mobile_otp_verified: formData.mobileOtpVerified,
               email_verified: formData.emailVerified,
               background_check_consent: formData.backgroundCheckConsent,
               
               // Timestamps
               created_at: new Date().toISOString(),
               updated_at: new Date().toISOString()
             }, {
               onConflict: 'user_id',
               ignoreDuplicates: false
             });

           if (institutionError) {
             console.error('Could not create institution profile:', institutionError);
             throw institutionError;
           }
         } catch (error) {
           console.error('Institution profiles table error:', error);
           throw error;
         }

         // 4. Create course fee structures (separate table for complex data)
         // Commented out due to missing table in database schema
         // if (formData.courseFeeStructures && formData.courseFeeStructures.length > 0) {
         //   try {
         //     const feeStructuresData = formData.courseFeeStructures.map(fee => ({
         //       user_id: authData.user.id,
         //       course_subject_name: fee.courseSubjectName,
         //       admission_fee: parseFloat(fee.admissionFee) || 0,
         //       monthly_fee: parseFloat(fee.monthlyFee) || 0,
         //       quarterly_fee: parseFloat(fee.quarterlyFee) || 0,
         //       annual_fee: parseFloat(fee.annualFee) || 0,
         //       material_charges: parseFloat(fee.materialCharges) || 0,
         //       exam_fee: parseFloat(fee.examFee) || 0,
         //       other_charges: parseFloat(fee.otherCharges) || 0,
         //       created_at: new Date().toISOString()
         //     }));

         //     const { error: feeStructuresError } = await supabase
         //       .from('institution_course_fees')
         //       .insert(feeStructuresData);

         //     if (feeStructuresError) {
         //       console.error('Could not create course fee structures:', feeStructuresError);
         //       // Don't throw error here as main profile was created
         //     }
         //   } catch (error) {
         //     console.error('Course fee structures table error:', error);
         //     // Don't throw error here as main profile was created
         //   }
         // }

        toast({
          title: "Success!",
          description: "Institution profile created successfully! Redirecting to dashboard...",
        });

        // Redirect to institution dashboard after a short delay
        setTimeout(() => {
          navigate('/institution-dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      
      let errorMessage = "Failed to create account. Please try again.";
      
      // Handle specific Supabase auth errors
      if (error.message?.includes("20 seconds")) {
        errorMessage = "Please wait 20 seconds before trying again. This is a security measure.";
      } else if (error.message?.includes("already registered")) {
        errorMessage = "An account with this email already exists. Please use a different email or try logging in.";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message?.includes("password")) {
        errorMessage = "Password must be at least 6 characters long.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage1 = () => (
    <div className="space-y-6">
            <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 1 of 7: Institution Basic Information</h2>
        <p className="text-gray-600">Tell us about your institution</p>
              </div>
            
                <div className="space-y-4">
                  <div>
          <Label htmlFor="institutionName">Institution Name *</Label>
                    <Input
            id="institutionName"
            value={formData.institutionName}
            onChange={(e) => handleInputChange('institutionName', e.target.value)}
                      placeholder="Enter your institution name"
            className={errors.institutionName ? "border-red-500" : ""}
                    />
          {errors.institutionName && <p className="text-red-500 text-sm mt-1">{errors.institutionName}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
            <Label htmlFor="institutionType">Institution Type *</Label>
            <Select value={formData.institutionType} onValueChange={(value) => handleInputChange('institutionType', value)}>
              <SelectTrigger className={errors.institutionType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select institution type" />
              </SelectTrigger>
              <SelectContent>
                {INSTITUTION_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.institutionType && <p className="text-red-500 text-sm mt-1">{errors.institutionType}</p>}
          </div>

          <div>
            <Label htmlFor="establishmentYear">Establishment Year *</Label>
            <Select value={formData.establishmentYear} onValueChange={(value) => handleInputChange('establishmentYear', value)}>
              <SelectTrigger className={errors.establishmentYear ? "border-red-500" : ""}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {ESTABLISHMENT_YEARS.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.establishmentYear && <p className="text-red-500 text-sm mt-1">{errors.establishmentYear}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="registrationNumber">Registration Number *</Label>
                      <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              placeholder="Enter registration number"
              className={errors.registrationNumber ? "border-red-500" : ""}
            />
            {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
          </div>

          <div>
            <Label htmlFor="panNumber">PAN Number *</Label>
            <Input
              id="panNumber"
              value={formData.panNumber}
              onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              maxLength={10}
              className={errors.panNumber ? "border-red-500" : ""}
            />
            {errors.panNumber && <p className="text-red-500 text-sm mt-1">{errors.panNumber}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="gstNumber">GST Number *</Label>
          <Input
            id="gstNumber"
            value={formData.gstNumber}
            onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
            placeholder="22ABCDE1234F1Z5"
            maxLength={15}
            className={errors.gstNumber ? "border-red-500" : ""}
          />
          {errors.gstNumber && <p className="text-red-500 text-sm mt-1">{errors.gstNumber}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="officialEmail">Official Email *</Label>
            <Input
              id="officialEmail"
                        type="email"
              value={formData.officialEmail}
              onChange={(e) => handleInputChange('officialEmail', e.target.value)}
              placeholder="admin@institution.com"
              className={errors.officialEmail ? "border-red-500" : ""}
            />
            {errors.officialEmail && <p className="text-red-500 text-sm mt-1">{errors.officialEmail}</p>}
                    </div>

                    <div>
            <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
                      <Input
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              placeholder="https://www.institution.com"
              className={errors.websiteUrl ? "border-red-500" : ""}
            />
            {errors.websiteUrl && <p className="text-red-500 text-sm mt-1">{errors.websiteUrl}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
            <Label htmlFor="primaryContactNumber">Primary Contact Number *</Label>
                      <Input
              id="primaryContactNumber"
              value={formData.primaryContactNumber}
              onChange={(e) => handleInputChange('primaryContactNumber', e.target.value)}
              placeholder="9876543210"
              maxLength={10}
              className={errors.primaryContactNumber ? "border-red-500" : ""}
            />
            {errors.primaryContactNumber && <p className="text-red-500 text-sm mt-1">{errors.primaryContactNumber}</p>}
                    </div>

                    <div>
            <Label htmlFor="secondaryContactNumber">Secondary Contact Number (Optional)</Label>
                      <Input
              id="secondaryContactNumber"
              value={formData.secondaryContactNumber}
              onChange={(e) => handleInputChange('secondaryContactNumber', e.target.value)}
              placeholder="9876543210"
              maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={errors.password ? "border-red-500" : ""}
                      />
                      {errors.password && (
                        <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        <p>Requirements:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li className={formData.password.length >= 8 && formData.password.length <= 20 ? "text-green-600" : "text-gray-400"}>
                            Length: 8-20 characters
                          </li>
                          <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>
                            At least 1 uppercase letter (A-Z)
                          </li>
                          <li className={/[0-9]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>
                            At least 1 digit (0-9)
                          </li>
                          <li className={/[!@#$%^&*]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>
                            At least 1 special character (!@#$%^&*)
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                      )}
                      {formData.password && formData.confirmPassword && (
                        <p className={`text-sm mt-1 ${formData.password === formData.confirmPassword ? "text-green-600" : "text-red-500"}`}>
                          {formData.password === formData.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
                    
                    <div>
                      <Label htmlFor="completeAddress">Complete Address *</Label>
                      <Textarea
                        id="completeAddress"
                        value={formData.completeAddress}
                        onChange={(e) => handleInputChange('completeAddress', e.target.value)}
                        placeholder="Enter complete address including street, area, etc."
                        rows={3}
                        className={errors.completeAddress ? "border-red-500" : ""}
                      />
                      {errors.completeAddress && <p className="text-red-500 text-sm mt-1">{errors.completeAddress}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                          <SelectTrigger className={errors.city ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {CITIES.map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>

                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                          <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                            <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                            <SelectItem value="Assam">Assam</SelectItem>
                            <SelectItem value="Bihar">Bihar</SelectItem>
                            <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                            <SelectItem value="Goa">Goa</SelectItem>
                            <SelectItem value="Gujarat">Gujarat</SelectItem>
                            <SelectItem value="Haryana">Haryana</SelectItem>
                            <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                            <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                            <SelectItem value="Karnataka">Karnataka</SelectItem>
                            <SelectItem value="Kerala">Kerala</SelectItem>
                            <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="Manipur">Manipur</SelectItem>
                            <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                            <SelectItem value="Mizoram">Mizoram</SelectItem>
                            <SelectItem value="Nagaland">Nagaland</SelectItem>
                            <SelectItem value="Odisha">Odisha</SelectItem>
                            <SelectItem value="Punjab">Punjab</SelectItem>
                            <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                            <SelectItem value="Sikkim">Sikkim</SelectItem>
                            <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                            <SelectItem value="Telangana">Telangana</SelectItem>
                            <SelectItem value="Tripura">Tripura</SelectItem>
                            <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                            <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                            <SelectItem value="West Bengal">West Bengal</SelectItem>
                            <SelectItem value="Delhi">Delhi</SelectItem>
                            <SelectItem value="Jammu and Kashmir">Jammu and Kashmir</SelectItem>
                            <SelectItem value="Ladakh">Ladakh</SelectItem>
                            <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                            <SelectItem value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</SelectItem>
                            <SelectItem value="Daman and Diu">Daman and Diu</SelectItem>
                            <SelectItem value="Lakshadweep">Lakshadweep</SelectItem>
                            <SelectItem value="Puducherry">Puducherry</SelectItem>
                            <SelectItem value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>

                      <div>
                        <Label htmlFor="pinCode">Pin Code *</Label>
                        <Input
                          id="pinCode"
                          value={formData.pinCode}
                          onChange={(e) => handleInputChange('pinCode', e.target.value)}
                          placeholder="Enter 6-digit pin code"
                          maxLength={6}
                          className={errors.pinCode ? "border-red-500" : ""}
                        />
                        {errors.pinCode && <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="landmark">Landmark (Optional)</Label>
                        <Input
                          id="landmark"
                          value={formData.landmark}
                          onChange={(e) => handleInputChange('landmark', e.target.value)}
                          placeholder="e.g., Near Metro Station, Opposite Mall"
                        />
                      </div>

                      <div>
                        <Label htmlFor="googleMapsLocation">Google Maps Location (Optional)</Label>
                        <Input
                          id="googleMapsLocation"
                          value={formData.googleMapsLocation}
                          onChange={(e) => handleInputChange('googleMapsLocation', e.target.value)}
                          placeholder="Google Maps URL or coordinates"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Legal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Legal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ownerName">Institution Owner/Director Name *</Label>
                        <Input
                          id="ownerName"
                          value={formData.ownerName}
                          onChange={(e) => handleInputChange('ownerName', e.target.value)}
                          placeholder="Enter owner/director name"
                          className={errors.ownerName ? "border-red-500" : ""}
                        />
                        {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="ownerContactNumber">Owner Contact Number *</Label>
                        <Input
                          id="ownerContactNumber"
                          value={formData.ownerContactNumber}
                          onChange={(e) => handleInputChange('ownerContactNumber', e.target.value)}
                          placeholder="Enter owner contact number"
                          maxLength={10}
                          className={errors.ownerContactNumber ? "border-red-500" : ""}
                        />
                        {errors.ownerContactNumber && <p className="text-red-500 text-sm mt-1">{errors.ownerContactNumber}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessLicense">Business License Upload (Optional)</Label>
                        <Input
                          type="file"
                          id="businessLicense"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('businessLicense', e.target.files?.[0] || null)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>

                      <div>
                        <Label htmlFor="registrationCertificate">Registration Certificate Upload (Optional)</Label>
                        <Input
                          type="file"
                          id="registrationCertificate"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('registrationCertificate', e.target.files?.[0] || null)}
                          className="file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Terms and Conditions</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm">
                          I agree to the Terms and Conditions *
                        </Label>
                      </div>
                      {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeToBackgroundVerification"
                          checked={formData.agreeToBackgroundVerification}
                          onCheckedChange={(checked) => handleInputChange('agreeToBackgroundVerification', checked)}
                        />
                        <Label htmlFor="agreeToBackgroundVerification" className="text-sm">
                          I agree to Background Verification *
                        </Label>
                      </div>
                      {errors.agreeToBackgroundVerification && <p className="text-red-500 text-sm">{errors.agreeToBackgroundVerification}</p>}
                    </div>
                  </div>

                </div>
    </div>
  );

  const renderPage2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 2 of 7: Institution Details & Facilities</h2>
        <p className="text-gray-600">Tell us about your institution's facilities</p>
      </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
          <Label htmlFor="totalClassrooms">Total Classrooms *</Label>
                      <Input
            id="totalClassrooms"
            type="number"
            value={formData.totalClassrooms}
            onChange={(e) => handleInputChange('totalClassrooms', e.target.value)}
            placeholder="Enter total classrooms"
            className={errors.totalClassrooms ? "border-red-500" : ""}
          />
          {errors.totalClassrooms && <p className="text-red-500 text-sm mt-1">{errors.totalClassrooms}</p>}
                    </div>

                    <div>
          <Label htmlFor="classroomCapacity">Classroom Capacity *</Label>
                      <Input
            id="classroomCapacity"
            type="number"
            value={formData.classroomCapacity}
            onChange={(e) => handleInputChange('classroomCapacity', e.target.value)}
            placeholder="Enter classroom capacity"
            className={errors.classroomCapacity ? "border-red-500" : ""}
          />
          {errors.classroomCapacity && <p className="text-red-500 text-sm mt-1">{errors.classroomCapacity}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
          <Label htmlFor="mainBuildingPhoto">Main Building Photo *</Label>
                      <Input
            type="file"
            id="mainBuildingPhoto"
            accept="image/*,application/pdf"
            onChange={(e) => handleFileUpload('mainBuildingPhoto', e.target.files?.[0] || null)}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.mainBuildingPhoto && <p className="text-red-500 text-sm mt-1">{errors.mainBuildingPhoto}</p>}
                    </div>

                    <div>
          <Label htmlFor="classroomPhotos">Classroom Photos (Optional)</Label>
                      <Input
            type="file"
            id="classroomPhotos"
            accept="image/*,application/pdf"
            multiple
            onChange={(e) => handleFileUpload('classroomPhotos', Array.from(e.target.files || []))}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="libraryAvailable">Library Available</Label>
          <Checkbox
            id="libraryAvailable"
            checked={formData.libraryAvailable}
            onCheckedChange={(checked) => handleInputChange('libraryAvailable', checked)}
          />
                </div>

        <div>
          <Label htmlFor="computerLab">Computer Lab</Label>
          <Checkbox
            id="computerLab"
            checked={formData.computerLab}
            onCheckedChange={(checked) => handleInputChange('computerLab', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="wifiAvailable">WiFi Available</Label>
          <Checkbox
            id="wifiAvailable"
            checked={formData.wifiAvailable}
            onCheckedChange={(checked) => handleInputChange('wifiAvailable', checked)}
          />
        </div>

        <div>
          <Label htmlFor="parkingAvailable">Parking Available</Label>
          <Checkbox
            id="parkingAvailable"
            checked={formData.parkingAvailable}
            onCheckedChange={(checked) => handleInputChange('parkingAvailable', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cafeteriaAvailable">Cafeteria Available</Label>
          <Checkbox
            id="cafeteriaAvailable"
            checked={formData.cafeteriaAvailable}
            onCheckedChange={(checked) => handleInputChange('cafeteriaAvailable', checked)}
          />
        </div>

        <div>
          <Label htmlFor="airConditioning">Air Conditioning</Label>
          <Checkbox
            id="airConditioning"
            checked={formData.airConditioning}
            onCheckedChange={(checked) => handleInputChange('airConditioning', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cctvSecurity">CCTV Security</Label>
          <Checkbox
            id="cctvSecurity"
            checked={formData.cctvSecurity}
            onCheckedChange={(checked) => handleInputChange('cctvSecurity', checked)}
          />
        </div>

        <div>
          <Label htmlFor="wheelchairAccessible">Wheelchair Accessible</Label>
          <Checkbox
            id="wheelchairAccessible"
            checked={formData.wheelchairAccessible}
            onCheckedChange={(checked) => handleInputChange('wheelchairAccessible', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectorsSmartBoards">Projectors & Smart Boards</Label>
          <Checkbox
            id="projectorsSmartBoards"
            checked={formData.projectorsSmartBoards}
            onCheckedChange={(checked) => handleInputChange('projectorsSmartBoards', checked)}
          />
        </div>

        <div>
          <Label htmlFor="audioSystem">Audio System</Label>
          <Checkbox
            id="audioSystem"
            checked={formData.audioSystem}
            onCheckedChange={(checked) => handleInputChange('audioSystem', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="physicsLab">Physics Lab</Label>
          <Checkbox
            id="physicsLab"
            checked={formData.physicsLab}
            onCheckedChange={(checked) => handleInputChange('physicsLab', checked)}
          />
        </div>

        <div>
          <Label htmlFor="chemistryLab">Chemistry Lab</Label>
          <Checkbox
            id="chemistryLab"
            checked={formData.chemistryLab}
            onCheckedChange={(checked) => handleInputChange('chemistryLab', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="biologyLab">Biology Lab</Label>
          <Checkbox
            id="biologyLab"
            checked={formData.biologyLab}
            onCheckedChange={(checked) => handleInputChange('biologyLab', checked)}
          />
        </div>

        <div>
          <Label htmlFor="languageLab">Language Lab</Label>
          <Checkbox
            id="languageLab"
            checked={formData.languageLab}
            onCheckedChange={(checked) => handleInputChange('languageLab', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="indoorGames">Indoor Games</Label>
          <Checkbox
            id="indoorGames"
            checked={formData.indoorGames}
            onCheckedChange={(checked) => handleInputChange('indoorGames', checked)}
          />
        </div>

        <div>
          <Label htmlFor="outdoorPlayground">Outdoor Playground</Label>
          <Checkbox
            id="outdoorPlayground"
            checked={formData.outdoorPlayground}
            onCheckedChange={(checked) => handleInputChange('outdoorPlayground', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gymnasium">Gymnasium</Label>
          <Checkbox
            id="gymnasium"
            checked={formData.gymnasium}
            onCheckedChange={(checked) => handleInputChange('gymnasium', checked)}
          />
        </div>

        <div>
          <Label htmlFor="swimmingPool">Swimming Pool</Label>
          <Checkbox
            id="swimmingPool"
            checked={formData.swimmingPool}
            onCheckedChange={(checked) => handleInputChange('swimmingPool', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="transportationProvided">Transportation Provided</Label>
          <Checkbox
            id="transportationProvided"
            checked={formData.transportationProvided}
            onCheckedChange={(checked) => handleInputChange('transportationProvided', checked)}
          />
        </div>

        <div>
          <Label htmlFor="hostelFacility">Hostel Facility</Label>
          <Checkbox
            id="hostelFacility"
            checked={formData.hostelFacility}
            onCheckedChange={(checked) => handleInputChange('hostelFacility', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="studyMaterialProvided">Study Material Provided</Label>
          <Checkbox
            id="studyMaterialProvided"
            checked={formData.studyMaterialProvided}
            onCheckedChange={(checked) => handleInputChange('studyMaterialProvided', checked)}
          />
        </div>

        <div>
          <Label htmlFor="onlineClasses">Online Classes</Label>
          <Checkbox
            id="onlineClasses"
            checked={formData.onlineClasses}
            onCheckedChange={(checked) => handleInputChange('onlineClasses', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="recordedSessions">Recorded Sessions</Label>
          <Checkbox
            id="recordedSessions"
            checked={formData.recordedSessions}
            onCheckedChange={(checked) => handleInputChange('recordedSessions', checked)}
          />
        </div>

        <div>
          <Label htmlFor="mockTestsAssessments">Mock Tests & Assessments</Label>
          <Checkbox
            id="mockTestsAssessments"
            checked={formData.mockTestsAssessments}
            onCheckedChange={(checked) => handleInputChange('mockTestsAssessments', checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="careerCounseling">Career Counseling</Label>
          <Checkbox
            id="careerCounseling"
            checked={formData.careerCounseling}
            onCheckedChange={(checked) => handleInputChange('careerCounseling', checked)}
          />
        </div>

        <div>
          <Label htmlFor="jobPlacementAssistance">Job Placement Assistance</Label>
          <Checkbox
            id="jobPlacementAssistance"
            checked={formData.jobPlacementAssistance}
            onCheckedChange={(checked) => handleInputChange('jobPlacementAssistance', checked)}
          />
        </div>
      </div>
    </div>
  );

    const renderPage3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 3 of 7: Courses & Programs Offered</h2>
        <p className="text-gray-600">Tell us about your academic offerings and batch information</p>
      </div>
      
      {/* Academic Courses */}
                <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Academic Courses</h3>
        
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Course Categories *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cbse"
                checked={formData.cbse}
                onCheckedChange={(checked) => handleInputChange('cbse', checked)}
              />
              <Label htmlFor="cbse" className="text-sm">CBSE (Classes 1-12)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="icse"
                checked={formData.icse}
                onCheckedChange={(checked) => handleInputChange('icse', checked)}
              />
              <Label htmlFor="icse" className="text-sm">ICSE (Classes 1-12)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stateBoard"
                checked={formData.stateBoard}
                onCheckedChange={(checked) => handleInputChange('stateBoard', checked)}
              />
              <Label htmlFor="stateBoard" className="text-sm">State Board</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ibInternational"
                checked={formData.ibInternational}
                onCheckedChange={(checked) => handleInputChange('ibInternational', checked)}
              />
              <Label htmlFor="ibInternational" className="text-sm">IB/International</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="competitiveExams"
                checked={formData.competitiveExams}
                onCheckedChange={(checked) => handleInputChange('competitiveExams', checked)}
              />
              <Label htmlFor="competitiveExams" className="text-sm">Competitive Exams</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="professionalCourses"
                checked={formData.professionalCourses}
                onCheckedChange={(checked) => handleInputChange('professionalCourses', checked)}
              />
              <Label htmlFor="professionalCourses" className="text-sm">Professional Courses</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="languageClasses"
                checked={formData.languageClasses}
                onCheckedChange={(checked) => handleInputChange('languageClasses', checked)}
              />
              <Label htmlFor="languageClasses" className="text-sm">Language Classes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="computerCourses"
                checked={formData.computerCourses}
                onCheckedChange={(checked) => handleInputChange('computerCourses', checked)}
              />
              <Label htmlFor="computerCourses" className="text-sm">Computer Courses</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="artsCrafts"
                checked={formData.artsCrafts}
                onCheckedChange={(checked) => handleInputChange('artsCrafts', checked)}
              />
              <Label htmlFor="artsCrafts" className="text-sm">Arts & Crafts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="musicDance"
                checked={formData.musicDance}
                onCheckedChange={(checked) => handleInputChange('musicDance', checked)}
              />
              <Label htmlFor="musicDance" className="text-sm">Music & Dance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sportsTraining"
                checked={formData.sportsTraining}
                onCheckedChange={(checked) => handleInputChange('sportsTraining', checked)}
              />
              <Label htmlFor="sportsTraining" className="text-sm">Sports Training</Label>
            </div>
          </div>
        </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
            <Label htmlFor="subjectsOffered">Subjects Offered *</Label>
            <Textarea
              id="subjectsOffered"
              value={formData.subjectsOffered}
              onChange={(e) => handleInputChange('subjectsOffered', e.target.value)}
              placeholder="e.g., Mathematics, Science, English, Hindi, Social Studies..."
              rows={3}
              className={errors.subjectsOffered ? "border-red-500" : ""}
            />
            {errors.subjectsOffered && <p className="text-red-500 text-sm mt-1">{errors.subjectsOffered}</p>}
          </div>

          <div>
            <Label htmlFor="classLevels">Class Levels *</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="beginner"
                  checked={formData.beginner}
                  onCheckedChange={(checked) => handleInputChange('beginner', checked)}
                />
                <Label htmlFor="beginner" className="text-sm">Beginner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="intermediate"
                  checked={formData.intermediate}
                  onCheckedChange={(checked) => handleInputChange('intermediate', checked)}
                />
                <Label htmlFor="intermediate" className="text-sm">Intermediate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="advanced"
                  checked={formData.advanced}
                  onCheckedChange={(checked) => handleInputChange('advanced', checked)}
                />
                <Label htmlFor="advanced" className="text-sm">Advanced</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="batchSizes">Batch Sizes *</Label>
                      <Input
              id="batchSizes"
              value={formData.batchSizes}
              onChange={(e) => handleInputChange('batchSizes', e.target.value)}
              placeholder="e.g., 15-20 students, Individual, 25 students"
              className={errors.batchSizes ? "border-red-500" : ""}
            />
            {errors.batchSizes && <p className="text-red-500 text-sm mt-1">{errors.batchSizes}</p>}
                    </div>

                    <div>
            <Label htmlFor="courseDuration">Course Duration Options</Label>
            <Select value={formData.courseDuration} onValueChange={(value) => handleInputChange('courseDuration', value)}>
                        <SelectTrigger>
                <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                <SelectItem value="3 months">3 months</SelectItem>
                <SelectItem value="6 months">6 months</SelectItem>
                <SelectItem value="1 year">1 year</SelectItem>
                <SelectItem value="2 years">2 years</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
          </div>
                    </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
            <Label htmlFor="certificationProvided">Certification Provided</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="certificationYes"
                  name="certificationProvided"
                  value="true"
                  checked={formData.certificationProvided === true}
                  onChange={() => handleInputChange('certificationProvided', true)}
                  className="text-primary"
                />
                <Label htmlFor="certificationYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="certificationNo"
                  name="certificationProvided"
                  value="false"
                  checked={formData.certificationProvided === false}
                  onChange={() => handleInputChange('certificationProvided', false)}
                  className="text-primary"
                />
                <Label htmlFor="certificationNo">No</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="courseFeeStructure">Course Fee Structure *</Label>
                      <Input
              id="courseFeeStructure"
              value={formData.courseFeeStructure}
              onChange={(e) => handleInputChange('courseFeeStructure', e.target.value)}
              placeholder="e.g., ₹5000 per subject, ₹15000 per course"
              className={errors.courseFeeStructure ? "border-red-500" : ""}
            />
            {errors.courseFeeStructure && <p className="text-red-500 text-sm mt-1">{errors.courseFeeStructure}</p>}
          </div>
                    </div>
                  </div>

      {/* Batch Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Batch Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="totalCurrentStudents">Total Current Students *</Label>
            <Input
              id="totalCurrentStudents"
                        type="number"
              value={formData.totalCurrentStudents}
              onChange={(e) => handleInputChange('totalCurrentStudents', e.target.value)}
              placeholder="e.g., 150"
              className={errors.totalCurrentStudents ? "border-red-500" : ""}
            />
            {errors.totalCurrentStudents && <p className="text-red-500 text-sm mt-1">{errors.totalCurrentStudents}</p>}
                    </div>

          <div>
            <Label htmlFor="averageBatchSize">Average Batch Size *</Label>
            <Input
              id="averageBatchSize"
              type="number"
              value={formData.averageBatchSize}
              onChange={(e) => handleInputChange('averageBatchSize', e.target.value)}
              placeholder="e.g., 20"
              className={errors.averageBatchSize ? "border-red-500" : ""}
            />
            {errors.averageBatchSize && <p className="text-red-500 text-sm mt-1">{errors.averageBatchSize}</p>}
                  </div>

                  <div>
            <Label htmlFor="studentTeacherRatio">Student-Teacher Ratio *</Label>
            <Input
              id="studentTeacherRatio"
              value={formData.studentTeacherRatio}
              onChange={(e) => handleInputChange('studentTeacherRatio', e.target.value)}
              placeholder="e.g., 15:1"
              className={errors.studentTeacherRatio ? "border-red-500" : ""}
            />
            {errors.studentTeacherRatio && <p className="text-red-500 text-sm mt-1">{errors.studentTeacherRatio}</p>}
                  </div>
                </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Class Timings Available</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="morningBatches"
                checked={formData.morningBatches}
                onCheckedChange={(checked) => handleInputChange('morningBatches', checked)}
              />
              <Label htmlFor="morningBatches" className="text-sm">Morning (6AM-12PM)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="afternoonBatches"
                checked={formData.afternoonBatches}
                onCheckedChange={(checked) => handleInputChange('afternoonBatches', checked)}
              />
              <Label htmlFor="afternoonBatches" className="text-sm">Afternoon (12PM-6PM)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eveningBatches"
                checked={formData.eveningBatches}
                onCheckedChange={(checked) => handleInputChange('eveningBatches', checked)}
              />
              <Label htmlFor="eveningBatches" className="text-sm">Evening (6PM-10PM)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weekendBatches"
                checked={formData.weekendBatches}
                onCheckedChange={(checked) => handleInputChange('weekendBatches', checked)}
              />
              <Label htmlFor="weekendBatches" className="text-sm">Weekend Batches</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="flexibleTimings"
                checked={formData.flexibleTimings}
                onCheckedChange={(checked) => handleInputChange('flexibleTimings', checked)}
              />
              <Label htmlFor="flexibleTimings" className="text-sm">Flexible Timings</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Admission Process */}
                <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Admission Process</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
            <Label htmlFor="admissionTestRequired">Admission Test Required</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="admissionTestYes"
                  name="admissionTestRequired"
                  value="true"
                  checked={formData.admissionTestRequired === true}
                  onChange={() => handleInputChange('admissionTestRequired', true)}
                  className="text-primary"
                />
                <Label htmlFor="admissionTestYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="admissionTestNo"
                  name="admissionTestRequired"
                  value="false"
                  checked={formData.admissionTestRequired === false}
                  onChange={() => handleInputChange('admissionTestRequired', false)}
                  className="text-primary"
                />
                <Label htmlFor="admissionTestNo">No</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="minimumQualification">Minimum Qualification Required</Label>
            <Select value={formData.minimumQualification} onValueChange={(value) => handleInputChange('minimumQualification', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Qualification Required</SelectItem>
                <SelectItem value="primary">Primary Education</SelectItem>
                <SelectItem value="middle">Middle School</SelectItem>
                <SelectItem value="high">High School</SelectItem>
                <SelectItem value="higher">Higher Secondary</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="postgraduate">Post Graduate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ageRestrictions">Age Restrictions (if any)</Label>
                      <Input
              id="ageRestrictions"
              value={formData.ageRestrictions}
              onChange={(e) => handleInputChange('ageRestrictions', e.target.value)}
              placeholder="e.g., 5-18 years, No restrictions"
                      />
                    </div>

                    <div>
            <Label htmlFor="admissionFees">Admission Fees *</Label>
                      <Input
              id="admissionFees"
              value={formData.admissionFees}
              onChange={(e) => handleInputChange('admissionFees', e.target.value)}
              placeholder="e.g., ₹1000"
              className={errors.admissionFees ? "border-red-500" : ""}
            />
            {errors.admissionFees && <p className="text-red-500 text-sm mt-1">{errors.admissionFees}</p>}
                    </div>
                  </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="securityDeposit">Security Deposit (Optional)</Label>
            <Input
              id="securityDeposit"
              value={formData.securityDeposit}
              onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
              placeholder="e.g., ₹5000"
            />
                </div>

          <div>
            <Label htmlFor="refundPolicy">Refund Policy</Label>
            <Textarea
              id="refundPolicy"
              value={formData.refundPolicy}
              onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
              placeholder="Describe your refund policy..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.refundPolicy.length}/500 characters</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 4 of 7: Faculty & Staff Information</h2>
        <p className="text-gray-600">Tell us about your teaching staff and faculty</p>
      </div>
      
      {/* Faculty Details */}
                <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Faculty Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="totalTeachingStaff">Total Teaching Staff *</Label>
            <Input
              id="totalTeachingStaff"
              type="number"
              value={formData.totalTeachingStaff}
              onChange={(e) => handleInputChange('totalTeachingStaff', e.target.value)}
              placeholder="e.g., 25"
              className={errors.totalTeachingStaff ? "border-red-500" : ""}
            />
            {errors.totalTeachingStaff && <p className="text-red-500 text-sm mt-1">{errors.totalTeachingStaff}</p>}
          </div>

          <div>
            <Label htmlFor="totalNonTeachingStaff">Total Non-Teaching Staff</Label>
            <Input
              id="totalNonTeachingStaff"
              type="number"
              value={formData.totalNonTeachingStaff}
              onChange={(e) => handleInputChange('totalNonTeachingStaff', e.target.value)}
              placeholder="e.g., 15"
            />
          </div>

          <div>
            <Label htmlFor="averageFacultyExperience">Average Faculty Experience *</Label>
            <Select value={formData.averageFacultyExperience} onValueChange={(value) => handleInputChange('averageFacultyExperience', value)}>
              <SelectTrigger className={errors.averageFacultyExperience ? "border-red-500" : ""}>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2 years">1-2 years</SelectItem>
                <SelectItem value="3-5 years">3-5 years</SelectItem>
                <SelectItem value="5+ years">5+ years</SelectItem>
              </SelectContent>
            </Select>
            {errors.averageFacultyExperience && <p className="text-red-500 text-sm mt-1">{errors.averageFacultyExperience}</p>}
          </div>
        </div>
      </div>

      {/* Principal/Director Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Principal/Director Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
            <Label htmlFor="principalName">Name *</Label>
            <Input
              id="principalName"
              value={formData.principalName}
              onChange={(e) => handleInputChange('principalName', e.target.value)}
              placeholder="Enter principal/director name"
              className={errors.principalName ? "border-red-500" : ""}
            />
            {errors.principalName && <p className="text-red-500 text-sm mt-1">{errors.principalName}</p>}
          </div>

          <div>
            <Label htmlFor="principalQualification">Qualification *</Label>
            <Input
              id="principalQualification"
              value={formData.principalQualification}
              onChange={(e) => handleInputChange('principalQualification', e.target.value)}
              placeholder="e.g., M.Ed, PhD"
              className={errors.principalQualification ? "border-red-500" : ""}
            />
            {errors.principalQualification && <p className="text-red-500 text-sm mt-1">{errors.principalQualification}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="principalExperience">Experience (years) *</Label>
            <Input
              id="principalExperience"
              type="number"
              value={formData.principalExperience}
              onChange={(e) => handleInputChange('principalExperience', e.target.value)}
              placeholder="e.g., 15"
              className={errors.principalExperience ? "border-red-500" : ""}
            />
            {errors.principalExperience && <p className="text-red-500 text-sm mt-1">{errors.principalExperience}</p>}
          </div>

          <div>
            <Label htmlFor="principalPhoto">Photo Upload *</Label>
            <Input
              type="file"
              id="principalPhoto"
              accept="image/*"
              onChange={(e) => handleFileUpload('principalPhoto', e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.principalPhoto && <p className="text-red-500 text-sm mt-1">{errors.principalPhoto}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="principalBio">Brief Bio</Label>
          <Textarea
            id="principalBio"
            value={formData.principalBio}
            onChange={(e) => handleInputChange('principalBio', e.target.value)}
            placeholder="Brief description about the principal/director..."
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.principalBio.length}/300 characters</p>
        </div>
      </div>

      {/* Head of Departments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Head of Departments</h3>
        
        <div className="space-y-4">
          {formData.departmentHeads.map((head, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Department Head {index + 1}</h4>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDepartmentHead(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`deptHeadName${index}`}>Name *</Label>
                  <Input
                    id={`deptHeadName${index}`}
                    value={head.name}
                    onChange={(e) => updateDepartmentHead(index, 'name', e.target.value)}
                    placeholder="Enter department head name"
                  />
                </div>

                <div>
                  <Label htmlFor={`deptHeadDepartment${index}`}>Department *</Label>
                  <Input
                    id={`deptHeadDepartment${index}`}
                    value={head.department}
                    onChange={(e) => updateDepartmentHead(index, 'department', e.target.value)}
                    placeholder="e.g., Mathematics, Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor={`deptHeadQualification${index}`}>Qualification *</Label>
                  <Input
                    id={`deptHeadQualification${index}`}
                    value={head.qualification}
                    onChange={(e) => updateDepartmentHead(index, 'qualification', e.target.value)}
                    placeholder="e.g., M.Sc, PhD"
                  />
                </div>

                <div>
                  <Label htmlFor={`deptHeadExperience${index}`}>Experience (years) *</Label>
                  <Input
                    id={`deptHeadExperience${index}`}
                    type="number"
                    value={head.experience}
                    onChange={(e) => updateDepartmentHead(index, 'experience', e.target.value)}
                    placeholder="e.g., 8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor={`deptHeadPhoto${index}`}>Photo Upload</Label>
                  <Input
                    type="file"
                    id={`deptHeadPhoto${index}`}
                    accept="image/*"
                    onChange={(e) => updateDepartmentHead(index, 'photo', e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <Label htmlFor={`deptHeadSpecialization${index}`}>Specialization</Label>
                  <Input
                    id={`deptHeadSpecialization${index}`}
                    value={head.specialization}
                    onChange={(e) => updateDepartmentHead(index, 'specialization', e.target.value)}
                    placeholder="e.g., Advanced Mathematics, Physics"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addDepartmentHead}
            className="w-full"
          >
            + Add Another Department Head
          </Button>
        </div>
      </div>

      {/* Faculty Qualifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Faculty Qualifications</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="phdHolders">PhD Holders</Label>
            <Input
              id="phdHolders"
              type="number"
              value={formData.phdHolders}
              onChange={(e) => handleInputChange('phdHolders', e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="postGraduates">Post Graduates</Label>
            <Input
              id="postGraduates"
              type="number"
              value={formData.postGraduates}
              onChange={(e) => handleInputChange('postGraduates', e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="graduates">Graduates</Label>
            <Input
              id="graduates"
              type="number"
              value={formData.graduates}
              onChange={(e) => handleInputChange('graduates', e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="professionalCertified">Professional Certified</Label>
            <Input
              id="professionalCertified"
              type="number"
              value={formData.professionalCertified}
              onChange={(e) => handleInputChange('professionalCertified', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Faculty Achievements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Faculty Achievements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="awardsReceived">Awards Received</Label>
            <Textarea
              id="awardsReceived"
              value={formData.awardsReceived}
              onChange={(e) => handleInputChange('awardsReceived', e.target.value)}
              placeholder="List any awards or recognitions received by faculty..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="publications">Publications</Label>
            <Textarea
              id="publications"
              value={formData.publications}
              onChange={(e) => handleInputChange('publications', e.target.value)}
              placeholder="List research papers, books, or publications..."
              rows={3}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="industryExperience">Industry Experience</Label>
            <Textarea
              id="industryExperience"
              value={formData.industryExperience}
              onChange={(e) => handleInputChange('industryExperience', e.target.value)}
              placeholder="Describe industry experience of faculty members..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="trainingProgramsAttended">Training Programs Attended</Label>
            <Textarea
              id="trainingProgramsAttended"
              value={formData.trainingProgramsAttended}
              onChange={(e) => handleInputChange('trainingProgramsAttended', e.target.value)}
              placeholder="List training programs, workshops, or certifications..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 5 of 7: Results & Achievements</h2>
        <p className="text-gray-600">Showcase your institution's academic excellence and achievements</p>
      </div>
      
      {/* Academic Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Academic Results</h3>
        
        <div className="space-y-4">
          {formData.boardExamResults.map((result, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Board Exam Result {index + 1}</h4>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeBoardExamResult(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`boardYear${index}`}>Year *</Label>
                  <Select value={result.year} onValueChange={(value) => updateBoardExamResult(index, 'year', value)}>
                        <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2020">2020</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`passPercentage${index}`}>Pass Percentage *</Label>
                  <Input
                    id={`passPercentage${index}`}
                    type="number"
                    min="0"
                    max="100"
                    value={result.passPercentage}
                    onChange={(e) => updateBoardExamResult(index, 'passPercentage', e.target.value)}
                    placeholder="e.g., 95"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor={`distinctionPercentage${index}`}>Distinction Percentage</Label>
                  <Input
                    id={`distinctionPercentage${index}`}
                    type="number"
                    min="0"
                    max="100"
                    value={result.distinctionPercentage}
                    onChange={(e) => updateBoardExamResult(index, 'distinctionPercentage', e.target.value)}
                    placeholder="e.g., 25"
                  />
                </div>

                <div>
                  <Label htmlFor={`topScorerName${index}`}>Top Scorer Name (Optional)</Label>
                  <Input
                    id={`topScorerName${index}`}
                    value={result.topScorerName}
                    onChange={(e) => updateBoardExamResult(index, 'topScorerName', e.target.value)}
                    placeholder="Student name"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor={`topScorerMarks${index}`}>Top Scorer Marks (Optional)</Label>
                <Input
                  id={`topScorerMarks${index}`}
                  value={result.topScorerMarks}
                  onChange={(e) => updateBoardExamResult(index, 'topScorerMarks', e.target.value)}
                  placeholder="e.g., 98% or 490/500"
                />
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addBoardExamResult}
            className="w-full"
          >
            + Add Another Board Exam Result
          </Button>
        </div>
      </div>

      {/* Competitive Exam Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Competitive Exam Results</h3>
        
        <div className="space-y-4">
          {formData.competitiveExamResults.map((result, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Competitive Exam Result {index + 1}</h4>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCompetitiveExamResult(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`examType${index}`}>Exam Type</Label>
                  <Select value={result.examType} onValueChange={(value) => updateCompetitiveExamResult(index, 'examType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JEE">JEE (Main/Advanced)</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                      <SelectItem value="CAT">CAT</SelectItem>
                      <SelectItem value="UPSC">UPSC</SelectItem>
                      <SelectItem value="GATE">GATE</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                  <Label htmlFor={`compYear${index}`}>Year</Label>
                      <Input
                    id={`compYear${index}`}
                    value={result.year}
                    onChange={(e) => updateCompetitiveExamResult(index, 'year', e.target.value)}
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor={`totalStudentsAppeared${index}`}>Total Students Appeared</Label>
                  <Input
                    id={`totalStudentsAppeared${index}`}
                        type="number"
                    value={result.totalStudentsAppeared}
                    onChange={(e) => updateCompetitiveExamResult(index, 'totalStudentsAppeared', e.target.value)}
                    placeholder="e.g., 50"
                  />
                </div>

                <div>
                  <Label htmlFor={`qualifiedStudents${index}`}>Qualified Students</Label>
                  <Input
                    id={`qualifiedStudents${index}`}
                    type="number"
                    value={result.qualifiedStudents}
                    onChange={(e) => updateCompetitiveExamResult(index, 'qualifiedStudents', e.target.value)}
                    placeholder="e.g., 15"
                      />
                    </div>
                  </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                  <Label htmlFor={`topRanksAchieved${index}`}>Top Ranks Achieved</Label>
                  <Input
                    id={`topRanksAchieved${index}`}
                    value={result.topRanksAchieved}
                    onChange={(e) => updateCompetitiveExamResult(index, 'topRanksAchieved', e.target.value)}
                    placeholder="e.g., AIR 1500, AIR 2500"
                  />
                </div>

                <div>
                  <Label htmlFor={`successPercentage${index}`}>Success Percentage</Label>
                  <Input
                    id={`successPercentage${index}`}
                    type="number"
                    min="0"
                    max="100"
                    value={result.successPercentage}
                    onChange={(e) => updateCompetitiveExamResult(index, 'successPercentage', e.target.value)}
                    placeholder="e.g., 30"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addCompetitiveExamResult}
            className="w-full"
          >
            + Add Another Competitive Exam Result
          </Button>
        </div>
      </div>

      {/* Awards & Recognition */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Awards & Recognition</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="institutionAwards">Institution Awards</Label>
                    <Textarea
              id="institutionAwards"
              value={formData.institutionAwards}
              onChange={(e) => handleInputChange('institutionAwards', e.target.value)}
              placeholder="List government recognition, education board awards, quality certifications (ISO, etc.), media recognition..."
                      rows={4}
                    />
          </div>

          <div>
            <Label htmlFor="studentAchievements">Student Achievements</Label>
            <Textarea
              id="studentAchievements"
              value={formData.studentAchievements}
              onChange={(e) => handleInputChange('studentAchievements', e.target.value)}
              placeholder="List sports achievements, cultural achievements, academic excellence awards, competition winners..."
              rows={4}
            />
          </div>
                  </div>
                </div>

      {/* Accreditations */}
                <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Accreditations</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
            <Label htmlFor="governmentAccreditation">Government Accreditation</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="govAccredYes"
                  name="governmentAccreditation"
                  value="true"
                  checked={formData.governmentAccreditation === true}
                  onChange={() => handleInputChange('governmentAccreditation', true)}
                  className="text-primary"
                />
                <Label htmlFor="govAccredYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="govAccredNo"
                  name="governmentAccreditation"
                  value="false"
                  checked={formData.governmentAccreditation === false}
                  onChange={() => handleInputChange('governmentAccreditation', false)}
                  className="text-primary"
                />
                <Label htmlFor="govAccredNo">No</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="boardAffiliationDetails">Board Affiliation Details *</Label>
                      <Input
              id="boardAffiliationDetails"
              value={formData.boardAffiliationDetails}
              onChange={(e) => handleInputChange('boardAffiliationDetails', e.target.value)}
              placeholder="e.g., CBSE, ICSE, State Board"
              className={errors.boardAffiliationDetails ? "border-red-500" : ""}
            />
            {errors.boardAffiliationDetails && <p className="text-red-500 text-sm mt-1">{errors.boardAffiliationDetails}</p>}
          </div>
                    </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
            <Label htmlFor="universityAffiliation">University Affiliation (if applicable)</Label>
                      <Input
              id="universityAffiliation"
              value={formData.universityAffiliation}
              onChange={(e) => handleInputChange('universityAffiliation', e.target.value)}
              placeholder="e.g., Mumbai University, Delhi University"
                      />
                    </div>

          <div>
            <Label htmlFor="professionalBodyMembership">Professional Body Membership</Label>
            <Input
              id="professionalBodyMembership"
              value={formData.professionalBodyMembership}
              onChange={(e) => handleInputChange('professionalBodyMembership', e.target.value)}
              placeholder="e.g., AICTE, NAAC, NBA"
            />
                  </div>
                </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="qualityCertifications">Quality Certifications</Label>
            <Input
              id="qualityCertifications"
              value={formData.qualityCertifications}
              onChange={(e) => handleInputChange('qualityCertifications', e.target.value)}
              placeholder="e.g., ISO 9001:2015, ISO 14001"
            />
          </div>

          <div>
            <Label htmlFor="certificateDocuments">Upload Certificate Documents *</Label>
            <Input
              type="file"
              id="certificateDocuments"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => handleFileUpload('certificateDocuments', Array.from(e.target.files || []))}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.certificateDocuments && <p className="text-red-500 text-sm mt-1">{errors.certificateDocuments}</p>}
          </div>
        </div>
      </div>

      {/* Success Stories */}
                <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Success Stories</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="alumniSuccessStories">Alumni Success Stories (Optional)</Label>
            <Textarea
              id="alumniSuccessStories"
              value={formData.alumniSuccessStories}
              onChange={(e) => handleInputChange('alumniSuccessStories', e.target.value)}
              placeholder="Share inspiring stories of your alumni..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="placementRecords">Placement Records (if applicable)</Label>
            <Textarea
              id="placementRecords"
              value={formData.placementRecords}
              onChange={(e) => handleInputChange('placementRecords', e.target.value)}
              placeholder="Describe placement statistics, top recruiters, average salary..."
              rows={4}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="higherStudiesAdmissions">Higher Studies Admissions</Label>
            <Textarea
              id="higherStudiesAdmissions"
              value={formData.higherStudiesAdmissions}
              onChange={(e) => handleInputChange('higherStudiesAdmissions', e.target.value)}
              placeholder="List universities/colleges where students got admission..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="scholarshipRecipients">Scholarship Recipients</Label>
            <Textarea
              id="scholarshipRecipients"
              value={formData.scholarshipRecipients}
              onChange={(e) => handleInputChange('scholarshipRecipients', e.target.value)}
              placeholder="List scholarship details, amounts, and recipients..."
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 6 of 7: Fee Structure & Policies</h2>
        <p className="text-gray-600">Define your institution's fee structure and payment policies</p>
      </div>
      
      {/* Detailed Fee Structure */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Detailed Fee Structure</h3>
        
        <div className="space-y-4">
          {formData.courseFeeStructures.map((structure, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Course/Subject {index + 1}</h4>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCourseFeeStructure(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`courseSubjectName${index}`}>Course/Subject Name *</Label>
                  <Input
                    id={`courseSubjectName${index}`}
                    value={structure.courseSubjectName}
                    onChange={(e) => updateCourseFeeStructure(index, 'courseSubjectName', e.target.value)}
                    placeholder="e.g., Mathematics, Science, English"
                  />
                </div>

                <div>
                  <Label htmlFor={`admissionFee${index}`}>One-time Admission Fee * (₹)</Label>
                  <Input
                    id={`admissionFee${index}`}
                    type="number"
                    value={structure.admissionFee}
                    onChange={(e) => updateCourseFeeStructure(index, 'admissionFee', e.target.value)}
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor={`monthlyFee${index}`}>Monthly Fee * (₹)</Label>
                  <Input
                    id={`monthlyFee${index}`}
                    type="number"
                    value={structure.monthlyFee}
                    onChange={(e) => updateCourseFeeStructure(index, 'monthlyFee', e.target.value)}
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <Label htmlFor={`quarterlyFee${index}`}>Quarterly Fee * (₹)</Label>
                  <Input
                    id={`quarterlyFee${index}`}
                    type="number"
                    value={structure.quarterlyFee}
                    onChange={(e) => updateCourseFeeStructure(index, 'quarterlyFee', e.target.value)}
                    placeholder="e.g., 1400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor={`annualFee${index}`}>Annual Fee * (₹)</Label>
                  <Input
                    id={`annualFee${index}`}
                    type="number"
                    value={structure.annualFee}
                    onChange={(e) => updateCourseFeeStructure(index, 'annualFee', e.target.value)}
                    placeholder="e.g., 5000"
                  />
                </div>

                <div>
                  <Label htmlFor={`materialCharges${index}`}>Material/Book Charges (₹)</Label>
                  <Input
                    id={`materialCharges${index}`}
                    type="number"
                    value={structure.materialCharges}
                    onChange={(e) => updateCourseFeeStructure(index, 'materialCharges', e.target.value)}
                    placeholder="e.g., 200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor={`examFee${index}`}>Exam Fee (₹)</Label>
                  <Input
                    id={`examFee${index}`}
                    type="number"
                    value={structure.examFee}
                    onChange={(e) => updateCourseFeeStructure(index, 'examFee', e.target.value)}
                    placeholder="e.g., 100"
                  />
                </div>

                <div>
                  <Label htmlFor={`otherCharges${index}`}>Other Charges (₹)</Label>
                  <Input
                    id={`otherCharges${index}`}
                    value={structure.otherCharges}
                    onChange={(e) => updateCourseFeeStructure(index, 'otherCharges', e.target.value)}
                    placeholder="e.g., 50 for ID card"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addCourseFeeStructure}
            className="w-full"
          >
            + Add Another Course/Subject Fee Structure
          </Button>
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Payment Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Payment Modes Accepted *</Label>
            <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                  id="cash"
                  checked={formData.paymentModesAccepted.cash}
                  onCheckedChange={(checked) => handleInputChange('paymentModesAccepted', { ...formData.paymentModesAccepted, cash: checked })}
                />
                <Label htmlFor="cash" className="text-sm">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                  id="cheque"
                  checked={formData.paymentModesAccepted.cheque}
                  onCheckedChange={(checked) => handleInputChange('paymentModesAccepted', { ...formData.paymentModesAccepted, cheque: checked })}
                />
                <Label htmlFor="cheque" className="text-sm">Cheque</Label>
                    </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bankTransfer"
                  checked={formData.paymentModesAccepted.bankTransfer}
                  onCheckedChange={(checked) => handleInputChange('paymentModesAccepted', { ...formData.paymentModesAccepted, bankTransfer: checked })}
                />
                <Label htmlFor="bankTransfer" className="text-sm">Bank Transfer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="onlinePayment"
                  checked={formData.paymentModesAccepted.onlinePayment}
                  onCheckedChange={(checked) => handleInputChange('paymentModesAccepted', { ...formData.paymentModesAccepted, onlinePayment: checked })}
                />
                <Label htmlFor="onlinePayment" className="text-sm">Online Payment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="upi"
                  checked={formData.paymentModesAccepted.upi}
                  onCheckedChange={(checked) => handleInputChange('paymentModesAccepted', { ...formData.paymentModesAccepted, upi: checked })}
                />
                <Label htmlFor="upi" className="text-sm">UPI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="creditDebitCards"
                  checked={formData.paymentModesAccepted.creditDebitCards}
                  onCheckedChange={(checked) => handleInputChange('paymentModesAccepted', { ...formData.paymentModesAccepted, creditDebitCards: checked })}
                />
                <Label htmlFor="creditDebitCards" className="text-sm">Credit/Debit Cards</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emiAvailable"
                  checked={formData.paymentModesAccepted.emiAvailable}
                  onCheckedChange={(checked) => handleInputChange('paymentModesAccepted', { ...formData.paymentModesAccepted, emiAvailable: checked })}
                />
                <Label htmlFor="emiAvailable" className="text-sm">EMI Available</Label>
              </div>
                  </div>
                </div>

          <div>
            <Label htmlFor="paymentSchedule">Payment Schedule *</Label>
            <Select value={formData.paymentSchedule} onValueChange={(value) => handleInputChange('paymentSchedule', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="half-yearly">Half-yearly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Fee Policies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Fee Policies</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latePaymentPenalty">Late Payment Penalty (₹ or %)</Label>
            <Input
              id="latePaymentPenalty"
              value={formData.latePaymentPenalty}
              onChange={(e) => handleInputChange('latePaymentPenalty', e.target.value)}
              placeholder="e.g., ₹100 or 5% per month"
            />
          </div>

          <div>
            <Label htmlFor="scholarshipAvailable">Scholarship Available</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="scholarshipYes"
                  name="scholarshipAvailable"
                  value="true"
                  checked={formData.scholarshipAvailable === true}
                  onChange={() => handleInputChange('scholarshipAvailable', true)}
                  className="text-primary"
                />
                <Label htmlFor="scholarshipYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="scholarshipNo"
                  name="scholarshipAvailable"
                  value="false"
                  checked={formData.scholarshipAvailable === false}
                  onChange={() => handleInputChange('scholarshipAvailable', false)}
                  className="text-primary"
                />
                <Label htmlFor="scholarshipNo">No</Label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="refundPolicy">Refund Policy *</Label>
          <Textarea
            id="refundPolicy"
            value={formData.refundPolicy}
            onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
            placeholder="Describe your institution's refund policy in detail..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.refundPolicy.length}/500 characters</p>
        </div>

        {formData.scholarshipAvailable && (
          <div>
            <Label htmlFor="scholarshipCriteria">Scholarship Criteria</Label>
            <Textarea
              id="scholarshipCriteria"
              value={formData.scholarshipCriteria}
              onChange={(e) => handleInputChange('scholarshipCriteria', e.target.value)}
              placeholder="Describe the criteria for awarding scholarships..."
              rows={3}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="discountMultipleCourses">Discount for Multiple Courses</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="discountMultipleYes"
                  name="discountMultipleCourses"
                  value="true"
                  checked={formData.discountMultipleCourses === true}
                  onChange={() => handleInputChange('discountMultipleCourses', true)}
                  className="text-primary"
                />
                <Label htmlFor="discountMultipleYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="discountMultipleNo"
                  name="discountMultipleCourses"
                  value="false"
                  checked={formData.discountMultipleCourses === false}
                  onChange={() => handleInputChange('discountMultipleCourses', false)}
                  className="text-primary"
                />
                <Label htmlFor="discountMultipleNo">No</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="siblingDiscount">Sibling Discount</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="siblingDiscountYes"
                  name="siblingDiscount"
                  value="true"
                  checked={formData.siblingDiscount === true}
                  onChange={() => handleInputChange('siblingDiscount', true)}
                  className="text-primary"
                />
                <Label htmlFor="siblingDiscountYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="siblingDiscountNo"
                  name="siblingDiscount"
                  value="false"
                  checked={formData.siblingDiscount === false}
                  onChange={() => handleInputChange('siblingDiscount', false)}
                  className="text-primary"
                />
                <Label htmlFor="siblingDiscountNo">No</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="earlyBirdDiscount">Early Bird Discount</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="earlyBirdDiscountYes"
                  name="earlyBirdDiscount"
                  value="true"
                  checked={formData.earlyBirdDiscount === true}
                  onChange={() => handleInputChange('earlyBirdDiscount', true)}
                  className="text-primary"
                />
                <Label htmlFor="earlyBirdDiscountYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="earlyBirdDiscountNo"
                  name="earlyBirdDiscount"
                  value="false"
                  checked={formData.earlyBirdDiscount === false}
                  onChange={() => handleInputChange('earlyBirdDiscount', false)}
                  className="text-primary"
                />
                <Label htmlFor="earlyBirdDiscountNo">No</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Aid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Financial Aid</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="educationLoanAssistance">Education Loan Assistance</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="educationLoanYes"
                  name="educationLoanAssistance"
                  value="true"
                  checked={formData.educationLoanAssistance === true}
                  onChange={() => handleInputChange('educationLoanAssistance', true)}
                  className="text-primary"
                />
                <Label htmlFor="educationLoanYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="educationLoanNo"
                  name="educationLoanAssistance"
                  value="false"
                  checked={formData.educationLoanAssistance === false}
                  onChange={() => handleInputChange('educationLoanAssistance', false)}
                  className="text-primary"
                />
                <Label htmlFor="educationLoanNo">No</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="installmentFacility">Installment Facility</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="installmentYes"
                  name="installmentFacility"
                  value="true"
                  checked={formData.installmentFacility === true}
                  onChange={() => handleInputChange('installmentFacility', true)}
                  className="text-primary"
                />
                <Label htmlFor="installmentYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="installmentNo"
                  name="installmentFacility"
                  value="false"
                  checked={formData.installmentFacility === false}
                  onChange={() => handleInputChange('installmentFacility', false)}
                  className="text-primary"
                />
                <Label htmlFor="installmentNo">No</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="hardshipSupport">Hardship Support</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="hardshipYes"
                  name="hardshipSupport"
                  value="true"
                  checked={formData.hardshipSupport === true}
                  onChange={() => handleInputChange('hardshipSupport', true)}
                  className="text-primary"
                />
                <Label htmlFor="hardshipYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="hardshipNo"
                  name="hardshipSupport"
                  value="false"
                  checked={formData.hardshipSupport === false}
                  onChange={() => handleInputChange('hardshipSupport', false)}
                  className="text-primary"
                />
                <Label htmlFor="hardshipNo">No</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage7 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 7 of 7: Contact & Verification</h2>
        <p className="text-gray-600">Provide contact information and upload required documents for verification</p>
      </div>
      
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryContactPerson">Primary Contact Person *</Label>
            <Input
              id="primaryContactPerson"
              value={formData.primaryContactPerson}
              onChange={(e) => handleInputChange('primaryContactPerson', e.target.value)}
              placeholder="e.g., John Doe"
            />
          </div>

          <div>
            <Label htmlFor="designation">Designation *</Label>
            <Select value={formData.designation} onValueChange={(value) => handleInputChange('designation', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="directPhoneNumber">Direct Phone Number *</Label>
            <Input
              id="directPhoneNumber"
              type="tel"
              value={formData.directPhoneNumber}
              onChange={(e) => handleInputChange('directPhoneNumber', e.target.value)}
              placeholder="10-digit number"
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="contactEmailAddress">Email Address *</Label>
            <Input
              id="contactEmailAddress"
              type="email"
              value={formData.contactEmailAddress}
              onChange={(e) => handleInputChange('contactEmailAddress', e.target.value)}
              placeholder="Different from institution email"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input
              id="whatsappNumber"
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
              placeholder="10-digit number"
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="bestTimeToContact">Best Time to Contact *</Label>
            <Select value={formData.bestTimeToContact} onValueChange={(value) => handleInputChange('bestTimeToContact', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9am-12pm">9:00 AM - 12:00 PM</SelectItem>
                <SelectItem value="12pm-3pm">12:00 PM - 3:00 PM</SelectItem>
                <SelectItem value="3pm-6pm">3:00 PM - 6:00 PM</SelectItem>
                <SelectItem value="6pm-9pm">6:00 PM - 9:00 PM</SelectItem>
                <SelectItem value="anytime">Anytime</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Social Media & Online Presence */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Social Media & Online Presence</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="facebookPage">Facebook Page</Label>
            <Input
              id="facebookPage"
              type="url"
              value={formData.facebookPage}
              onChange={(e) => handleInputChange('facebookPage', e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <Label htmlFor="instagramAccount">Instagram Account</Label>
            <Input
              id="instagramAccount"
              type="url"
              value={formData.instagramAccount}
              onChange={(e) => handleInputChange('instagramAccount', e.target.value)}
              placeholder="https://instagram.com/youraccount"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="youtubeChannel">YouTube Channel</Label>
            <Input
              id="youtubeChannel"
              type="url"
              value={formData.youtubeChannel}
              onChange={(e) => handleInputChange('youtubeChannel', e.target.value)}
              placeholder="https://youtube.com/yourchannel"
            />
          </div>

          <div>
            <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
            <Input
              id="linkedinProfile"
              type="url"
              value={formData.linkedinProfile}
              onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="googleMyBusiness">Google My Business</Label>
          <Input
            id="googleMyBusiness"
            type="url"
            value={formData.googleMyBusiness}
            onChange={(e) => handleInputChange('googleMyBusiness', e.target.value)}
            placeholder="https://g.page/yourbusiness"
          />
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Emergency Contacts</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyContactPerson">Emergency Contact Person *</Label>
            <Input
              id="emergencyContactPerson"
              value={formData.emergencyContactPerson}
              onChange={(e) => handleInputChange('emergencyContactPerson', e.target.value)}
              placeholder="Name"
            />
          </div>

          <div>
            <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
            <Input
              id="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
              placeholder="10-digit number"
              maxLength={10}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="localPoliceStationContact">Local Police Station Contact</Label>
            <Input
              id="localPoliceStationContact"
              value={formData.localPoliceStationContact}
              onChange={(e) => handleInputChange('localPoliceStationContact', e.target.value)}
              placeholder="Phone number"
            />
          </div>

          <div>
            <Label htmlFor="nearestHospitalContact">Nearest Hospital Contact</Label>
            <Input
              id="nearestHospitalContact"
              value={formData.nearestHospitalContact}
              onChange={(e) => handleInputChange('nearestHospitalContact', e.target.value)}
              placeholder="Phone number"
            />
          </div>

          <div>
            <Label htmlFor="fireDepartmentContact">Fire Department Contact</Label>
            <Input
              id="fireDepartmentContact"
              value={formData.fireDepartmentContact}
              onChange={(e) => handleInputChange('fireDepartmentContact', e.target.value)}
              placeholder="Phone number"
            />
          </div>
        </div>
      </div>

      {/* Document Verification */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Document Verification</h3>
        
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800">Required Documents Upload</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessRegistrationCertificate">Business Registration Certificate *</Label>
              <Input
                type="file"
                id="businessRegistrationCertificate"
                accept=".pdf"
                onChange={(e) => handleFileUpload('businessRegistrationCertificate', e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <Label htmlFor="educationBoardAffiliationCertificate">Education Board Affiliation Certificate *</Label>
              <Input
                type="file"
                id="educationBoardAffiliationCertificate"
                accept=".pdf"
                onChange={(e) => handleFileUpload('educationBoardAffiliationCertificate', e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fireSafetyCertificate">Fire Safety Certificate *</Label>
              <Input
                type="file"
                id="fireSafetyCertificate"
                accept=".pdf"
                onChange={(e) => handleFileUpload('fireSafetyCertificate', e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <Label htmlFor="buildingPlanApproval">Building Plan Approval *</Label>
              <Input
                type="file"
                id="buildingPlanApproval"
                accept=".pdf"
                onChange={(e) => handleFileUpload('buildingPlanApproval', e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="panCardDocument">PAN Card *</Label>
              <Input
                type="file"
                id="panCardDocument"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('panCardDocument', e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <Label htmlFor="gstCertificate">GST Certificate (if applicable)</Label>
              <Input
                type="file"
                id="gstCertificate"
                accept=".pdf"
                onChange={(e) => handleFileUpload('gstCertificate', e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankAccountDetails">Bank Account Details *</Label>
              <Input
                type="file"
                id="bankAccountDetails"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('bankAccountDetails', e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">Cancelled cheque or bank statement</p>
            </div>

            <div>
              <Label htmlFor="institutionPhotographs">Photographs of Institution *</Label>
              <Input
                type="file"
                id="institutionPhotographs"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload('institutionPhotographs', Array.from(e.target.files || []))}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 5 photos</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800">Optional Documents</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="insuranceDocuments">Insurance Documents</Label>
              <Input
                type="file"
                id="insuranceDocuments"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('insuranceDocuments', Array.from(e.target.files || []))}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <Label htmlFor="accreditationCertificates">Accreditation Certificates</Label>
              <Input
                type="file"
                id="accreditationCertificates"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('accreditationCertificates', Array.from(e.target.files || []))}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="awardCertificates">Award Certificates</Label>
              <Input
                type="file"
                id="awardCertificates"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('awardCertificates', Array.from(e.target.files || []))}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <Label htmlFor="facultyQualificationCertificates">Faculty Qualification Certificates</Label>
              <Input
                type="file"
                id="facultyQualificationCertificates"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('facultyQualificationCertificates', Array.from(e.target.files || []))}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="safetyComplianceCertificates">Safety Compliance Certificates</Label>
            <Input
              type="file"
              id="safetyComplianceCertificates"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('safetyComplianceCertificates', Array.from(e.target.files || []))}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Final Verification */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Final Verification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mobileOtpVerified">Mobile OTP Verification *</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="mobileOtpYes"
                  name="mobileOtpVerified"
                  value="true"
                  checked={formData.mobileOtpVerified === true}
                  onChange={() => handleInputChange('mobileOtpVerified', true)}
                  className="text-primary"
                />
                <Label htmlFor="mobileOtpYes">Verified</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="mobileOtpNo"
                  name="mobileOtpVerified"
                  value="false"
                  checked={formData.mobileOtpVerified === false}
                  onChange={() => handleInputChange('mobileOtpVerified', false)}
                  className="text-primary"
                />
                <Label htmlFor="mobileOtpNo">Not Verified</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="emailVerified">Email Verification *</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="emailVerifiedYes"
                  name="emailVerified"
                  value="true"
                  checked={formData.emailVerified === true}
                  onChange={() => handleInputChange('emailVerified', true)}
                  className="text-primary"
                />
                <Label htmlFor="emailVerifiedYes">Verified</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="emailVerifiedNo"
                  name="emailVerified"
                  value="false"
                  checked={formData.emailVerified === false}
                  onChange={() => handleInputChange('emailVerified', false)}
                  className="text-primary"
                />
                <Label htmlFor="emailVerifiedNo">Not Verified</Label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="backgroundCheckConsent">Background Check Consent</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="backgroundCheckYes"
                name="backgroundCheckConsent"
                value="true"
                checked={formData.backgroundCheckConsent === true}
                onChange={() => handleInputChange('backgroundCheckConsent', true)}
                className="text-primary"
              />
              <Label htmlFor="backgroundCheckYes">I consent to background verification</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="backgroundCheckNo"
                name="backgroundCheckConsent"
                value="false"
                checked={formData.backgroundCheckConsent === false}
                onChange={() => handleInputChange('backgroundCheckConsent', false)}
                className="text-primary"
              />
              <Label htmlFor="backgroundCheckNo">I do not consent</Label>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Review Process Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Document Verification: Admin review required</li>
            <li>• Physical Verification: For premium listings</li>
            <li>• Review Timeline: 5-7 business days</li>
            <li>• Status Tracking: Available in dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Step {currentPage} of 7</span>
        <span className="text-sm text-gray-500">{Math.round((currentPage / 7) * 100)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentPage / 7) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Basic Info</span>
        <span>Facilities</span>
        <span>Courses</span>
        <span>Faculty</span>
        <span>Results</span>
        <span>Fees</span>
        <span>Contact</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Institution Registration</h1>
          <p className="text-lg text-gray-600">Join our platform and connect with students worldwide</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Complete Your Institution Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {renderProgressBar()}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentPage === 1 && renderPage1()}
              {currentPage === 2 && renderPage2()}
              {currentPage === 3 && renderPage3()}
              {currentPage === 4 && renderPage4()}
              {currentPage === 5 && renderPage5()}
              {currentPage === 6 && renderPage6()}
              {currentPage === 7 && renderPage7()}

              <div className="flex justify-between pt-6">
                {currentPage > 1 && (
                  <Button
                    type="button"
                    onClick={prevPage}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}

                {currentPage < 7 ? (
                  <Button
                    type="button"
                    onClick={nextPage}
                    className="flex items-center space-x-2 ml-auto"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                <Button 
                  type="submit" 
                    className="flex items-center space-x-2 ml-auto"
                  disabled={isLoading || submitCooldown > 0}
                >
                  {isLoading ? "Creating Account..." : 
                   submitCooldown > 0 ? `Wait ${submitCooldown}s` : "Submit for Review"}
                </Button>
                )}
              </div>
            </form>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
