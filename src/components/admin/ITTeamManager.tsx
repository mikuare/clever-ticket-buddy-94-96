import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useITTeam, type ITTeamMember } from '@/hooks/useITTeam';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Edit3, Save, X } from 'lucide-react';

interface ITTeamManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITTeamManager = ({ isOpen, onClose }: ITTeamManagerProps) => {
  const { teamMembers, loading, updateTeamMember, uploadImage } = useITTeam();
  const [editingMember, setEditingMember] = useState<ITTeamMember | null>(null);
  const [formData, setFormData] = useState({ name: '', job_title: '' });
  const [uploading, setUploading] = useState<string | null>(null);

  const handleEditMember = (member: ITTeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      job_title: member.job_title
    });
  };

  const handleSave = async () => {
    if (!editingMember) return;
    
    await updateTeamMember(editingMember.id, formData);
    setEditingMember(null);
    setFormData({ name: '', job_title: '' });
  };

  const handleImageUpload = async (file: File, member: ITTeamMember) => {
    setUploading(member.id);
    try {
      const imageUrl = await uploadImage(file, member.id);
      if (imageUrl) {
        await updateTeamMember(member.id, { image_url: imageUrl });
      }
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage IT Team</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage IT Team</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {teamMembers.map((member) => (
            <Card key={member.id} className="relative">
              <CardContent className="p-6">
                {editingMember?.id === member.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b82f6&color=ffffff&size=64`;
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="mb-2"
                        />
                        <Label htmlFor="job_title">Job Title</Label>
                        <Input
                          id="job_title"
                          value={formData.job_title}
                          onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm" className="flex-1">
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        onClick={() => setEditingMember(null)} 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b82f6&color=ffffff&size=64`;
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.job_title}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleEditMember(member)} 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit Details
                      </Button>
                      <div className="relative flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, member);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploading === member.id}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          disabled={uploading === member.id}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          {uploading === member.id ? 'Uploading...' : 'Upload Image'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ITTeamManager;