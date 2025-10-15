"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { applicationsAPI, criteriaAPI, evaluationAPI } from '@/lib/api';
import { CollegeApplication, UGCCriteria } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function EvaluationPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<CollegeApplication[]>([]);
  const [criteria, setCriteria] = useState<UGCCriteria[]>([]);
  const [pendingApplications, setPendingApplications] = useState<CollegeApplication[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<string>('default');
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [batchEvaluating, setBatchEvaluating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appsData, criteriaData] = await Promise.all([
        applicationsAPI.getAll(),
        criteriaAPI.getAll(),
      ]);

      setApplications(appsData);
      setCriteria(criteriaData);
      setPendingApplications(appsData.filter(app => app.status === 'pending' && !app.aiEvaluation));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSingleEvaluation = async () => {
    if (!selectedApplication) {
      toast({
        title: 'Validation Error',
        description: 'Please select an application to evaluate',
        variant: 'destructive',
      });
      return;
    }

    setEvaluating(true);
    try {
      const evaluateData: any = {
        applicationId: selectedApplication,
      };

      if (selectedCriteria !== 'default' && selectedCriteria) {
        evaluateData.criteriaId = selectedCriteria;
      }

      const result = await evaluationAPI.evaluateSingle(evaluateData);

      toast({
        title: 'Success',
        description: 'Application evaluated successfully',
      });

      setSelectedApplication('');
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to evaluate application',
        variant: 'destructive',
      });
    } finally {
      setEvaluating(false);
    }
  };

  const handleBatchEvaluation = async () => {
    if (pendingApplications.length === 0) {
      toast({
        title: 'No Applications',
        description: 'No pending applications to evaluate',
        variant: 'destructive',
      });
      return;
    }

    setBatchEvaluating(true);
    try {
      const evaluateData: any = {};

      if (selectedCriteria !== 'default' && selectedCriteria) {
        evaluateData.criteriaId = selectedCriteria;
      }

      const result = await evaluationAPI.evaluateBatch(evaluateData);

      toast({
        title: 'Success',
        description: `Successfully evaluated ${result.evaluated} applications`,
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to evaluate applications',
        variant: 'destructive',
      });
    } finally {
      setBatchEvaluating(false);
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

  const getRecommendationIcon = (recommendation?: string) => {
    if (!recommendation) return null;

    switch (recommendation) {
      case 'approve':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'reject':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
          <Sparkles className="mr-3 h-10 w-10 text-blue-600" />
          AI Evaluation Center
        </h1>
        <p className="text-gray-600">Evaluate college applications using AI-powered analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{applications.length}</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg">Pending Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-600">{pendingApplications.length}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">Evaluated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {applications.filter(app => app.aiEvaluation).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Sparkles className="mr-2 h-5 w-5" />
              Single Application Evaluation
            </CardTitle>
            <CardDescription>Evaluate one application at a time with detailed analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Criteria (Optional)</label>
              <Select value={selectedCriteria} onValueChange={setSelectedCriteria}>
                <SelectTrigger>
                  <SelectValue placeholder="Use default UGC criteria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default UGC Criteria</SelectItem>
                  {criteria.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Application</label>
              <Select value={selectedApplication} onValueChange={setSelectedApplication}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app._id} value={app._id}>
                      {app.collegeName} - {app.status}
                      {app.aiEvaluation && ' ✓'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSingleEvaluation}
              disabled={evaluating || !selectedApplication}
              className="w-full"
            >
              {evaluating ? (
                <>Evaluating...</>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Evaluate Application
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Zap className="mr-2 h-5 w-5" />
              Batch Evaluation
            </CardTitle>
            <CardDescription>Evaluate all pending applications automatically</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-sm">
                This will evaluate all {pendingApplications.length} pending application(s) that haven't been evaluated yet.
              </AlertDescription>
            </Alert>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Criteria (Optional)</label>
              <Select value={selectedCriteria} onValueChange={setSelectedCriteria}>
                <SelectTrigger>
                  <SelectValue placeholder="Use default UGC criteria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default UGC Criteria</SelectItem>
                  {criteria.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleBatchEvaluation}
              disabled={batchEvaluating || pendingApplications.length === 0}
              className="w-full"
              variant="default"
            >
              {batchEvaluating ? (
                <>Evaluating All...</>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Evaluate All Pending
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Recent Evaluations
          </CardTitle>
          <CardDescription>Latest AI evaluation results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications
              .filter(app => app.aiEvaluation)
              .slice(0, 10)
              .map((app) => (
                <div key={app._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{app.collegeName}</h4>
                      <p className="text-sm text-gray-600">{app.address || 'No address'}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {getRecommendationIcon(app.aiEvaluation?.recommendation)}
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  {app.aiEvaluation && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-gray-600 mb-1">AI Score</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {app.aiEvaluation.overallScore}/100
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-gray-600 mb-1">Recommendation</p>
                        <p className="text-sm font-semibold text-green-700 capitalize">
                          {app.aiEvaluation.recommendation}
                        </p>
                      </div>
                      <div className="flex items-center justify-center">
                        <Link href={`/applications/${app._id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {applications.filter(app => app.aiEvaluation).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No evaluations yet. Start evaluating applications!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
