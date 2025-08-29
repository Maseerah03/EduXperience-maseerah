import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'

const InstitutionSignupTest = () => {
  const [testResults, setTestResults] = useState<any>({})
  const [isTesting, setIsTesting] = useState(false)

  const runTests = async () => {
    setIsTesting(true)
    const results: any = {}

    try {
      // Test 1: Check if we can connect to the database
      console.log('Testing database connection...')
      const { data: connectionTest, error: connectionError } = await supabase
        .from('institutions')
        .select('count')
        .limit(1)
      
      results.connection = {
        success: !connectionError,
        data: connectionTest,
        error: connectionError
      }

      // Test 2: Check if institutions table exists and has correct structure
      console.log('Testing institutions table...')
      const { data: institutions, error: institutionsError } = await supabase
        .from('institutions')
        .select('*')
        .limit(1)
      
      results.institutions = {
        success: !institutionsError,
        count: institutions?.length || 0,
        data: institutions,
        error: institutionsError
      }

      // Test 3: Check if institution_facilities table exists
      console.log('Testing institution_facilities table...')
      const { data: facilities, error: facilitiesError } = await supabase
        .from('institution_facilities')
        .select('*')
        .limit(1)
      
      results.facilities = {
        success: !facilitiesError,
        count: facilities?.length || 0,
        data: facilities,
        error: facilitiesError
      }

      // Test 4: Check if institution_photos table exists
      console.log('Testing institution_photos table...')
      const { data: photos, error: photosError } = await supabase
        .from('institution_photos')
        .select('*')
        .limit(1)
      
      results.photos = {
        success: !photosError,
        count: photos?.length || 0,
        data: photos,
        error: photosError
      }

      // Test 5: Check storage bucket
      console.log('Testing storage bucket...')
      const { data: buckets, error: bucketsError } = await supabase.storage
        .listBuckets()
      
      const institutionPhotosBucket = buckets?.find(b => b.id === 'institution-photos')
      results.storage = {
        success: !bucketsError && !!institutionPhotosBucket,
        bucketExists: !!institutionPhotosBucket,
        buckets: buckets,
        error: bucketsError
      }

    } catch (error) {
      console.error('Test error:', error)
      results.error = error
    }

    setTestResults(results)
    setIsTesting(false)
  }

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌'
  }

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Institution Signup System Test
        </CardTitle>
        <p className="text-gray-600">
          Test the database connection and table structure for the institution signup system
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={runTests} 
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? 'Running Tests...' : 'Run System Tests'}
        </Button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results:</h3>
            
            {testResults.connection && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">
                  {getStatusIcon(testResults.connection.success)} Database Connection
                </h4>
                <p className={getStatusColor(testResults.connection.success)}>
                  {testResults.connection.success ? 'Connected successfully' : 'Connection failed'}
                </p>
                {testResults.connection.error && (
                  <p className="text-sm text-red-500 mt-1">
                    Error: {testResults.connection.error.message}
                  </p>
                )}
              </div>
            )}

            {testResults.institutions && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">
                  {getStatusIcon(testResults.institutions.success)} Institutions Table
                </h4>
                <p className={getStatusColor(testResults.institutions.success)}>
                  {testResults.institutions.success ? 'Table exists and accessible' : 'Table not accessible'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Records found: {testResults.institutions.count}
                </p>
              </div>
            )}

            {testResults.facilities && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">
                  {getStatusIcon(testResults.facilities.success)} Institution Facilities Table
                </h4>
                <p className={getStatusColor(testResults.facilities.success)}>
                  {testResults.facilities.success ? 'Table exists and accessible' : 'Table not accessible'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Records found: {testResults.facilities.count}
                </p>
              </div>
            )}

            {testResults.photos && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">
                  {getStatusIcon(testResults.photos.success)} Institution Photos Table
                </h4>
                <p className={getStatusColor(testResults.photos.success)}>
                  {testResults.photos.success ? 'Table exists and accessible' : 'Table not accessible'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Records found: {testResults.photos.count}
                </p>
              </div>
            )}

            {testResults.storage && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">
                  {getStatusIcon(testResults.storage.success)} Storage Bucket
                </h4>
                <p className={getStatusColor(testResults.storage.success)}>
                  {testResults.storage.success ? 'Bucket exists and accessible' : 'Bucket not accessible'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Institution photos bucket: {testResults.storage.bucketExists ? 'Found' : 'Not found'}
                </p>
              </div>
            )}

            {testResults.error && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="font-medium text-red-800 mb-2">❌ Test Error</h4>
                <p className="text-red-600 text-sm">
                  {testResults.error.message || 'An unexpected error occurred'}
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Next Steps:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• If all tests pass: Your system is ready to use!</li>
                <li>• If tables are missing: Run the database migration</li>
                <li>• If connection fails: Check your Supabase configuration</li>
                <li>• If storage fails: Verify bucket creation in Supabase</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default InstitutionSignupTest
