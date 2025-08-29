import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Trophy, Award, Star, TrendingUp, Save, Plus, X, GraduationCap, Target } from 'lucide-react'
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext'
import { useWorkingPageAutoSave } from '@/hooks/useWorkingPageAutoSave'
import { WorkingPageSaveIndicator } from '@/components/ui/WorkingPageSaveIndicator'

export default function ResultsAchievementsPage5() {
  const { 
    formData, 
    currentPage, 
    totalPages, 
    previousPage, 
    goToNextPage, 
    updateResultsAchievements 
  } = useInstitutionSignup()

  // Initialize local data with fallback values
  const [localData, setLocalData] = useState(() => {
    const initialData = formData.resultsAchievements
    return {
      academicResults: initialData?.academicResults || [],
      competitiveExamResults: initialData?.competitiveExamResults || [],
      sportsAchievements: initialData?.sportsAchievements || [],
      culturalAchievements: initialData?.culturalAchievements || [],
      communityService: initialData?.communityService || [],
      institutionAwards: initialData?.institutionAwards || [],
      studentAchievements: initialData?.studentAchievements || [],
      awardsReceived: initialData?.awardsReceived || [],
      mediaRecognition: initialData?.mediaRecognition || false,
      governmentAccreditation: initialData?.governmentAccreditation || false,
      boardAffiliationDetails: initialData?.boardAffiliationDetails || '',
      universityAffiliation: initialData?.universityAffiliation || '',
      professionalBodyMembership: initialData?.professionalBodyMembership || '',
      qualityCertifications: initialData?.qualityCertifications || '',
      certificateDocuments: initialData?.certificateDocuments || [],
      alumniSuccessStories: initialData?.alumniSuccessStories || '',
      placementRecords: initialData?.placementRecords || '',
      higherStudiesAdmissions: initialData?.higherStudiesAdmissions || '',
      scholarshipRecipients: initialData?.scholarshipRecipients || '',
      alumniSuccess: initialData?.alumniSuccess || '',
      futureGoals: initialData?.futureGoals || ''
    }
  })

  // Auto-save functionality
  const { save, debouncedSave, manualSave, lastSaved, isSaving, restore } = useWorkingPageAutoSave(5, localData)

  // Sync local state with context
  useEffect(() => {
    if (formData.resultsAchievements) {
      setLocalData(prev => ({
        ...prev,
        ...formData.resultsAchievements
      }))
    }
  }, [formData.resultsAchievements])

  // Restore saved data on mount
  useEffect(() => {
    const savedData = restore()
    if (savedData && Object.keys(savedData).length > 0) {
      setLocalData(prev => ({ ...prev, ...savedData }))
      // Also update the context with restored data
      updateResultsAchievements(savedData)
    }
  }, []) // Only run once on mount

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateResultsAchievements({ [field]: value })
    debouncedSave(newData)
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    const currentArray = (localData[field as keyof typeof localData] as string[]) || []
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    const newData = { ...localData, [field]: newArray }
    setLocalData(newData)
    updateResultsAchievements({ [field]: newArray })
    debouncedSave(newData)
  }

  // Academic Results Management
  const addAcademicResult = () => {
    const newResult = {
      year: '',
      passPercentage: 0,
      distinctionPercentage: undefined,
      topScorerName: '',
      topScorerMarks: undefined
    }
    const newData = { 
      ...localData, 
      academicResults: [...(localData.academicResults || []), newResult] 
    }
    setLocalData(newData)
    updateResultsAchievements({ academicResults: newData.academicResults })
    debouncedSave(newData)
  }

  const removeAcademicResult = (index: number) => {
    const newResults = (localData.academicResults || []).filter((_, i) => i !== index)
    const newData = { ...localData, academicResults: newResults }
    setLocalData(newData)
    updateResultsAchievements({ academicResults: newResults })
    debouncedSave(newData)
  }

  const handleAcademicResultChange = (index: number, field: string, value: any) => {
    const newResults = [...(localData.academicResults || [])]
    newResults[index] = { ...newResults[index], [field]: value }
    const newData = { ...localData, academicResults: newResults }
    setLocalData(newData)
    updateResultsAchievements({ academicResults: newResults })
    debouncedSave(newData)
  }

  // Competitive Exam Results Management
  const addCompetitiveExamResult = () => {
    const newResult = {
      examType: '',
      year: '',
      totalStudentsAppeared: 0,
      qualifiedStudents: 0,
      topRanksAchieved: '',
      successPercentage: 0
    }
    const newData = { 
      ...localData, 
      competitiveExamResults: [...(localData.competitiveExamResults || []), newResult] 
    }
    setLocalData(newData)
    updateResultsAchievements({ competitiveExamResults: newData.competitiveExamResults })
    debouncedSave(newData)
  }

  const removeCompetitiveExamResult = (index: number) => {
    const newResults = (localData.competitiveExamResults || []).filter((_, i) => i !== index)
    const newData = { ...localData, competitiveExamResults: newResults }
    setLocalData(newData)
    updateResultsAchievements({ competitiveExamResults: newResults })
    debouncedSave(newData)
  }

  const handleCompetitiveExamResultChange = (index: number, field: string, value: any) => {
    const newResults = [...(localData.competitiveExamResults || [])]
    newResults[index] = { ...newResults[index], [field]: value }
    const newData = { ...localData, competitiveExamResults: newResults }
    setLocalData(newData)
    updateResultsAchievements({ competitiveExamResults: newResults })
    debouncedSave(newData)
  }

  // Sports Achievements Management
  const addSportsAchievement = () => {
    const newAchievement = {
      sport: '',
      achievement: '',
      year: '',
      level: '',
      participants: 0
    }
    const newData = { 
      ...localData, 
      sportsAchievements: [...(localData.sportsAchievements || []), newAchievement] 
    }
    setLocalData(newData)
    updateResultsAchievements({ sportsAchievements: newData.sportsAchievements })
    debouncedSave(newData)
  }

  const removeSportsAchievement = (index: number) => {
    const newAchievements = (localData.sportsAchievements || []).filter((_, i) => i !== index)
    const newData = { ...localData, sportsAchievements: newAchievements }
    setLocalData(newData)
    updateResultsAchievements({ sportsAchievements: newAchievements })
    debouncedSave(newData)
  }

  const handleSportsAchievementChange = (index: number, field: string, value: any) => {
    const newAchievements = [...(localData.sportsAchievements || [])]
    newAchievements[index] = { ...newAchievements[index], [field]: value }
    const newData = { ...localData, sportsAchievements: newAchievements }
    setLocalData(newData)
    updateResultsAchievements({ sportsAchievements: newAchievements })
    debouncedSave(newData)
  }

  // Cultural Achievements Management
  const addCulturalAchievement = () => {
    const newAchievement = {
      category: '',
      achievement: '',
      year: '',
      level: '',
      participants: 0
    }
    const newData = { 
      ...localData, 
      culturalAchievements: [...(localData.culturalAchievements || []), newAchievement] 
    }
    setLocalData(newData)
    updateResultsAchievements({ culturalAchievements: newData.culturalAchievements })
    debouncedSave(newData)
  }

  const removeCulturalAchievement = (index: number) => {
    const newAchievements = (localData.culturalAchievements || []).filter((_, i) => i !== index)
    const newData = { ...localData, culturalAchievements: newAchievements }
    setLocalData(newData)
    updateResultsAchievements({ culturalAchievements: newAchievements })
    debouncedSave(newData)
  }

  const handleCulturalAchievementChange = (index: number, field: string, value: any) => {
    const newAchievements = [...(localData.culturalAchievements || [])]
    newAchievements[index] = { ...newAchievements[index], [field]: value }
    const newData = { ...localData, culturalAchievements: newAchievements }
    setLocalData(newData)
    updateResultsAchievements({ culturalAchievements: newAchievements })
    debouncedSave(newData)
  }

  // Community Service Management
  const addCommunityService = () => {
    const newService = {
      activity: '',
      description: '',
      year: '',
      participants: 0,
      impact: ''
    }
    const newData = { 
      ...localData, 
      communityService: [...(localData.communityService || []), newService] 
    }
    setLocalData(newData)
    updateResultsAchievements({ communityService: newData.communityService })
    debouncedSave(newData)
  }

  const removeCommunityService = (index: number) => {
    const newServices = (localData.communityService || []).filter((_, i) => i !== index)
    const newData = { ...localData, communityService: newServices }
    setLocalData(newData)
    debouncedSave(newData)
  }

  const handleCommunityServiceChange = (index: number, field: string, value: any) => {
    const newServices = [...(localData.communityService || [])]
    newServices[index] = { ...newServices[index], [field]: value }
    const newData = { ...localData, communityService: newServices }
    setLocalData(newData)
    updateResultsAchievements({ communityService: newServices })
    debouncedSave(newData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goToNextPage()
  }

  const progressPercentage = (currentPage / totalPages) * 100

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i)

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
            <span>Results & Achievements</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Results & Achievements</h2>
          <p className="text-muted-foreground">Share your institution's academic performance and achievements</p>
        </div>

        <div className="space-y-6">
          {/* Academic Results (last 3 years) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Results (Last 3 Years)
              </CardTitle>
              <CardDescription>
                Academic performance data for the past three years
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(localData.academicResults || []).map((result, index) => (
                <Card key={index} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Academic Year {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAcademicResult(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`academic-year-${index}`}>Year *</Label>
                        <Select
                          value={result.year}
                          onValueChange={(value) => handleAcademicResultChange(index, 'year', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`pass-percentage-${index}`}>Pass Percentage *</Label>
                        <Input
                          id={`pass-percentage-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          value={result.passPercentage || ''}
                          onChange={(e) => handleAcademicResultChange(index, 'passPercentage', parseInt(e.target.value) || 0)}
                          placeholder="0-100"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`distinction-percentage-${index}`}>Distinction %</Label>
                        <Input
                          id={`distinction-percentage-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          value={result.distinctionPercentage || ''}
                          onChange={(e) => handleAcademicResultChange(index, 'distinctionPercentage', parseInt(e.target.value) || undefined)}
                          placeholder="Optional"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`top-scorer-name-${index}`}>Top Scorer Name</Label>
                        <Input
                          id={`top-scorer-name-${index}`}
                          value={result.topScorerName || ''}
                          onChange={(e) => handleAcademicResultChange(index, 'topScorerName', e.target.value)}
                          placeholder="Optional"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`top-scorer-marks-${index}`}>Top Scorer Marks</Label>
                        <Input
                          id={`top-scorer-marks-${index}`}
                          type="number"
                          min="0"
                          value={result.topScorerMarks || ''}
                          onChange={(e) => handleAcademicResultChange(index, 'topScorerMarks', parseInt(e.target.value) || undefined)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addAcademicResult}
                className="w-full h-12 border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Academic Result
              </Button>
            </CardContent>
          </Card>

          {/* Competitive Exam Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Competitive Exam Results
              </CardTitle>
              <CardDescription>
                Performance in competitive examinations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(localData.competitiveExamResults || []).map((result, index) => (
                <Card key={index} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Exam Result {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCompetitiveExamResult(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`exam-type-${index}`}>Exam Type *</Label>
                        <Select
                          value={result.examType}
                          onValueChange={(value) => handleCompetitiveExamResultChange(index, 'examType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select exam type" />
                          </SelectTrigger>
                          <SelectContent>
                            {['JEE Main', 'JEE Advanced', 'NEET', 'CAT', 'MAT', 'XAT', 'CLAT', 'AILET', 'Other'].map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`exam-year-${index}`}>Year *</Label>
                        <Select
                          value={result.year}
                          onValueChange={(value) => handleCompetitiveExamResultChange(index, 'year', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`total-appeared-${index}`}>Total Students Appeared *</Label>
                        <Input
                          id={`total-appeared-${index}`}
                          type="number"
                          min="0"
                          value={result.totalStudentsAppeared || ''}
                          onChange={(e) => handleCompetitiveExamResultChange(index, 'totalStudentsAppeared', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`qualified-students-${index}`}>Qualified Students *</Label>
                        <Input
                          id={`qualified-students-${index}`}
                          type="number"
                          min="0"
                          value={result.qualifiedStudents || ''}
                          onChange={(e) => handleCompetitiveExamResultChange(index, 'qualifiedStudents', parseInt(e.target.value) || 0)}
                          placeholder="Enter number"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`top-ranks-${index}`}>Top Ranks Achieved *</Label>
                        <Input
                          id={`top-ranks-${index}`}
                          value={result.topRanksAchieved}
                          onChange={(e) => handleCompetitiveExamResultChange(index, 'topRanksAchieved', e.target.value)}
                          placeholder="e.g., AIR 100, 500, 1000"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`success-percentage-${index}`}>Success Percentage *</Label>
                        <Input
                          id={`success-percentage-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          value={result.successPercentage || ''}
                          onChange={(e) => handleCompetitiveExamResultChange(index, 'successPercentage', parseInt(e.target.value) || 0)}
                          placeholder="0-100"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addCompetitiveExamResult}
                className="w-full h-12 border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Competitive Exam Result
              </Button>
            </CardContent>
          </Card>

          {/* Awards & Recognition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Awards & Recognition
              </CardTitle>
              <CardDescription>
                Recognition and awards received by your institution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Institution Awards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Government Recognition', 'Education Board Awards', 'Quality Certifications (ISO)', 'Media Recognition', 'Industry Awards', 'Excellence Awards'].map(award => (
                    <div key={award} className="flex items-center space-x-2">
                      <Checkbox
                        id={award}
                        checked={localData.institutionAwards.includes(award)}
                        onCheckedChange={(checked) => handleArrayChange('institutionAwards', award, checked as boolean)}
                      />
                      <Label htmlFor={award}>{award}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Student Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Sports Awards', 'Cultural Awards', 'Academic Excellence', 'Competition Winners', 'Science Olympiads', 'Debate Competitions', 'Art & Music', 'Leadership Awards'].map(achievement => (
                    <div key={achievement} className="flex items-center space-x-2">
                      <Checkbox
                        id={achievement}
                        checked={localData.studentAchievements.includes(achievement)}
                        onCheckedChange={(checked) => handleArrayChange('studentAchievements', achievement, checked as boolean)}
                      />
                      <Label htmlFor={achievement}>{achievement}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accreditations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Accreditations & Affiliations
              </CardTitle>
              <CardDescription>
                Official recognitions and affiliations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="governmentAccreditation">Government Accreditation</Label>
                  <Select
                    value={localData.governmentAccreditation ? 'yes' : 'no'}
                    onValueChange={(value) => handleInputChange('governmentAccreditation', value === 'yes')}
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
                  <Label htmlFor="boardAffiliationDetails">Board Affiliation Details</Label>
                  <Input
                    id="boardAffiliationDetails"
                    value={localData.boardAffiliationDetails}
                    onChange={(e) => handleInputChange('boardAffiliationDetails', e.target.value)}
                    placeholder="e.g., CBSE, ICSE, State Board"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="universityAffiliation">University Affiliation</Label>
                  <Input
                    id="universityAffiliation"
                    value={localData.universityAffiliation}
                    onChange={(e) => handleInputChange('universityAffiliation', e.target.value)}
                    placeholder="If affiliated with any university"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professionalBodyMembership">Professional Body Membership</Label>
                  <Input
                    id="professionalBodyMembership"
                    value={localData.professionalBodyMembership}
                    onChange={(e) => handleInputChange('professionalBodyMembership', e.target.value)}
                    placeholder="e.g., AICTE, NBA, NAAC"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualityCertifications">Quality Certifications</Label>
                  <Input
                    id="qualityCertifications"
                    value={localData.qualityCertifications}
                    onChange={(e) => handleInputChange('qualityCertifications', e.target.value)}
                    placeholder="e.g., ISO 9001, ISO 14001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificateDocuments">Certificate Documents</Label>
                  <Input
                    id="certificateDocuments"
                    type="file"
                    multiple
                    onChange={(e) => handleInputChange('certificateDocuments', e.target.files)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Stories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Success Stories
              </CardTitle>
              <CardDescription>
                Notable achievements and success stories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alumniSuccessStories">Alumni Success Stories</Label>
                  <Input
                    id="alumniSuccessStories"
                    value={localData.alumniSuccessStories}
                    onChange={(e) => handleInputChange('alumniSuccessStories', e.target.value)}
                    placeholder="Share inspiring stories of your alumni"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placementRecords">Placement Records</Label>
                  <Input
                    id="placementRecords"
                    value={localData.placementRecords}
                    onChange={(e) => handleInputChange('placementRecords', e.target.value)}
                    placeholder="Details about student placements"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="higherStudiesAdmissions">Higher Studies Admissions</Label>
                  <Input
                    id="higherStudiesAdmissions"
                    value={localData.higherStudiesAdmissions}
                    onChange={(e) => handleInputChange('higherStudiesAdmissions', e.target.value)}
                    placeholder="Information about students pursuing higher education"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scholarshipRecipients">Scholarship Recipients</Label>
                  <Input
                    id="scholarshipRecipients"
                    value={localData.scholarshipRecipients}
                    onChange={(e) => handleInputChange('scholarshipRecipients', e.target.value)}
                    placeholder="Details about scholarship achievements"
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
                onClick={handleSubmit}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>Continue to Fee Policies</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
