import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, GraduationCap, Users, BookOpen, Clock, DollarSign, Save } from 'lucide-react'
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext'
import { useWorkingPageAutoSave } from '@/hooks/useWorkingPageAutoSave'
import { WorkingPageSaveIndicator } from '@/components/ui/WorkingPageSaveIndicator'

export default function AcademicProgramsPage3() {
  const { 
    formData, 
    currentPage, 
    totalPages, 
    previousPage, 
    goToNextPage, 
    updateAcademicPrograms 
  } = useInstitutionSignup()

  // Initialize local data with fallback values
  const [localData, setLocalData] = useState(() => {
    const initialData = formData.academicPrograms
    return {
      courseCategories: initialData?.courseCategories || [],
      totalCurrentStudents: initialData?.totalCurrentStudents || 0,
      averageBatchSize: initialData?.averageBatchSize || 0,
      studentTeacherRatio: initialData?.studentTeacherRatio || '',
      classTimings: initialData?.classTimings || [],
      admissionTestRequired: initialData?.admissionTestRequired || false,
      minimumQualification: initialData?.minimumQualification || '',
      ageRestrictions: initialData?.ageRestrictions || '',
      admissionFees: initialData?.admissionFees || 0,
      securityDeposit: initialData?.securityDeposit || 0,
      refundPolicy: initialData?.refundPolicy || ''
    }
  })

  // Auto-save functionality
  const { save, debouncedSave, manualSave, lastSaved, isSaving, restore } = useWorkingPageAutoSave(3, localData)

  // Sync local state with context
  useEffect(() => {
    if (formData.academicPrograms) {
      setLocalData(prev => ({
        ...prev,
        ...formData.academicPrograms
      }))
    }
  }, [formData.academicPrograms])

  // Restore saved data on mount
  useEffect(() => {
    const savedData = restore()
    if (savedData && Object.keys(savedData).length > 0) {
      setLocalData(prev => ({ ...prev, ...savedData }))
      // Also update the context with restored data
      updateAcademicPrograms(savedData)
    }
  }, []) // Only run once on mount

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateAcademicPrograms({ [field]: value })
    debouncedSave(newData)
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    const currentArray = (localData[field as keyof typeof localData] as string[]) || []
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    const newData = { ...localData, [field]: newArray }
    setLocalData(newData)
    updateAcademicPrograms({ [field]: newArray })
    debouncedSave(newData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
      goToNextPage()
  }

  const courseCategories = [
    'CBSE (Classes 1-12)', 'ICSE (Classes 1-12)', 'State Board', 'IB/International', 
    'Competitive Exams (JEE/NEET/CAT/etc.)', 'Professional Courses', 'Language Classes', 
    'Computer Courses', 'Arts & Crafts', 'Music & Dance', 'Sports Training'
  ]

  const timeSlots = ['Morning Batches 6AM–12PM', 'Afternoon Batches 12PM–6PM', 'Evening Batches 6PM–10PM', 'Weekend Batches', 'Flexible Timings']

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Institution Registration
        </CardTitle>
        <CardDescription className="text-lg">
          Complete your institution profile to join our educational platform
        </CardDescription>
        
        {/* Save Progress Indicator */}
        <div className="mt-4 flex items-center justify-center">
          <WorkingPageSaveIndicator 
            isSaving={isSaving} 
            lastSaved={lastSaved} 
          />
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentPage} of {totalPages}</span>
            <span>Academic Programs</span>
          </div>
          <Progress value={(currentPage / totalPages) * 100} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Academic Programs</h2>
            <p className="text-muted-foreground">Tell us about your courses and programs</p>
          </div>

          {/* Course Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course Categories</h3>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Course Categories *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {courseCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      checked={localData.courseCategories.includes(category)}
                      onCheckedChange={(checked) => handleArrayChange('courseCategories', category, checked as boolean)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor={`category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className="text-sm cursor-pointer">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Details */}
              <div className="space-y-4">
              <h4 className="text-md font-medium">Course Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="totalCurrentStudents">Total Current Students *</Label>
                  <Input
                    id="totalCurrentStudents"
                    type="number"
                    min="1"
                    value={localData.totalCurrentStudents || ''}
                    onChange={(e) => handleInputChange('totalCurrentStudents', parseInt(e.target.value) || 0)}
                    placeholder="Enter number of students"
                    className="h-12"
                    required
                  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="averageBatchSize">Average Batch Size *</Label>
                  <Input
                    id="averageBatchSize"
                    type="number"
                    min="1"
                    value={localData.averageBatchSize || ''}
                    onChange={(e) => handleInputChange('averageBatchSize', parseInt(e.target.value) || 0)}
                    placeholder="Enter average batch size"
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="studentTeacherRatio">Student-Teacher Ratio *</Label>
                <Input
                  id="studentTeacherRatio"
                    value={localData.studentTeacherRatio || ''}
                  onChange={(e) => handleInputChange('studentTeacherRatio', e.target.value)}
                  placeholder="e.g., 15:1"
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                  <Label>Class Timings *</Label>
                  <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <Checkbox
                          id={`timing-${slot.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                          checked={localData.classTimings.includes(slot)}
                          onCheckedChange={(checked) => handleArrayChange('classTimings', slot, checked as boolean)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                        <Label htmlFor={`timing-${slot.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className="text-sm cursor-pointer">
                        {slot}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>



          {/* Admission Process */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Admission Process</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Admission Test Required *</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="admission-test-yes"
                      checked={localData.admissionTestRequired === true}
                      onCheckedChange={(checked) => handleInputChange('admissionTestRequired', checked)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="admission-test-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="admission-test-no"
                      checked={localData.admissionTestRequired === false}
                      onCheckedChange={(checked) => handleInputChange('admissionTestRequired', !checked)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="admission-test-no">No</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumQualification">Minimum Qualification Required *</Label>
                <Select value={localData.minimumQualification} onValueChange={(value) => handleInputChange('minimumQualification', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No minimum">No minimum</SelectItem>
                    <SelectItem value="10th pass">10th pass</SelectItem>
                    <SelectItem value="12th pass">12th pass</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                    <SelectItem value="Post Graduate">Post Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageRestrictions">Age Restrictions</Label>
                <Input
                  id="ageRestrictions"
                  value={localData.ageRestrictions || ''}
                  onChange={(e) => handleInputChange('ageRestrictions', e.target.value)}
                  placeholder="e.g., 5-18 years (optional)"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionFees">Admission Fees *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admissionFees"
                    type="number"
                    min="0"
                    value={localData.admissionFees}
                    onChange={(e) => handleInputChange('admissionFees', parseFloat(e.target.value))}
                    placeholder="Enter amount in ₹"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityDeposit">Security Deposit</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="securityDeposit"
                    type="number"
                    min="0"
                    value={localData.securityDeposit || ''}
                    onChange={(e) => handleInputChange('securityDeposit', parseFloat(e.target.value))}
                    placeholder="Enter amount in ₹ (optional)"
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundPolicy">Refund Policy *</Label>
              <textarea
                id="refundPolicy"
                value={localData.refundPolicy}
                onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                placeholder="Describe your refund policy (max 500 characters)"
                className="min-h-20"
                maxLength={500}
                required
              />
              <p className="text-xs text-muted-foreground">
                {localData.refundPolicy?.length || 0}/500 characters
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
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
              type="submit"
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>Continue to Staff & Faculty</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

