import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DepartmentAuthKey {
  id: string;
  department_code: string;
  auth_key: string;
  updated_at: string;
}

const DepartmentAuthKeyManager = () => {
  const [authKeys, setAuthKeys] = useState<DepartmentAuthKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingKeys, setEditingKeys] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAuthKeys();
  }, []);

  const fetchAuthKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('department_auth_keys')
        .select('*')
        .order('department_code');
      
      if (error) throw error;
      setAuthKeys(data || []);
      
      // Initialize editing keys with current values
      const initialKeys: Record<string, string> = {};
      data?.forEach(key => {
        initialKeys[key.department_code] = key.auth_key;
      });
      setEditingKeys(initialKeys);
    } catch (err) {
      console.error('Error fetching auth keys:', err);
      setError('Failed to load authorization keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async (departmentCode: string) => {
    if (!editingKeys[departmentCode]?.trim()) {
      setError('Authorization key cannot be empty');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      const { error } = await supabase
        .from('department_auth_keys')
        .update({ 
          auth_key: editingKeys[departmentCode].trim(),
          updated_at: new Date().toISOString()
        })
        .eq('department_code', departmentCode);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Authorization key updated for ${departmentCode} department`
      });
      
      // Refresh the data
      await fetchAuthKeys();
    } catch (err) {
      console.error('Error updating auth key:', err);
      setError('Failed to update authorization key');
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (departmentCode: string) => {
    setShowKeys(prev => ({
      ...prev,
      [departmentCode]: !prev[departmentCode]
    }));
  };

  const handleKeyChange = (departmentCode: string, newKey: string) => {
    setEditingKeys(prev => ({
      ...prev,
      [departmentCode]: newKey
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Department Authorization Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Department Authorization Keys
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage authorization keys required for admin department signup
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {authKeys.map((keyData) => (
          <div key={keyData.department_code} className="border rounded-lg p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{keyData.department_code}</h3>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(keyData.updated_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`key-${keyData.department_code}`}>Authorization Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id={`key-${keyData.department_code}`}
                    type={showKeys[keyData.department_code] ? "text" : "password"}
                    value={editingKeys[keyData.department_code] || ''}
                    onChange={(e) => handleKeyChange(keyData.department_code, e.target.value)}
                    placeholder="Enter authorization key"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleShowKey(keyData.department_code)}
                  >
                    {showKeys[keyData.department_code] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={() => handleSaveKey(keyData.department_code)}
                  disabled={saving || editingKeys[keyData.department_code] === keyData.auth_key}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ))}

        {authKeys.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No department authorization keys configured
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentAuthKeyManager;