// FREE Chatbot Knowledge Base - No AI APIs needed!
// This uses pattern matching and keyword detection

interface QAPair {
  patterns: string[]; // Keywords/phrases to match
  answer: string;
  category: string;
}

export const chatbotKnowledgeBase: QAPair[] = [
  // Getting Started
  {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'start'],
    answer: "Hello! 👋 Welcome to the Helpdesk System!\n\nI can help you with:\n• Creating tickets\n• Checking ticket status\n• Understanding departments\n• Priority levels\n• System features\n\nWhat would you like to know?",
    category: 'greeting'
  },

  // Creating Tickets
  {
    patterns: ['create ticket', 'new ticket', 'submit ticket', 'how to create', 'make ticket', 'open ticket'],
    answer: "To create a ticket:\n\n1. Click 'Create Ticket' button\n2. Fill in:\n   • Title (required)\n   • Description (required)\n   • Department (required)\n   • Priority level\n   • Category/Classification\n3. Attach files if needed (images, PDFs, documents)\n4. Click 'Submit'\n\nYou'll receive a ticket number like TKT-20250106-001. You can track it in your dashboard!",
    category: 'tickets'
  },

  // Ticket Status
  {
    patterns: ['ticket status', 'check status', 'track ticket', 'ticket progress', 'where is my ticket'],
    answer: "Ticket statuses explained:\n\n🟢 Open - Just submitted, waiting for admin\n🟡 In Progress - Admin is working on it\n🔵 Resolved - Issue fixed, awaiting your confirmation\n🔴 Closed - Completed and confirmed\n\nYou can check your ticket status in the dashboard or receive real-time notifications!",
    category: 'status'
  },

  // Departments
  {
    patterns: ['departments', 'which department', 'department list', 'what departments', 'choose department'],
    answer: "Available departments include:\n\n• IT Concerns (Technical issues)\n• Human Resources\n• Finance Department\n• Accounting Department\n• Supply Chain\n• Production Department\n• Quality Health Safety\n• And 20+ more!\n\nChoose the department that best matches your issue. Your ticket will be routed to the right team!",
    category: 'departments'
  },

  // Priority Levels
  {
    patterns: ['priority', 'urgent', 'critical', 'low priority', 'priority levels', 'how urgent'],
    answer: "Priority levels:\n\n🔴 Critical - System down, business stopped\n🟠 High - Major impact, needs quick fix\n🟡 Medium - Important but not blocking\n🟢 Low - Minor issue, can wait\n\nChoose based on how much the issue affects your work. Critical tickets get immediate attention!",
    category: 'priority'
  },

  // File Attachments
  {
    patterns: ['attach file', 'upload', 'attachment', 'send file', 'add image', 'screenshot'],
    answer: "File attachments:\n\n✅ Supported: Images (JPG, PNG), PDFs, Word docs, Excel files\n📏 Max size: 10MB per file\n📦 Max files: 3 per ticket\n\nYou can:\n• Click the paperclip icon\n• Drag & drop files\n• Paste screenshots (Ctrl+V)\n\nAttachments help admins solve your issue faster!",
    category: 'files'
  },

  // Audio Messages
  {
    patterns: ['voice', 'audio', 'record', 'voice message', 'speak'],
    answer: "Audio messages:\n\n🎤 Click the microphone icon\n🔴 Record your message\n⏹️ Click stop when done\n📤 Send automatically\n\nPerfect for explaining complex issues! Admins will hear your message and can reply via text or audio.",
    category: 'audio'
  },

  // Chat & Communication
  {
    patterns: ['chat', 'message', 'talk to admin', 'communicate', 'reply', 'conversation'],
    answer: "Real-time chat features:\n\n💬 Live messaging with admins\n⌨️ Typing indicators (see when admin types)\n↩️ Reply to specific messages\n✏️ Edit your messages\n🔔 Instant notifications\n\nAll communication stays in your ticket for easy tracking!",
    category: 'chat'
  },

  // Notifications
  {
    patterns: ['notification', 'alert', 'email', 'notify', 'updates'],
    answer: "Notification system:\n\n🔔 Browser notifications (real-time)\n📧 Email updates\n🔴 Red badge for new messages\n📱 Works on mobile too!\n\nYou'll be notified when:\n• Admin replies to your ticket\n• Status changes\n• Ticket resolved\n• New messages arrive",
    category: 'notifications'
  },

  // Login & Account
  {
    patterns: ['login', 'sign in', 'account', 'register', 'password', 'forgot password'],
    answer: "Account & Login:\n\n👤 Login with your email\n🔐 Use your company credentials\n📝 First time? Contact your admin for registration\n🔑 Forgot password? Use the 'Forgot Password' link\n\nYour account is linked to your department for proper ticket routing!",
    category: 'account'
  },

  // Ticket Number
  {
    patterns: ['ticket number', 'reference number', 'ticket id', 'tracking number'],
    answer: "Ticket numbers:\n\nFormat: TKT-YYYYMMDD-XXX\nExample: TKT-20250106-001\n\n• YYYYMMDD = Date created\n• XXX = Sequential number\n\nUse this to:\n• Track your ticket\n• Reference in conversations\n• Search in dashboard\n\nSave your ticket number for easy reference!",
    category: 'tickets'
  },

  // Response Time
  {
    patterns: ['how long', 'response time', 'when will', 'waiting', 'how fast', 'sla'],
    answer: "Response times:\n\n⚡ Critical: Immediate response\n🔸 High: Within 4 hours\n🔹 Medium: Within 24 hours\n⭕ Low: Within 48 hours\n\nActual fix time depends on issue complexity. You'll receive updates throughout the process via chat!",
    category: 'support'
  },

  // Mobile
  {
    patterns: ['mobile', 'phone', 'smartphone', 'tablet', 'mobile app'],
    answer: "Mobile access:\n\n📱 Fully responsive web interface\n✅ Works on phones & tablets\n🌐 No app needed - use your browser\n📲 Same features as desktop\n\nJust visit the helpdesk URL on your mobile device and login!",
    category: 'access'
  },

  // Features
  {
    patterns: ['features', 'what can', 'capabilities', 'functions', 'what does'],
    answer: "Key features:\n\n✅ Create & track tickets\n💬 Real-time chat with admins\n📎 File & audio attachments\n🔔 Instant notifications\n📊 Dashboard with ticket history\n⌨️ Typing indicators\n↩️ Reply to messages\n✏️ Edit messages\n🔍 Search & filter tickets\n📱 Mobile friendly\n\nAll designed to solve your issues faster!",
    category: 'features'
  },

  // Help
  {
    patterns: ['help', 'support', 'need help', 'assist', 'problem'],
    answer: "I'm here to help!\n\nCommon topics:\n• How to create tickets\n• Understanding status\n• Using chat features\n• File attachments\n• Priority levels\n\nJust ask me anything like:\n'How do I create a ticket?'\n'What does In Progress mean?'\n'Can I attach files?'\n\nI'll do my best to answer!",
    category: 'help'
  },

  // Thank you
  {
    patterns: ['thank', 'thanks', 'appreciate', 'helpful'],
    answer: "You're very welcome! 😊\n\nHappy to help! If you have more questions, feel free to ask.\n\nRemember: Once you login, you can create tickets and get real-time support from our admin team!",
    category: 'closing'
  },

  // Goodbye
  {
    patterns: ['bye', 'goodbye', 'see you', 'exit', 'close'],
    answer: "Goodbye! 👋\n\nFeel free to come back anytime you have questions. Our helpdesk team is ready to assist you!\n\nHave a great day! ✨",
    category: 'closing'
  }
];

