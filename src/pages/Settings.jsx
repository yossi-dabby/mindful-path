import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { User, Bell, CreditCard, LogOut, Crown, Shield, Layout as LayoutIcon } from 'lucide-react';
import ThemeSelector, { themes } from '../components/settings/ThemeSelector';
import { motion } from 'framer-motion';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [currentTheme, setCurrentTheme] = useState('default');
  const [notifications, setNotifications] = useState({
    dailyReminders: false,
    progressUpdates: false,
    goalReminders: false,
    exerciseReminders: false
  });
  const [dashboardLayout, setDashboardLayout] = useState('default');

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setFullName(userData.full_name || '');
      setCurrentTheme(userData.preferences?.theme || 'default');
      setNotifications(userData.preferences?.notifications || {
        dailyReminders: false,
        progressUpdates: false,
        goalReminders: false,
        exerciseReminders: false
      });
      setDashboardLayout(userData.preferences?.dashboardLayout || 'default');
    });
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    }
  });

  const handleThemeChange = async (theme) => {
    setCurrentTheme(theme.id);
    await updateProfileMutation.mutateAsync({
      preferences: {
        ...user.preferences,
        theme: theme.id
      }
    });
    
    // Apply theme colors to CSS variables
    document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
    document.documentElement.style.setProperty('--color-secondary', theme.colors.secondary);
    document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
  };

  const handleNotificationToggle = async (key) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    await updateProfileMutation.mutateAsync({
      preferences: {
        ...user.preferences,
        notifications: newNotifications
      }
    });
  };

  const handleDashboardLayoutChange = async (layout) => {
    setDashboardLayout(layout);
    await updateProfileMutation.mutateAsync({
      preferences: {
        ...user.preferences,
        dashboardLayout: layout
      }
    });
  };

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
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto" style={{ background: 'linear-gradient(to bottom, #F0F9F8 0%, #E8F5F3 50%, #E0F2F1 100%)' }}>
      {/* Header */}
      <motion.div 
        className="mb-8 mt-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-light mb-2" style={{ color: '#2D3748' }}>Settings</h1>
        <p style={{ color: '#718096' }}>Manage your account and preferences</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 mb-6" style={{ 
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 3px 12px rgba(38, 166, 154, 0.1), 0 1px 3px rgba(0,0,0,0.04)'
        }}>
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
            className="text-white px-6 py-5"
            style={{ 
              borderRadius: '9999px',
              backgroundColor: '#26A69A',
              boxShadow: '0 2px 8px rgba(38, 166, 154, 0.2), 0 1px 3px rgba(0,0,0,0.06)'
            }}
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
      </motion.div>

      {/* Theme Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
      </motion.div>

      {/* Dashboard Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-0 mb-6" style={{ 
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 3px 12px rgba(38, 166, 154, 0.1), 0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <LayoutIcon className="w-5 h-5 text-gray-600" />
              Dashboard Layout
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Choose how your home dashboard is organized
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => handleDashboardLayoutChange('default')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  dashboardLayout === 'default'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-800 mb-1">Default</h3>
                <p className="text-xs text-gray-500">Balanced layout with all sections</p>
              </button>
              <button
                onClick={() => handleDashboardLayoutChange('compact')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  dashboardLayout === 'compact'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-800 mb-1">Compact</h3>
                <p className="text-xs text-gray-500">Condensed view for quick access</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
      <Card className="border-0 mb-6" style={{ 
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 3px 12px rgba(38, 166, 154, 0.1), 0 1px 3px rgba(0,0,0,0.04)'
      }}>
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
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card className="border-0 mb-6" style={{ 
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 3px 12px rgba(38, 166, 154, 0.1), 0 1px 3px rgba(0,0,0,0.04)'
        }}>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Daily Reminders</p>
                <p className="text-sm text-gray-500">Get reminded to check in daily</p>
              </div>
              <Switch
                checked={notifications.dailyReminders}
                onCheckedChange={() => handleNotificationToggle('dailyReminders')}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Progress Updates</p>
                <p className="text-sm text-gray-500">Weekly summary of your progress</p>
              </div>
              <Switch
                checked={notifications.progressUpdates}
                onCheckedChange={() => handleNotificationToggle('progressUpdates')}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Goal Reminders</p>
                <p className="text-sm text-gray-500">Notifications about goal deadlines</p>
              </div>
              <Switch
                checked={notifications.goalReminders}
                onCheckedChange={() => handleNotificationToggle('goalReminders')}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Exercise Reminders</p>
                <p className="text-sm text-gray-500">Suggested times for CBT exercises</p>
              </div>
              <Switch
                checked={notifications.exerciseReminders}
                onCheckedChange={() => handleNotificationToggle('exerciseReminders')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card className="border-0" style={{ 
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 3px 12px rgba(38, 166, 154, 0.1), 0 1px 3px rgba(0,0,0,0.04)'
        }}>
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
      </motion.div>

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