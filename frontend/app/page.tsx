"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { applicationsAPI } from '@/lib/api';
import { CollegeApplication } from '@/lib/types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0,
  });
  const [recentApplications, setRecentApplications] = useState<CollegeApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const applications = await applicationsAPI.getAll();

      setStats({
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        approved: applications.filter(app => app.status === 'approved').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        underReview: applications.filter(app => app.status === 'under_review').length,
      });

      setRecentApplications(applications.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Applications', value: stats.total, icon: FileText, color: 'bg-blue-500' },
    { title: 'Pending Review', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-red-500' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">UGC College Approval Dashboard</h1>
        <p className="text-gray-600">Monitor and manage college applications with AI-powered evaluation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest college applications submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No applications yet</p>
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{app.collegeName}</h4>
                      <p className="text-sm text-gray-600">{app.address || 'No address provided'}</p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/applications">
                <Button variant="outline" className="w-full">View All Applications</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/applications/new">
              <Button className="w-full justify-start" variant="default">
                <FileText className="mr-2 h-4 w-4" />
                Submit New Application
              </Button>
            </Link>
            <Link href="/evaluation">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Evaluate Applications
              </Button>
            </Link>
            <Link href="/applications?status=pending">
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Review Pending ({stats.pending})
              </Button>
            </Link>
            <Link href="/criteria">
              <Button className="w-full justify-start" variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Manage Criteria
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
