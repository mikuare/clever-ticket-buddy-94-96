import { useAuth } from '@/hooks/useAuth';
import ChatBot from './ChatBot';

/**
 * Wrapper component that only shows the chatbot on the landing page
 * (before users are logged in). Hides the chatbot once authenticated.
 */
const ChatBotWrapper = () => {
  const { user, loading } = useAuth();

  // Don't show chatbot while checking authentication
  if (loading) {
    return null;
  }

  // Only show chatbot when user is NOT logged in
  // This means it appears on login/signup page only
  if (user) {
    return null;
  }

  return <ChatBot />;
};

export default ChatBotWrapper;

