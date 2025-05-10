# 🔥 DevNewz: Hacker News Clone  
A Hacker News-style feed and discussion platform with key features like velocity-based ranking, nested comments, karma system, and user profiles.

---

## 🧱 Tech Stack
- **Frontend**: Next.js, Tailwind CSS  
- **Backend**: Next.js API Routes, Server Actions  
- **Authentication**: JWT (via `jose`)  
- **Database**: PostgreSQL  
- **ORM**: Prisma  
- **Validation**: Conform, Zod (Client + Server)  
- **Emails**: SendGrid  
- **Data Fetching**: TanStack React Query, Axios  
- **Security**: Crypto Web API (Hashing & Cryptography)

---

## 🚀 Features
### 🗞️ Feed  
- **`/news`** – Posts with high velocity (recent posts getting rapid upvotes) 
- **`/news/newest`** – Chronologically sorted feed of newly submitted posts  
- **`/news/threads`** – View a user’s comments in threaded (nested) format  
- **`/news/past?date=05/05/2025`** – Shows front-page content from previous days  
- **`/news/newcomments`** – Recent comments across all posts  
- **`/news/ask`** – Posts where users ask questions (title starts with `Ask DevNewz: `)  
- **`/news/show`** – Project showcases (title starts with `Show DevNewz: `)  
- **`/news/submit`** – Submit a new post to the platform

---

### 🔐 Authentication  
- **Login / Sign-up** with a username and password  
- **Optional Email** for password recovery  
- **User Profile**:  
  - Username  
  - Account creation time (e.g., "15 days ago")  
  - Karma  
  - About section  
  - Email (optional)  
  - Change password  
  - View your:  
    - Submissions  
    - Upvoted posts/comments  
    - Downvoted posts/comments  

---

### 💬 Comments  
- Nested comments up to **5 levels deep**  
- `/news/threads` page to see a user's full comment history in nested format  

---

### 🔼 Karma System  
- Earn **+1 karma** per upvote on your posts/comments  
- Lose karma when others **downvote** your content  
- Downvoting becomes available only after reaching **500 karma**  
- Users **cannot**:  
  - Upvote their own content  
  - Upvote the same post/comment more than once  

---