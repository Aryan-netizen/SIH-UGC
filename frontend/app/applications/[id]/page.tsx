"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Users, Award, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { applicationsAPI } from '@/lib/api';
import { CollegeApplication, StatusUpdateRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Add proper type for status
type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [application, setApplication] = useState<CollegeApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('pending');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (params.id) {
      loadApplication(params.id as string);
    }
  }, [params.id]);

  const loadApplication = async (id: string) => {
    try {
      const data = await applicationsAPI.getById(id);
      setApplication(data);
      setNewStatus(data.status);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load application details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!application || !newStatus || !remarks.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide remarks for status update',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      const updateData: StatusUpdateRequest = {
        status: newStatus,
        remarks: remarks.trim()
      };

      const updated = await applicationsAPI.updateStatus(application._id, updateData);
      setApplication(updated);
      setRemarks('');

      toast({
        title: 'Success',
        description: 'Application status updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'under_review':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800',
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Application not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/applications">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{application.collegeName}</CardTitle>
                  <CardDescription>{application.address}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(application.status)}
                  {getStatusBadge(application.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Established Year</p>
                  <p className="font-semibold">{application.establishedYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Affiliated University</p>
                  <p className="font-semibold">{application.affiliatedUniversity || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Student Capacity</p>
                  <p className="font-semibold">{application.studentCapacity || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{application.infrastructure}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Faculty Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{application.facultyDetails}</p>
            </CardContent>
          </Card>

          {application.accreditations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Accreditations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{application.accreditations}</p>
              </CardContent>
            </Card>
          )}

          {application.facilities && (
            <Card>
              <CardHeader>
                <CardTitle>Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{application.facilities}</p>
              </CardContent>
            </Card>
          )}

          {application.coursesOffered && (
            <Card>
              <CardHeader>
                <CardTitle>Courses Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{application.coursesOffered}</p>
              </CardContent>
            </Card>
          )}

          {application.financialStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{application.financialStatus}</p>
              </CardContent>
            </Card>
          )}

          {application.additionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{application.additionalInfo}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {application.aiEvaluation && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  AI Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                  <p className="text-4xl font-bold text-blue-700">
                    {application.aiEvaluation.score}/100
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Recommendation</p>
                  <Badge
                    className={
                      application.aiEvaluation.recommendation.toLowerCase() === 'approve'
                        ? 'bg-green-100 text-green-800'
                        : application.aiEvaluation.recommendation.toLowerCase() === 'reject'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {application.aiEvaluation.recommendation}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Analysis</p>
                  <p className="text-sm text-gray-700">{application.aiEvaluation.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Manually review and update application status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">New Status</label>
                <Select 
                  value={newStatus || application?.status || 'pending'} 
                  onValueChange={(value: ApplicationStatus) => setNewStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Remarks *</label>
                <Textarea
                  placeholder="Enter remarks for this status update..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleStatusUpdate}
                disabled={updating || !remarks.trim() || newStatus === application.status}
                className="w-full"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </Button>
            </CardContent>
          </Card>

          {application.remarks && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.remarks}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
