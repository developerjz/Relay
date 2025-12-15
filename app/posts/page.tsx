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

export default function PostsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<SavedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

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
    let query = supabase
      .from('saved_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (data) {
      setPosts(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      loadPosts(user.id)
    }
  }, [filter])

  const handleDelete = async (postId: string) => {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('id', postId)

    if (!error) {
      setPosts(posts.filter(p => p.id !== postId))
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

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
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/posts" className="text-linkedin font-medium">
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
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">All Saved Posts</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-linkedin text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('queue')}
              className={`px-4 py-2 rounded-md ${filter === 'queue' ? 'bg-linkedin text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Queue
            </button>
            <button
              onClick={() => setFilter('scheduled')}
              className={`px-4 py-2 rounded-md ${filter === 'scheduled' ? 'bg-linkedin text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setFilter('commented')}
              className={`px-4 py-2 rounded-md ${filter === 'commented' ? 'bg-linkedin text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Commented
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No posts found with this filter.
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
                        <p className="text-gray-600 text-sm mb-2">{post.post_preview}</p>
                      )}
                      {post.comment_text && (
                        <div className="mt-2 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">{post.comment_text}</p>
                        </div>
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
                      <Button 
                        variant="secondary" 
                        className="text-sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        Delete
                      </Button>
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
