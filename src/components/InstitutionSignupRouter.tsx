import React, { useEffect } from 'react'
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext'
import AccountCreationPage0 from '@/pages/institution-signup/AccountCreationPage0'
import InstitutionSignUp from '@/pages/InstitutionSignUp'
import InstitutionDetailsPage2 from '@/pages/institution-signup/InstitutionDetailsPage2'
import AcademicProgramsPage3 from '@/pages/institution-signup/AcademicProgramsPage3'
import StaffFacultyPage4 from '@/pages/institution-signup/StaffFacultyPage4'
import ResultsAchievementsPage5 from '@/pages/institution-signup/ResultsAchievementsPage5'
import FeeStructurePoliciesPage6 from '@/pages/institution-signup/FeeStructurePoliciesPage6'
import FinalReviewPage7 from '@/pages/institution-signup/FinalReviewPage7'
import { Header } from '@/components/layout/Header'

export default function InstitutionSignupRouter() {
  const { currentPage, checkVerificationStatus, totalPages } = useInstitutionSignup()
  console.log('🔄 InstitutionSignupRouter: currentPage =', currentPage, 'totalPages =', totalPages)
  
  // Automatically check verification status when component mounts
  useEffect(() => {
    console.log('🔄 InstitutionSignupRouter: Checking verification status on mount...')
    if (checkVerificationStatus()) {
      console.log('✅ Verification status restored, user should be at Step 1')
    }
  }, [checkVerificationStatus])
  
  // Debug effect to track currentPage changes
  useEffect(() => {
    console.log('📱 InstitutionSignupRouter: currentPage changed to:', currentPage)
  }, [currentPage])
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
                  {(() => {
          switch (currentPage) {
            case 0: return <AccountCreationPage0 />
            case 1: return <InstitutionSignUp />
            case 2: return <InstitutionDetailsPage2 />
            case 3: return <AcademicProgramsPage3 />
            case 4: return <StaffFacultyPage4 />
            case 5: return <ResultsAchievementsPage5 />
            case 6: return <FeeStructurePoliciesPage6 />
            case 7: return <FinalReviewPage7 />
            default:
              console.log('InstitutionSignupRouter: default case, currentPage =', currentPage)
              return <AccountCreationPage0 />
          }
        })()}
        </div>
      </div>
    </div>
  )
}
