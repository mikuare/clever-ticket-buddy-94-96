import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, MessageSquare, Plus, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { PostReactions } from './PostReactions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EmojiPicker from '@/components/shared/EmojiPicker';
import { useIsMobile } from '@/hooks/use-mobile';

interface Post {
  id: string;
  admin_id: string;
  admin_name: string;
  title: string;
  content: string;
  created_at: string;
}

interface AdminProfile {
  id: string;
  avatar_url?: string;
  full_name: string;
}

const PostsSection = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<Map<string, AdminProfile>>(new Map());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPostsHidden, setIsPostsHidden] = useState(() => {
    return localStorage.getItem('postsHidden') === 'true';
  });
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const isAdmin = profile?.is_admin;

  const togglePostsVisibility = () => {
    const newHiddenState = !isPostsHidden;
    setIsPostsHidden(newHiddenState);
    localStorage.setItem('postsHidden', newHiddenState.toString());
  };

  useEffect(() => {
    fetchPosts();
    
    // Setup realtime subscriptions with cleanup
    const cleanup = subscribeToChanges();
    
    return cleanup;
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
      
      // Fetch admin profiles for avatar display
      if (data && data.length > 0) {
        await fetchAdminProfiles(data.map(post => post.admin_id));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchAdminProfiles = async (adminIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar_url, full_name')
        .in('id', adminIds);

      if (error) throw error;
      
      const profilesMap = new Map();
      data?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      setAdminProfiles(profilesMap);
    } catch (error) {
      console.error('Error fetching admin profiles:', error);
    }
  };

  const subscribeToChanges = () => {
    // Enhanced realtime subscription for immediate updates
    const postsChannel = supabase
      .channel('posts-realtime-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        console.log('Posts change detected:', payload);
        fetchPosts();
      })
      .subscribe((status) => {
        console.log('Posts realtime status:', status);
      });

    return () => {
      console.log('Cleaning up posts realtime subscription');
      supabase.removeChannel(postsChannel);
    };
  };

  const createPost = async () => {
    if (!user || !profile) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content before creating a post.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          admin_id: user.id,
          admin_name: profile.full_name,
          title: trimmedTitle,
          content: trimmedContent
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPosts(prev => [data, ...prev]);

        setAdminProfiles(prev => {
          const next = new Map(prev);
          next.set(data.admin_id, {
            id: data.admin_id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          });
          return next;
        });
      }

      setTitle('');
      setContent('');
      setShowCreateForm(false);

      toast({
        title: "Success",
        description: "Post created successfully"
      });

      // Background refresh to ensure consistent ordering and metadata
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  if (!user || !profile) return null;

  return (
    <>
      <style>{`
        @keyframes borderFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animated-border {
          position: relative;
          background: linear-gradient(45deg, 
            hsl(var(--primary)/0.4), 
            hsl(var(--accent)/0.4), 
            hsl(var(--primary)/0.6), 
            hsl(var(--accent)/0.6),
            hsl(var(--primary)/0.4)
          );
          background-size: 300% 300%;
          animation: borderFlow 3s ease infinite;
          padding: 2px;
          border-radius: 0.5rem;
        }
        
        .animated-border-inner {
          background: hsl(var(--card));
          border-radius: 0.375rem;
          position: relative;
          z-index: 1;
        }
      `}</style>
      
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className={isMobile ? "w-4 h-4 text-primary" : "w-5 h-5 text-primary"} />
            <h2 className={isMobile ? "text-lg font-semibold text-foreground" : "text-xl font-semibold text-foreground"}>
              {isMobile ? "Posts" : "Information Posts"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePostsVisibility}
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              className={isMobile ? "h-8 w-8 p-0" : "gap-2"}
              title={isPostsHidden ? "Show posts" : "Hide posts"}
            >
              {isPostsHidden ? (
                <>
                  <Eye className="w-4 h-4" />
                  {!isMobile && <span>Show Posts</span>}
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  {!isMobile && <span>Hide Posts</span>}
                </>
              )}
            </Button>
            {isAdmin && !isPostsHidden && (
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant="default"
                size="sm"
                className={isMobile ? "h-8 w-8 p-0" : "gap-2"}
                title="Create Post"
              >
                <Plus className="w-4 h-4" />
                {!isMobile && <span>Create Post</span>}
              </Button>
            )}
          </div>
        </div>

        {/* Show message when posts are hidden */}
        {isPostsHidden ? (
          <Card>
            <CardContent className="text-center py-12">
              <EyeOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Information posts are hidden.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Show Posts" above to view them again.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Create Post Form */}
            {isAdmin && showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Information Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Post content..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <EmojiPicker
                        onEmojiSelect={(emoji) => setContent(prev => prev + emoji)}
                        className="h-8 w-8"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={createPost} 
                      disabled={loading || !title.trim() || !content.trim()}
                      className="flex-1"
                    >
                      {loading ? 'Creating...' : 'Create Post'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowCreateForm(false);
                        setTitle('');
                        setContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No information posts yet.</p>
                    {isAdmin && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Create the first post to share information with all users.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => {
                  const adminProfile = adminProfiles.get(post.admin_id);
                  
                  return (
                    <div key={post.id} className="animated-border">
                      <Card className="animated-border-inner bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <CardTitle className="text-lg">{post.title}</CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage 
                                      src={adminProfile?.avatar_url} 
                                      alt={post.admin_name}
                                    />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                      {post.admin_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <Badge variant="secondary">{post.admin_name}</Badge>
                                </div>
                                <span>•</span>
                                <span>{format(new Date(post.created_at), 'PPp')}</span>
                              </div>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletePost(post.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{post.content}</p>
                          </div>
                          <PostReactions 
                            postId={post.id} 
                            currentUserId={user.id}
                            currentUserName={profile.full_name}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PostsSection;
