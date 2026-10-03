import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  DollarSign,
  Bell,
  RefreshCw,
  Shield,
  Database,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'EUR' | 'INR';
  refreshInterval: '30' | '60' | '300' | 'manual';
  notifications: boolean;
  priceAlerts: boolean;
  compactView: boolean;
}

const currencySymbols = {
  USD: '$',
  EUR: '€',
  INR: '₹'
};

const refreshOptions = {
  '30': '30 seconds',
  '60': '1 minute',
  '300': '5 minutes',
  'manual': 'Manual only'
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'system',
    currency: 'USD',
    refreshInterval: '60',
    notifications: true,
    priceAlerts: false,
    compactView: false
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stocktracker-settings');
      if (saved) {
        setSettings({ ...settings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = async (newSettings: SettingsState) => {
    setIsSaving(true);
    try {
      localStorage.setItem('stocktracker-settings', JSON.stringify(newSettings));
      setSettings(newSettings);

      // Apply theme immediately
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('stocktracker-theme', 'dark');
      } else if (newSettings.theme === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('stocktracker-theme', 'light');
      } else {
        // System preference
        localStorage.removeItem('stocktracker-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save delay
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This will delete your portfolio, watchlist, and settings. This action cannot be undone.')) {
      localStorage.removeItem('stocktracker-portfolio');
      localStorage.removeItem('stocktracker-watchlist');
      localStorage.removeItem('stocktracker-settings');
      localStorage.removeItem('stocktracker-theme');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Settings & Preferences
          </h1>
          <p className="text-muted-foreground">
            Customize your StockTracker experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <Select value={settings.theme} onValueChange={(value: 'light' | 'dark' | 'system') => updateSetting('theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Compact View</Label>
                  <p className="text-sm text-muted-foreground">
                    Show more data in less space
                  </p>
                </div>
                <Switch
                  checked={settings.compactView}
                  onCheckedChange={(checked) => updateSetting('compactView', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Currency Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Data & Currency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Currency</Label>
                <Select value={settings.currency} onValueChange={(value: 'USD' | 'EUR' | 'INR') => updateSetting('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">
                      <div className="flex items-center gap-2">
                        <span>{currencySymbols.USD}</span>
                        US Dollar (USD)
                      </div>
                    </SelectItem>
                    <SelectItem value="EUR">
                      <div className="flex items-center gap-2">
                        <span>{currencySymbols.EUR}</span>
                        Euro (EUR)
                      </div>
                    </SelectItem>
                    <SelectItem value="INR">
                      <div className="flex items-center gap-2">
                        <span>{currencySymbols.INR}</span>
                        Indian Rupee (INR)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Data Refresh Rate</Label>
                <Select value={settings.refreshInterval} onValueChange={(value: '30' | '60' | '300' | 'manual') => updateSetting('refreshInterval', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(refreshOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about portfolio changes
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Price Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when stocks hit target prices
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  <Switch
                    checked={settings.priceAlerts}
                    onCheckedChange={(checked) => updateSetting('priceAlerts', checked)}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Management */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">Local Storage</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your portfolio data, watchlist, and settings are stored locally in your browser.
                  This data is private and never sent to external servers.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-success" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <span>Local Only</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-destructive">Clear All Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all your data including portfolio, watchlist, and settings
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={clearAllData}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Status */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
            Saving settings...
          </div>
        )}
      </div>
    </div>
  );
}
