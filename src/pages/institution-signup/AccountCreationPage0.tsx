import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordStrength } from '@/components/ui/password-strength'
import { Mail, Lock, Building2, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { emailRegex } from '@/lib/validation'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext'

interface AccountCreationData {
  email: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
  privacyPolicyAccepted: boolean
}

interface ValidationErrors {
  [key: string]: string
}

const initialFormData: AccountCreationData = {
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
  privacyPolicyAccepted: false
}

export default function AccountCreationPage0() {
  const { updateAccountStatus, goToNextPage, checkVerificationStatus } = useInstitutionSignup()
  const [formData, setFormData] = useState<AccountCreationData>(initialFormData)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  // Check if user is already signed in or verified
  useEffect(() => {
    const checkUser = async () => {
      try {
        // First check localStorage for verification status
        if (checkVerificationStatus()) {
          console.log('✅ Verification status found in localStorage')
          return
        }
        
        // Then check Supabase session
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          if (user.email_confirmed_at) {
            // User is already verified, update status and redirect
            console.log('✅ User already verified in Supabase')
            updateAccountStatus({ accountCreated: true, emailVerified: true })
            goToNextPage()
            return
          }
          
          // User exists but not verified, check if they have an institution profile
          const { data: profile } = await supabase
            .from('institutions')
            .select('id, email')
            .eq('email', user.email)
            .single()
          
          if (profile) {
            // User already has an institution profile, redirect to dashboard
            toast.info('You are already signed in with an institution account')
            // You can redirect to dashboard here if needed
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }
    
    checkUser()
  }, [])

  const validateField = (field: keyof AccountCreationData, value: any) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required'
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address'
        } else {
          delete newErrors.email
        }
        break
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required'
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters'
        } else if (!/(?=.*[a-z])/.test(value)) {
          newErrors.password = 'Password must contain at least one lowercase letter'
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.password = 'Password must contain at least one uppercase letter'
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain at least one number'
        } else if (!/(?=.*[@$!%*?&])/.test(value)) {
          newErrors.password = 'Password must contain at least one special character'
        } else {
          delete newErrors.password
        }
        break
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password'
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match'
        } else {
          delete newErrors.confirmPassword
        }
        break
        
      case 'termsAccepted':
        if (!value) {
          newErrors.termsAccepted = 'You must accept the terms and conditions'
        } else {
          delete newErrors.termsAccepted
        }
        break
        
      case 'privacyPolicyAccepted':
        if (!value) {
          newErrors.privacyPolicyAccepted = 'You must accept the privacy policy'
        } else {
          delete newErrors.privacyPolicyAccepted
        }
        break
        
      default:
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof AccountCreationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (touchedFields.has(field)) {
      validateField(field, value)
    }
  }

  const handleBlur = (field: keyof AccountCreationData) => {
    setTouchedFields(prev => new Set([...prev, field]))
    validateField(field, formData[field])
  }

  const isFormValid = () => {
    return formData.email && 
           formData.password && 
           formData.confirmPassword && 
           formData.termsAccepted && 
           formData.privacyPolicyAccepted &&
           Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Create new user account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'institution',
            email_confirmed: false
          },
          emailRedirectTo: `${window.location.origin}/institution-signup/verify-email`
        }
      })

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message?.includes('already registered')) {
          toast.error('An account with this email already exists. Please try signing in instead.')
        } else {
          throw signUpError
        }
        return
      }

      if (signUpData.user) {
        // Update context with account creation status
        updateAccountStatus({ 
          accountCreated: true,
          emailVerified: false
        })

        // Store account creation data in localStorage for later use
        localStorage.setItem('institution_account_creation', JSON.stringify({
          email: formData.email,
          userId: signUpData.user.id,
          createdAt: new Date().toISOString()
        }))

        setIsEmailSent(true)
        toast.success('Account created successfully! Please check your email for verification.')
      }

    } catch (error: any) {
      console.error('Account creation error:', error)
      toast.error(error.message || 'Failed to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-gray-600">
                We've sent a verification link to <strong>{formData.email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the verification link in the email</li>
                  <li>• Return here to complete your institution profile</li>
                </ul>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>Didn't receive the email?</p>
                <Button
                  variant="link"
                  onClick={() => setIsEmailSent(false)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Try again
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (checkVerificationStatus()) {
                      toast.success('Email verified! Redirecting to Step 1...')
                    } else {
                      toast.info('Email not yet verified. Please check your email and click the verification link.')
                    }
                  }}
                  className="w-full"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check Verification Status
                </Button>
              </div>
              
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Institution Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step 0 of 8: Account Creation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Create your account to start the institution registration process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="institution@example.com"
                    required
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Create a strong password"
                    required
                  />
                </div>
                <PasswordStrength password={formData.password} />
                {errors.password && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleInputChange('termsAccepted', checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="termsAccepted" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-700 underline">
                      Terms and Conditions
                    </Link>{' '}
                    *
                  </Label>
                </div>
                {errors.termsAccepted && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.termsAccepted}
                  </div>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacyPolicyAccepted"
                    checked={formData.privacyPolicyAccepted}
                    onCheckedChange={(checked) => handleInputChange('privacyPolicyAccepted', checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="privacyPolicyAccepted" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                      Privacy Policy
                    </Link>{' '}
                    *
                  </Label>
                </div>
                {errors.privacyPolicyAccepted && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.privacyPolicyAccepted}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="w-full h-12 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account & Continue'
                )}
              </Button>
              
              {/* Manual verification check button */}
              <Button
                type="button"
                onClick={() => {
                  if (checkVerificationStatus()) {
                    toast.success('Verification status restored! Moving to Step 1...')
                  } else {
                    toast.info('No verified account found. Please create an account or check your email.')
                  }
                }}
                variant="outline"
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Check Verification Status
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
