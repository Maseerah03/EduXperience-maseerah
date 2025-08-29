import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Mail, Building2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext'

export default function EmailVerificationPage() {
  const { updateAccountStatus, goToNextPage } = useInstitutionSignup()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log('🔍 Starting email verification process...')
        console.log('URL params:', Object.fromEntries(searchParams.entries()))

        // Handle different Supabase email verification flows
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')
        const token = searchParams.get('token') // Standard Supabase verification token
        const tokenHash = searchParams.get('token_hash') // Alternative Supabase parameter

        // Check if we have any of the required tokens
        if (!accessToken && !refreshToken && !token && !tokenHash) {
          console.log('❌ No verification tokens found in URL')
          setVerificationStatus('error')
          setErrorMessage('Invalid verification link. Please check your email and try again.')
          return
        }

        let sessionResult

        if (accessToken && refreshToken) {
          // Handle custom token flow
          console.log('🔑 Using access_token and refresh_token flow')
          sessionResult = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
        } else if (token) {
          // Handle standard Supabase verification flow
          console.log('🔑 Using standard Supabase token flow')
          sessionResult = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          })
        } else if (tokenHash) {
          // Handle alternative Supabase flow
          console.log('🔑 Using token_hash flow')
          sessionResult = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'email'
          })
        }

        if (sessionResult?.error) {
          throw sessionResult.error
        }

        console.log('✅ Session established successfully')

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          throw userError || new Error('User not found after verification')
        }

        console.log('✅ User retrieved:', user.email)

        // Check if email is already confirmed
        if (user.email_confirmed_at) {
          console.log('✅ Email already confirmed at:', user.email_confirmed_at)
        } else {
          // Update user metadata to mark email as confirmed
          console.log('🔄 Updating user metadata...')
          const { error: updateError } = await supabase.auth.updateUser({
            data: { email_confirmed: true }
          })

          if (updateError) {
            console.warn('⚠️ Warning updating user metadata:', updateError)
            // Don't fail the verification for this
          }
        }

        // Mark verification as successful
        setVerificationStatus('success')
        toast.success('Email verified successfully!')

        // Update context to mark email as verified
        updateAccountStatus({ emailVerified: true })
        
        // Also update localStorage directly for immediate persistence
        const accountCreation = localStorage.getItem('institution_account_creation')
        if (accountCreation) {
          try {
            const accountData = JSON.parse(accountCreation)
            accountData.emailVerified = true
            localStorage.setItem('institution_account_creation', JSON.stringify(accountData))
          } catch (error) {
            console.error('Error updating localStorage:', error)
          }
        }

        // Store verification status in localStorage for persistence
        localStorage.setItem('institution_email_verified', 'true')
        localStorage.setItem('institution_verification_user_id', user.id)

        console.log('✅ Email verification completed successfully')
        console.log('🔄 Auto-advancing to Step 1 in 3 seconds...')

        // Auto-advance to Step 1 (Basic Information) after a short delay
        setTimeout(() => {
          console.log('🚀 Redirecting to Step 1...')
          goToNextPage()
        }, 3000)

      } catch (error: any) {
        console.error('❌ Email verification error:', error)
        setVerificationStatus('error')
        setErrorMessage(error.message || 'Failed to verify email. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams, updateAccountStatus, goToNextPage])

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Verifying Your Email
              </CardTitle>
              <CardDescription className="text-gray-600">
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Email Verified Successfully!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your account has been activated. You can now complete your institution profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Complete your institution profile (7 steps)</li>
                  <li>• Upload required documents</li>
                  <li>• Get verified and start using the platform</li>
                </ul>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => {
                    // Move to the next step (Basic Information)
                    goToNextPage()
                  }}
                  className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  Continue to Institution Profile
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>You will be automatically taken to Step 1 (Basic Information) in a few seconds...</p>
                <p className="mt-1 text-xs text-gray-400">Or click the button above to continue immediately</p>
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  <p>🔍 Debug Info:</p>
                  <p>• Email verification completed</p>
                  <p>• Context updated with emailVerified: true</p>
                  <p>• localStorage updated</p>
                  <p>• Auto-redirect in progress...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Verification Failed
              </CardTitle>
              <CardDescription className="text-gray-600">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Troubleshooting:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Check if the link is complete and not broken</li>
                  <li>• Try copying and pasting the link again</li>
                  <li>• Contact support if the problem persists</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                <Button
                  onClick={() => navigate('/institution-signup')}
                  className="w-full"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Back to Signup
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>Need help? Contact our support team</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
