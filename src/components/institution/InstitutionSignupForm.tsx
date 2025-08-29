import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, MapPin, Upload, CheckCircle, XCircle, Send, Eye, EyeOff } from 'lucide-react'
import { OTPVerification } from './OTPVerification'
import { FileUpload } from './FileUpload'
import { LocationPicker } from './LocationPicker'
import { CityAutocomplete } from './CityAutocomplete'

interface InstitutionSignupFormProps {
  onSuccess: (institutionId: string) => void
}

interface FormData {
  // Basic Information
  name: string
  type: string
  establishment_year: string
  registration_number: string
  pan: string
  gst: string
  official_email: string
  primary_contact: string
  secondary_contact: string
  website: string
  
  // Address
  complete_address: string
  city: string
  state: string
  pincode: string
  landmark: string
  latitude: number | null
  longitude: number | null
  
  // Legal
  owner_name: string
  owner_contact: string
  agree_terms: boolean
  agree_background_verification: boolean
}

interface FileData {
  file_key: string
  file_name: string
  file_type: string
  file_size: number
}

export const InstitutionSignupForm: React.FC<InstitutionSignupFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    establishment_year: '',
    registration_number: '',
    pan: '',
    gst: '',
    official_email: '',
    primary_contact: '',
    secondary_contact: '',
    website: '',
    complete_address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    latitude: null,
    longitude: null,
    owner_name: '',
    owner_contact: '',
    agree_terms: false,
    agree_background_verification: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [primaryContactVerified, setPrimaryContactVerified] = useState(false)
  const [ownerContactVerified, setOwnerContactVerified] = useState(false)
  const [businessLicenseFile, setBusinessLicenseFile] = useState<FileData | null>(null)
  const [registrationCertificateFile, setRegistrationCertificateFile] = useState<FileData | null>(null)

  const institutionTypes = [
    'Coaching', 'Training', 'Language', 'Music Academy', 'Dance School', 
    'Sports Academy', 'Computer Training', 'Professional', 'Arts & Crafts', 'Other'
  ]

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ]

  const currentYear = new Date().getFullYear()
  const establishmentYears = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)

  const handleInputChange = (field: keyof FormData, value: string | boolean | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Institution name is required'
    if (!formData.type) newErrors.type = 'Institution type is required'
    if (!formData.establishment_year) newErrors.establishment_year = 'Establishment year is required'
    if (!formData.registration_number.trim()) newErrors.registration_number = 'Registration number is required'
    if (!formData.pan.trim()) newErrors.pan = 'PAN is required'
    if (!formData.official_email.trim()) newErrors.official_email = 'Official email is required'
    if (!formData.primary_contact.trim()) newErrors.primary_contact = 'Primary contact is required'
    if (!formData.owner_name.trim()) newErrors.owner_name = 'Owner name is required'
    if (!formData.owner_contact.trim()) newErrors.owner_contact = 'Owner contact is required'
    if (!formData.complete_address.trim()) newErrors.complete_address = 'Complete address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'

    // Format validation
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(formData.pan)) {
      newErrors.pan = 'PAN must be 10 characters in format AAAAA9999A'
    }
    if (formData.gst && !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/i.test(formData.gst)) {
      newErrors.gst = 'GST must be 15 characters'
    }
    if (formData.primary_contact && !/^\d{10}$/.test(formData.primary_contact)) {
      newErrors.primary_contact = 'Primary contact must be 10 digits'
    }
    if (formData.secondary_contact && !/^\d{10}$/.test(formData.secondary_contact)) {
      newErrors.secondary_contact = 'Secondary contact must be 10 digits'
    }
    if (formData.owner_contact && !/^\d{10}$/.test(formData.owner_contact)) {
      newErrors.owner_contact = 'Owner contact must be 10 digits'
    }
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits'
    }
    if (formData.official_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.official_email)) {
      newErrors.official_email = 'Invalid email format'
    }

    // OTP verification check
    if (!primaryContactVerified) newErrors.primary_contact = 'Primary contact must be verified via OTP'
    if (!ownerContactVerified) newErrors.owner_contact = 'Owner contact must be verified via OTP'

    // Document upload check
    if (!businessLicenseFile) newErrors.business_license = 'Business license is required'
    if (!registrationCertificateFile) newErrors.registration_certificate = 'Registration certificate is required'

    // Terms agreement check
    if (!formData.agree_terms) newErrors.agree_terms = 'You must agree to terms and conditions'
    if (!formData.agree_background_verification) newErrors.agree_background_verification = 'You must agree to background verification'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        business_license_file: businessLicenseFile,
        registration_certificate_file: registrationCertificateFile
      }

      const response = await fetch('/api/institution/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.field) {
          setErrors({ [data.field]: data.error })
          toast.error(data.error)
        } else {
          toast.error(data.error || 'Registration failed')
        }
        return
      }

      onSuccess(data.institution_id)

    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Basic Information</CardTitle>
          <CardDescription>Enter your institution's basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Institution Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter institution name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Institution Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {institutionTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="establishment_year">Establishment Year *</Label>
              <Select value={formData.establishment_year} onValueChange={(value) => handleInputChange('establishment_year', value)}>
                <SelectTrigger className={errors.establishment_year ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {establishmentYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.establishment_year && <p className="text-sm text-red-500">{errors.establishment_year}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number *</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => handleInputChange('registration_number', e.target.value)}
                placeholder="Enter registration number"
                className={errors.registration_number ? 'border-red-500' : ''}
              />
              {errors.registration_number && <p className="text-sm text-red-500">{errors.registration_number}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number *</Label>
              <Input
                id="pan"
                value={formData.pan}
                onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                className={errors.pan ? 'border-red-500' : ''}
              />
              {errors.pan && <p className="text-sm text-red-500">{errors.pan}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst">GST Number (Optional)</Label>
              <Input
                id="gst"
                value={formData.gst}
                onChange={(e) => handleInputChange('gst', e.target.value.toUpperCase())}
                placeholder="12ABCDE1234F1Z5"
                maxLength={15}
                className={errors.gst ? 'border-red-500' : ''}
              />
              {errors.gst && <p className="text-sm text-red-500">{errors.gst}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="official_email">Official Email *</Label>
              <Input
                id="official_email"
                type="email"
                value={formData.official_email}
                onChange={(e) => handleInputChange('official_email', e.target.value)}
                placeholder="admin@institution.com"
                className={errors.official_email ? 'border-red-500' : ''}
              />
              {errors.official_email && <p className="text-sm text-red-500">{errors.official_email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.institution.com"
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Contact Information</CardTitle>
          <CardDescription>Enter contact details for your institution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_contact">Primary Contact *</Label>
              <div className="flex space-x-2">
                <Input
                  id="primary_contact"
                  value={formData.primary_contact}
                  onChange={(e) => handleInputChange('primary_contact', e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  className={errors.primary_contact ? 'border-red-500' : ''}
                />
                <OTPVerification
                  phone={formData.primary_contact}
                  purpose="institution_primary_contact"
                  onVerified={() => setPrimaryContactVerified(true)}
                  isVerified={primaryContactVerified}
                />
              </div>
              {errors.primary_contact && <p className="text-sm text-red-500">{errors.primary_contact}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_contact">Secondary Contact (Optional)</Label>
              <Input
                id="secondary_contact"
                value={formData.secondary_contact}
                onChange={(e) => handleInputChange('secondary_contact', e.target.value)}
                placeholder="9876543211"
                maxLength={10}
                className={errors.secondary_contact ? 'border-red-500' : ''}
              />
              {errors.secondary_contact && <p className="text-sm text-red-500">{errors.secondary_contact}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Address Information</CardTitle>
          <CardDescription>Enter your institution's address details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="complete_address">Complete Address *</Label>
            <Textarea
              id="complete_address"
              value={formData.complete_address}
              onChange={(e) => handleInputChange('complete_address', e.target.value)}
              placeholder="Enter complete address"
              rows={3}
              className={errors.complete_address ? 'border-red-500' : ''}
            />
            {errors.complete_address && <p className="text-sm text-red-500">{errors.complete_address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <CityAutocomplete
                value={formData.city}
                onChange={(city, state) => {
                  handleInputChange('city', city)
                  handleInputChange('state', state)
                }}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="123456"
                maxLength={6}
                className={errors.pincode ? 'border-red-500' : ''}
              />
              {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                value={formData.landmark}
                onChange={(e) => handleInputChange('landmark', e.target.value)}
                placeholder="Near main road, opposite bank, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Location Coordinates (Optional)</Label>
              <LocationPicker
                onLocationSelect={(lat, lng) => {
                  handleInputChange('latitude', lat)
                  handleInputChange('longitude', lng)
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Legal Information</CardTitle>
          <CardDescription>Enter owner details and upload required documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner_name">Owner/Director Name *</Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => handleInputChange('owner_name', e.target.value)}
                placeholder="Enter owner/director name"
                className={errors.owner_name ? 'border-red-500' : ''}
              />
              {errors.owner_name && <p className="text-sm text-red-500">{errors.owner_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_contact">Owner Contact *</Label>
              <div className="flex space-x-2">
                <Input
                  id="owner_contact"
                  value={formData.owner_contact}
                  onChange={(e) => handleInputChange('owner_contact', e.target.value)}
                  placeholder="9876543212"
                  maxLength={10}
                  className={errors.owner_contact ? 'border-red-500' : ''}
                />
                <OTPVerification
                  phone={formData.owner_contact}
                  purpose="institution_owner_contact"
                  onVerified={() => setOwnerContactVerified(true)}
                  isVerified={ownerContactVerified}
                />
              </div>
              {errors.owner_contact && <p className="text-sm text-red-500">{errors.owner_contact}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business License *</Label>
              <FileUpload
                onFileUploaded={setBusinessLicenseFile}
                docType="business_license"
                error={errors.business_license}
              />
            </div>

            <div className="space-y-2">
              <Label>Registration Certificate *</Label>
              <FileUpload
                onFileUploaded={setRegistrationCertificateFile}
                docType="registration_certificate"
                error={errors.registration_certificate}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Terms and Conditions</CardTitle>
          <CardDescription>Please read and agree to the following terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agree_terms"
                checked={formData.agree_terms}
                onCheckedChange={(checked) => handleInputChange('agree_terms', checked as boolean)}
              />
              <Label htmlFor="agree_terms" className="text-sm">
                I agree to the terms and conditions of the platform
              </Label>
            </div>
            {errors.agree_terms && <p className="text-sm text-red-500">{errors.agree_terms}</p>}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agree_background_verification"
                checked={formData.agree_background_verification}
                onCheckedChange={(checked) => handleInputChange('agree_background_verification', checked as boolean)}
              />
              <Label htmlFor="agree_background_verification" className="text-sm">
                I agree to undergo background verification as required
              </Label>
            </div>
            {errors.agree_background_verification && <p className="text-sm text-red-500">{errors.agree_background_verification}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full h-12 text-lg font-semibold"
          disabled={isSubmitting || !primaryContactVerified || !ownerContactVerified}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Institution Registration'
          )}
        </Button>
      </div>
    </form>
  )
}
