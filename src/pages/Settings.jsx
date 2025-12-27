import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Bell, CreditCard, LogOut, Crown, Shield } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setFullName(userData.full_name || '');
    });
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    }
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="border-0 shadow-md mb-6">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
            <Input value={user.email} disabled className="rounded-xl bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Role</label>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }
              >
                {user.role === 'admin' ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 mr-1" />
                    User
                  </>
                )}
              </Badge>
            </div>
          </div>

          <Button
            onClick={() => updateProfileMutation.mutate({ full_name: fullName })}
            disabled={updateProfileMutation.isPending || fullName === user.full_name}
            className="bg-green-600 hover:bg-green-700 rounded-xl"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card className="border-0 shadow-md mb-6">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Free Trial</h3>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                You're currently on a free trial. Upgrade to Premium for unlimited access to all features.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>✓ Limited therapy sessions (5 free)</li>
                <li>✓ Basic CBT exercises</li>
                <li>✓ Mood tracking</li>
              </ul>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium - $9.99/month
          </Button>
          <p className="text-xs text-gray-500 mt-3">
            Premium includes: Unlimited sessions, advanced exercises, priority support, and more.
          </p>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-0 shadow-md mb-6">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Daily Reminders</p>
                <p className="text-sm text-gray-500">Get reminded to check in daily</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Progress Updates</p>
                <p className="text-sm text-gray-500">Weekly summary of your progress</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                Enable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need help?{' '}
          <a href="#" className="text-green-600 hover:text-green-700 font-medium">
            Contact Support
          </a>
        </p>
        <p className="text-xs text-gray-400 mt-2">
          MindCare CBT Therapist · Version 1.0
        </p>
      </div>
    </div>
  );
}