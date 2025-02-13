# Project Requirements Document (PRD)

## Project Name
**TwoFold**  
*(A private digital scrapbook for couples)*

---

## Introduction
### Purpose
TwoFold is a web app designed for couples to share memories, exchange virtual affection, and coordinate plans in a private, intimate space. The MVP focuses on core relationship-building features, with future scalability for analytics and mobile apps.

### Target Audience
- Couples in long-distance relationships  
- Partners who value organized, sentimental digital interaction  
- Users prioritizing privacy over social sharing  

---

## Core Features
### MVP (Minimum Viable Product)
1. **Partner Account Linking**  
   - Secure email/password authentication via Supabase  
   - Invite partner via email → Accept/decline system  
2. **Shared Timeline**  
   - Upload images/text with timestamps and tags (e.g., "Adventure", "Silly Moments")  
   - View entries in a chronological grid  
3. **Affection Notifications**  
   - Send "hugs" or "kisses" with a notification history  
   - Basic emoji animations (no real-time MVP)  
4. **Hint System**  
   - Drop hints (text/links) for gifts, dates, or experiences  
   - Mark hints as "fulfilled"  

### Future Features
1. **Relationship Wrapped**  
   - Yearly recap of stats (e.g., "You sent 127 hugs!")  
2. **Schedule Syncing**  
   - Google/Apple Calendar integration  
3. **Mobile Apps**  
   - iOS/Android versions with push notifications  

---

## User Flow (MVP)
1. **Sign Up** → Email Verification → Dashboard  
2. **Dashboard** → Invite Partner → Partner Accepts via Email  
3. **Timeline** → Upload Photo/Text → Partner Views/Adds  
4. **Hints** → Add "Sushi Class" Link → Partner Marks as Done  

---

## Tech Stack
### Frontend
- **Framework**: React + TypeScript (Vite)  
- **Styling**: Tailwind CSS + Headless UI  
- **State Management**: Zustand  

### Backend
- **Auth/DB**: Supabase (PostgreSQL)  
- **Storage**: Supabase Storage (images)  
- **Hosting**: Vercel (frontend), Supabase (backend)  

---

## In Scope vs. Out of Scope
| In Scope (MVP)                | Out of Scope               |
|-------------------------------|----------------------------|
| Partner linking               | Third-party calendar sync  |
| Image/text uploads            | Mobile apps                |
| Affection notifications       | Relationship Wrapped       |
| Hint system                   | AI/ML insights             |
