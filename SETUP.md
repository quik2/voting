# Voting System - Setup Guide

## 🚀 Quick Start

### Step 1: Run the SQL Schema in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `votingsystem`
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy the entire contents of `supabase-schema.sql`
6. Paste it into the query editor
7. Click **"Run"** or press `Cmd/Ctrl + Enter`

This will create:
- `admins` table with default admin user
- `quizzes` table for storing quiz configurations
- `quiz_responses` table for storing voter submissions
- `quiz_sessions` table for caching progress

### Step 2: Verify Your Environment Variables

Your `.env` file should already be configured with:

```
NEXT_PUBLIC_SUPABASE_URL=https://jcwkgvartqmqyjydxsfi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
AIRTABLE_API_KEY=pat49oMBzmHOe3xMP...
AIRTABLE_BASE_ID=appEmD27JyhYr4osO
AIRTABLE_TABLE_NAME=Applicants
JWT_SECRET=voting_system_jwt_secret_key_2025_secure_random_string_xyz789
```

✅ All values are already set!

### Step 3: Test the Application

The dev server is already running! Open your browser:

**🌐 http://localhost:3000**

### Step 4: Sign In

Use these credentials:
- **Username:** `quinnadmin`
- **Password:** `testpassword`

---

## 📋 How to Use

### Admin Flow

1. **Sign In** at http://localhost:3000/signin
2. You'll see the **Create Quiz** tab with all 155 applicants from Airtable
3. Applicants are automatically sorted by graduation year
4. **Select applicants:**
   - Click individual cards to select/deselect
   - Use "Select All" / "Deselect All" per year
5. Click **"Create Quiz"** button
6. A modal appears with the quiz link - **Copy it!**
7. Switch to the **"View Quizzes"** tab to see all created quizzes
8. Click **"View Analytics"** on any quiz to see results

### Voter Flow

1. Open the quiz link you received
2. Each applicant shows with their photo and name
3. Rate each person 1-5 stars (all ratings required)
4. **Your progress is auto-saved** - you can close and return anytime
5. Click **"Submit Quiz"** when done

### Analytics

1. From the admin dashboard, go to **"View Quizzes"** tab
2. Click **"View Analytics"** on a quiz
3. See:
   - **Overall Results**: Table with rankings and average scores
   - **Tier Filtering**: Adjust top/middle/low percentages
   - Click the copy icon to copy names from each tier

---

## 🚀 Deploy to Vercel

### Option 1: Via Vercel Dashboard

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit - voting system"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click **"Import Project"**
4. Select your `voting` repository
5. Add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_DB_PASSWORD`
   - `AIRTABLE_API_KEY`
   - `AIRTABLE_BASE_ID`
   - `AIRTABLE_TABLE_NAME`
   - `JWT_SECRET`

6. Click **"Deploy"**

### Option 2: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts and add environment variables when asked.

---

## 🔧 Configuration

### Change Admin Password

If you want to change the admin password after setup:

1. Generate a new password hash:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_NEW_PASSWORD', 10, (err, hash) => console.log(hash));"
   ```

2. Update the hash in Supabase:
   ```sql
   UPDATE admins
   SET password_hash = 'YOUR_NEW_HASH'
   WHERE username = 'quinnadmin';
   ```

### Add More Admins

```sql
INSERT INTO admins (username, password_hash)
VALUES ('newadmin', 'BCRYPT_HASH_HERE');
```

---

## 📊 Database Schema

### Tables Created

1. **admins** - Admin user accounts
2. **quizzes** - Quiz configurations with selected applicants
3. **quiz_responses** - Individual voter ratings
4. **quiz_sessions** - Progress tracking (not actively used in v1)

---

## ✅ Testing Checklist

- [ ] Run SQL schema in Supabase
- [ ] Sign in with quinnadmin / testpassword
- [ ] See 155 applicants loaded from Airtable
- [ ] Create a test quiz
- [ ] Open quiz link in incognito/private window
- [ ] Rate applicants and submit
- [ ] View analytics and see the results
- [ ] Test tier filtering with different percentages

---

## 🐛 Troubleshooting

### Can't sign in
- Make sure you ran the SQL schema
- Check that Supabase URL and keys are correct in `.env`

### No applicants showing
- Verify Airtable token has access to the base
- Check the table name is "Applicants"
- Look at browser console for errors

### Quiz submission fails
- Check browser console for errors
- Verify all applicants are rated (green border on cards)
- Make sure Supabase connection is working

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Check terminal logs where `npm run dev` is running
3. Verify all environment variables are set correctly
