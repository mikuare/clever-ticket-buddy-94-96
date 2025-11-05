# 🎨 Chatbot Customization Examples

## Quick Examples to Make the Bot More Useful for Your Company

---

## 📝 Example 1: Add Company Hours

```typescript
// In src/components/chatbot/chatbotKnowledge.ts
// Add this to the chatbotKnowledgeBase array:

{
  patterns: ['hours', 'working hours', 'office hours', 'when open', 'business hours', 'support hours'],
  answer: "📅 Support Hours:\n\n🕐 Monday-Friday: 8:00 AM - 5:00 PM\n🕐 Saturday: 9:00 AM - 1:00 PM\n❌ Sunday: Closed\n\n⚡ Emergency Support:\n24/7 for Critical issues - Mark ticket as 'Critical'\n\n🌍 Timezone: Philippine Time (PHT)",
  category: 'hours'
}
```

**Test it:**
- "What are your hours?"
- "When is support available?"
- "Are you open on weekends?"

---

## 📞 Example 2: Add Contact Information

```typescript
{
  patterns: ['contact', 'phone', 'email', 'reach', 'call', 'contact number'],
  answer: "📞 Contact Information:\n\n📧 Email: support@yourcompany.com\n📱 Phone: +63 XXX-XXXX-XXXX\n💬 WhatsApp: Available\n\n🏢 Office Address:\nYour Building Name\nStreet Address\nCity, Province ZIP\n\n✨ For fastest help, create a ticket in this system!",
  category: 'contact'
}
```

**Test it:**
- "How can I contact support?"
- "What's your phone number?"
- "Where is your office?"

---

## 🏢 Example 3: Add Specific Departments

```typescript
{
  patterns: ['IT department', 'IT support', 'technical support', 'computer problem'],
  answer: "💻 IT Department:\n\n✅ We handle:\n• Computer issues\n• Network problems\n• Software installation\n• Email access\n• Password resets\n• Hardware repairs\n\n⚡ Priority Response Times:\n• Critical: Immediate\n• High: 2-4 hours\n• Medium: Same day\n• Low: 1-2 days\n\nCreate an IT ticket now for fastest support!",
  category: 'departments'
},
{
  patterns: ['HR', 'human resources', 'leave', 'payroll', 'benefits'],
  answer: "👥 Human Resources:\n\n✅ We handle:\n• Leave requests\n• Payroll questions\n• Benefits inquiries\n• Employment certificates\n• HR concerns\n\n📋 Required Information:\n• Employee ID\n• Department\n• Nature of request\n\nCreate an HR ticket for official tracking!",
  category: 'departments'
}
```

**Test it:**
- "I have a computer problem"
- "How do I request leave?"
- "I need IT support"

---

## 🚨 Example 4: Add Emergency Procedures

```typescript
{
  patterns: ['emergency', 'urgent', 'critical issue', 'system down', 'can\'t work'],
  answer: "🚨 EMERGENCY PROCEDURE:\n\n⚡ For Critical/Urgent Issues:\n\n1. Create ticket with 'CRITICAL' priority\n2. Call: +63 XXX-XXXX-XXXX (24/7 hotline)\n3. Email: emergency@yourcompany.com\n\n🔴 Critical means:\n• System completely down\n• Can't work at all\n• Business stopped\n• Security breach\n\n✅ Immediate Response Guaranteed:\n• Admin notified instantly\n• Response within 15 minutes\n• Dedicated urgent support team\n\nDon't wait - create your critical ticket now!",
  category: 'emergency'
}
```

**Test it:**
- "This is an emergency!"
- "System is down!"
- "Urgent help needed"

---

## 📚 Example 5: Add Common Issues & Solutions

