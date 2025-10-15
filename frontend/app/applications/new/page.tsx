"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { applicationsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function NewApplicationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    collegeName: '',
    establishedYear: '',
    address: '',
    affiliatedUniversity: '',
    infrastructure: '',
    facultyDetails: '',
    accreditations: '',
    facilities: '',
    studentCapacity: '',
    coursesOffered: '',
    financialStatus: '',
    additionalInfo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.collegeName.trim() || !formData.infrastructure.trim() || !formData.facultyDetails.trim()) {
      toast({
        title: 'Validation Error',
        description: 'College name, infrastructure, and faculty details are required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const submitData: any = {
        collegeName: formData.collegeName.trim(),
        infrastructure: formData.infrastructure.trim(),
        facultyDetails: formData.facultyDetails.trim(),
      };

      if (formData.establishedYear) submitData.establishedYear = parseInt(formData.establishedYear);
      if (formData.address) submitData.address = formData.address.trim();
      if (formData.affiliatedUniversity) submitData.affiliatedUniversity = formData.affiliatedUniversity.trim();
      if (formData.accreditations) submitData.accreditations = formData.accreditations.trim();
      if (formData.facilities) submitData.facilities = formData.facilities.trim();
      if (formData.studentCapacity) submitData.studentCapacity = parseInt(formData.studentCapacity);
      if (formData.coursesOffered) submitData.coursesOffered = formData.coursesOffered.trim();
      if (formData.financialStatus) submitData.financialStatus = formData.financialStatus.trim();
      if (formData.additionalInfo) submitData.additionalInfo = formData.additionalInfo.trim();

      const result = await applicationsAPI.create(submitData);

      toast({
        title: 'Success',
        description: 'Application submitted successfully',
      });

      router.push(`/applications/${result._id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/applications">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">New College Application</CardTitle>
          <CardDescription>Submit a new college application for UGC approval</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="collegeName">College Name *</Label>
                <Input
                  id="collegeName"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  placeholder="Enter college name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    name="establishedYear"
                    type="number"
                    value={formData.establishedYear}
                    onChange={handleChange}
                    placeholder="e.g., 2005"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <Label htmlFor="studentCapacity">Student Capacity</Label>
                  <Input
                    id="studentCapacity"
                    name="studentCapacity"
                    type="number"
                    value={formData.studentCapacity}
                    onChange={handleChange}
                    placeholder="e.g., 2400"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Complete address with city, state, and pincode"
                />
              </div>

              <div>
                <Label htmlFor="affiliatedUniversity">Affiliated University</Label>
                <Input
                  id="affiliatedUniversity"
                  name="affiliatedUniversity"
                  value={formData.affiliatedUniversity}
                  onChange={handleChange}
                  placeholder="Name of affiliated university"
                />
              </div>

              <div>
                <Label htmlFor="infrastructure">Infrastructure *</Label>
                <Textarea
                  id="infrastructure"
                  name="infrastructure"
                  value={formData.infrastructure}
                  onChange={handleChange}
                  placeholder="Describe the campus, buildings, classrooms, laboratories, library, and other infrastructure facilities..."
                  rows={5}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide detailed information about campus size, buildings, facilities, and equipment
                </p>
              </div>

              <div>
                <Label htmlFor="facultyDetails">Faculty Details *</Label>
                <Textarea
                  id="facultyDetails"
                  name="facultyDetails"
                  value={formData.facultyDetails}
                  onChange={handleChange}
                  placeholder="Describe the faculty strength, qualifications, experience, and faculty-student ratio..."
                  rows={5}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include number of faculty members, their qualifications (PhD, Masters), and average experience
                </p>
              </div>

              <div>
                <Label htmlFor="accreditations">Accreditations</Label>
                <Textarea
                  id="accreditations"
                  name="accreditations"
                  value={formData.accreditations}
                  onChange={handleChange}
                  placeholder="List all accreditations like NAAC, NBA, AICTE, ISO certifications..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="facilities">Facilities</Label>
                <Textarea
                  id="facilities"
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleChange}
                  placeholder="Describe library, computer labs, internet, hostel, transportation, sports, medical facilities..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="coursesOffered">Courses Offered</Label>
                <Textarea
                  id="coursesOffered"
                  name="coursesOffered"
                  value={formData.coursesOffered}
                  onChange={handleChange}
                  placeholder="List all undergraduate, postgraduate, and doctoral programs offered..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="financialStatus">Financial Status</Label>
                <Textarea
                  id="financialStatus"
                  name="financialStatus"
                  value={formData.financialStatus}
                  onChange={handleChange}
                  placeholder="Describe the financial stability, annual budget, fee structure, scholarships..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Any other relevant information like placements, industry collaborations, research grants, student activities..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
              <Link href="/applications" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
