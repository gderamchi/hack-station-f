'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function SimplifiedSetup() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'calling' | 'complete'>('form');
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Technology',
    description: '',
    targetMarket: '',
    testName: 'Guillaume Deramchi',
    testPhone: '+33766830375',
    testCompany: 'Test Company',
    testRole: 'CEO',
    callNow: true,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/setup');
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep('calling');

    try {
      // Call API to set up everything
      const response = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message
        const errorMsg = `Setup failed: ${data.error || 'Unknown error'}\n${data.details ? `Details: ${data.details}` : ''}`;
        console.error('Setup error:', errorMsg, data);
        setError(errorMsg);
        alert(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Setup successful:', data);
      
      // Start polling for transcript updates
      if (data.callSessionId) {
        pollTranscript(data.callSessionId);
      } else {
        // If no call was made, go directly to complete
        setStep('complete');
      }

    } catch (error) {
      console.error('Setup error:', error);
      setLoading(false);
      setStep('form');
    }
  };

  const pollTranscript = async (callSessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/calls/${callSessionId}/transcript`);
        const data = await response.json();
        
        if (data.transcript && data.transcript.length > 0) {
          setTranscript(data.transcript);
        }

        // Check if call is complete
        if (data.status === 'completed') {
          clearInterval(interval);
          setStep('complete');
        }
      } catch (error) {
        console.error('Error fetching transcript:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  if (step === 'calling') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📞</div>
            <h1 className="text-3xl font-bold mb-2">Calling {formData.testPhone}...</h1>
            <p className="text-gray-600">Your AI agent is calling you right now!</p>
          </div>

          {transcript.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Live Transcript:</h2>
              {transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`flex ${entry.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      entry.role === 'assistant'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">
                      {entry.role === 'assistant' ? '🤖 AI Agent' : '👤 You'}
                    </div>
                    <div className="text-sm">{entry.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {transcript.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-pulse text-gray-500">
                Waiting for call to connect...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold mb-4">You're All Set!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your AI calling system is ready. Upload your leads and we'll handle the rest.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold">View Dashboard</div>
              <div className="text-sm text-gray-600">See your stats</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-3xl mb-2">📤</div>
              <div className="font-semibold">Upload Leads</div>
              <div className="text-sm text-gray-600">Start calling</div>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">Welcome to Mirai! 👋</h1>
          <p className="text-xl text-gray-600">
            Let's set up your AI calling system in 2 minutes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="text-2xl mr-3">❌</div>
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Setup Failed</h3>
                  <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Company Info */}
          <div className="border-b pb-6">
            <h2 className="text-2xl font-bold mb-4">📋 Your Company</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="TechFlow Solutions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Industry *</label>
                <select
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                What do you sell? * <span className="text-gray-500 text-xs">(Be specific - the AI will use this)</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="We provide cloud-based project management software that helps teams collaborate better and increase productivity by 40%. Key features: real-time collaboration, task management, time tracking. Pricing: $15-29/user/month. Free 14-day trial available."
              />
              <div className="text-xs text-gray-500 mt-1">
                Include: what you sell, key benefits, pricing, unique value
              </div>
            </div>
          </div>

          {/* Target Market */}
          <div className="border-b pb-6">
            <h2 className="text-2xl font-bold mb-4">🎯 Who do you want to call?</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Audience * <span className="text-gray-500 text-xs">(Who are your ideal customers?)</span>
              </label>
              <input
                type="text"
                required
                value={formData.targetMarket}
                onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="CEOs and CTOs of small tech companies (10-100 employees) in France"
              />
            </div>
          </div>

          {/* Test Call */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">📞 Demo Call (Test the System)</h2>
            <p className="text-sm text-gray-600 mb-4">
              The AI will call this number immediately to demonstrate how it works
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.testName}
                  onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Guillaume Deramchi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.testPhone}
                  onChange={(e) => setFormData({ ...formData, testPhone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+33766830375"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Company *</label>
                <input
                  type="text"
                  required
                  value={formData.testCompany}
                  onChange={(e) => setFormData({ ...formData, testCompany: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Test Company"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Role *</label>
                <input
                  type="text"
                  required
                  value={formData.testRole}
                  onChange={(e) => setFormData({ ...formData, testRole: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="CEO"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="callNow"
                checked={formData.callNow}
                onChange={(e) => setFormData({ ...formData, callNow: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="callNow" className="ml-2 text-sm font-medium">
                ☑️ Call me now to test the system
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform transition hover:scale-105"
            >
              {loading ? '🤖 Setting up your AI agent...' : '🚀 Start AI Calling System'}
            </button>
            <p className="text-xs text-gray-500 mt-3">
              This will generate your script, select a voice, and call you immediately
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