```typescript
{
  patterns: ['password', 'forgot password', 'can\'t login', 'reset password', 'locked out'],
  answer: "🔐 Password Issues:\n\n✅ Quick Solutions:\n\n1️⃣ Forgot Password?\n• Click 'Forgot Password' on login\n• Enter your email\n• Check email for reset link\n• Create new password\n\n2️⃣ Account Locked?\n• Wait 15 minutes (auto-unlock)\n• OR contact IT immediately\n• OR create urgent ticket\n\n3️⃣ Password Requirements:\n• 8+ characters\n• Mix of letters & numbers\n• At least 1 special character\n\n💡 Still stuck? Create a ticket with 'Password Reset' in the title!",
  category: 'solutions'
},
{
  patterns: ['slow', 'performance', 'loading', 'freezing', 'lagging'],
  answer: "🐌 Performance Issues:\n\n🔧 Quick Fixes:\n\n1️⃣ Refresh the page (Ctrl+F5)\n2️⃣ Clear browser cache\n3️⃣ Close unused tabs\n4️⃣ Check internet connection\n5️⃣ Try different browser\n\n⚙️ Still Slow?\nCreate a ticket with:\n• What you were doing\n• Browser you're using\n• Screenshot if possible\n\n✅ IT will investigate:\n• Server status\n• Network issues\n• Your system settings\n\nWe'll fix it fast!",
  category: 'solutions'
}
```

**Test it:**
- "I forgot my password"
- "System is slow"
- "Can't login"

---

## 🎓 Example 6: Add Training/Tutorial Info

```typescript
{
  patterns: ['tutorial', 'training', 'how to use', 'guide', 'learn', 'video'],
  answer: "🎓 Training & Tutorials:\n\n📺 Video Tutorials:\n• Creating Tickets: bit.ly/helpdesk-create\n• Checking Status: bit.ly/helpdesk-status\n• Using Chat: bit.ly/helpdesk-chat\n\n📖 Documentation:\n• User Guide: docs.yourcompany.com\n• FAQ: faq.yourcompany.com\n\n👨‍🏫 Live Training:\n• Every Friday, 2:00 PM\n• IT Training Room\n• Register: training@yourcompany.com\n\n💡 New user? Watch the 5-minute intro video first!",
  category: 'training'
}
```

**Test it:**
- "Is there a tutorial?"
- "How do I learn the system?"
- "Any training available?"

---

## 🏆 Example 7: Add SLA (Service Level Agreement)

```typescript
{
  patterns: ['SLA', 'service level', 'response time', 'how fast', 'when will you respond'],
  answer: "⏱️ Service Level Agreement (SLA):\n\n📊 Response Times:\n\n🔴 CRITICAL\n• First Response: 15 minutes\n• Resolution Target: 2 hours\n• 24/7 Support\n\n🟠 HIGH\n• First Response: 2 hours\n• Resolution Target: 8 hours\n• Business hours priority\n\n🟡 MEDIUM\n• First Response: 8 hours\n• Resolution Target: 2 days\n• Regular queue\n\n🟢 LOW\n• First Response: 24 hours\n• Resolution Target: 5 days\n• When available\n\n✅ 98% of tickets resolved within SLA!\n\n💬 Real-time chat updates throughout!",
  category: 'sla'
}
```

**Test it:**
- "What's your SLA?"
- "How fast will you respond?"
- "When will my ticket be fixed?"

---

## 🎫 Example 8: Add Ticket Type Examples

```typescript
{
  patterns: ['examples', 'ticket examples', 'what to write', 'sample ticket', 'how to describe'],
  answer: "📝 Good Ticket Examples:\n\n✅ GOOD:\nTitle: 'Printer on 3rd floor not responding'\nDescription: 'HP LaserJet in Accounting, Floor 3. Paper jam error. Already cleared paper. Still shows error.'\n\n✅ GOOD:\nTitle: 'Can't access payroll system'\nDescription: 'Getting error 404 when clicking Payroll link. Started this morning. Using Chrome. Tried Edge, same issue.'\n\n❌ BAD:\nTitle: 'Help'\nDescription: 'Not working'\n\n💡 Good tickets include:\n• Specific problem\n• Where/when it happened\n• What you tried\n• Error messages\n• Screenshots\n\nMore details = Faster solution!",
  category: 'examples'
}
```

**Test it:**
- "Can you show examples?"
- "What should I write in my ticket?"
- "How do I describe my problem?"

---

## 🌟 Example 9: Add Company-Specific Policies

