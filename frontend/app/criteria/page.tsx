"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, List, FileCheck, Trash2 } from 'lucide-react';
import { criteriaAPI } from '@/lib/api';
import { UGCCriteria } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function CriteriaPage() {
  const { toast } = useToast();
  const [criteriaList, setCriteriaList] = useState<UGCCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    minimumRequirements: '',
    evaluationPoints: '',
  });

  useEffect(() => {
    loadCriteria();
  }, []);

  const loadCriteria = async () => {
    try {
      const data = await criteriaAPI.getAll();
      setCriteriaList(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load criteria',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.minimumRequirements.trim() || !formData.evaluationPoints.trim()) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const evaluationPointsArray = formData.evaluationPoints
        .split('\n')
        .map(point => point.trim())
        .filter(point => point.length > 0);

      const newCriteria = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        minimumRequirements: formData.minimumRequirements.trim(),
        evaluationPoints: evaluationPointsArray,
      };

      await criteriaAPI.create(newCriteria);

      toast({
        title: 'Success',
        description: 'Criteria created successfully',
      });

      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        minimumRequirements: '',
        evaluationPoints: '',
      });

      loadCriteria();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create criteria',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">UGC Evaluation Criteria</h1>
          <p className="text-gray-600">Manage evaluation criteria for college applications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Criteria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Evaluation Criteria</DialogTitle>
              <DialogDescription>
                Define criteria for evaluating college applications
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Criteria Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., UGC Approval Criteria for Engineering Colleges 2025"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of this criteria set..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="minimumRequirements">Minimum Requirements *</Label>
                <Textarea
                  id="minimumRequirements"
                  name="minimumRequirements"
                  value={formData.minimumRequirements}
                  onChange={handleChange}
                  placeholder="List the minimum requirements (e.g., land area, faculty count, facilities...)"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="evaluationPoints">Evaluation Points *</Label>
                <Textarea
                  id="evaluationPoints"
                  name="evaluationPoints"
                  value={formData.evaluationPoints}
                  onChange={handleChange}
                  placeholder="Enter each evaluation point on a new line&#10;Infrastructure and campus facilities&#10;Faculty qualifications and experience&#10;Laboratory and research facilities"
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter each evaluation point on a separate line
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Creating...' : 'Create Criteria'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {criteriaList.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileCheck className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Criteria Created</h3>
              <p className="text-gray-600 mb-4">Create evaluation criteria to assess college applications</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Criteria
              </Button>
            </CardContent>
          </Card>
        ) : (
          criteriaList.map((criteria) => (
            <Card key={criteria._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{criteria.title}</CardTitle>
                    <CardDescription>{criteria.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {criteria.evaluationPoints.length} Points
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <FileCheck className="h-4 w-4 mr-2 text-blue-600" />
                    Minimum Requirements
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {criteria.minimumRequirements}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <List className="h-4 w-4 mr-2 text-blue-600" />
                    Evaluation Points
                  </h4>
                  <ul className="space-y-2">
                    {criteria.evaluationPoints.map((point, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mr-2 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="pt-0.5">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {criteria.createdAt && (
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Created: {new Date(criteria.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
