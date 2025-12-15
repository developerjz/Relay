# Relay MVP - LinkedIn Engagement Tool

A simple, powerful LinkedIn engagement tool built with Next.js and Supabase.

## Features

- 📌 Save LinkedIn posts to engage with later
- ⏰ Schedule email reminders for optimal engagement timing
- 💬 Store comment templates for faster responses
- 📊 Track engagement statistics
- 🔒 Secure authentication with Supabase

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Email**: Resend
- **Payments**: Stripe (coming soon)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Resend account (free tier works)
- A Vercel account (free tier works)

### 1. Clone and Install

```bash
# If you're starting from scratch
git clone <your-repo-url>
cd relay-mvp

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready (2-3 minutes)
3. Go to SQL Editor in Supabase dashboard
4. Copy the entire content of `supabase-schema.sql`
5. Paste it into the SQL Editor and click "Run"
6. Go to Settings > API to get your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (under "Service Role")

### 3. Set Up Resend

1. Go to [resend.com](https://resend.com) and sign up
2. Add and verify your domain (or use their test domain for now)
3. Create an API key
4. Copy your `RESEND_API_KEY`

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Fill in your actual values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Resend (Email)
RESEND_API_KEY=re_xxxxx

# Stripe (Optional for now)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (generate a random string)
CRON_SECRET=your_random_secret_here
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Deployment to Vercel

### Option 1: One-Click Deploy (Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add all environment variables from your `.env.local`
6. Click "Deploy"

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all other env vars

# Deploy to production
vercel --prod
```

### Post-Deployment Setup

1. **Update App URL**:
   - In Vercel dashboard, copy your deployment URL
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
   - Redeploy

2. **Set Up Cron Job** (for email reminders):
   - In Vercel dashboard, go to your project
   - Click "Settings" > "Cron Jobs"
   - Add new cron job:
     - **Path**: `/api/cron/send-reminders`
     - **Schedule**: `0 * * * *` (every hour)
     - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

3. **Update Resend Domain**:
   - In `app/api/cron/send-reminders/route.ts`
   - Change `from: 'Relay <noreply@tryrelay.com>'` to your verified domain

4. **Update Supabase Settings**:
   - In Supabase dashboard > Authentication > URL Configuration
   - Add your Vercel URL to "Site URL"
   - Add `https://your-app.vercel.app/**` to "Redirect URLs"

## Testing

### Test Authentication
1. Go to `/signup`
2. Create an account
3. Check your email for confirmation (if required)
4. Log in at `/login`

### Test Core Features
1. Add a LinkedIn post from dashboard
2. Schedule it for 5 minutes in the future
3. Wait for email reminder (check spam folder)
4. Mark as "commented"

### Test Cron Job Manually
```bash
curl -X GET \
  https://your-app.vercel.app/api/cron/send-reminders \
  -H 'Authorization: Bearer YOUR_CRON_SECRET'
```

## Project Structure

```
relay-mvp/
├── app/
│   ├── api/
│   │   └── cron/
│   │       └── send-reminders/
│   │           └── route.ts          # Email reminder cron job
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard
│   ├── login/
│   │   └── page.tsx                  # Login page
│   ├── posts/
│   │   └── page.tsx                  # All posts view
│   ├── signup/
│   │   └── page.tsx                  # Signup page
│   ├── templates/
│   │   └── page.tsx                  # Comment templates
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing page
├── components/
│   └── Button.tsx                    # Reusable button component
├── lib/
│   ├── supabase.ts                   # Supabase client setup
│   └── utils.ts                      # Utility functions
├── supabase-schema.sql               # Database schema
├── .env.example                      # Environment variables template
├── package.json                      # Dependencies
└── README.md                         # This file
```

## Common Issues & Solutions

### Issue: "Invalid API key" from Supabase
**Solution**: Make sure you're using the anon key (not service role) for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: Emails not sending
**Solution**: 
1. Check if Resend API key is correct
2. Verify your domain in Resend
3. Check spam folder
4. Look at Vercel logs for errors

### Issue: "Failed to fetch" errors
**Solution**: 
1. Check Supabase URL is correct
2. Verify RLS policies are set up (from schema.sql)
3. Check browser console for CORS errors

### Issue: Cron job not running
**Solution**:
1. Verify cron job is set up in Vercel
2. Check `CRON_SECRET` matches in env vars
3. Test manually with curl command above

## Adding Stripe Payments (Optional)

Coming soon! For now, the app works with all features for free.

To add later:
1. Create Stripe account
2. Add Stripe keys to env vars
3. Implement subscription logic
4. Add pricing tiers enforcement

## Customization

### Change Branding
- Update "Relay" in all navigation components
- Change LinkedIn blue color in `tailwind.config.js`
- Update favicon and metadata in `app/layout.tsx`

### Add More Features
- AI comment suggestions (OpenAI API)
- Browser extension (Plasmo framework)
- Team collaboration
- Advanced analytics
- LinkedIn post scheduling (not just reminders)

## Support

Having issues? Check:
1. This README first
2. Supabase logs (Dashboard > Logs)
3. Vercel deployment logs
4. Browser console (F12)

## License

MIT - Do whatever you want with this code!

## Built With

❤️ and lots of ☕ by a solo founder in 2024

---

**Ready to launch?** Follow the deployment steps above and you'll be live in 20 minutes!
