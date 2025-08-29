import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Building2, Wifi, Car, Utensils, Snowflake, Shield, Projector, FlaskConical, Bus, BookOpen, Users, Camera, Save } from 'lucide-react'
import { useInstitutionSignup, PhotoMetadata } from '@/contexts/InstitutionSignupContext'
import { FacilitiesDetails, PhotoFile } from '@/contexts/InstitutionSignupContext'
import { useWorkingPageAutoSave } from '@/hooks/useWorkingPageAutoSave'
import { WorkingPageSaveIndicator } from '@/components/ui/WorkingPageSaveIndicator'

export default function InstitutionDetailsPage2() {
  const { 
    formData, 
    currentPage, 
    totalPages, 
    previousPage, 
    goToNextPage, 
    updateFacilitiesDetails, 
    updatePhotos 
  } = useInstitutionSignup()

  // Initialize local data with fallback values
  const [localData, setLocalData] = useState<FacilitiesDetails>(() => {
    const initialData = formData.facilitiesDetails
    return {
      totalClassrooms: initialData?.totalClassrooms || 1,
      classroomCapacity: initialData?.classroomCapacity || undefined,
      libraryAvailable: initialData?.libraryAvailable || false,
      computerLab: initialData?.computerLab || false,
      wifiAvailable: initialData?.wifiAvailable || false,
      parkingAvailable: initialData?.parkingAvailable || false,
      cafeteriaCanteen: initialData?.cafeteriaCanteen || false,
      airConditioning: initialData?.airConditioning || false,
      cctvSecurity: initialData?.cctvSecurity || false,
      wheelchairAccessible: initialData?.wheelchairAccessible || false,
      projectorsSmartBoards: initialData?.projectorsSmartBoards || false,
      audioSystem: initialData?.audioSystem || false,
      laboratoryFacilities: initialData?.laboratoryFacilities || [],
      sportsFacilities: initialData?.sportsFacilities || [],
      transportationProvided: initialData?.transportationProvided || false,
      hostelFacility: initialData?.hostelFacility || false,
      studyMaterialProvided: initialData?.studyMaterialProvided || false,
      onlineClasses: initialData?.onlineClasses || false,
      recordedSessions: initialData?.recordedSessions || false,
      mockTestsAssessments: initialData?.mockTestsAssessments || false,
      careerCounseling: initialData?.careerCounseling || false,
      jobPlacementAssistance: initialData?.jobPlacementAssistance || false,
      photos: initialData?.photos || []
    }
  })
  
  const [localPhotos, setLocalPhotos] = useState<PhotoFile[]>(formData.photos)

  // Auto-save functionality for facilities data
  const { save, debouncedSave, manualSave, lastSaved, isSaving, restore } = useWorkingPageAutoSave(2, localData)
  


  // Sync local state with context
  useEffect(() => {
    if (formData.facilitiesDetails) {
      setLocalData(prev => ({
        ...prev,
        ...formData.facilitiesDetails
      }))
    }
    if (formData.photos) {
    setLocalPhotos(formData.photos)
    }
  }, [formData.facilitiesDetails, formData.photos])

  // Restore saved data on mount
  useEffect(() => {
    const savedData = restore()
    if (savedData && Object.keys(savedData).length > 0) {
      setLocalData(prev => ({ ...prev, ...savedData }))
      // Also update the context with restored data
      updateFacilitiesDetails(savedData)
      
      // Photos are now included in the main facilities data and will be restored automatically
      // No need for separate photo restoration logic
    }
  }, []) // Only run once on mount

  const handleInputChange = (field: keyof FacilitiesDetails, value: any) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    updateFacilitiesDetails({ [field]: value })
    debouncedSave(newData)
  }

  const handleArrayChange = (field: keyof FacilitiesDetails, value: string, checked: boolean) => {
    const currentArray = (localData[field] as string[]) || []
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    const newData = { ...localData, [field]: newArray }
    setLocalData(newData)
    updateFacilitiesDetails({ [field]: newArray })
    debouncedSave(newData)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, type: PhotoFile['type']) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newPhotos: PhotoFile[] = Array.from(files).map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        type,
        order: localPhotos.filter(p => p.type === type).length + index
      }))
      
      const updatedPhotos = [...localPhotos, ...newPhotos]
      setLocalPhotos(updatedPhotos)
      updatePhotos(updatedPhotos)
      
      // Convert to metadata for localStorage (serializable)
      const photoMetadata = updatedPhotos.map(photo => ({
        name: photo.file.name,
        size: photo.file.size,
        type: photo.file.type,
        preview: photo.preview,
        photoType: photo.type,
        order: photo.order
      }))
      
      // Convert photos to metadata and save in main facilities data
      const photoMetadata1 = updatedPhotos.map(photo => ({
        name: photo.file.name,
        size: photo.file.size,
        type: photo.file.type,
        preview: photo.preview,
        photoType: photo.type,
        order: photo.order
      }))
      
      // Save photos directly in the main facilities data
      const newData = { ...localData, photos: photoMetadata1 }
      debouncedSave(newData)
    }
  }

  const removePhoto = (index: number) => {
    const updatedPhotos = localPhotos.filter((_, i) => index !== i)
    setLocalPhotos(updatedPhotos)
    updatePhotos(updatedPhotos)
    
    // Convert to metadata for localStorage (serializable)
    const photoMetadata = updatedPhotos.map(photo => ({
      name: photo.file.name,
      size: photo.file.size,
      type: photo.file.type,
      preview: photo.preview,
      photoType: photo.type,
      order: photo.order
    }))
    
    // Convert photos to metadata and save in main facilities data
    const photoMetadata2 = updatedPhotos.map(photo => ({
      name: photo.file.name,
      size: photo.file.size,
      type: photo.file.type,
      preview: photo.preview,
      photoType: photo.type,
      order: photo.order
    }))
    
    // Save photos directly in the main facilities data
    const newData = { ...localData, photos: photoMetadata2 }
    debouncedSave(newData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goToNextPage()
  }

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
                        
                        {/* Photo Save Status */}
                        <div className="mt-2 text-center">
                          <p className="text-sm text-muted-foreground">
                            Photos: {localPhotos.length} current • {localData.photos?.length || 0} saved in auto-save
                          </p>
                        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentPage} of {totalPages}</span>
            <span>Facilities & Details</span>
          </div>
          <Progress value={(currentPage / totalPages) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Account Creation</span>
            <span>Basic Information</span>
            <span className="font-semibold text-blue-600">Facilities & Photos</span>
            <span>Academic Programs</span>
            <span>Faculty & Staff</span>
            <span>Results & Achievements</span>
            <span>Fee Structure & Policies</span>
            <span>Final Review</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Facilities & Details</h2>
            <p className="text-muted-foreground">Tell us about your infrastructure and facilities</p>
          </div>

          {/* Infrastructure Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Infrastructure Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="totalClassrooms">Total Classrooms *</Label>
                <Input
                  id="totalClassrooms"
                  type="number"
                  min="1"
                  max="100"
                  value={localData.totalClassrooms}
                  onChange={(e) => handleInputChange('totalClassrooms', parseInt(e.target.value))}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classroomCapacity">Classroom Capacity</Label>
                <Input
                  id="classroomCapacity"
                  type="number"
                  min="1"
                  value={localData.classroomCapacity || ''}
                  onChange={(e) => handleInputChange('classroomCapacity', parseInt(e.target.value))}
                  placeholder="Optional"
                  className="h-12"
                />
              </div>
            </div>

            {/* Basic Facilities Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { field: 'libraryAvailable', label: 'Library', icon: BookOpen },
                { field: 'computerLab', label: 'Computer Lab', icon: FlaskConical },
                { field: 'wifiAvailable', label: 'Wi-Fi', icon: Wifi },
                { field: 'parkingAvailable', label: 'Parking', icon: Car },
                { field: 'cafeteriaCanteen', label: 'Cafeteria', icon: Utensils },
                { field: 'airConditioning', label: 'Air Conditioning', icon: Snowflake },
                { field: 'cctvSecurity', label: 'CCTV Security', icon: Shield },
                { field: 'wheelchairAccessible', label: 'Wheelchair Access', icon: Users }
              ].map(({ field, label, icon: Icon }) => (
                <div key={field} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <Checkbox
                    id={field}
                    checked={localData[field as keyof FacilitiesDetails] as boolean}
                    onCheckedChange={(checked) => handleInputChange(field as keyof FacilitiesDetails, checked)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor={field} className="text-sm font-medium cursor-pointer">
                      {label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teaching Facilities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Teaching Facilities</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Smart Teaching Aids</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="projectorsSmartBoards"
                      checked={localData.projectorsSmartBoards}
                      onCheckedChange={(checked) => handleInputChange('projectorsSmartBoards', checked)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="projectorsSmartBoards" className="text-sm cursor-pointer">
                      Projectors/Smart Boards
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="audioSystem"
                      checked={localData.audioSystem}
                      onCheckedChange={(checked) => handleInputChange('audioSystem', checked)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="audioSystem" className="text-sm cursor-pointer">
                      Audio System
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Laboratory Facilities</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['Physics', 'Chemistry', 'Biology', 'Computer'].map((lab) => (
                    <div key={lab} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lab-${lab.toLowerCase()}`}
                        checked={localData.laboratoryFacilities.includes(lab)}
                        onCheckedChange={(checked) => handleArrayChange('laboratoryFacilities', lab, checked as boolean)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor={`lab-${lab.toLowerCase()}`} className="text-sm cursor-pointer">
                        {lab}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Sports Facilities</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Indoor Games', 'Outdoor Playground', 'Gymnasium', 'Swimming Pool'].map((sport) => (
                  <div key={sport} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sport-${sport.toLowerCase().replace(' ', '-')}`}
                      checked={localData.sportsFacilities.includes(sport)}
                                              onCheckedChange={(checked) => handleArrayChange('sportsFacilities', sport, checked as boolean)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor={`sport-${sport.toLowerCase().replace(' ', '-')}`} className="text-sm cursor-pointer">
                      {sport}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Services</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Transportation & Accommodation</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="transportationProvided"
                      checked={localData.transportationProvided}
                      onCheckedChange={(checked) => handleInputChange('transportationProvided', checked)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="transportationProvided" className="text-sm cursor-pointer">
                      Transportation Provided
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="hostelFacility"
                      checked={localData.hostelFacility}
                      onCheckedChange={(checked) => handleInputChange('hostelFacility', checked)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="hostelFacility" className="text-sm cursor-pointer">
                      Hostel Facility
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Academic Support</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="studyMaterialProvided"
                      checked={localData.studyMaterialProvided}
                      onCheckedChange={(checked) => handleInputChange('studyMaterialProvided', checked)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="studyMaterialProvided" className="text-sm cursor-pointer">
                      Study Material Provided
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="onlineClasses"
                      checked={localData.onlineClasses}
                      onCheckedChange={(checked) => handleInputChange('onlineClasses', checked)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="onlineClasses" className="text-sm cursor-pointer">
                      Online Classes
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="recordedSessions"
                  checked={localData.recordedSessions}
                  onCheckedChange={(checked) => handleInputChange('recordedSessions', checked)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="recordedSessions" className="text-sm cursor-pointer">
                  Recorded Sessions
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="mockTestsAssessments"
                  checked={localData.mockTestsAssessments}
                  onCheckedChange={(checked) => handleInputChange('mockTestsAssessments', checked)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="mockTestsAssessments" className="text-sm cursor-pointer">
                  Mock Tests/Assessments
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="careerCounseling"
                  checked={localData.careerCounseling}
                  onCheckedChange={(checked) => handleInputChange('careerCounseling', checked)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="careerCounseling" className="text-sm cursor-pointer">
                  Career Counseling
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="jobPlacementAssistance"
                checked={localData.jobPlacementAssistance}
                onCheckedChange={(checked) => handleInputChange('jobPlacementAssistance', checked)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="jobPlacementAssistance" className="text-sm cursor-pointer">
                Job Placement Assistance
              </Label>
            </div>
          </div>

          {/* Photo Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Institution Photos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Main Building Photo *
                </Label>
                <Input
                  type="file"
                  name="main-building-photos"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, 'main_building')}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">Required: Main building exterior photo</p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Classroom Photos
                </Label>
                <Input
                  type="file"
                  name="classroom-photos"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, 'classroom')}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">Optional: Up to 10 classroom photos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Laboratory Photos
                </Label>
                <Input
                  type="file"
                  name="laboratory-photos"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, 'laboratory')}
                  className="h-12"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Facilities Photos
                </Label>
                <Input
                  type="file"
                  name="facilities-photos"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, 'facilities')}
                  className="h-12"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Achievement Photos
                </Label>
                <Input
                  type="file"
                  name="achievement-photos"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, 'achievement_certificate')}
                  className="h-12"
                />
              </div>
            </div>

            {/* Photo Preview */}
            {localPhotos.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Current Uploaded Photos</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {localPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.preview}
                        alt={`${photo.type} photo`}
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <div className="text-xs text-muted-foreground mt-1 text-center capitalize">
                        {photo.type.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restored Photo Metadata */}
            {localData.photos && localData.photos.length > 0 && localPhotos.length === 0 && (
              <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Label className="text-sm font-medium text-blue-800">Previously Uploaded Photos (Restored from Auto-Save)</Label>
                <p className="text-sm text-blue-600 mb-3">
                  We found {localData.photos.length} photo(s) from your previous session. 
                  You'll need to re-upload the actual files, but we've saved the details.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {restoredPhotoMetadata.map((photo, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-blue-200">
                                              <div className="w-full h-24 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">Photo {index + 1}</p>
                          </div>
                        </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <p className="font-medium">{photo.name}</p>
                        <p className="text-gray-500 capitalize">{photo.photoType.replace('_', ' ')}</p>
                        <p className="text-gray-400">{(photo.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> These are placeholder previews. You'll need to re-upload the actual photo files 
                    to continue with your registration. Your photo details have been preserved.
                  </p>
                </div>
              </div>
            )}
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
              <span>Continue to Programs</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
