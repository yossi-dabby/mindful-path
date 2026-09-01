import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Crown,
  Languages,
  Layout as LayoutIcon,
  LogOut,
  Palette,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  User
} from 'lucide-react';
import ThemeSelector from '../components/settings/ThemeSelector';
import DataPrivacy from '../components/settings/DataPrivacy';
import LanguageSelector from '../components/settings/LanguageSelector';
import NotificationSettings from '../components/settings/NotificationSettings';
import DeleteAccountFlow from '../components/settings/DeleteAccountFlow';
import PremiumPaywall from '../components/subscription/PremiumPaywall';
import { performLogout } from '@/lib/platform';
import { createPageUrl } from '../utils';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DEFAULT_NOTIFICATIONS = {
  dailyReminders: false,
  progressUpdates: false,
  goalReminders: false,
  exerciseReminders: false
};

const DEFAULT_EMAIL_NOTIFICATIONS = {
  emailCritical: true,
  emailMentions: false,
  dailyReminders: false,
  progressUpdates: false,
  goalReminders: false,
  exerciseReminders: false
};

const cardClassName = 'settings-surface overflow-hidden border border-white/80 bg-white/80 shadow-[0_16px_50px_rgba(15,118,110,0.10)] backdrop-blur-xl';

export default function Settings() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [showProfileSaved, setShowProfileSaved] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [emailNotifications, setEmailNotifications] = useState(DEFAULT_EMAIL_NOTIFICATIONS);
  const [dashboardLayout, setDashboardLayout] = useState('default');
  const [showPremium, setShowPremium] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let active = true;

    base44.auth.me().then(async (userData) => {
      if (!userData) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      if (!active) return;

      setUser(userData);
      setFullName(userData.full_name || '');
      setCurrentTheme(userData.preferences?.theme || 'default');
      setNotifications({ ...DEFAULT_NOTIFICATIONS, ...(userData.preferences?.notifications || {}) });
      setEmailNotifications({ ...DEFAULT_EMAIL_NOTIFICATIONS, ...(userData.preferences?.emailNotifications || {}) });
      setDashboardLayout(userData.preferences?.dashboardLayout || 'default');

      try {
        const existingPoints = await base44.entities.UserPoints.list();
        if (existingPoints.length === 0) {
          await base44.entities.UserPoints.create({
            total_points: 0,
            weekly_points: 0,
            level: 1,
            points_to_next_level: 100,
            last_updated: new Date().toISOString().split('T')[0]
          });
        }
      } catch (_) {
        // Non-critical initialization.
      }

      try {
        const existingSubscriptions = await base44.entities.Subscription.list();
        if (existingSubscriptions.length === 0) {
          await base44.entities.Subscription.create({ plan_type: 'free', status: 'trial' });
        }
      } catch (_) {
        // Non-critical initialization.
      }
    }).catch(() => {
      base44.auth.redirectToLogin(window.location.pathname);
    });

    return () => {
      active = false;
    };
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onMutate: async (data) => {
      const previousUser = user;
      setSaveError(false);
      setUser((current) => ({
        ...current,
        ...data,
        preferences: {
          ...(current?.preferences || {}),
          ...(data?.preferences || {})
        }
      }));
      return { previousUser };
    },
    onSuccess: (updatedUser, variables) => {
      if (updatedUser) setUser(updatedUser);
      if (variables && Object.prototype.hasOwnProperty.call(variables, 'full_name')) {
        setFullName(variables.full_name || '');
        setShowProfileSaved(true);
        window.setTimeout(() => setShowProfileSaved(false), 2500);
      }
    },
    onError: (_error, _data, context) => {
      if (context?.previousUser) setUser(context.previousUser);
      setSaveError(true);
      window.setTimeout(() => setSaveError(false), 4000);
    }
  });

  const savePreferences = (patch) => updateProfileMutation.mutateAsync({
    preferences: {
      ...(user?.preferences || {}),
      ...patch
    }
  });

  const handleThemeChange = async (theme) => {
    const previousTheme = currentTheme;
    setCurrentTheme(theme.id);
    try {
      await savePreferences({ theme: theme.id });
      document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
      document.documentElement.style.setProperty('--color-secondary', theme.colors.secondary);
      document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
    } catch (_) {
      setCurrentTheme(previousTheme);
    }
  };

  const handleNotificationToggle = async (key) => {
    const previous = notifications;
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    try {
      await savePreferences({ notifications: next });
    } catch (_) {
      setNotifications(previous);
    }
  };

  const handleEmailNotificationToggle = async (key) => {
    const previous = emailNotifications;
    const next = { ...emailNotifications, [key]: !emailNotifications[key] };
    setEmailNotifications(next);
    try {
      await savePreferences({ emailNotifications: next });
    } catch (_) {
      setEmailNotifications(previous);
    }
  };

  const handleDashboardLayoutChange = async (layout) => {
    const previous = dashboardLayout;
    setDashboardLayout(layout);
    try {
      await savePreferences({ dashboardLayout: layout });
    } catch (_) {
      setDashboardLayout(previous);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const initials = useMemo(() => {
    const source = fullName || user?.full_name || user?.email || 'M';
    const parts = source.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'M';
  }, [fullName, user]);

  const quickSections = [
    { id: 'settings-profile', label: t('settings_ui.sections.profile'), icon: User },
    { id: 'settings-language', label: t('settings_ui.sections.language'), icon: Languages },
    { id: 'settings-appearance', label: t('settings_ui.sections.appearance'), icon: Palette },
    { id: 'settings-notifications', label: t('settings_ui.sections.notifications'), icon: Bell },
    { id: 'settings-privacy', label: t('settings_ui.sections.privacy'), icon: Shield },
    { id: 'settings-account', label: t('settings_ui.sections.account'), icon: Settings2 }
  ];

  const sectionMotion = {
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.08 },
    transition: { duration: 0.35 }
  };

  if (!user) {
    return (
      <div className="min-h-dvh px-4 py-8 sm:px-6" data-testid="settings-loading">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse rounded-[32px] border border-white/70 bg-white/70 p-6 shadow-xl sm:p-8">
            <div className="h-4 w-36 rounded-full bg-teal-100" />
            <div className="mt-5 h-9 w-72 max-w-full rounded-xl bg-slate-200/80" />
            <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-slate-100" />
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="h-14 rounded-2xl bg-teal-50" />
              <div className="h-14 rounded-2xl bg-teal-50" />
              <div className="h-14 rounded-2xl bg-teal-50" />
            </div>
          </div>
          <p className="mt-4 text-center text-sm font-medium text-slate-500">{t('settings_ui.loading_profile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page min-h-dvh bg-transparent px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.header
          className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/78 p-5 shadow-[0_24px_80px_rgba(15,118,110,0.14)] backdrop-blur-xl sm:p-8"
          initial={reduceMotion ? false : { opacity: 0, y: -14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          data-testid="settings-hero"
        >
          <div className="absolute -end-16 -top-20 h-64 w-64 rounded-full bg-teal-200/45 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 start-10 h-52 w-52 rounded-full bg-amber-100/60 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/90 px-3 py-1.5 text-xs font-bold text-teal-800">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('settings_ui.eyebrow')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t('settings_ui.protected')}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                {t('settings_ui.hero_title')}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
                {t('settings_ui.hero_subtitle')}
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-3xl border border-white bg-white/80 p-3 shadow-lg shadow-teal-900/5 sm:min-w-[280px]">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-lg font-bold text-white shadow-lg shadow-teal-500/20">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-900">{fullName || user.email}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          </div>
        </motion.header>

        <nav
          className="sticky top-[calc(60px+env(safe-area-inset-top,0px))] z-20 -mx-3 mt-4 border-y border-white/60 bg-teal-50/80 px-3 py-3 backdrop-blur-xl sm:static sm:mx-0 sm:mt-5 sm:rounded-3xl sm:border sm:bg-white/70 sm:px-4"
          aria-label={t('settings_ui.quick_navigation')}
          data-testid="settings-quick-nav"
        >
          <p className="sr-only">{t('settings_ui.quick_navigation')}</p>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center">
            {quickSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  type="button"
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-teal-200/80 bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </nav>

        {saveError && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/95 p-3 text-sm font-medium text-red-800" role="alert" data-testid="settings-save-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {t('settings_ui.save_error')}
          </div>
        )}

        <div className="mt-5 space-y-5 sm:mt-7 sm:space-y-6">
          <motion.section id="settings-profile" className="scroll-mt-36 sm:scroll-mt-8" {...sectionMotion}>
            <Card className={cardClassName}>
              <CardHeader className="border-b border-teal-100/80 p-5 sm:p-6">
                <CardTitle className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                    <User className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-bold text-slate-800">{t('settings.profile.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <form
                  className="grid gap-5 md:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    updateProfileMutation.mutate({ full_name: fullName.trim() });
                  }}
                >
                  <div>
                    <label htmlFor="settings-full-name" className="mb-2 block text-sm font-semibold text-slate-700">{t('settings.profile.full_name')}</label>
                    <Input
                      id="settings-full-name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder={t('settings.profile.name_placeholder')}
                      className="min-h-[48px] rounded-2xl border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="settings-email" className="mb-2 block text-sm font-semibold text-slate-700">{t('settings.profile.email')}</label>
                    <Input id="settings-email" value={user.email} disabled className="min-h-[48px] rounded-2xl bg-slate-50" />
                    <p className="mt-1.5 text-xs text-slate-500">{t('settings.profile.email_readonly')}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">{t('settings.profile.role')}</span>
                    <Badge className={user.role === 'admin' ? 'border-0 bg-violet-100 text-violet-800' : 'border-0 bg-sky-100 text-sky-800'}>
                      {user.role === 'admin' ? <Shield className="me-1 h-3 w-3" /> : <User className="me-1 h-3 w-3" />}
                      {user.role === 'admin' ? t('settings.profile.role_admin') : t('settings.profile.role_user')}
                    </Badge>
                  </div>
                  <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                    {showProfileSaved && !updateProfileMutation.isPending && (
                      <span className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700" role="status">
                        <CheckCircle2 className="h-4 w-4" />
                        {t('settings_ui.saved')}
                      </span>
                    )}
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending || !fullName.trim() || fullName.trim() === (user.full_name || '')}
                      className="min-h-[48px] rounded-full bg-teal-600 px-6 text-white shadow-md hover:bg-teal-700"
                    >
                      {updateProfileMutation.isPending ? t('settings.profile.saving') : t('settings.profile.save_changes')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section id="settings-language" className="scroll-mt-36 sm:scroll-mt-8" {...sectionMotion}>
            <LanguageSelector />
          </motion.section>

          <motion.section id="settings-appearance" className="scroll-mt-36 space-y-5 sm:scroll-mt-8" {...sectionMotion}>
            <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
            <Card className={cardClassName}>
              <CardHeader className="border-b border-teal-100/80 p-5 sm:p-6">
                <CardTitle className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <LayoutIcon className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-bold text-slate-800">{t('settings.dashboard_layout.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <p className="mb-4 text-sm leading-6 text-slate-600">{t('settings.dashboard_layout.description')}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: 'default', title: t('settings.dashboard_layout.default_title'), description: t('settings.dashboard_layout.default_description') },
                    { value: 'compact', title: t('settings.dashboard_layout.compact_title'), description: t('settings.dashboard_layout.compact_description') }
                  ].map((layout) => {
                    const selected = dashboardLayout === layout.value;
                    return (
                      <button
                        type="button"
                        key={layout.value}
                        onClick={() => handleDashboardLayoutChange(layout.value)}
                        aria-pressed={selected}
                        className={'min-h-[92px] rounded-2xl border-2 p-4 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ' + (selected ? 'border-teal-500 bg-teal-50 shadow-md' : 'border-slate-200 bg-white hover:border-teal-200')}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span>
                            <span className="block font-bold text-slate-800">{layout.title}</span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">{layout.description}</span>
                          </span>
                          {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section id="settings-subscription" className="scroll-mt-36 sm:scroll-mt-8" {...sectionMotion}>
            <Card className="settings-surface overflow-hidden border border-amber-200/80 bg-gradient-to-br from-amber-50/95 via-white/90 to-teal-50/90 shadow-[0_18px_55px_rgba(180,83,9,0.10)] backdrop-blur-xl">
              <CardContent className="p-5 sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20">
                      <Crown className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">{t('settings.subscription.title')}</h2>
                        <Badge className="border-0 bg-emerald-100 text-emerald-800">{t('settings.subscription.active')}</Badge>
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('settings.subscription.description')}</p>
                      <ul className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-3">
                        <li>{t('settings.subscription.feature_sessions')}</li>
                        <li>{t('settings.subscription.feature_exercises')}</li>
                        <li>{t('settings.subscription.feature_mood')}</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowPremium(true)}
                    className="min-h-[50px] shrink-0 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 font-bold text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600"
                    data-testid="settings-upgrade-button"
                  >
                    <Sparkles className="me-2 h-4 w-4" />
                    {t('settings.subscription.upgrade_button')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section id="settings-privacy" className="scroll-mt-36 sm:scroll-mt-8" {...sectionMotion}>
            <DataPrivacy user={user} />
          </motion.section>

          <motion.section id="settings-notifications" className="scroll-mt-36 sm:scroll-mt-8" {...sectionMotion}>
            <NotificationSettings
              notifications={notifications}
              emailNotifications={emailNotifications}
              onToggleInApp={handleNotificationToggle}
              onToggleEmail={handleEmailNotificationToggle}
            />
          </motion.section>

          <motion.section id="settings-account" className="scroll-mt-36 sm:scroll-mt-8" {...sectionMotion}>
            <Card className={cardClassName}>
              <CardHeader className="border-b border-teal-100/80 p-5 sm:p-6">
                <CardTitle className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Settings2 className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-bold text-slate-800">{t('settings.account.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <Button
                    type="button"
                    onClick={performLogout}
                    variant="outline"
                    className="min-h-[48px] w-full rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="me-2 h-4 w-4" />
                    {t('settings.account.logout')}
                  </Button>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50/75 p-4">
                  <h3 className="text-sm font-bold text-red-900">{t('settings.account.delete_account')}</h3>
                  <p className="mb-3 mt-1 text-xs leading-5 text-red-700">{t('settings.account.delete_section_description')}</p>
                  <DeleteAccountFlow userRole={user.role} />
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>

        <footer className="mt-8 rounded-3xl border border-white/70 bg-white/55 p-5 text-center backdrop-blur-lg">
          <p className="text-sm text-slate-600">
            {t('settings.footer.need_help')}{' '}
            <Link to={createPageUrl('Contact')} className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-800">
              {t('settings.footer.contact_support')}
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </p>
          <p className="mt-2 text-xs text-slate-400">{t('settings.footer.version')}</p>
        </footer>
      </div>

      {showPremium && <PremiumPaywall onClose={() => setShowPremium(false)} />}
    </div>
  );
}
