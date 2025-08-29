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
import { ArrowLeft, ArrowRight, Users, GraduationCap, Clock, Award, Save, Plus, X, User, Building2, Image, Upload } from 'lucide-react'
import { useInstitutionSignup, DepartmentHead } from '@/contexts/InstitutionSignupContext'
import { useWorkingPageAutoSave } from '@/hooks/useWorkingPageAutoSave'
import { WorkingPageSaveIndicator } from '@/components/ui/WorkingPageSaveIndicator'

export default function StaffFacultyPage4() {
  const { 
    formData, 
    currentPage, 
    totalPages, 
    previousPage, 
    goToNextPage, 
    updateStaffFaculty 
  } = useInstitutionSignup()

  // Initialize local data with fallback values
  const [localData, setLocalData] = useState(() => {
    const initialData = formData.staffFaculty
    return {
      totalTeachingStaff: initialData?.totalTeachingStaff || 0,
      totalNonTeachingStaff: initialData?.totalNonTeachingStaff || 0,
      averageFacultyExperience: initialData?.averageFacultyExperience || '',
      principalName: initialData?.principalName || '',
      principalQualification: initialData?.principalQualification || '',
      principalExperience: initialData?.principalExperience || 0,
      principalPhoto: initialData?.principalPhoto || undefined,
      principalBio: initialData?.principalBio || '',
      departmentHeads: initialData?.departmentHeads || [],
      phdHolders: initialData?.phdHolders || 0,
      postGraduates: initialData?.postGraduates || 0,
      graduates: initialData?.graduates || 0,
      professionalCertified: initialData?.professionalCertified || 0,
      awardsReceived: initialData?.awardsReceived || '',
      publications: initialData?.publications || '',
      industryExperience: initialData?.industryExperience || '',
      trainingProgramsAttended: initialData?.trainingProgramsAttended || ''
    }
  })

  // Auto-save functionality
  const { save, debouncedSave, manualSave, lastSaved, isSaving, restore } = useWorkingPageAutoSave(4, localData)

  // Sync local state with context
  useEffect(() => {
    if (formData.staffFaculty) {
      setLocalData(prev => ({
        ...prev,
        ...formData.staffFaculty
      }))
    }
  }, [formData.staffFaculty])

  // Restore saved data on mount
  useEffect(() => {
    const savedData = restore()
    if (savedData && Object.keys(savedData).length > 0) {
      setLocalData(prev => ({ ...prev, ...savedData }))
      // Also update the context with restored data
      updateStaffFaculty(savedData)
    }
  }, []) // Only run once on mount

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateStaffFaculty({ [field]: value })
    debouncedSave(newData)
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    const currentArray = (localData[field as keyof typeof localData] as string[]) || []
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    const newData = { ...localData, [field]: newArray }
    setLocalData(newData)
    updateStaffFaculty({ [field]: newArray })
    debouncedSave(newData)
  }

  // Department Head Management Functions
  const addDepartmentHead = () => {
    const newHead = {
      name: '',
      department: '',
      qualification: '',
      experience: 0,
      photo: undefined,
      specialization: ''
    }
    
    const updatedHeads = [...(localData.departmentHeads || []), newHead]
    const newData = { ...localData, departmentHeads: updatedHeads }
    setLocalData(newData)
    updateStaffFaculty({ departmentHeads: updatedHeads })
    debouncedSave(newData)
  }

  const removeDepartmentHead = (index: number) => {
    const updatedHeads = (localData.departmentHeads || []).filter((_, i) => i !== index)
    const newData = { ...localData, departmentHeads: updatedHeads }
    setLocalData(newData)
    updateStaffFaculty({ departmentHeads: updatedHeads })
    debouncedSave(newData)
  }

  const handleDepartmentHeadChange = (index: number, field: keyof DepartmentHead, value: any) => {
    const updatedHeads = [...(localData.departmentHeads || [])]
    updatedHeads[index] = { ...updatedHeads[index], [field]: value }
    
    const newData = { ...localData, departmentHeads: updatedHeads }
    setLocalData(newData)
    updateStaffFaculty({ departmentHeads: updatedHeads })
    debouncedSave(newData)
  }

  const handlePhotoUpload = (file: File, type: 'principal' | 'department', index?: number) => {
    if (type === 'principal') {
      const newData = { ...localData, principalPhoto: file }
      setLocalData(newData)
      updateStaffFaculty({ principalPhoto: file })
      debouncedSave(newData)
    } else if (type === 'department' && index !== undefined) {
      const updatedHeads = [...(localData.departmentHeads || [])]
      updatedHeads[index] = { ...updatedHeads[index], photo: file }
      
      const newData = { ...localData, departmentHeads: updatedHeads }
      setLocalData(newData)
      updateStaffFaculty({ departmentHeads: updatedHeads })
      debouncedSave(newData)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted, calling goToNextPage...')
    goToNextPage()
  }

  const progressPercentage = (currentPage / totalPages) * 100

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
            <span>Faculty & Staff Information</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Faculty & Staff Information</h2>
            <p className="text-muted-foreground">Tell us about your teaching staff and faculty</p>
          </div>
            {/* Faculty Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Faculty Details
                </CardTitle>
                <CardDescription>
                  Basic information about your teaching and non-teaching staff
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalTeachingStaff">Total Teaching Staff *</Label>
                    <Input
                      id="totalTeachingStaff"
                      type="number"
                      min="1"
                      value={localData.totalTeachingStaff || ''}
                      onChange={(e) => handleInputChange('totalTeachingStaff', parseInt(e.target.value) || 0)}
                      placeholder="Enter number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalNonTeachingStaff">Total Non-Teaching Staff</Label>
                    <Input
                      id="totalNonTeachingStaff"
                      type="number"
                      min="0"
                      value={localData.totalNonTeachingStaff || ''}
                      onChange={(e) => handleInputChange('totalNonTeachingStaff', parseInt(e.target.value) || 0)}
                      placeholder="Enter number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="averageFacultyExperience">Average Faculty Experience *</Label>
                    <Select
                      value={localData.averageFacultyExperience}
                      onValueChange={(value) => handleInputChange('averageFacultyExperience', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2 years">1-2 years</SelectItem>
                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                        <SelectItem value="5+ years">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Principal/Director Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Principal/Director Information
                </CardTitle>
                <CardDescription>
                  Details about the head of your institution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="principalName">Name *</Label>
                    <Input
                      id="principalName"
                      value={localData.principalName}
                      onChange={(e) => handleInputChange('principalName', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="principalQualification">Qualification *</Label>
                    <Input
                      id="principalQualification"
                      value={localData.principalQualification}
                      onChange={(e) => handleInputChange('principalQualification', e.target.value)}
                      placeholder="e.g., PhD, M.Ed, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="principalExperience">Experience (Years) *</Label>
                    <Input
                      id="principalExperience"
                      type="number"
                      min="0"
                      value={localData.principalExperience || ''}
                      onChange={(e) => handleInputChange('principalExperience', parseInt(e.target.value) || 0)}
                      placeholder="Enter years of experience"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Photo Upload *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        name="principal-photo"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'principal')}
                        className="hidden"
                        id="principal-photo-upload"
                        required
                      />
                      <label htmlFor="principal-photo-upload" className="cursor-pointer">
                        {localData.principalPhoto ? (
                          <div className="space-y-2">
                            <Image className="mx-auto h-12 w-12 text-green-500" />
                            <p className="text-sm text-green-600">Photo uploaded successfully</p>
                            <p className="text-xs text-gray-500">{localData.principalPhoto?.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="text-sm text-gray-600">Click to upload photo</p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="principalBio">Brief Bio</Label>
                  <Textarea
                    id="principalBio"
                    value={localData.principalBio}
                    onChange={(e) => handleInputChange('principalBio', e.target.value)}
                    placeholder="Brief biography of the principal/director (max 300 words)"
                    maxLength={300}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    {(localData.principalBio || '').length}/300 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Head of Departments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Head of Departments
                </CardTitle>
                <CardDescription>
                  Information about department heads (at least one required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(localData.departmentHeads || []).map((head, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Department Head {index + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDepartmentHead(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`head-name-${index}`}>Name *</Label>
                          <Input
                            id={`head-name-${index}`}
                            value={head.name}
                            onChange={(e) => handleDepartmentHeadChange(index, 'name', e.target.value)}
                            placeholder="Enter full name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`head-department-${index}`}>Department *</Label>
                          <Input
                            id={`head-department-${index}`}
                            value={head.department}
                            onChange={(e) => handleDepartmentHeadChange(index, 'department', e.target.value)}
                            placeholder="e.g., Mathematics, Science"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`head-qualification-${index}`}>Qualification *</Label>
                          <Input
                            id={`head-qualification-${index}`}
                            value={head.qualification}
                            onChange={(e) => handleDepartmentHeadChange(index, 'qualification', e.target.value)}
                            placeholder="e.g., PhD, M.Sc, etc."
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`head-experience-${index}`}>Experience (Years) *</Label>
                          <Input
                            id={`head-experience-${index}`}
                            type="number"
                            min="0"
                            value={head.experience || ''}
                            onChange={(e) => handleDepartmentHeadChange(index, 'experience', parseInt(e.target.value) || 0)}
                            placeholder="Enter years of experience"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`head-specialization-${index}`}>Specialization</Label>
                          <Input
                            id={`head-specialization-${index}`}
                            value={head.specialization || ''}
                            onChange={(e) => handleDepartmentHeadChange(index, 'specialization', e.target.value)}
                            placeholder="e.g., Advanced Mathematics, Physics"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Photo Upload (Optional)</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                            <input
                              type="file"
                              name={`department-head-photo-${index}`}
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'department', index)}
                              className="hidden"
                              id={`head-photo-upload-${index}`}
                            />
                            <label htmlFor={`head-photo-upload-${index}`} className="cursor-pointer">
                              {head.photo ? (
                                <div className="space-y-1">
                                  <Image className="mx-auto h-8 w-8 text-green-500" />
                                  <p className="text-xs text-green-600">Photo uploaded</p>
                                <p className="text-xs text-gray-500">{head.photo?.name}</p>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                  <p className="text-xs text-gray-500">Upload photo</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  onClick={addDepartmentHead}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department Head
                </Button>
              </CardContent>
            </Card>

            {/* Faculty Qualifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Faculty Qualifications
                </CardTitle>
                <CardDescription>
                  Breakdown of faculty by qualification level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phdHolders">PhD Holders</Label>
                    <Input
                      id="phdHolders"
                      type="number"
                      min="0"
                      value={localData.phdHolders || ''}
                      onChange={(e) => handleInputChange('phdHolders', parseInt(e.target.value) || 0)}
                      placeholder="Enter number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postGraduates">Post Graduates</Label>
                    <Input
                      id="postGraduates"
                      type="number"
                      min="0"
                      value={localData.postGraduates || ''}
                      onChange={(e) => handleInputChange('postGraduates', parseInt(e.target.value) || 0)}
                      placeholder="Enter number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graduates">Graduates</Label>
                    <Input
                      id="graduates"
                      type="number"
                      min="0"
                      value={localData.graduates || ''}
                      onChange={(e) => handleInputChange('graduates', parseInt(e.target.value) || 0)}
                      placeholder="Enter number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="professionalCertified">Professional Certified</Label>
                    <Input
                      id="professionalCertified"
                      type="number"
                      min="0"
                      value={localData.professionalCertified || ''}
                      onChange={(e) => handleInputChange('professionalCertified', parseInt(e.target.value) || 0)}
                      placeholder="Enter number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Faculty Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Faculty Achievements
                </CardTitle>
                <CardDescription>
                  Recognition and accomplishments of your faculty
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="awardsReceived">Awards Received</Label>
                    <Textarea
                      id="awardsReceived"
                      value={localData.awardsReceived}
                      onChange={(e) => handleInputChange('awardsReceived', e.target.value)}
                      placeholder="List any awards, honors, or recognitions received by faculty members"
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publications">Publications</Label>
                    <Textarea
                      id="publications"
                      value={localData.publications}
                      onChange={(e) => handleInputChange('publications', e.target.value)}
                      placeholder="List research papers, books, or other publications by faculty"
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industryExperience">Industry Experience</Label>
                    <Textarea
                      id="industryExperience"
                      value={localData.industryExperience}
                      onChange={(e) => handleInputChange('industryExperience', e.target.value)}
                      placeholder="Describe any industry experience or corporate partnerships"
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trainingProgramsAttended">Training Programs Attended</Label>
                    <Textarea
                      id="trainingProgramsAttended"
                      value={localData.trainingProgramsAttended}
                      onChange={(e) => handleInputChange('trainingProgramsAttended', e.target.value)}
                      placeholder="List professional development and training programs attended by faculty"
                      rows={4}
                      className="resize-none"
                    />
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
                type="button"
                  onClick={goToNextPage}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                  <span>Continue to Results</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
          </form>
        </CardContent>
      </Card>
    )
  }


