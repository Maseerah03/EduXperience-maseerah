import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Home, FileText, Clock, Phone, Mail } from 'lucide-react'

const InstitutionSignupSuccess = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Registration Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Thank you for registering your institution with EduXperience
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Registration Details</h3>
                <div className="text-blue-800 text-left space-y-1">
                  <p><strong>Institution ID:</strong> {id}</p>
                  <p><strong>Status:</strong> <span className="text-orange-600 font-medium">Pending Verification</span></p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-blue-800 text-left space-y-1">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Our team will review your application within 2-3 business days
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    We'll contact you on your verified phone numbers
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    You'll receive an email confirmation shortly
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Keep your uploaded documents ready for verification
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
                <ul className="text-yellow-800 text-left space-y-1 text-sm">
                  <li>• Please save your Institution ID for future reference</li>
                  <li>• Ensure your contact numbers remain active</li>
                  <li>• Keep all original documents ready</li>
                  <li>• You may be contacted for additional verification</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/institution-signup-new')}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Register Another Institution
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                <p>Need help? Contact our support team at support@eduxperience.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default InstitutionSignupSuccess