// Smart pattern matching function
export const findBestAnswer = (userInput: string): string => {
  const input = userInput.toLowerCase().trim();
  
  // Check for empty input
  if (!input) {
    return "I didn't catch that. Could you please ask your question?";
  }

  // Find matching Q&A pairs
  let bestMatch: QAPair | null = null;
  let highestScore = 0;

  for (const qa of chatbotKnowledgeBase) {
    let score = 0;
    
    for (const pattern of qa.patterns) {
      // Exact match gets highest score
      if (input === pattern.toLowerCase()) {
        score += 10;
      }
      // Contains the pattern
      else if (input.includes(pattern.toLowerCase())) {
        score += 5;
      }
      // Partial word match
      else {
        const words = pattern.toLowerCase().split(' ');
        const matchedWords = words.filter(word => input.includes(word));
        score += matchedWords.length;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = qa;
    }
  }

  // If we found a good match, return it
  if (bestMatch && highestScore >= 3) {
    return bestMatch.answer;
  }

  // Fallback responses for unmatched questions
  return `I'm not sure about that specific question, but I can help with:\n\n• Creating and tracking tickets\n• Understanding ticket status\n• Using chat features\n• File attachments\n• Priority levels\n• Departments\n\nTry asking something like:\n"How do I create a ticket?"\n"What are the priority levels?"\n"Can I attach files?"\n\nOr login to chat with a real admin for personalized help! 😊`;
};

// Get quick suggestion questions
export const getQuickSuggestions = (): string[] => {
  return [
    "How do I create a ticket?",
    "What are ticket statuses?",
    "Can I attach files?",
    "How long for response?",
    "What are the features?"
  ];
};