```typescript
{
  patterns: ['policy', 'rules', 'guidelines', 'allowed', 'can I'],
  answer: "📋 Helpdesk Policies:\n\n✅ You CAN:\n• Create unlimited tickets\n• Upload files (10MB max)\n• Reply to admin messages\n• Update ticket details\n• Close resolved tickets\n\n❌ Please DON'T:\n• Create duplicate tickets\n• Mark non-urgent as Critical\n• Close unresolved tickets\n• Share ticket access\n\n⏰ Ticket Lifecycle:\n• Auto-close after 7 days (if resolved)\n• Reopen within 48 hours if needed\n• Archive after 30 days\n\n🔒 Privacy:\n• Your tickets are private\n• Only you and admins see them\n• Secure and confidential\n\nQuestions? Ask your IT admin!",
  category: 'policy'
}
```

**Test it:**
- "What are the rules?"
- "What can I do?"
- "Are my tickets private?"

---

## 🎁 Example 10: Add Holiday/Maintenance Schedule

```typescript
{
  patterns: ['holiday', 'maintenance', 'downtime', 'closed', 'unavailable'],
  answer: "📅 Schedule Updates:\n\n🎄 Upcoming Holidays:\n• Dec 25, 2024: Christmas (Closed)\n• Jan 1, 2025: New Year (Closed)\n• Emergency support available\n\n🔧 Scheduled Maintenance:\n• None currently planned\n• Usually: Last Sunday of month, 2-4 AM\n• Advance notice: 1 week\n\n⚠️ During Maintenance:\n• System may be unavailable\n• Emergency tickets only\n• Resume normal hours after\n\n📧 Updates sent via:\n• Email notifications\n• System announcements\n• Dashboard alerts\n\nStay informed!",
  category: 'schedule'
}
```

**Test it:**
- "Are you closed for holidays?"
- "When is maintenance?"
- "Will the system be down?"

---

## 🚀 How to Add These

### Step 1: Open the file
```
src/components/chatbot/chatbotKnowledge.ts
```

### Step 2: Find the array
```typescript
export const chatbotKnowledgeBase: QAPair[] = [
  // Existing entries...
  
  // ADD YOUR NEW ENTRIES HERE
  
];
```

### Step 3: Paste any example
Just copy-paste the example code block from above

### Step 4: Customize
Replace with your actual:
- Company name
- Phone numbers
- Email addresses
- Office hours
- Policies
- URLs

### Step 5: Save
The chatbot will automatically use the new knowledge!

---

## 💡 Pro Tips

1. **Use clear patterns**: Add all possible ways users might ask
2. **Keep answers concise**: Break into bullet points
3. **Use emojis**: Makes it visually appealing
4. **Test variations**: Try different ways of asking
5. **Update regularly**: Add new Q&A based on common questions

---

## 🎯 Quick Start Template

```typescript
{
  patterns: ['keyword1', 'keyword2', 'phrase to match'],
  answer: "📌 Title:\n\nYour answer here with:\n• Bullet points\n• Clear info\n• Helpful details\n\n✅ Call to action!",
  category: 'your-category'
}
```

---

## 📊 Popular Categories

Organize your Q&A by category:
- `greeting` - Welcome messages
- `tickets` - Ticket creation/management
- `status` - Ticket status explanations
- `departments` - Department info
- `priority` - Priority levels
- `files` - File attachments
- `audio` - Voice messages
- `chat` - Messaging features
- `notifications` - Alerts/emails
- `account` - Login/passwords
- `support` - SLA/response times
- `access` - Mobile/browser access
- `features` - System capabilities
- `help` - General assistance
- `closing` - Thank you/goodbye
- `hours` - Business hours
- `contact` - Contact info
- `emergency` - Urgent procedures
- `solutions` - Common fixes
- `training` - Tutorials/guides
- `sla` - Service levels
- `examples` - Sample tickets
- `policy` - Rules/guidelines
- `schedule` - Holidays/maintenance

---

## ✅ Testing Checklist

After adding new Q&A:
- [ ] Test exact keyword match
- [ ] Test variations
- [ ] Test with typos
- [ ] Check answer formatting
- [ ] Verify links work
- [ ] Test on mobile
- [ ] Ask colleagues to try

---

## 🎉 You're Ready!

Pick any examples above and add them to your chatbot. Make it as comprehensive as you want - **it's all FREE!**

**Happy customizing!** 🚀

