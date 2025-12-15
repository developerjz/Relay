# 🚀 Relay Deployment Checklist

Follow this checklist to get Relay live in 30 minutes or less!

## ✅ Pre-Deployment (15 mins)

### 1. Supabase Setup (5 mins)
- [ ] Create account at https://supabase.com
- [ ] Create new project
- [ ] Wait for database to initialize
- [ ] Run SQL from `supabase-schema.sql` in SQL Editor
- [ ] Copy these from Settings > API:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

### 2. Resend Setup (3 mins)
- [ ] Create account at https://resend.com
- [ ] Verify a domain (or use test domain)
- [ ] Create API key
- [ ] Copy `RESEND_API_KEY`

### 3. Code Setup (2 mins)
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all values from Supabase and Resend
- [ ] Generate random string for `CRON_SECRET` (e.g., use: https://randomkeygen.com)
- [ ] Test locally: `npm install && npm run dev`
- [ ] Create test account at http://localhost:3000/signup

### 4. Git Setup (5 mins)
- [ ] Create GitHub repository
- [ ] Push code:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin YOUR_GITHUB_REPO_URL
  git push -u origin main
  ```

## ✅ Deployment (10 mins)

### 5. Vercel Deployment (5 mins)
- [ ] Go to https://vercel.com
- [ ] Click "Import Project"
- [ ] Select your GitHub repository
- [ ] Add ALL environment variables (copy from `.env.local`)
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes
- [ ] Copy your deployment URL (e.g., `relay-mvp.vercel.app`)

### 6. Post-Deployment Configuration (5 mins)

**Update Vercel Environment Variables:**
- [ ] Go to Vercel Dashboard > Settings > Environment Variables
- [ ] Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
- [ ] Click "Redeploy" (takes 1 minute)

**Configure Cron Job:**
- [ ] In Vercel Dashboard > Settings > Cron Jobs
- [ ] Verify cron job exists (should be auto-added from vercel.json)
- [ ] If not, add manually:
  - Path: `/api/cron/send-reminders`
  - Schedule: `0 * * * *`
  - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

**Update Supabase:**
- [ ] In Supabase Dashboard > Authentication > URL Configuration
- [ ] Set "Site URL" to your Vercel URL
- [ ] Add to "Redirect URLs": `https://your-app.vercel.app/**`

**Update Resend Email:**
- [ ] Edit `app/api/cron/send-reminders/route.ts`
- [ ] Change `from: 'Relay <noreply@tryrelay.com>'` to your verified domain
- [ ] Commit and push (auto-deploys)

## ✅ Testing (5 mins)

### 7. Test Everything Works
- [ ] Visit your Vercel URL
- [ ] Create a new account
- [ ] Verify you can log in
- [ ] Add a LinkedIn post to your dashboard
- [ ] Schedule it for 5 minutes from now
- [ ] Wait and check your email (check spam!)
- [ ] Mark the post as "commented"

### 8. Test Cron Job Manually
```bash
curl -X GET \
  https://your-app.vercel.app/api/cron/send-reminders \
  -H 'Authorization: Bearer YOUR_CRON_SECRET'
```
- [ ] Check response is 200 OK
- [ ] If any scheduled posts exist, verify email was sent

## ✅ Launch Preparation

### 9. Before Going Public
- [ ] Buy custom domain (optional)
- [ ] Update branding/logo
- [ ] Test on mobile
- [ ] Create demo video (use Loom)
- [ ] Set up analytics (PostHog, Plausible, etc.)
- [ ] Prepare launch content for X

### 10. Launch Day
- [ ] Share on X with your blue check
- [ ] Monitor Vercel logs for errors
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately

## 🆘 Troubleshooting

**Can't log in?**
- Check Supabase URL is correct in env vars
- Verify SQL schema was run successfully

**No emails arriving?**
- Check Resend API key
- Verify domain in Resend
- Look in spam folder
- Check Vercel function logs

**Cron not working?**
- Test manually with curl command
- Check CRON_SECRET matches
- Verify cron job is configured in Vercel

**Build failed?**
- Check all env vars are set
- Run `npm run build` locally to test
- Check Vercel deployment logs

## 📊 Monitoring

After launch, check daily:
- [ ] Vercel deployment status
- [ ] Error logs in Vercel
- [ ] User signups in Supabase
- [ ] Email delivery in Resend
- [ ] Revenue in Stripe (when added)

## 🎉 You're Live!

Congratulations! Your MVP is now live.

**Next steps:**
1. Get your first 10 users
2. Gather feedback
3. Iterate quickly
4. Add Stripe payments
5. Scale to $5K MRR

**Remember:** You have 28 days to hit your goal. Ship fast, iterate faster!

---

**Need help?** Check the main README.md for detailed troubleshooting.
