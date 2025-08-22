
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Classification {
  id: string;
  name: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  is_active: boolean;
  classification_id: string;
  classification_name: string;
}

const CategoryManager = () => {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedClassification, setSelectedClassification] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingClassificationId, setEditingClassificationId] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscriptions
    const classificationsChannel = supabase
      .channel('classifications-for-categories')
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

    const categoriesChannel = supabase
      .channel('categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_categories'
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(classificationsChannel);
      supabase.removeChannel(categoriesChannel);
    };
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchClassifications(), fetchCategories()]);
    setLoading(false);
  };

  const fetchClassifications = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_classifications')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setClassifications(data || []);
    } catch (error) {
      console.error('Error fetching classifications:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_categories')
        .select(`
          *,
          ticket_classifications!inner(name)
        `)
        .order('name');

      if (error) throw error;
      
      const categoriesWithClassification = data?.map(cat => ({
        ...cat,
        classification_name: cat.ticket_classifications.name
      })) || [];
      
      setCategories(categoriesWithClassification);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive"
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !selectedClassification) return;

    try {
      const { error } = await supabase
        .from('ticket_categories')
        .insert({
          name: newCategory.trim(),
          classification_id: selectedClassification,
          created_by: profile?.id
        });

      if (error) throw error;

      setNewCategory('');
      setSelectedClassification('');
      toast({
        title: "Success",
        description: "Category added successfully"
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editingName.trim() || !editingClassificationId) return;

    try {
      const { error } = await supabase
        .from('ticket_categories')
        .update({
          name: editingName.trim(),
          classification_id: editingClassificationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditingName('');
      setEditingClassificationId('');
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ticket_categories')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast({
        title: "Error",
        description: "Failed to update category status",
        variant: "destructive"
      });
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingClassificationId(category.classification_id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingClassificationId('');
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>Create a new category and assign it to a classification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="selectedClassification">Classification</Label>
              <Select value={selectedClassification} onValueChange={setSelectedClassification}>
                <SelectTrigger>
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  {classifications.map((classification) => (
                    <SelectItem key={classification.id} value={classification.id}>
                      {classification.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newCategory">Category Name</Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
          </div>
          <Button onClick={handleAddCategory} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>Manage existing categories and their classifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {editingId === category.id ? (
                    <div className="flex gap-2">
                      <Select value={editingClassificationId} onValueChange={setEditingClassificationId}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {classifications.map((classification) => (
                            <SelectItem key={classification.id} value={classification.id}>
                              {classification.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEditCategory(category.id)}
                        className="w-48"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-gray-500">Classification: {category.classification_name}</span>
                    </div>
                  )}
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === category.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleEditCategory(category.id)}
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
                        onClick={() => startEdit(category)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={category.is_active ? "secondary" : "default"}
                        onClick={() => handleToggleActive(category.id, category.is_active)}
                      >
                        {category.is_active ? "Deactivate" : "Activate"}
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

export default CategoryManager;
