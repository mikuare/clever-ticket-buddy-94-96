import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Save, X } from 'lucide-react';
import { useDigitalizationTeam, TeamMember } from '@/hooks/useDigitalizationTeam';
import { useToast } from '@/hooks/use-toast';

interface DigitalizationTeamManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DigitalizationTeamManager = ({ isOpen, onClose }: DigitalizationTeamManagerProps) => {
  const { teamMembers, loading, updateTeamMember, uploadImage } = useDigitalizationTeam();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({ name: '', job_title: '' });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({ name: member.name, job_title: member.job_title });
  };

  const handleSave = async () => {
    if (!editingMember) return;

    await updateTeamMember(editingMember.id, {
      name: formData.name,
      job_title: formData.job_title
    });

    setEditingMember(null);
    setFormData({ name: '', job_title: '' });
  };

  const handleImageUpload = async (file: File, member: TeamMember) => {
    setUploading(true);
    try {
      const newImageUrl = await uploadImage(file, member.id);
      if (newImageUrl) {
        await updateTeamMember(member.id, { image_url: newImageUrl });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Digitalization Team</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="relative">
              <CardContent className="p-4">
                {editingMember?.id === member.id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Edit Member</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMember(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Position</Label>
                      <Input
                        id="job_title"
                        value={formData.job_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                      />
                    </div>
                    
                    <Button onClick={handleSave} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <label htmlFor={`file-${member.id}`} className="cursor-pointer">
                          <Button size="sm" variant="secondary" disabled={uploading} asChild>
                            <span>
                              <Upload className="h-4 w-4" />
                            </span>
                          </Button>
                        </label>
                        <input
                          id={`file-${member.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, member);
                              // Reset the input so the same file can be selected again
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-muted-foreground">{member.job_title}</p>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEditMember(member)}
                    >
                      Edit Details
                    </Button>
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

export default DigitalizationTeamManager;