
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Module {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const ModuleManager = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [newModule, setNewModule] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchModules();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('modules')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'acumatica_modules'
        },
        () => {
          fetchModules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('acumatica_modules')
        .select('*')
        .order('name');

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch modules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModule.trim()) return;

    try {
      const { error } = await supabase
        .from('acumatica_modules')
        .insert({
          name: newModule.trim(),
          created_by: profile?.id
        });

      if (error) throw error;

      setNewModule('');
      toast({
        title: "Success",
        description: "Module added successfully"
      });
    } catch (error) {
      console.error('Error adding module:', error);
      toast({
        title: "Error",
        description: "Failed to add module",
        variant: "destructive"
      });
    }
  };

  const handleEditModule = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const { error } = await supabase
        .from('acumatica_modules')
        .update({
          name: editingName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditingName('');
      toast({
        title: "Success",
        description: "Module updated successfully"
      });
    } catch (error) {
      console.error('Error updating module:', error);
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('acumatica_modules')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Module ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling module status:', error);
      toast({
        title: "Error",
        description: "Failed to update module status",
        variant: "destructive"
      });
    }
  };

  const startEdit = (module: Module) => {
    setEditingId(module.id);
    setEditingName(module.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading modules...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Module</CardTitle>
          <CardDescription>Create a new Acumatica module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newModule">Module Name</Label>
              <Input
                id="newModule"
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                placeholder="Enter module name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddModule()}
              />
            </div>
            <Button onClick={handleAddModule} className="mt-6">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Modules</CardTitle>
          <CardDescription>Manage existing Acumatica modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {modules.map((module) => (
              <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {editingId === module.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEditModule(module.id)}
                      className="w-48"
                    />
                  ) : (
                    <span className="font-medium">{module.name}</span>
                  )}
                  <Badge variant={module.is_active ? "default" : "secondary"}>
                    {module.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === module.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleEditModule(module.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(module)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={module.is_active ? "secondary" : "default"}
                        onClick={() => handleToggleActive(module.id, module.is_active)}
                      >
                        {module.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleManager;
