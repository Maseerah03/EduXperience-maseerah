import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, MapPin, Upload, CheckCircle, XCircle } from 'lucide-react'
import { InstitutionSignupForm } from '@/components/institution/InstitutionSignupForm'

const InstitutionSignupNew = () => {
  const navigate = useNavigate()

  const handleSuccess = (institutionId: string) => {
    toast.success('Institution registration submitted successfully!')
    navigate(`/institution-signup/success/${institutionId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Institution Registration
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Complete your institution profile with all required information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstitutionSignupForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default InstitutionSignupNew
