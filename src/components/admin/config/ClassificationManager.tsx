
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Classification {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const ClassificationManager = () => {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [newClassification, setNewClassification] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchClassifications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('classifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_classifications'
        },
        () => {
          fetchClassifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClassifications = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_classifications')
        .select('*')
        .order('name');

      if (error) throw error;
      setClassifications(data || []);
    } catch (error) {
      console.error('Error fetching classifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch classifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClassification = async () => {
    if (!newClassification.trim()) return;

    try {
      const { error } = await supabase
        .from('ticket_classifications')
        .insert({
          name: newClassification.trim(),
          created_by: profile?.id
        });

      if (error) throw error;

      setNewClassification('');
      toast({
        title: "Success",
        description: "Classification added successfully"
      });
    } catch (error) {
      console.error('Error adding classification:', error);
      toast({
        title: "Error",
        description: "Failed to add classification",
        variant: "destructive"
      });
    }
  };

  const handleEditClassification = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const { error } = await supabase
        .from('ticket_classifications')
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
        description: "Classification updated successfully"
      });
    } catch (error) {
      console.error('Error updating classification:', error);
      toast({
        title: "Error",
        description: "Failed to update classification",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ticket_classifications')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Classification ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling classification status:', error);
      toast({
        title: "Error",
        description: "Failed to update classification status",
        variant: "destructive"
      });
    }
  };

  const startEdit = (classification: Classification) => {
    setEditingId(classification.id);
    setEditingName(classification.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading classifications...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Classification</CardTitle>
          <CardDescription>Create a new ticket classification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newClassification">Classification Name</Label>
              <Input
                id="newClassification"
                value={newClassification}
                onChange={(e) => setNewClassification(e.target.value)}
                placeholder="Enter classification name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddClassification()}
              />
            </div>
            <Button onClick={handleAddClassification} className="mt-6">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Classifications</CardTitle>
          <CardDescription>Manage existing ticket classifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {classifications.map((classification) => (
              <div key={classification.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {editingId === classification.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEditClassification(classification.id)}
                      className="w-48"
                    />
                  ) : (
                    <span className="font-medium">{classification.name}</span>
                  )}
                  <Badge variant={classification.is_active ? "default" : "secondary"}>
                    {classification.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === classification.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleEditClassification(classification.id)}
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
                        onClick={() => startEdit(classification)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={classification.is_active ? "secondary" : "default"}
                        onClick={() => handleToggleActive(classification.id, classification.is_active)}
                      >
                        {classification.is_active ? "Deactivate" : "Activate"}
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

export default ClassificationManager;
