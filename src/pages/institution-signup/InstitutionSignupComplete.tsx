import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Mail, Clock, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function InstitutionSignupComplete() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registration Submitted Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for registering your institution with us
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current Status: Under Review
            </CardTitle>
            <CardDescription>
              Your application is now being processed by our verification team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Email Confirmation Sent</p>
                  <p className="text-sm text-blue-700">Please check your email and click the confirmation link</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Review Timeline</p>
                  <p className="text-sm text-yellow-700">5-7 business days for complete verification</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Email Confirmation</h4>
                  <p className="text-sm text-gray-600">Click the link in your email to activate your account</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Document Review</h4>
                  <p className="text-sm text-gray-600">Our team will review all uploaded documents and information</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Verification Process</h4>
                  <p className="text-sm text-gray-600">Background checks and verification procedures will be completed</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Account Activation</h4>
                  <p className="text-sm text-gray-600">Once approved, your account will be fully activated</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Our support team is here to assist you throughout the process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                If you have any questions or need assistance, please contact our support team:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> support@eduxperience.com</p>
                <p><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="flex-1 sm:flex-none">
            <Link to="/login" onClick={() => {
              // Set a flag to indicate user should be redirected to dashboard after login
              localStorage.setItem('institution_redirect_to_dashboard', 'true')
            }}>
              Go to Login
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <Link to="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
