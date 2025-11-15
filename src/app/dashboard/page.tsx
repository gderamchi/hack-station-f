'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, TrendingUp, Users, Clock, Settings, Upload } from 'lucide-react';

interface DashboardStats {
  totalCalls: number;
  qualifiedLeads: number;
  activeNow: number;
  avgDuration: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    qualifiedLeads: 0,
    activeNow: 0,
    avgDuration: '0:00',
  });
  const [loading, setLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);

  useEffect(() => {
    checkSetup();
    fetchStats();
  }, []);

  const checkSetup = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      
      if (!data.companies || data.companies.length === 0) {
        // No company setup yet, redirect to setup
        router.push('/dashboard/setup');
      } else {
        setHasCompany(true);
      }
    } catch (error) {
      console.error('Error checking setup:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics/overview');
      const data = await response.json();
      
      if (data.metrics) {
        setStats({
          totalCalls: data.metrics.totalCalls || 0,
          qualifiedLeads: data.metrics.qualifiedLeads || 0,
          activeNow: data.metrics.activeCalls || 0,
          avgDuration: data.metrics.avgDurationMinutes || '0:00',
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasCompany) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Mirai Dashboard</h1>
            <p className="text-gray-600 mt-2">Your AI calling system is running</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/settings')}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <Phone className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCalls}</div>
            <div className="text-sm text-gray-600 mt-1">Total Calls</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.qualifiedLeads}</div>
            <div className="text-sm text-gray-600 mt-1">Qualified Leads</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.activeNow}</div>
            <div className="text-sm text-gray-600 mt-1">Active Calls Now</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.avgDuration}</div>
            <div className="text-sm text-gray-600 mt-1">Avg Call Duration</div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Upload Leads */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
            <Upload className="h-12 w-12 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Upload Leads</h2>
            <p className="text-blue-100 mb-6">
              Upload a CSV file with your leads and we'll start calling them automatically
            </p>
            <button
              onClick={() => router.push('/dashboard/campaigns')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Upload CSV
            </button>
          </div>

          {/* View Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <TrendingUp className="h-12 w-12 text-gray-700 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Live Activity</h2>
            <p className="text-gray-600 mb-6">
              See real-time transcripts and monitor your AI agents in action
            </p>
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              View Activity
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your AI calling system is active and ready
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How it works</h3>
          <ol className="text-sm text-blue-800 space-y-2">
            <li>1. Upload your leads (CSV file with names and phone numbers)</li>
            <li>2. Mirai calls them automatically using your AI agent</li>
            <li>3. Qualified leads appear in your dashboard</li>
            <li>4. You get notified of meetings booked</li>
          </ol>
          <p className="text-xs text-blue-700 mt-4">
            That's it! Just upload leads and relax - Mirai handles everything. ☕
          </p>
        </div>
      </div>
    </div>
  );
}
