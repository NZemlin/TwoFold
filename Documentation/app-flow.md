# App Flow

## 1. Landing Page
- **Purpose**: Introduce the app and guide users to sign up/log in.  
- **Features**:  
  - **Header**: TwoFold logo + "Sign Up" / "Log In" buttons.  
  - **Hero Section**:  
    - Tagline: "Your private space for shared memories."  
    - Call-to-action: "Start Your Journey" (links to signup).  
  - **No Footer** (MVP focus on core actions).  

---

## 2. Authentication
### Sign Up  
1. Click "Sign Up" → Enter email + password.  
2. Supabase sends email verification link.  
3. Verify email → Redirect to **Dashboard**.  

### Partner Linking (Post-Signup)  
1. **Dashboard** → "Invite Partner" button.  
2. Enter partner’s email → Supabase triggers invitation email.  
3. **Partner’s Flow**:  
   - Click invite link → Sign up → Couple profile auto-linked.  

### Log In  
1. Click "Log In" → Enter email + password.  
2. Redirect to **Dashboard**.  

---

## 3. Dashboard (Post-Linking)
- **Purpose**: Central hub for accessing all features.  
- **Layout**:  
  - **Sidebar**:  
    - Timeline | Affection | Hints | Profile  
  - **Main Content**:  
    - "Add Memory" button (image/text).  
    - Grid of existing memories (newest first).  

---

## 4. Timeline Page
- **Purpose**: Chronological feed of shared memories.  
- **Flow**:  
  1. Click "Add Memory" → Choose "Image" or "Text".  
  2. **Image Upload**:  
     - Drag-and-drop or file picker.  
     - Add caption + tags (e.g., "Adventure", "Silly").  
  3. **Text Entry**:  
     - Write a note → Tag emotions (e.g., "❤️ Loving", "😂 Funny").  
  4. Partner receives email notification (future) + sees entry in their timeline.  

---

## 5. Affection Page
- **Purpose**: Exchange virtual gestures (hugs/kisses).  
- **Flow**:  
  1. Click "Send Hug" or "Send Kiss".  
  2. Animation plays (e.g., floating heart emoji).  
  3. Gesture appears in **History** tab for both partners.  
- **History**:  
  - List of sent/received gestures with timestamps.  

---

## 6. Hints Page
- **Purpose**: Share gift/date ideas.  
- **Flow**:  
  1. Click "Add Hint" → Enter text/link + category (e.g., "Gift", "Date Night").  
  2. Partner sees hint in their Hints tab → Marks as "Fulfilled" when completed.  
- **Fulfilled Hints**:  
  - Strikethrough + green checkmark (visual feedback).  

---

## 7. Profile Page
- **Purpose**: Manage account settings.  
- **Features**:  
  - **Edit Profile**: Update email/password.  
  - **Partner Info**: View partner’s email/last active status.  
  - **Log Out**: Button to sign out.  

---

## User Flow Summary (MVP)
1. **Landing Page** → Sign Up → Verify Email → Dashboard.  
2. **Dashboard** → Invite Partner → Partner Joins → Timeline.  
3. **Timeline** → Upload Memory → Partner Views/Adds.  
4. **Affection** → Send Gesture → Partner Receives.  
5. **Hints** → Add Idea → Partner Acts.  