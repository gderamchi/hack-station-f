'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Technology',
    description: '',
    targetMarket: '',
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      
      if (data.companies && data.companies.length > 0) {
        const comp = data.companies[0];
        setCompany(comp);
        setFormData({
          companyName: comp.name || '',
          industry: comp.industry || 'Technology',
          description: comp.description || '',
          targetMarket: comp.targetIndustries?.[0] || '',
        });
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.companyName,
          industry: formData.industry,
          description: formData.description,
          targetIndustries: [formData.targetMarket],
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      alert('Settings saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your company information and AI agent configuration</p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Company Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📋 Company Information</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="TechFlow Solutions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do you sell? *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Describe your product or service, key benefits, pricing, and unique value proposition..."
              />
              <p className="text-xs text-gray-500 mt-2">
                The AI uses this to personalize conversations with your leads
              </p>
            </div>
          </div>

          {/* Target Market */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">🎯 Target Market</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who do you want to call? *
              </label>
              <input
                type="text"
                required
                value={formData.targetMarket}
                onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="CEOs and CTOs of small tech companies (10-100 employees) in France"
              />
              <p className="text-xs text-gray-500 mt-2">
                Be specific about your ideal customer profile
              </p>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">🎤 Voice Settings</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Current Voice</h3>
                  <p className="text-sm text-blue-700 mt-1">Rachel - Professional Female</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/voices')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Change Voice
                </button>
              </div>
            </div>
          </div>

          {/* Script Settings */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📝 Script Settings</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-900">AI-Generated Script</h3>
                  <p className="text-sm text-green-700 mt-1">Your script is active and approved</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/scripts')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Script
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t pt-8">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-5 w-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            These actions are irreversible. Please be careful.
          </p>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            onClick={() => {
              if (confirm('Are you sure you want to reset your setup? This will delete all campaigns and leads.')) {
                // Handle reset
                alert('Reset functionality coming soon');
              }
            }}
          >
            Reset Setup
          </button>
        </div>
      </div>
    </div>
  );
}
