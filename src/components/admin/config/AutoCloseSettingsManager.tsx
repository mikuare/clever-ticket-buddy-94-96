import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AutoCloseSettingsManager = () => {
  const [autoCloseHours, setAutoCloseHours] = useState<string>('24');
  const [cooldownMinutes, setCooldownMinutes] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['auto_close_hours', 'classification_cooldown_minutes']);

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        data.forEach(setting => {
          if (setting.setting_key === 'auto_close_hours') {
            setAutoCloseHours(setting.setting_value);
          } else if (setting.setting_key === 'classification_cooldown_minutes') {
            setCooldownMinutes(setting.setting_value);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    const hours = parseInt(autoCloseHours);
    const minutes = parseInt(cooldownMinutes);
    
    if (isNaN(hours) || hours < 1 || hours > 168) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number between 1 and 168 hours for auto-close time",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(minutes) || minutes < 1 || minutes > 60) {
      toast({
        title: "Invalid Input", 
        description: "Please enter a valid number between 1 and 60 minutes for classification cooldown",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Update auto-close hours
      const { error: autoCloseError } = await supabase
        .from('system_settings')
        .upsert({ 
          setting_key: 'auto_close_hours',
          setting_value: hours.toString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (autoCloseError) throw autoCloseError;

      // Update classification cooldown minutes
      const { error: cooldownError } = await supabase
        .from('system_settings')
        .upsert({ 
          setting_key: 'classification_cooldown_minutes',
          setting_value: minutes.toString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (cooldownError) throw cooldownError;

      toast({
        title: "Settings Updated",
        description: `Auto-close time: ${hours} hours, Classification cooldown: ${minutes} minutes`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Auto-Close Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Ticket Settings
        </CardTitle>
        <CardDescription>
          Configure auto-close timing for resolved tickets and cooldown period for classification-based ticket submissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="autoCloseHours">
            Auto-close time (hours)
          </Label>
          <div className="flex gap-3 items-end">
            <div className="space-y-1">
              <Input
                id="autoCloseHours"
                type="number"
                min="1"
                max="168"
                value={autoCloseHours}
                onChange={(e) => setAutoCloseHours(e.target.value)}
                className="w-32"
                placeholder="24"
              />
              <p className="text-xs text-muted-foreground">
                Between 1-168 hours (1 week max)
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cooldownMinutes">
            Classification cooldown (minutes)
          </Label>
          <div className="flex gap-3 items-end">
            <div className="space-y-1">
              <Input
                id="cooldownMinutes"
                type="number"
                min="1"
                max="60"
                value={cooldownMinutes}
                onChange={(e) => setCooldownMinutes(e.target.value)}
                className="w-32"
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                Between 1-60 minutes
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </Button>
        
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-3">
          <div>
            <p className="font-medium mb-1">Auto-close feature:</p>
            <p>
              When an admin marks a ticket as "Resolved", users have the specified number of hours 
              to review and close the ticket themselves. After this time period expires, the ticket 
              will be automatically closed by the system.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Classification cooldown:</p>
            <p>
              After submitting a ticket of a specific classification, users must wait the specified 
              number of minutes before submitting another ticket of the same classification type. 
              This prevents spam and ensures proper ticket spacing.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoCloseSettingsManager;