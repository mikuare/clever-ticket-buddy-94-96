# Messaging Features Migration Instructions

## Overview
New messaging features have been added (Reply, Edit, Typing Indicators) that require database changes.

## Important Note
**The messaging system will work WITHOUT the migration**, but the new features (reply, edit, typing indicator) will only be fully functional after applying the migration.

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to the **SQL Editor** section in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase/migrations/20250106000002_add_message_reply_edit_typing.sql`
6. Paste it into the SQL editor
7. Click **Run** or press `Ctrl+Enter`
8. Wait for the query to complete
9. Refresh your application

### Option 2: Using Supabase CLI
If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd clever-ticket-buddy-94-96

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push
```

### Option 3: Manual SQL Execution
If you prefer to run SQL manually, execute the migration file directly in your database.

## Features Enabled After Migration

### ✅ Before Migration (Current State)
- Send messages ✓
- Receive messages ✓
- Audio messages ✓
- File attachments ✓
- Real-time updates ✓

### 🚀 After Migration (Enhanced Features)
- Reply to specific messages ✓ (NEW)
- Edit your own messages ✓ (NEW)
- See typing indicators ✓ (NEW)
- View edit history ✓ (NEW)
- Message reply context ✓ (NEW)

## Troubleshooting

### If you see "Failed to send message" errors:
1. Check your browser console for specific errors
2. Make sure your Supabase connection is active
3. Verify that the `ticket_messages` table exists
4. Try applying the migration

### If new features don't appear:
1. Apply the migration using one of the methods above
2. Clear your browser cache
3. Refresh the application

### If you see database errors:
1. The code is backward compatible - basic messaging will still work
2. Apply the migration when you're ready to enable new features
3. Check Supabase logs for specific error messages

## Migration File Location
`supabase/migrations/20250106000002_add_message_reply_edit_typing.sql`

## Support
If you encounter any issues, check the console logs for detailed error messages.

