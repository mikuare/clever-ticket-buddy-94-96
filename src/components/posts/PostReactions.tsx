import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Smile } from 'lucide-react';

interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  emoji: string;
}

interface PostReactionsProps {
  postId: string;
  reactions: PostReaction[];
  currentUserId: string;
  currentUserName: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '💯', '🔥', '👏'];

export const PostReactions = ({ postId, reactions, currentUserId, currentUserName }: PostReactionsProps) => {
  const [loading, setLoading] = useState(false);
  const [currentReactions, setCurrentReactions] = useState<PostReaction[]>(reactions);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const { toast } = useToast();

  // Initialize reactions from props
  useEffect(() => {
    setCurrentReactions(reactions);
  }, [reactions]);

  // Real-time subscription for instant reaction updates
  useEffect(() => {
    const channel = supabase
      .channel(`post-reactions-${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_reactions',
        filter: `post_id=eq.${postId}`
      }, async (payload) => {
        console.log('Real-time reaction update:', payload);
        
        // Fetch latest reactions from database
        try {
          const { data, error } = await supabase
            .from('post_reactions')
            .select('*')
            .eq('post_id', postId);
          
          if (!error && data) {
            setCurrentReactions(data);
          }
        } catch (error) {
          console.error('Error fetching updated reactions:', error);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  // Check cooldown status on component mount
  useEffect(() => {
    const checkCooldownStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('check_reaction_cooldown', {
          p_user_id: currentUserId,
          p_post_id: postId
        });
        
        if (!error) {
          setIsInCooldown(data);
        }
      } catch (error) {
        console.error('Error checking cooldown:', error);
      }
    };

    checkCooldownStatus();
  }, [currentUserId, postId]);

  // Use current reactions state
  const effectiveReactions = currentReactions;

  const groupedReactions = effectiveReactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, PostReaction[]>);

  const getUserReaction = (emoji: string) => {
    return effectiveReactions.find(r => r.user_id === currentUserId && r.emoji === emoji);
  };

  // Get user's current reaction (any emoji)
  const getUserCurrentReaction = () => {
    return effectiveReactions.find(r => r.user_id === currentUserId);
  };

  const toggleReaction = async (emoji: string) => {
    if (loading) return;
    
    const currentUserReaction = getUserCurrentReaction();
    const isCurrentEmoji = currentUserReaction?.emoji === emoji;

    // Check if user is in cooldown and trying to add a new reaction
    if (isInCooldown && !currentUserReaction) {
      toast({
        title: "Reaction Cooldown",
        description: "Please wait 1 minute after removing a reaction before adding a new one.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    
    setLoading(true);

    console.log('Toggling reaction:', { emoji, currentUserReaction, isCurrentEmoji });

    // Optimistic update for instant UI feedback
    if (isCurrentEmoji) {
      // Remove current reaction (user clicked same emoji)
      setCurrentReactions(prev => prev.filter(r => r.user_id !== currentUserId));
    } else {
      // Replace current reaction with new emoji (or add if no current reaction)
      const newReaction: PostReaction = {
        id: `temp-${Date.now()}-${currentUserId}`,
        post_id: postId,
        user_id: currentUserId,
        user_name: currentUserName,
        emoji
      };
      setCurrentReactions(prev => [
        ...prev.filter(r => r.user_id !== currentUserId), // Remove any existing reaction
        newReaction // Add new reaction
      ]);
    }

    try {
      // Use a transaction-like approach: delete then insert in sequence
      if (currentUserReaction) {
        console.log('Deleting existing reaction:', currentUserReaction.id);
        const { error: deleteError } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          throw deleteError;
        }

        // If removing reaction completely (not replacing), track cooldown
        if (isCurrentEmoji) {
          await supabase
            .from('reaction_cooldowns')
            .upsert({
              user_id: currentUserId,
              post_id: postId,
              last_removal_at: new Date().toISOString()
            });
          
          // Update cooldown state
          setIsInCooldown(true);
        }
      }

      // If not removing the same emoji, add the new reaction
      if (!isCurrentEmoji) {
        console.log('Inserting new reaction:', emoji);
        const { error: insertError } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: currentUserId,
            user_name: currentUserName,
            emoji
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
      }

      console.log('Reaction toggle completed successfully');

    } catch (error) {
      console.error('Error toggling reaction:', error);
      // Revert to original reactions on error
      setCurrentReactions(reactions);
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Existing reactions */}
      {Object.entries(groupedReactions).map(([emoji, emojiReactions]) => {
        const userReacted = getUserReaction(emoji);
        const count = emojiReactions.length;
        const userNames = emojiReactions.map(r => r.user_name).join(', ');
        const displayText = count > 3 ? 
          `${emojiReactions.slice(0, 3).map(r => r.user_name).join(', ')} and ${count - 3} others` : 
          userNames;

        return (
          <div
            key={emoji}
            className="h-8 px-3 gap-2 text-xs font-medium transition-all duration-200 shadow-sm bg-accent/20 text-accent-foreground rounded-md border border-accent/30 flex items-center cursor-default"
            title={`${displayText} reacted with ${emoji}`}
          >
            <span className="text-sm">{emoji}</span>
            <span className="bg-background/20 px-1.5 py-0.5 rounded text-xs font-bold">
              {count}
            </span>
            {userReacted && (
              <span className="ml-1 text-xs font-bold text-primary">You</span>
            )}
          </div>
        );
      })}

      {/* Add reaction button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/50"
            disabled={loading}
            title="Add reaction"
          >
            <Smile className="w-4 h-4" />
            <span className="ml-1 text-xs">React</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <div className="grid grid-cols-5 gap-2">
            {EMOJI_OPTIONS.map((emoji) => {
              const userCurrentReaction = getUserCurrentReaction();
              const isCurrentReaction = userCurrentReaction?.emoji === emoji;
              const reactionCount = groupedReactions[emoji]?.length || 0;
              return (
                <Button
                  key={emoji}
                  variant={isCurrentReaction ? "default" : "ghost"}
                  size="sm"
                  onClick={() => toggleReaction(emoji)}
                  disabled={loading || (isInCooldown && !userCurrentReaction)}
                  className="h-10 w-10 p-0 relative hover:scale-110 transition-transform disabled:opacity-50"
                  title={`${emoji} ${reactionCount > 0 ? `(${reactionCount})` : ''}${isCurrentReaction ? ' - Your current reaction' : ''}${isInCooldown && !userCurrentReaction ? ' - Cooldown active' : ''}`}
                >
                  <span className="text-lg">{emoji}</span>
                  {reactionCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {reactionCount}
                    </span>
                  )}
                  {isCurrentReaction && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </Button>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Choose one emoji to react • Click again to remove • Click different emoji to change
            {isInCooldown && !getUserCurrentReaction() && (
              <div className="mt-1 text-xs text-destructive font-medium">
                ⏱️ Cooldown active - wait 1 minute after removing a reaction
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
