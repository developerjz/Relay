// Run this to check if your environment variables are set correctly
// Usage: node check-env.js

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
  'CRON_SECRET',
]

const optionalEnvVars = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
]

console.log('🔍 Checking environment variables...\n')

let allGood = true

console.log('Required variables:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName} - NOT SET`)
    allGood = false
  } else {
    const masked = value.substring(0, 8) + '...'
    console.log(`✅ ${varName} - ${masked}`)
  }
})

console.log('\nOptional variables (for Stripe):')
optionalEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`⚠️  ${varName} - NOT SET (optional)`)
  } else {
    const masked = value.substring(0, 8) + '...'
    console.log(`✅ ${varName} - ${masked}`)
  }
})

console.log('\n' + '='.repeat(50))
if (allGood) {
  console.log('✅ All required environment variables are set!')
  console.log('\nYou can now run: npm run dev')
} else {
  console.log('❌ Some required variables are missing!')
  console.log('\nPlease check your .env.local file')
  process.exit(1)
}
