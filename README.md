# Voting System

A full-stack recruitment voting system built with Next.js, TypeScript, Material-UI, Supabase, and Airtable.

## Features

- **Admin Dashboard** with JWT authentication
- **Applicant Management** - Fetch and display applicants from Airtable
- **Quiz Creation** - Select applicants and generate shareable quiz links
- **Voting Interface** - Rate applicants 1-5 stars with auto-save progress
- **Analytics Dashboard** - View average scores and filter by percentage tiers
- **Responsive UI** - Built with Material-UI components

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `AIRTABLE_API_KEY` - Your Airtable personal access token
- `AIRTABLE_BASE_ID` - Your Airtable base ID
- `JWT_SECRET` - A secure random string for JWT signing

### 3. Setup Supabase Database

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor to create the necessary tables.

Default admin credentials:
- Username: `quinnadmin`
- Password: `testpassword`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables from `.env` to Vercel's environment variables
4. Deploy!

## Usage

### Admin Flow

1. Sign in at `/signin` with admin credentials
2. Select applicants from the "Create Quiz" tab (sorted by graduation year)
3. Click "Create Quiz" to generate a shareable link
4. Share the quiz link with voters
5. View results in the "View Quizzes" tab
6. Click "View Analytics" to see average scores and tier filtering

### Voter Flow

1. Open the quiz link
2. Rate each applicant 1-5 stars (progress is auto-saved)
3. Submit the quiz when all ratings are complete

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Database**: Supabase (PostgreSQL)
- **External Data**: Airtable
- **Authentication**: JWT with bcryptjs
- **Deployment**: Vercel
