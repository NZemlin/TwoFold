# Tech Stack

## Frontend
### Core
- **React**: Component-based UI with functional components + hooks  
- **TypeScript**: Strict type checks for props/state  
- **Vite**: Fast development environment  

### State Management
- **Zustand**: Lightweight global state (e.g., `useAuthStore`)  
- **TanStack Query**: Data fetching/caching for Supabase API calls  

### Styling
- **Tailwind CSS**: Utility-first styling with custom theme  
- **Heroicons**: SVG icons for buttons/notifications  

### Libraries
- **Supabase JS Client**: `@supabase/supabase-js` for auth/storage  

---

## Backend
### Supabase Services
- **Authentication**: Email/password with JWT sessions  
- **Database**: PostgreSQL tables:  
  ```sql
  -- users: Stores individual user data
  CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    partner_id UUID REFERENCES users(id) NULLABLE
  );

  -- couples: Links two users into a relationship
  CREATE TABLE couples (
    id UUID PRIMARY KEY,
    user1_id UUID REFERENCES users(id) NOT NULL,
    user2_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- timeline_posts: Shared memories
  CREATE TABLE timeline_posts (
    id UUID PRIMARY KEY,
    couple_id UUID REFERENCES couples(id) NOT NULL,
    content TEXT,
    media_url TEXT,
    type TEXT CHECK (type IN ('image', 'text', 'hint')),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- affection_gestures: Virtual hugs and kisses
  CREATE TABLE affection_gestures (
    id UUID PRIMARY KEY,
    couple_id UUID REFERENCES couples(id) NOT NULL,
    sender_id UUID REFERENCES users(id) NOT NULL,
    receiver_id UUID REFERENCES users(id) NOT NULL,
    type TEXT CHECK (type IN ('hug', 'kiss')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- hints: Gift and date suggestions
  CREATE TABLE hints (
    id UUID PRIMARY KEY,
    couple_id UUID REFERENCES couples(id) NOT NULL,
    creator_id UUID REFERENCES users(id) NOT NULL,
    content TEXT NOT NULL,
    category TEXT CHECK (category IN ('gift', 'date_night', 'experience', 'other')) NOT NULL,
    link_url TEXT,
    is_fulfilled BOOLEAN DEFAULT false,
    fulfilled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

---

### Storage
- **Supabase Storage**: Handles image uploads

---

### Development Tools
- **ESLint/Prettier**: Code formatting/linting
- **Cypress**: E2E testing (post-MVP)

---

### GitHub Actions
- **CI/CD pipeline**

---

### Hosting
- **Frontend**: Vercel (static site hosting)
- **Backend**: Supabase (Auth, DB, Storage)

---

### Domain
- **Custom domain**: app.twofold.love

---

### Environment Variables
- **VITE_SUPABASE_URL**: Supabase project URL
- **VITE_SUPABASE_ANON_KEY**: Supabase public API key
