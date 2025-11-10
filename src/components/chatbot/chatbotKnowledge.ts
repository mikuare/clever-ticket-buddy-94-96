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
    answer: "Hello! 👋 Welcome to the Helpdesk System!\n\nI can help you with:\n• Creating tickets\n• Checking ticket status\n• Understanding departments\n• Master Data Management\n• System features\n\nWhat would you like to know?",
    category: 'greeting'
  },

  // Creating Tickets
  {
    patterns: ['create ticket', 'new ticket', 'submit ticket', 'how to create', 'make ticket', 'open ticket'],
    answer: "To create a ticket:\n\n1. Click 'Create Ticket' button\n2. Fill in:\n   • Title (required)\n   • Description (required)\n   • Department (required)\n   • Category/Classification\n3. Attach files if needed (images, PDFs, documents)\n4. Click 'Submit'\n\nYou'll receive a ticket number like TKT-20250106-001. You can track it in your dashboard!",
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
    answer: "Response times vary based on:\n\n• Issue complexity\n• Department workload\n• Ticket type\n\nYou'll receive updates throughout the process via chat and notifications. Our team works to resolve issues as quickly as possible!",
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
    answer: "I'm here to help!\n\nCommon topics:\n• How to create tickets\n• Understanding status\n• Using chat features\n• File attachments\n• Master Data Management\n\nJust ask me anything like:\n'How do I create a ticket?'\n'What does In Progress mean?'\n'Can I attach files?'\n'How to add stock items?'\n\nI'll do my best to answer!",
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
  },

  // Master Data Management - Overview
  {
    patterns: ['master data', 'mdm', 'data management', 'acumatica data', 'erp data'],
    answer: "Master Data Management (MDM) for Acumatica ERP:\n\n🎯 Purpose: Standardized process for collecting and validating data before adding to ERP system to ensure consistency, accuracy, and compliance.\n\n📌 Scope: Covers Vendors, Stock Items, Non-stock Items, and Employee records. Applies to all business units and support departments (Accounting, HR).\n\nI can help you add:\n📦 Stock Items - Physical inventory products\n📋 Non-stock Items - Services/expenses\n🏢 Vendors - Suppliers, haulers, subcontractors\n👤 Employees - Workforce records\n\nAll requests follow standardized formats to ensure accuracy and compliance. What would you like to add?",
    category: 'mdm'
  },

  // Stock Items
  {
    patterns: ['stock item', 'inventory item', 'add stock', 'physical product', 'inventory product'],
    answer: "📦 Adding Stock Items to Acumatica:\n\n✅ Format: [Item Name + Specification + Brand = UOM]\nExample: LED Bulb 10W, 6500K (Daylight) - PHILIPS = PCS\n\n✅ Technical Items Format: [Brand + Item Name + Specs = UOM]\nExample: PHILIPS LED Bulb 10W, 6500K (Daylight) = PCS\n\nSteps:\n1. Create ticket → Master Data Management\n2. Select 'Add Items' category\n3. Choose 'Inventory' module\n4. Enter item details in Description field\n5. Attach Excel/PDF if multiple items\n6. Submit ticket\n\nNeed help with the format?",
    category: 'mdm'
  },

  // Non-Stock Items
  {
    patterns: ['non-stock item', 'non stock', 'service item', 'expense item', 'non inventory'],
    answer: "📋 Adding Non-Stock Items to Acumatica:\n\n✅ Format: [Brand + Description + Specification = UOM = Type]\nExample: Ergodynamic Office Chair, Mesh Back = PCS = Non Stock Item\n\nNon-stock items are:\n• Services or goods not inventoried\n• Recorded directly as expenses\n• Linked to GL accounts\n\nSteps:\n1. Create ticket → Master Data Management\n2. Select 'Add Items' category\n3. Choose 'Inventory' module\n4. Enter details in Description field\n5. Specify as 'Non Stock Item'\n6. Submit ticket\n\nAccounting will validate GL account assignment!",
    category: 'mdm'
  },

  // Vendors
  {
    patterns: ['vendor', 'supplier', 'add vendor', 'hauler', 'subcontractor', 'vendor registration'],
    answer: "🏢 Adding Vendors to Acumatica:\n\n✅ Required Information:\n• Vendor Type (Hauler/Subcontractor/Supplier)\n• Vendor Name\n• Complete Address\n• Payment Terms\n• Payment Method (Cash/Check/Fund Transfer)\n• Tax Zone\n• TIN Number (required if Tax = VAT)\n\nExample Format:\nSupplier, RUTH & RYAN TRUCKING, LOT NO. 12 BLOCK NO. 4 MONTECARLO VITO, MINGLANILLA, CEBU, DATED, CHECK PAYMENT, VAT, TIN 432-289-729-00000\n\nSteps:\n1. Create ticket → Master Data Management\n2. Select 'Vendor' category\n3. Choose 'Payables' module\n4. Enter vendor details in Description\n5. Attach supporting documents\n6. Submit ticket",
    category: 'mdm'
  },

  // Employees
  {
    patterns: ['employee', 'add employee', 'staff', 'workforce', 'payruler', 'employee record'],
    answer: "👤 Adding Employees to Acumatica:\n\n✅ Requirements:\n• Must be registered in Payruler first\n• Valid Payruler Employee ID required\n• All details follow Payruler records\n\nEmployee records ensure:\n• HR and payroll data integration\n• Consistency across systems\n• Accurate workforce tracking\n\nSteps:\n1. Create ticket → Master Data Management\n2. Select 'Employee' category\n3. Provide Payruler Employee ID\n4. System will sync details from Payruler\n5. Submit ticket\n\nNote: Employee must exist in Payruler before Acumatica registration!",
    category: 'mdm'
  },

  // MDM Guidelines & Purpose
  {
    patterns: ['mdm guideline', 'data guideline', 'why mdm', 'mdm purpose', 'data standards', 'mdm scope', 'purpose of mdm', 'scope of mdm'],
    answer: "📋 Master Data Management Guidelines:\n\n🎯 PURPOSE:\nThe purpose of this guideline is to establish a standardized process for collecting and validating essential data before adding Vendors, Stock Items, Non-stock Items, and Employees into the Acumatica ERP system. By ensuring consistency, accuracy, and compliance, this process:\n• Reduces errors\n• Streamlines operations\n• Supports reliable reporting across all business functions\n\n📌 SCOPE:\nThis guideline covers the preparation, validation, and approval of data required before creating:\n• Vendors\n• Stock Items\n• Non-stock Items\n• Employee records\n\nIt applies to:\n• All business units that request or encode new records\n• Support departments (Accounting, Human Resources) responsible for validation\n\n✅ Key Principle:\nOnly complete, accurate, and standardized data is entered into the system to support compliance, efficiency, and reliable reporting.\n\nAll data must follow standard formats before entering Acumatica ERP!",
    category: 'mdm'
  },

  // MDM Ticket Creation Process
  {
    patterns: ['how to add mdm', 'mdm ticket', 'create mdm ticket', 'mdm process', 'add master data'],
    answer: "📝 How to Create MDM Ticket:\n\n1. Go to: https://help-desk-qmaz-v1-iota.vercel.app/\n2. Login with your credentials\n3. Click 'Create New Ticket'\n4. Select Classification: 'Master Data Management'\n5. Choose Category:\n   • 'Add Items' (Stock/Non-stock)\n   • 'Vendor' (Suppliers/Haulers)\n   • 'Employee' (Workforce)\n6. Select Acumatica Module:\n   • 'Inventory' for items\n   • 'Payables' for vendors\n7. Enter details in Description field\n8. Attach files (Excel/PDF/Images)\n9. Click 'Submit'\n\nYou'll receive a ticket number for tracking!",
    category: 'mdm'
  },

  // File Support for MDM
  {
    patterns: ['mdm file', 'bulk add', 'multiple items', 'excel upload', 'batch add'],
    answer: "📎 File Support for Bulk MDM Requests:\n\n✅ Supported Formats:\n• Excel (.xlsx, .xls)\n• PDF documents\n• Text/Note files\n• Images (screenshots)\n\n📦 Perfect for:\n• Multiple stock items\n• Batch vendor registration\n• Large inventory additions\n\n💡 Tips:\n• Use standard format templates\n• One item/vendor per row\n• Include all required fields\n• Attach to your MDM ticket\n\nThis speeds up processing and reduces back-and-forth!",
    category: 'mdm'
  },

  // UOM (Unit of Measure)
  {
    patterns: ['uom', 'unit of measure', 'pcs', 'units', 'measurement unit'],
    answer: "📏 Unit of Measure (UOM) Guide:\n\nCommon UOMs:\n• PCS - Pieces\n• BOX - Box\n• SET - Set\n• KG - Kilogram\n• LTR - Liter\n• MTR - Meter\n• ROLL - Roll\n• PACK - Pack\n\n✅ Always specify UOM when adding items:\n• Stock Items: LED Bulb 10W = PCS\n• Non-Stock: Office Chair = PCS\n\nCorrect UOM ensures accurate inventory tracking and ordering!",
    category: 'mdm'
  },

  // Tax & TIN
  {
    patterns: ['tin', 'tax', 'vat', 'tax zone', 'tin number', 'tax id'],
    answer: "💼 Tax & TIN Requirements:\n\n🔴 TIN (Tax Identification Number):\n• REQUIRED if Tax Zone = VAT\n• Format: XXX-XXX-XXX-XXXXX\n• Example: 432-289-729-00000\n\n✅ Tax Zones:\n• VAT - Value Added Tax (requires TIN)\n• Non-VAT - No TIN required\n\nFor Vendors:\n• Always specify tax zone\n• Provide valid TIN for VAT vendors\n• Ensures proper tax compliance\n\nMissing TIN for VAT vendors will delay processing!",
    category: 'mdm'
  },

  // Payment Methods
  {
    patterns: ['payment method', 'payment terms', 'how to pay', 'vendor payment', 'payment type'],
    answer: "💳 Vendor Payment Methods:\n\n✅ Available Options:\n• Cash Payment\n• Check Payment\n• Fund Transfer (Bank)\n\n📋 Payment Terms:\n• DATED - Payment on specific date\n• COD - Cash on Delivery\n• NET 30 - Payment within 30 days\n• NET 60 - Payment within 60 days\n\nSpecify both when adding vendors:\nExample: 'CHECK PAYMENT, DATED'\n\nThis ensures proper payment processing and vendor management!",
    category: 'mdm'
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
  return `I'm not sure about that specific question, but I can help with:\n\n• Creating and tracking tickets\n• Understanding ticket status\n• Master Data Management (MDM)\n• Adding Stock/Non-stock Items\n• Vendor registration\n• Employee records\n• File attachments\n• Departments\n\nTry asking:\n"How do I add stock items?"\n"How to add a vendor?"\n"What is Master Data Management?"\n"How do I create a ticket?"\n\nOr login to chat with a real admin for personalized help! 😊`;
};

// Get quick suggestion questions
export const getQuickSuggestions = (): string[] => {
  return [
    "How do I create a ticket?",
    "How to add stock items?",
    "How to add a vendor?",
    "What is Master Data Management?",
    "What are ticket statuses?"
  ];
};

