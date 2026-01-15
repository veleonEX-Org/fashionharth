# Customer Support & Enquiry System - Implementation Summary

## Overview
A complete customer support and enquiry system has been implemented, allowing customers to communicate with the company through multiple channels, with real-time chat functionality powered by Socket.io.

## Features Implemented

### 1. **Customer-Facing Features**

#### Floating Support Button (Global)
- **Location**: Bottom-right corner on all pages
- **File**: `frontend/src/components/SupportFab.tsx`
- **Options**:
  - 💬 **Message Us**: Opens internal enquiry modal
  - 📱 **WhatsApp**: Links to WhatsApp (update with your number)
  - 📞 **Call Us**: Links to phone (update with your number)

#### Enquiry Modal
- **File**: `frontend/src/components/EnquiryModal.tsx`
- **Features**:
  - Send enquiries from anywhere in the app
  - Context-aware (can include item details)
  - Redirects to `/chat` after submission
  - Automatically creates support conversation with admin/staff

#### Item Details Page Enquiry
- **File**: `frontend/src/pages/ItemDetailsPage.tsx`
- **Feature**: "Make Enquiry about this Piece" button
- Pre-fills enquiry with item information

#### Customer Chat Page
- **Route**: `/chat`
- **File**: `frontend/src/pages/ChatPage.tsx`
- **Features**:
  - View all conversations
  - Real-time messaging with Socket.io
  - Clean, modern UI matching app theme
  - Message timestamps
  - Conversation list with last message preview

---

### 2. **Admin & Staff Features**

#### Admin Support Dashboard
- **Route**: `/admin/support`
- **File**: `frontend/src/pages/admin/AdminSupportPage.tsx`
- **Features**:
  - View all customer support conversations
  - Filter: "Support Only" or "All Chats"
  - Real-time message updates
  - Group conversation indicators
  - Message timestamps
  - Respond to customer enquiries

#### Staff Support Dashboard
- **Route**: `/staff/support`
- **File**: `frontend/src/pages/staff/StaffSupportPage.tsx`
- **Features**: Identical to admin support page

#### Dashboard Integration
- Added "Customer Support" card to:
  - Admin Dashboard (`/admin/dashboard`)
  - Staff Dashboard (`/staff/dashboard`)

---

### 3. **Backend Implementation**

#### Enhanced Chat Controller
- **File**: `backend/src/controllers/chatController.ts`
- **New Features**:
  - `isSupport` flag for creating support conversations
  - Automatically adds all active admin/staff to support chats
  - Initial message support
  - Real-time socket notifications:
    - `new_conversation` event
    - `new_message` event
  - Group chat creation for support

#### Socket Service
- **File**: `backend/src/services/socketService.ts`
- **Features**:
  - Real-time bidirectional communication
  - User-to-user messaging
  - Conversation rooms
  - Message broadcasting
  - Authentication via JWT

#### Database Schema
- **File**: `backend/sql/chat.sql`
- **Tables**:
  - `conversations`: Chat metadata
  - `conversation_members`: User-conversation relationships
  - `messages`: Message content and timestamps
- **Triggers**: Auto-update conversation timestamps

---

### 4. **Frontend State Management**

#### Chat Store
- **File**: `frontend/src/state/chatStore.ts`
- **State**:
  - Conversations list
  - Active conversation ID
  - Messages by conversation
- **Actions**:
  - Set conversations
  - Set active conversation
  - Add/set messages

#### useChat Hook
- **File**: `frontend/src/hooks/useChat.ts`
- **Features**:
  - Fetch conversations
  - Select conversation
  - Send messages
  - Real-time socket listeners:
    - `new_message`
    - `new_conversation`
    - `error`

---

## How It Works

### Customer Flow:
1. Customer clicks floating support button or "Make Enquiry" on item page
2. Fills out enquiry form with their message
3. System creates a group conversation with:
   - The customer
   - All active admin users
   - All active staff users
4. Initial message is sent automatically
5. Customer is redirected to `/chat` to continue conversation
6. Real-time updates via Socket.io

### Admin/Staff Flow:
1. Navigate to `/admin/support` or `/staff/support`
2. See list of all support conversations
3. Filter to show only support enquiries
4. Click conversation to view messages
5. Respond in real-time
6. All admins/staff in the conversation receive updates

---

## Configuration Required

### Update Contact Information
**File**: `frontend/src/components/SupportFab.tsx`

```tsx
// Line 47: Update WhatsApp link
<a href="https://wa.me/YOUR_PHONE_NUMBER" ...>

// Line 56: Update phone number
<a href="tel:+YOUR_PHONE_NUMBER" ...>
```

### Ensure Admin/Staff Users Exist
Support enquiries automatically add admin/staff to conversations. Make sure you have users with:
- `role = 'admin'` OR `role = 'staff'`
- `status = 'active'`

---

## API Endpoints

### Chat Routes (`/api/chat`)
- `GET /conversations` - Get user's conversations
- `POST /conversations` - Create new conversation
  - Body: `{ isSupport?: boolean, message?: string, participantIds?: number[] }`
- `GET /conversations/:id/messages` - Get messages for conversation

### Socket Events
**Client → Server:**
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `send_message` - Send a message

**Server → Client:**
- `new_message` - New message received
- `new_conversation` - New conversation created
- `error` - Error occurred

---

## Testing Checklist

- [ ] Floating support button appears on all pages
- [ ] WhatsApp and Call buttons link correctly (after updating numbers)
- [ ] "Message Us" opens enquiry modal
- [ ] Enquiry modal sends message and redirects to `/chat`
- [ ] Item details page enquiry includes item information
- [ ] Customer can view conversations at `/chat`
- [ ] Real-time messages appear without refresh
- [ ] Admin can access `/admin/support`
- [ ] Staff can access `/staff/support`
- [ ] Support filter shows only support conversations
- [ ] Multiple admins/staff receive same enquiry
- [ ] Socket connection establishes on login

---

## Future Enhancements

1. **Typing Indicators**: Show when someone is typing
2. **Read Receipts**: Mark messages as read
3. **File Attachments**: Allow image/file sharing
4. **Conversation Assignment**: Assign specific staff to conversations
5. **Conversation Status**: Mark as resolved/pending/in-progress
6. **Notification Badges**: Show unread message count
7. **Email Notifications**: Notify staff of new enquiries via email
8. **Customer Satisfaction**: Post-conversation rating system

---

## Files Modified/Created

### Frontend
- ✅ `src/components/SupportFab.tsx` (new)
- ✅ `src/components/EnquiryModal.tsx` (new)
- ✅ `src/pages/admin/AdminSupportPage.tsx` (new)
- ✅ `src/pages/staff/StaffSupportPage.tsx` (new)
- ✅ `src/pages/ChatPage.tsx` (updated)
- ✅ `src/pages/ItemDetailsPage.tsx` (updated)
- ✅ `src/pages/AdminDashboardPage.tsx` (updated)
- ✅ `src/pages/StaffDashboardPage.tsx` (updated)
- ✅ `src/components/Layout.tsx` (updated)
- ✅ `src/hooks/useChat.ts` (updated)
- ✅ `src/App.tsx` (updated)

### Backend
- ✅ `src/controllers/chatController.ts` (updated)
- ✅ `src/services/socketService.ts` (existing)
- ✅ `sql/chat.sql` (existing)

---

## Support

The system is now fully functional and ready for use. Customers can reach out through multiple channels, and your team can respond in real-time through a centralized support dashboard.
