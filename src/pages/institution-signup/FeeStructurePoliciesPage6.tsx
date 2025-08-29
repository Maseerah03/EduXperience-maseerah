import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, DollarSign, CreditCard, Calendar, FileText, Save, Plus, X, Shield, Handshake } from 'lucide-react'
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext'
import { useWorkingPageAutoSave } from '@/hooks/useWorkingPageAutoSave'
import { WorkingPageSaveIndicator } from '@/components/ui/WorkingPageSaveIndicator'

export default function FeeStructurePoliciesPage6() {
  const { 
    formData, 
    currentPage, 
    totalPages, 
    previousPage, 
    goToNextPage, 
    updateFeePolicies 
  } = useInstitutionSignup()

  // Initialize local data with fallback values
  const [localData, setLocalData] = useState(() => {
    const initialData = formData.feePolicies
    return {
      feeStructures: initialData?.feeStructures || [],
      paymentModesAccepted: initialData?.paymentModesAccepted || [],
      paymentSchedule: initialData?.paymentSchedule || '',
      latePaymentPenalty: initialData?.latePaymentPenalty || '',
      refundPolicy: initialData?.refundPolicy || '',
      scholarshipAvailable: initialData?.scholarshipAvailable || false,
      scholarshipCriteria: initialData?.scholarshipCriteria || '',
      discountForMultipleCourses: initialData?.discountForMultipleCourses || false,
      siblingDiscount: initialData?.siblingDiscount || false,
      earlyBirdDiscount: initialData?.earlyBirdDiscount || false,
      educationLoanAssistance: initialData?.educationLoanAssistance || false,
      installmentFacility: initialData?.installmentFacility || false,
      hardshipSupport: initialData?.hardshipSupport || false
    }
  })

  // Auto-save functionality
  const { save, debouncedSave, manualSave, lastSaved, isSaving, restore } = useWorkingPageAutoSave(6, localData)

  // Sync local state with context
  useEffect(() => {
    if (formData.feePolicies) {
      setLocalData(prev => ({
        ...prev,
        ...formData.feePolicies
      }))
    }
  }, [formData.feePolicies])

  // Restore saved data on mount
  useEffect(() => {
    const savedData = restore()
    if (savedData && Object.keys(savedData).length > 0) {
      setLocalData(prev => ({ ...prev, ...savedData }))
      // Also update the context with restored data
      updateFeePolicies(savedData)
    }
  }, []) // Only run once on mount

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateFeePolicies({ [field]: value })
    debouncedSave(newData)
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    const currentArray = (localData[field as keyof typeof localData] as string[]) || []
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    const newData = { ...localData, [field]: newArray }
    setLocalData(newData)
    updateFeePolicies({ [field]: newArray })
    debouncedSave(newData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goToNextPage()
  }

  const handleFeeStructureChange = (index: number, field: string, value: any) => {
    const updatedStructures = [...(localData.feeStructures || [])]
    updatedStructures[index] = { ...updatedStructures[index], [field]: value }
    handleInputChange('feeStructures', updatedStructures)
  }

  const addFeeStructure = () => {
    const newStructure = {
      courseSubjectName: '',
      oneTimeAdmissionFee: 0,
      monthlyFee: 0,
      quarterlyFee: undefined,
      annualFee: undefined,
      materialBookCharges: undefined,
      examFee: undefined,
      otherCharges: '',
      otherChargesAmount: undefined
    }
    handleInputChange('feeStructures', [...(localData.feeStructures || []), newStructure])
  }

  const removeFeeStructure = (index: number) => {
    const updatedStructures = (localData.feeStructures || []).filter((_, i) => i !== index)
    handleInputChange('feeStructures', updatedStructures)
  }

  const progressPercentage = (currentPage / totalPages) * 100

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Institution Signup - Fee Structure & Policies
              </h1>
               <div className="flex items-center gap-4">
              <span className="text-lg text-gray-600">
                Step {currentPage} of {totalPages}
              </span>
                 <WorkingPageSaveIndicator 
                   lastSaved={lastSaved} 
                   isSaving={isSaving} 
                   onManualSave={manualSave}
                 />
               </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Basic Information</span>
              <span>Facilities & Photos</span>
              <span>Academic Programs</span>
              <span>Faculty & Staff</span>
              <span>Results & Achievements</span>
              <span className="font-semibold text-blue-600">Fee Structure & Policies</span>
              <span>Final Review</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Detailed Fee Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Detailed Fee Structure
                </CardTitle>
                <CardDescription>
                  Define fee structure for each course or subject offered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(localData.feeStructures || []).map((structure, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Course/Subject {index + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeeStructure(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`course-name-${index}`}>Course/Subject Name *</Label>
                          <Input
                            id={`course-name-${index}`}
                            value={structure.courseSubjectName}
                            onChange={(e) => handleFeeStructureChange(index, 'courseSubjectName', e.target.value)}
                            placeholder="e.g., Mathematics, Science, English"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`admission-fee-${index}`}>One-time Admission Fee (₹) *</Label>
                          <Input
                            id={`admission-fee-${index}`}
                            type="number"
                            min="0"
                            value={structure.oneTimeAdmissionFee || ''}
                            onChange={(e) => handleFeeStructureChange(index, 'oneTimeAdmissionFee', parseInt(e.target.value) || 0)}
                            placeholder="Enter amount"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`monthly-fee-${index}`}>Monthly Fee (₹) *</Label>
                          <Input
                            id={`monthly-fee-${index}`}
                            type="number"
                            min="0"
                            value={structure.monthlyFee || ''}
                            onChange={(e) => handleFeeStructureChange(index, 'monthlyFee', parseInt(e.target.value) || 0)}
                            placeholder="Enter amount"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`quarterly-fee-${index}`}>Quarterly Fee (₹)</Label>
                          <Input
                            id={`quarterly-fee-${index}`}
                            type="number"
                            min="0"
                            value={structure.quarterlyFee || ''}
                            onChange={(e) => handleFeeStructureChange(index, 'quarterlyFee', parseInt(e.target.value) || undefined)}
                            placeholder="Optional"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`annual-fee-${index}`}>Annual Fee (₹)</Label>
                          <Input
                            id={`annual-fee-${index}`}
                            type="number"
                            min="0"
                            value={structure.annualFee || ''}
                            onChange={(e) => handleFeeStructureChange(index, 'annualFee', parseInt(e.target.value) || undefined)}
                            placeholder="Optional"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`material-charges-${index}`}>Material/Book Charges (₹)</Label>
                          <Input
                            id={`material-charges-${index}`}
                            type="number"
                            min="0"
                            value={structure.materialBookCharges || ''}
                            onChange={(e) => handleFeeStructureChange(index, 'materialBookCharges', parseInt(e.target.value) || undefined)}
                            placeholder="Optional"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`exam-fee-${index}`}>Exam Fee (₹)</Label>
                          <Input
                            id={`exam-fee-${index}`}
                            type="number"
                            min="0"
                            value={structure.examFee || ''}
                            onChange={(e) => handleFeeStructureChange(index, 'examFee', parseInt(e.target.value) || undefined)}
                            placeholder="Optional"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`other-charges-${index}`}>Other Charges Description</Label>
                          <Input
                            id={`other-charges-${index}`}
                            value={structure.otherCharges || ''}
                            onChange={(e) => handleFeeStructureChange(index, 'otherCharges', e.target.value)}
                            placeholder="e.g., Lab fees, Sports fees"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`other-amount-${index}`}>Other Charges Amount (₹)</Label>
                          <Input
                            id={`other-amount-${index}`}
                            type="number"
                            min="0"
                            value={structure.otherChargesAmount || ''}
                            onChange={(e) => handleFeeStructureChange(index, 'otherChargesAmount', parseInt(e.target.value) || undefined)}
                            placeholder="Enter amount"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  onClick={addFeeStructure}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course/Subject Fee Structure
                </Button>
              </CardContent>
            </Card>

            {/* Payment Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Options
                </CardTitle>
                <CardDescription>
                  Configure accepted payment modes and schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Modes Accepted *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Cash', 'Cheque', 'Bank Transfer', 'Online Payment', 'UPI', 'Credit/Debit Cards', 'EMI Available'].map(mode => (
                      <div key={mode} className="flex items-center space-x-2">
                        <Checkbox
                          id={mode}
                          checked={localData.paymentModesAccepted.includes(mode)}
                          onCheckedChange={(checked) => handleArrayChange('paymentModesAccepted', mode, checked as boolean)}
                        />
                        <Label htmlFor={mode}>{mode}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentSchedule">Payment Schedule *</Label>
                  <Select
                    value={localData.paymentSchedule}
                    onValueChange={(value) => handleInputChange('paymentSchedule', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Monthly', 'Quarterly', 'Half-yearly', 'Annual', 'Flexible'].map(schedule => (
                        <SelectItem key={schedule} value={schedule}>
                          {schedule}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Fee Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Fee Policies
                </CardTitle>
                <CardDescription>
                  Define policies for late payments, refunds, and discounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="latePaymentPenalty">Late Payment Penalty</Label>
                    <Input
                      id="latePaymentPenalty"
                      value={localData.latePaymentPenalty}
                      onChange={(e) => handleInputChange('latePaymentPenalty', e.target.value)}
                      placeholder="e.g., ₹100 per month or 5% per month"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refundPolicy">Refund Policy *</Label>
                     <Input
                      id="refundPolicy"
                      value={localData.refundPolicy}
                      onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                      placeholder="Describe your refund policy in detail"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Discounts & Scholarships</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="scholarshipAvailable">Scholarship Available</Label>
                        <Select
                          value={localData.scholarshipAvailable ? 'yes' : 'no'}
                          onValueChange={(value) => handleInputChange('scholarshipAvailable', value === 'yes')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {localData.scholarshipAvailable && (
                        <div className="space-y-2">
                          <Label htmlFor="scholarshipCriteria">Scholarship Criteria</Label>
                           <Input
                            id="scholarshipCriteria"
                            value={localData.scholarshipCriteria || ''}
                            onChange={(e) => handleInputChange('scholarshipCriteria', e.target.value)}
                            placeholder="Describe scholarship eligibility criteria"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="discountForMultipleCourses">Discount for Multiple Courses</Label>
                        <Select
                          value={localData.discountForMultipleCourses ? 'yes' : 'no'}
                          onValueChange={(value) => handleInputChange('discountForMultipleCourses', value === 'yes')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="siblingDiscount">Sibling Discount</Label>
                        <Select
                          value={localData.siblingDiscount ? 'yes' : 'no'}
                          onValueChange={(value) => handleInputChange('siblingDiscount', value === 'yes')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="earlyBirdDiscount">Early Bird Discount</Label>
                        <Select
                          value={localData.earlyBirdDiscount ? 'yes' : 'no'}
                          onValueChange={(value) => handleInputChange('earlyBirdDiscount', value === 'yes')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Aid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5" />
                  Financial Aid & Support
                </CardTitle>
                <CardDescription>
                  Additional financial assistance options for students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="educationLoanAssistance">Education Loan Assistance</Label>
                    <Select
                      value={localData.educationLoanAssistance ? 'yes' : 'no'}
                      onValueChange={(value) => handleInputChange('educationLoanAssistance', value === 'yes')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installmentFacility">Installment Facility</Label>
                    <Select
                      value={localData.installmentFacility ? 'yes' : 'no'}
                      onValueChange={(value) => handleInputChange('installmentFacility', value === 'yes')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hardshipSupport">Hardship Support</Label>
                    <Select
                      value={localData.hardshipSupport ? 'yes' : 'no'}
                      onValueChange={(value) => handleInputChange('hardshipSupport', value === 'yes')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={previousPage}
                className="px-8"
              >
                ← Back
              </Button>
              
              <Button
                type="button"
                 onClick={goToNextPage}
                className="px-8"
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
