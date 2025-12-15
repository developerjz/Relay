import Link from 'next/link'
import { Button } from '@/components/Button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-linkedin">Relay</div>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Never Miss a LinkedIn{' '}
          <span className="text-linkedin">Engagement</span> Opportunity
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Save posts, schedule reminders, and stay consistent with your LinkedIn engagement.
          No automation. Just intelligent reminders.
        </p>
        <Link href="/signup">
          <Button className="text-lg px-8 py-4">
            Start Free Trial
          </Button>
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          Free plan includes 5 posts per month. No credit card required.
        </p>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-linkedin/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📌</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Save Posts</h3>
            <p className="text-gray-600">
              Bookmark LinkedIn posts you want to engage with later
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-linkedin/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⏰</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Schedule Reminders</h3>
            <p className="text-gray-600">
              Set when you want to be reminded to comment
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-linkedin/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Stay Consistent</h3>
            <p className="text-gray-600">
              Get email reminders and track your engagement
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border-2 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-4xl font-bold mb-4">$0<span className="text-lg font-normal">/mo</span></p>
            <ul className="space-y-2 mb-8">
              <li>✓ 5 posts per month</li>
              <li>✓ Email reminders</li>
              <li>✓ Basic analytics</li>
            </ul>
            <Link href="/signup">
              <Button variant="outline" className="w-full">Get Started</Button>
            </Link>
          </div>
          <div className="border-2 border-linkedin rounded-lg p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-linkedin text-white px-4 py-1 rounded-full text-sm">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-4xl font-bold mb-4">$49<span className="text-lg font-normal">/mo</span></p>
            <ul className="space-y-2 mb-8">
              <li>✓ Unlimited posts</li>
              <li>✓ Email reminders</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Comment templates</li>
              <li>✓ Priority support</li>
            </ul>
            <Link href="/signup">
              <Button className="w-full">Start Free Trial</Button>
            </Link>
          </div>
          <div className="border-2 rounded-lg p-8 bg-gray-50">
            <h3 className="text-2xl font-bold mb-2">Lifetime</h3>
            <p className="text-4xl font-bold mb-4">$149<span className="text-lg font-normal"> once</span></p>
            <ul className="space-y-2 mb-8">
              <li>✓ All Pro features</li>
              <li>✓ Lifetime access</li>
              <li>✓ Future updates free</li>
            </ul>
            <Link href="/signup">
              <Button variant="secondary" className="w-full">Get Lifetime Access</Button>
            </Link>
            <p className="text-sm text-red-600 mt-2 text-center">
              Limited time offer
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-gray-600">
        <p>&copy; 2024 Relay. Made with ☕ by a solo founder.</p>
      </footer>
    </div>
  )
}
