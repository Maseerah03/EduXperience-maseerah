import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { ArrowLeft, Upload, FileText, Image, Shield, Trophy, Phone, Mail, Globe, AlertTriangle, CheckCircle, Save } from 'lucide-react'
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext'
import { supabase } from '@/integrations/supabase/client'
import { useWorkingPageAutoSave } from '@/hooks/useWorkingPageAutoSave'
import { WorkingPageSaveIndicator } from '@/components/ui/WorkingPageSaveIndicator'
import { useNavigate } from 'react-router-dom'

export default function FinalReviewPage7() {
  const { 
    formData, 
    currentPage, 
    totalPages, 
    previousPage, 
    goToNextPage, 
    updateContactVerification 
  } = useInstitutionSignup()

  // Initialize local data with fallback values
  const [localData, setLocalData] = useState(() => {
    const initialData = formData.contactVerification
    return {
      // Contact Information
      primaryContactPerson: initialData?.primaryContactPerson || '',
      designation: initialData?.designation || '',
      directPhoneNumber: initialData?.directPhoneNumber || '',
      emailAddress: initialData?.emailAddress || '',
      whatsappNumber: initialData?.whatsappNumber || '',
      bestTimeToContact: initialData?.bestTimeToContact || '',
      
      // Social Media & Online Presence
      facebookPage: initialData?.facebookPage || '',
      instagramAccount: initialData?.instagramAccount || '',
      youtubeChannel: initialData?.youtubeChannel || '',
      linkedinProfile: initialData?.linkedinProfile || '',
      googleMyBusiness: initialData?.googleMyBusiness || '',
      
      // Emergency Contacts
      emergencyContactPerson: initialData?.emergencyContactPerson || '',
      emergencyContactPhone: initialData?.emergencyContactPhone || '',
      localPoliceStationContact: initialData?.localPoliceStationContact || '',
      nearestHospitalContact: initialData?.nearestHospitalContact || '',
      fireDepartmentContact: initialData?.fireDepartmentContact || '',
      
      // Document Verification (uploads)
      businessRegistrationCertificate: initialData?.businessRegistrationCertificate || undefined,
      educationBoardAffiliationCertificate: initialData?.educationBoardAffiliationCertificate || undefined,
      fireSafetyCertificate: initialData?.fireSafetyCertificate || undefined,
      buildingPlanApproval: initialData?.buildingPlanApproval || undefined,
      panCard: initialData?.panCard || undefined,
      gstCertificate: initialData?.gstCertificate || undefined,
      bankAccountDetails: initialData?.bankAccountDetails || undefined,
      institutionPhotographs: initialData?.institutionPhotographs || [],
      
      // Optional Documents
      insuranceDocuments: initialData?.insuranceDocuments || [],
      accreditationCertificates: initialData?.accreditationCertificates || [],
      awardCertificates: initialData?.awardCertificates || [],
      facultyQualificationCertificates: initialData?.facultyQualificationCertificates || [],
      safetyComplianceCertificates: initialData?.safetyComplianceCertificates || [],
      
      // Final Verification
      mobileOtpVerified: initialData?.mobileOtpVerified || false,
      emailVerified: initialData?.emailVerified || false,
      documentVerificationStatus: initialData?.documentVerificationStatus || 'pending',
      physicalVerificationRequired: initialData?.physicalVerificationRequired || false,
      backgroundCheckConsent: initialData?.backgroundCheckConsent || false,
      
      // Final Submission
      termsAccepted: initialData?.termsAccepted || false,
      submittedForReview: initialData?.submittedForReview || false,
      emailConfirmationSent: initialData?.emailConfirmationSent || false,
      accountActivated: initialData?.accountActivated || false,
      reviewTimeline: initialData?.reviewTimeline || '5-7 business days',
      verificationStatus: initialData?.verificationStatus || 'pending'
    }
  })

  // Auto-save functionality
  const { save, debouncedSave, manualSave, lastSaved, isSaving, restore } = useWorkingPageAutoSave(7, localData)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync local state with context
  useEffect(() => {
    if (formData.contactVerification) {
      setLocalData(prev => ({
        ...prev,
        ...formData.contactVerification
      }))
    }
  }, [formData.contactVerification])

  // Restore saved data on mount
  useEffect(() => {
    const savedData = restore()
    if (savedData && Object.keys(savedData).length > 0) {
      setLocalData(prev => ({ ...prev, ...savedData }))
      // Also update the context with restored data
      updateContactVerification(savedData)
    }
  }, []) // Only run once on mount

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateContactVerification({ [field]: value })
    debouncedSave(newData)
  }

  const handleTermsChange = (field: string, value: boolean) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
    updateContactVerification({ [field]: value })
  }

  const handleDocumentStatusChange = (value: boolean) => {
    const status = value ? 'approved' : 'pending'
    setLocalData(prev => ({ ...prev, documentVerificationStatus: status }))
    updateContactVerification({ documentVerificationStatus: status })
  }

  const handleFileUpload = (field: string, files: FileList | null) => {
    if (files && files.length > 0) {
      if (field === 'institutionPhotographs') {
        // Handle multiple photos
        const photoFiles = Array.from(files)
        setLocalData(prev => ({ ...prev, [field]: photoFiles }))
        updateContactVerification({ [field]: photoFiles })
      } else if (field.includes('Documents') || field.includes('Certificates')) {
        // Handle multiple optional documents
        const docFiles = Array.from(files)
        setLocalData(prev => ({ ...prev, [field]: docFiles }))
        updateContactVerification({ [field]: docFiles })
      } else {
        // Handle single file
        const file = files[0]
        setLocalData(prev => ({ ...prev, [field]: file }))
        updateContactVerification({ [field]: file })
      }
    }
  }

  const isPageComplete = (page: number) => {
    // Check if required contact fields are filled
    return localData.primaryContactPerson && 
           localData.designation && 
           localData.directPhoneNumber && 
           localData.emailAddress && 
           localData.bestTimeToContact &&
           localData.emergencyContactPerson &&
           localData.emergencyContactPhone &&
           localData.backgroundCheckConsent
  }

  const handleSubmit = async () => {
    if (!isPageComplete(currentPage)) {
      toast.error('Please complete all required fields before submitting')
      return
    }

    setIsSubmitting(true)
    try {
      // Get current user from Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      // Prepare data for institution_profiles table
      const institutionData = {
        user_id: user.id,
        institution_name: formData.basicInformation.institutionName,
        institution_type: formData.basicInformation.institutionType,
        establishment_year: formData.basicInformation.establishmentYear || null,
        registration_number: formData.basicInformation.registrationNumber || null,
        pan_number: formData.basicInformation.panNumber || null,
        gst_number: formData.basicInformation.gstNumber || null,
        official_email: formData.basicInformation.email,
        primary_contact: formData.basicInformation.phone,
        secondary_contact: null,
        website_url: formData.basicInformation.websiteUrl || null,
        total_classrooms: formData.facilitiesDetails.totalClassrooms || 0,
        classroom_capacity: formData.facilitiesDetails.classroomCapacity || null,
        library_available: formData.facilitiesDetails.libraryAvailable || false,
        computer_lab: formData.facilitiesDetails.computerLab || false,
        wifi_available: formData.facilitiesDetails.wifiAvailable || false,
        parking_available: formData.facilitiesDetails.parkingAvailable || false,
        cafeteria_available: formData.facilitiesDetails.cafeteriaCanteen || false,
        air_conditioning: formData.facilitiesDetails.airConditioning || false,
        cctv_security: formData.facilitiesDetails.cctvSecurity || false,
        wheelchair_accessible: formData.facilitiesDetails.wheelchairAccessible || false,
        projectors_smart_boards: formData.facilitiesDetails.projectorsSmartBoards || false,
        audio_system: formData.facilitiesDetails.audioSystem || false,
        physics_lab: formData.facilitiesDetails.laboratoryFacilities?.includes('physics') || false,
        chemistry_lab: formData.facilitiesDetails.laboratoryFacilities?.includes('chemistry') || false,
        biology_lab: formData.facilitiesDetails.laboratoryFacilities?.includes('biology') || false,
        language_lab: formData.facilitiesDetails.laboratoryFacilities?.includes('language') || false,
        indoor_games: formData.facilitiesDetails.sportsFacilities?.includes('indoor') || false,
        outdoor_playground: formData.facilitiesDetails.sportsFacilities?.includes('outdoor') || false,
        gymnasium: formData.facilitiesDetails.sportsFacilities?.includes('gym') || false,
        swimming_pool: formData.facilitiesDetails.sportsFacilities?.includes('swimming') || false,
        transportation_provided: formData.facilitiesDetails.transportationProvided || false,
        hostel_facility: formData.facilitiesDetails.hostelFacility || false,
        study_material_provided: formData.facilitiesDetails.studyMaterialProvided || false,
        online_classes: formData.facilitiesDetails.onlineClasses || false,
        recorded_sessions: formData.facilitiesDetails.recordedSessions || false,
        mock_tests_assessments: formData.facilitiesDetails.mockTestsAssessments || false,
        career_counseling: formData.facilitiesDetails.careerCounseling || false,
        job_placement_assistance: formData.facilitiesDetails.jobPlacementAssistance || false,
        complete_address: formData.basicInformation.address,
        city: formData.basicInformation.city,
        state: formData.basicInformation.state,
        pin_code: formData.basicInformation.pincode,
        landmark: null,
        google_maps_location: null,
        owner_name: formData.basicInformation.ownerName,
        owner_contact: formData.basicInformation.ownerPhone,
        verified: false, // Pending admin approval
        cbse: formData.academicPrograms.boardAffiliations?.includes('cbse') || false,
        icse: formData.academicPrograms.boardAffiliations?.includes('icse') || false,
        state_board: formData.academicPrograms.boardAffiliations?.includes('state') || false,
        ib_international: formData.academicPrograms.boardAffiliations?.includes('ib') || false,
        competitive_exams: formData.academicPrograms.competitiveExams || false,
        professional_courses: formData.academicPrograms.professionalCourses || false,
        language_classes: formData.academicPrograms.languageClasses || false,
        computer_courses: formData.academicPrograms.computerCourses || false,
        arts_crafts: formData.academicPrograms.artsCrafts || false,
        music_dance: formData.academicPrograms.musicDance || false,
        sports_training: formData.academicPrograms.sportsTraining || false,
        subjects_offered: formData.academicPrograms.subjectsOffered?.join(', ') || null,
        beginner: formData.academicPrograms.classLevels?.includes('beginner') || false,
        intermediate: formData.academicPrograms.classLevels?.includes('intermediate') || false,
        advanced: formData.academicPrograms.classLevels?.includes('advanced') || false,
        batch_sizes: formData.academicPrograms.batchSizes || null,
        course_duration: formData.academicPrograms.courseDuration || null,
        certification_provided: formData.academicPrograms.certification || false,
        course_fee_structure: formData.academicPrograms.feeStructure || null,
        total_current_students: formData.academicPrograms.totalCurrentStudents || 0,
        average_batch_size: formData.academicPrograms.averageBatchSize || 0,
        student_teacher_ratio: formData.academicPrograms.studentTeacherRatio || null,
        morning_batches: formData.academicPrograms.classTimings?.includes('morning') || false,
        afternoon_batches: formData.academicPrograms.classTimings?.includes('afternoon') || false,
        evening_batches: formData.academicPrograms.classTimings?.includes('evening') || false,
        weekend_batches: formData.academicPrograms.classTimings?.includes('weekend') || false,
        flexible_timings: formData.academicPrograms.flexibleTimings || false,
        admission_test_required: formData.academicPrograms.admissionTestRequired || false,
        minimum_qualification: formData.academicPrograms.minimumQualification || null,
        age_restrictions: formData.academicPrograms.ageRestrictions || null,
        admission_fees: formData.academicPrograms.admissionFees || 0,
        security_deposit: formData.academicPrograms.securityDeposit || 0,
        refund_policy: formData.academicPrograms.refundPolicy || null,
        total_teaching_staff: formData.staffFaculty.totalTeachingStaff || 0,
        total_non_teaching_staff: formData.staffFaculty.totalNonTeachingStaff || 0,
        average_faculty_experience: formData.staffFaculty.averageFacultyExperience || null,
        principal_name: formData.staffFaculty.principalName || null,
        principal_qualification: formData.staffFaculty.principalQualification || null,
        principal_experience: formData.staffFaculty.principalExperience || 0,
        principal_bio: formData.staffFaculty.principalBio || null,
        department_heads: formData.staffFaculty.departmentHeads || [],
        phd_holders: formData.staffFaculty.phdHolders || 0,
        post_graduates: formData.staffFaculty.postGraduates || 0,
        graduates: formData.staffFaculty.graduates || 0,
        professional_certified: formData.staffFaculty.professionalCertified || 0,
        awards_received: formData.staffFaculty.awardsReceived || null,
        publications: formData.staffFaculty.publications || null,
        industry_experience: formData.staffFaculty.industryExperience || null,
        training_programs_attended: formData.staffFaculty.trainingProgramsAttended || null,
        board_exam_results: formData.resultsAchievements.boardExamResults || [],
        competitive_exam_results: formData.resultsAchievements.competitiveExamResults || [],
        institution_awards: formData.resultsAchievements.institutionAwards || null,
        student_achievements: formData.resultsAchievements.studentAchievements || null,
        government_accreditation: formData.resultsAchievements.governmentAccreditation || false,
        board_affiliation_details: formData.resultsAchievements.boardAffiliationDetails || null,
        university_affiliation: formData.resultsAchievements.universityAffiliation || null,
        professional_body_membership: formData.resultsAchievements.professionalBodyMembership || null,
        quality_certifications: formData.resultsAchievements.qualityCertifications || null,
        alumni_success_stories: formData.resultsAchievements.alumniSuccessStories || null,
        placement_records: formData.resultsAchievements.placementRecords || null,
        higher_studies_admissions: formData.resultsAchievements.higherStudiesAdmissions || null,
        scholarship_recipients: formData.resultsAchievements.scholarshipRecipients || null,
        course_fee_structures: formData.feePolicies.feeStructures || [],
        payment_modes_accepted: formData.feePolicies.paymentModesAccepted || [],
        payment_schedule: formData.feePolicies.paymentSchedule || null,
        late_payment_penalty: formData.feePolicies.latePaymentPenalty || null,
        refund_policy_detailed: formData.feePolicies.refundPolicy || null,
        scholarship_available: formData.feePolicies.scholarshipAvailable || false,
        scholarship_criteria: formData.feePolicies.scholarshipCriteria || null,
        discount_multiple_courses: formData.feePolicies.discountMultipleCourses || false,
        sibling_discount: formData.feePolicies.siblingDiscount || false,
        early_bird_discount: formData.feePolicies.earlyBirdDiscount || false,
        education_loan_assistance: formData.feePolicies.educationLoanAssistance || false,
        installment_facility: formData.feePolicies.installmentFacility || false,
        hardship_support: formData.feePolicies.hardshipSupport || false,
        primary_contact_person: localData.primaryContactPerson,
        designation: localData.designation,
        direct_phone_number: localData.directPhoneNumber,
        contact_email_address: localData.emailAddress,
        whatsapp_number: localData.whatsappNumber || null,
        best_time_to_contact: localData.bestTimeToContact,
        facebook_page: localData.facebookPage || null,
        instagram_account: localData.instagramAccount || null,
        youtube_channel: localData.youtubeChannel || null,
        linkedin_profile: localData.linkedinProfile || null,
        google_my_business: localData.googleMyBusiness || null,
        emergency_contact_person: localData.emergencyContactPerson,
        emergency_contact_phone: localData.emergencyContactPhone,
        local_police_station_contact: localData.localPoliceStationContact || null,
        nearest_hospital_contact: localData.nearestHospitalContact || null,
        fire_department_contact: localData.fireDepartmentContact || null,
        mobile_otp_verified: localData.mobileOtpVerified || false,
        email_verified: localData.emailVerified || false,
        background_check_consent: localData.backgroundCheckConsent || false
      }

      // Save to institution_profiles table
      const { data: savedInstitution, error: saveError } = await supabase
        .from('institution_profiles')
        .insert([institutionData])
        .select()
        .single()

      if (saveError) {
        console.error('Error saving to institution_profiles:', saveError)
        throw new Error('Failed to save institution profile')
      }

      // Also update the profiles table to mark as institution
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          user_id: user.id,
          role: 'institution',
          full_name: formData.basicInformation.institutionName,
          email: formData.basicInformation.email,
          phone: formData.basicInformation.phone,
          city: formData.basicInformation.city,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (profileError) {
        console.warn('Warning: Could not update profiles table:', profileError)
      }

      // Mark as submitted in context
      updateContactVerification({ 
        submittedForReview: true,
        verificationStatus: 'under_review',
        emailConfirmationSent: true
      })
      
      // Show success message
      toast.success('Application submitted successfully! Your institution profile has been created and is pending admin approval.')
      
      // Redirect to institution dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/institution-dashboard'
      }, 2000)

    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCompletionStatus = (section: string) => {
    switch (section) {
      case 'basic':
        return formData.basicInformation.institutionName ? 'complete' : 'incomplete'
      case 'facilities':
        return formData.facilitiesDetails.totalClassrooms > 0 ? 'complete' : 'incomplete'
      case 'academic':
        return formData.academicPrograms.courseCategories.length > 0 ? 'complete' : 'incomplete'
      case 'staff':
        return formData.staffFaculty.principalName ? 'complete' : 'incomplete'
      case 'results':
        return formData.resultsAchievements.academicResults.length > 0 ? 'complete' : 'incomplete'
      case 'fees':
        return formData.feePolicies.feeStructures.length > 0 ? 'complete' : 'incomplete'
      case 'contact':
        return localData.primaryContactPerson ? 'complete' : 'incomplete'
      default:
        return 'incomplete'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contact & Verification
          </h1>
          <p className="text-gray-600">
            Final step: Provide contact information and complete verification
          </p>
          <div className="mt-4 flex justify-center">
            <WorkingPageSaveIndicator 
              isSaving={isSaving} 
              lastSaved={lastSaved} 
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentPage} of {totalPages}</span>
            <span>Final Review</span>
          </div>
          <Progress value={(currentPage / totalPages) * 100} className="h-2" />
        </div>

        {/* Review Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {['basic', 'facilities', 'academic', 'staff', 'results', 'fees'].map((section) => (
            <Card key={section} className="p-4">
              <div className="flex items-center justify-between">
                <span className="capitalize font-medium">{section} Information</span>
                <div className={`flex items-center gap-2 ${
                  getCompletionStatus(section) === 'complete' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {getCompletionStatus(section) === 'complete' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="text-sm capitalize">
                    {getCompletionStatus(section)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Primary contact details for the institution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryContactPerson">Primary Contact Person *</Label>
                <Input
                  id="primaryContactPerson"
                  value={localData.primaryContactPerson}
                  onChange={(e) => handleInputChange('primaryContactPerson', e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Select value={localData.designation} onValueChange={(value) => handleInputChange('designation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Principal">Principal</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="directPhoneNumber">Direct Phone Number *</Label>
                <Input
                  id="directPhoneNumber"
                  value={localData.directPhoneNumber}
                  onChange={(e) => handleInputChange('directPhoneNumber', e.target.value)}
                  placeholder="10-digit number"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="emailAddress">Email Address *</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={localData.emailAddress}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                  placeholder="contact@institution.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={localData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  placeholder="10-digit number (optional)"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="bestTimeToContact">Best Time to Contact *</Label>
                <Select value={localData.bestTimeToContact} onValueChange={(value) => handleInputChange('bestTimeToContact', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9AM-12PM">9AM-12PM</SelectItem>
                    <SelectItem value="12PM-3PM">12PM-3PM</SelectItem>
                    <SelectItem value="3PM-6PM">3PM-6PM</SelectItem>
                    <SelectItem value="6PM-9PM">6PM-9PM</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media & Online Presence */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Social Media & Online Presence
            </CardTitle>
            <CardDescription>
              Optional social media and online presence links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebookPage">Facebook Page</Label>
                <Input
                  id="facebookPage"
                  type="url"
                  value={localData.facebookPage}
                  onChange={(e) => handleInputChange('facebookPage', e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <Label htmlFor="instagramAccount">Instagram Account</Label>
                <Input
                  id="instagramAccount"
                  type="url"
                  value={localData.instagramAccount}
                  onChange={(e) => handleInputChange('instagramAccount', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="youtubeChannel">YouTube Channel</Label>
                <Input
                  id="youtubeChannel"
                  type="url"
                  value={localData.youtubeChannel}
                  onChange={(e) => handleInputChange('youtubeChannel', e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                <Input
                  id="linkedinProfile"
                  type="url"
                  value={localData.linkedinProfile}
                  onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                  placeholder="https://linkedin.com/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="googleMyBusiness">Google My Business</Label>
              <Input
                id="googleMyBusiness"
                type="url"
                value={localData.googleMyBusiness}
                onChange={(e) => handleInputChange('googleMyBusiness', e.target.value)}
                placeholder="https://business.google.com/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency Contacts
            </CardTitle>
            <CardDescription>
              Emergency contact information for safety and compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContactPerson">Emergency Contact Person *</Label>
                <Input
                  id="emergencyContactPerson"
                  value={localData.emergencyContactPerson}
                  onChange={(e) => handleInputChange('emergencyContactPerson', e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                <Input
                  id="emergencyContactPhone"
                  value={localData.emergencyContactPhone}
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
                  value={localData.localPoliceStationContact}
                  onChange={(e) => handleInputChange('localPoliceStationContact', e.target.value)}
                  placeholder="Phone number (optional)"
                />
              </div>
              <div>
                <Label htmlFor="nearestHospitalContact">Nearest Hospital Contact</Label>
                <Input
                  id="nearestHospitalContact"
                  value={localData.nearestHospitalContact}
                  onChange={(e) => handleInputChange('nearestHospitalContact', e.target.value)}
                  placeholder="Phone number (optional)"
                />
              </div>
              <div>
                <Label htmlFor="fireDepartmentContact">Fire Department Contact</Label>
                <Input
                  id="fireDepartmentContact"
                  value={localData.fireDepartmentContact}
                  onChange={(e) => handleInputChange('fireDepartmentContact', e.target.value)}
                  placeholder="Phone number (optional)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Documents */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documents
            </CardTitle>
            <CardDescription>
              Upload mandatory documents for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessRegistrationCertificate">Business Registration Certificate *</Label>
                <Input
                  id="businessRegistrationCertificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('businessRegistrationCertificate', e.target.files)}
                />
              </div>
              <div>
                <Label htmlFor="educationBoardAffiliationCertificate">Education Board Affiliation Certificate *</Label>
                <Input
                  id="educationBoardAffiliationCertificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('educationBoardAffiliationCertificate', e.target.files)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fireSafetyCertificate">Fire Safety Certificate *</Label>
                <Input
                  id="fireSafetyCertificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('fireSafetyCertificate', e.target.files)}
                />
              </div>
              <div>
                <Label htmlFor="buildingPlanApproval">Building Plan Approval *</Label>
                <Input
                  id="buildingPlanApproval"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('buildingPlanApproval', e.target.files)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="panCard">PAN Card *</Label>
                <Input
                  id="panCard"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('panCard', e.target.files)}
                />
              </div>
              <div>
                <Label htmlFor="gstCertificate">GST Certificate</Label>
                <Input
                  id="gstCertificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('gstCertificate', e.target.files)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankAccountDetails">Bank Account Details *</Label>
                <Input
                  id="bankAccountDetails"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('bankAccountDetails', e.target.files)}
                />
              </div>
              <div>
                <Label htmlFor="institutionPhotographs">Institution Photographs * (Min 5)</Label>
                <Input
                  id="institutionPhotographs"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileUpload('institutionPhotographs', e.target.files)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional Documents */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Optional Documents
            </CardTitle>
            <CardDescription>
              Additional documents for enhanced verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceDocuments">Insurance Documents</Label>
                <Input
                  id="insuranceDocuments"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileUpload('insuranceDocuments', e.target.files)}
                />
              </div>
              <div>
                <Label htmlFor="accreditationCertificates">Accreditation Certificates</Label>
                <Input
                  id="accreditationCertificates"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileUpload('accreditationCertificates', e.target.files)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="awardCertificates">Award Certificates</Label>
                <Input
                  id="awardCertificates"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileUpload('awardCertificates', e.target.files)}
                />
              </div>
              <div>
                <Label htmlFor="facultyQualificationCertificates">Faculty Qualification Certificates</Label>
                <Input
                  id="facultyQualificationCertificates"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileUpload('facultyQualificationCertificates', e.target.files)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="safetyComplianceCertificates">Safety Compliance Certificates</Label>
              <Input
                id="safetyComplianceCertificates"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleFileUpload('safetyComplianceCertificates', e.target.files)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Final Verification */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Final Verification
            </CardTitle>
            <CardDescription>
              Complete verification steps and provide consent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mobileOtpVerified"
                  checked={localData.mobileOtpVerified}
                  onCheckedChange={(checked) => handleInputChange('mobileOtpVerified', checked)}
                />
                <Label htmlFor="mobileOtpVerified">Mobile OTP Verified</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailVerified"
                  checked={localData.emailVerified}
                  onCheckedChange={(checked) => handleInputChange('emailVerified', checked)}
                />
                <Label htmlFor="emailVerified">Email Verified</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="physicalVerificationRequired"
                  checked={localData.physicalVerificationRequired}
                  onCheckedChange={(checked) => handleInputChange('physicalVerificationRequired', checked)}
                />
                <Label htmlFor="physicalVerificationRequired">Physical Verification Required (Premium)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="backgroundCheckConsent"
                  checked={localData.backgroundCheckConsent}
                  onCheckedChange={(checked) => handleInputChange('backgroundCheckConsent', checked)}
                />
                <Label htmlFor="backgroundCheckConsent">Background Check Consent *</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Terms & Conditions
            </CardTitle>
            <CardDescription>
              Please read and accept all terms before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                   id="termsAccepted"
                   checked={localData.termsAccepted}
                   onCheckedChange={(checked) => handleTermsChange('termsAccepted', checked as boolean)}
                 />
                 <Label htmlFor="termsAccepted">
                  I agree to the Terms and Conditions of the platform *
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                   id="backgroundCheckConsent"
                   checked={localData.backgroundCheckConsent}
                   onCheckedChange={(checked) => handleTermsChange('backgroundCheckConsent', checked as boolean)}
                 />
                 <Label htmlFor="backgroundCheckConsent">
                  I consent to background verification and document review *
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                   id="documentVerificationStatus"
                   checked={localData.documentVerificationStatus === 'approved'}
                   onCheckedChange={(checked) => handleDocumentStatusChange(checked as boolean)}
                 />
                 <Label htmlFor="documentVerificationStatus">
                  I confirm all information provided is accurate and truthful *
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                   id="submittedForReview"
                   checked={localData.submittedForReview}
                   onCheckedChange={(checked) => handleTermsChange('submittedForReview', checked as boolean)}
                 />
                 <Label htmlFor="submittedForReview">
                  I agree to the Privacy Policy and data handling practices *
                </Label>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Review Timeline & Process</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Review process takes 5-7 business days</li>
                <li>• You will receive email updates on verification status</li>
                <li>• Account remains inactive until email confirmation</li>
                <li>• Physical verification may be required for premium listings</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousPage}
            className="h-12 px-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <div className="flex items-center space-x-4">
            {/* Manual Save Button */}
            <Button
              type="button"
              variant="outline"
              onClick={manualSave}
              className="h-12 px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Progress
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isPageComplete(currentPage) || isSubmitting}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
