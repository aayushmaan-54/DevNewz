# 🔥 DevNewz: Hacker News Clone  
A Hacker News-style feed and discussion platform with key features like velocity-based ranking, nested comments, karma system, and user profiles with anti-procrastination settings.

---

## 🧱 Tech Stack
- **Frontend**: Next.js
- **Backend**: Next.js API Routes & Server Actions
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL
- **ORM**: Prisma

---

## 🚀 Features
### 🗞️ Feed  
- **`/news`** – Posts with high velocity (recent posts getting rapid upvotes)  
- **`/newest`** – Chronologically sorted feed of newly submitted posts  
- **`/threads`** – View a user’s comments in threaded (nested) format  
- **`/past`** – Shows front-page content from previous days  
- **`/comments`** – Recent comments across all posts  
- **`/ask`** – Posts where users ask questions (title starts with `Ask HN:`)  
- **`/show`** – Project showcases (title starts with `Show HN:`)  
- **`/submit`** – Submit a new post to the platform  

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
  - **noProcrast** mode:  
    - Set `maxVisit`: Maximum time allowed per session  
    - Set `minAway`: Minimum time required between sessions  
  - `delay`: Delay before comments become visible to others  
  - Change password  
  - View your:  
    - Submissions  
    - Upvoted posts/comments  

---

### 💬 Comments  
- Nested comments up to **5 levels deep**  
- Delayed comment visibility (based on user profile `delay`)  
- `/threads` page to see a user's full comment history in nested format  

---

### 🔼 Karma System  
- Earn **+1 karma** per upvote on your posts/comments  
- Lose karma when others **downvote** your content  
- Downvoting becomes available only after reaching **500 karma**  
- Users **cannot**:  
  - Upvote their own content  
  - Upvote the same post/comment more than once  

---

### 🌓 UX Details  
- Posts you've read appear in **muted color** (`#828282`)  
- Unread posts remain in **default black** (`#000000`)  

---