'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

interface SavedPost {
  id: string
  post_url: string
  post_author: string
  post_preview: string | null
  comment_text: string | null
  scheduled_for: string | null
  status: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<SavedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Form state
  const [postUrl, setPostUrl] = useState('')
  const [postAuthor, setPostAuthor] = useState('')
  const [postPreview, setPostPreview] = useState('')
  const [commentText, setCommentText] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    
    setUser(user)
    loadPosts(user.id)
  }

  const loadPosts = async (userId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('saved_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setPosts(data)
    }
    setLoading(false)
  }

  const handleAddPost = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!user) return

  // Convert scheduledFor to ISO string if it exists
  const scheduledDateTime = scheduledFor 
    ? new Date(scheduledFor).toISOString() 
    : null

  const { data, error } = await supabase
    .from('saved_posts')
    .insert({
      user_id: user.id,
      post_url: postUrl,
      post_author: postAuthor,
      post_preview: postPreview || null,
      comment_text: commentText || null,
      scheduled_for: scheduledDateTime,
      status: scheduledDateTime ? 'scheduled' : 'queue'
    })
    .select()
  
  // ... rest of the function
}

  const handleMarkCommented = async (postId: string) => {
    const { error } = await supabase
      .from('saved_posts')
      .update({ status: 'commented' })
      .eq('id', postId)

    if (!error) {
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, status: 'commented' } : p
      ))
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const queueCount = posts.filter(p => p.status === 'queue').length
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length
  const commentedCount = posts.filter(p => p.status === 'commented').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard">
              <span className="text-2xl font-bold text-linkedin cursor-pointer">Relay</span>
            </Link>
            <div className="flex space-x-4">
              <Link href="/dashboard" className="text-linkedin font-medium">
                Dashboard
              </Link>
              <Link href="/posts" className="text-gray-600 hover:text-gray-900">
                All Posts
              </Link>
              <Link href="/templates" className="text-gray-600 hover:text-gray-900">
                Templates
              </Link>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-linkedin">{queueCount}</div>
            <div className="text-gray-600">In Queue</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-orange-500">{scheduledCount}</div>
            <div className="text-gray-600">Scheduled</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-green-500">{commentedCount}</div>
            <div className="text-gray-600">Commented</div>
          </div>
        </div>

        {/* Add Post Button */}
        <div className="mb-6">
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add LinkedIn Post'}
          </Button>
        </div>

        {/* Add Post Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">Add New Post</h2>
            <form onSubmit={handleAddPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Post URL *
                </label>
                <input
                  type="url"
                  required
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/posts/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-linkedin focus:border-linkedin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Author *
                </label>
                <input
                  type="text"
                  required
                  value={postAuthor}
                  onChange={(e) => setPostAuthor(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-linkedin focus:border-linkedin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Preview (optional)
                </label>
                <textarea
                  value={postPreview}
                  onChange={(e) => setPostPreview(e.target.value)}
                  placeholder="First few lines of the post..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-linkedin focus:border-linkedin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Comment (optional)
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What you want to comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-linkedin focus:border-linkedin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule For (optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-linkedin focus:border-linkedin"
                />
              </div>
              <Button type="submit">Save Post</Button>
            </form>
          </div>
        )}

        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Recent Posts</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No posts saved yet. Click "Add LinkedIn Post" to get started!
            </div>
          ) : (
            <div className="divide-y">
              {posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{post.post_author}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          post.status === 'queue' ? 'bg-gray-100 text-gray-700' :
                          post.status === 'scheduled' ? 'bg-orange-100 text-orange-700' :
                          post.status === 'commented' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      {post.post_preview && (
                        <p className="text-gray-600 text-sm mb-2">{post.post_preview.substring(0, 100)}...</p>
                      )}
                      {post.comment_text && (
                        <p className="text-sm text-gray-500 italic">💬 {post.comment_text.substring(0, 80)}...</p>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        {post.scheduled_for ? `Scheduled for ${formatDate(post.scheduled_for)}` : `Added ${formatDate(post.created_at)}`}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <a 
                        href={post.post_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="text-sm">
                          View Post
                        </Button>
                      </a>
                      {post.status !== 'commented' && (
                        <Button 
                          variant="secondary" 
                          className="text-sm"
                          onClick={() => handleMarkCommented(post.id)}
                        >
                          Mark Done
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
