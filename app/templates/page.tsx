'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { supabase } from '@/lib/supabase'

interface Template {
  id: string
  template_name: string
  template_text: string
  times_used: number
  created_at: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [templateName, setTemplateName] = useState('')
  const [templateText, setTemplateText] = useState('')

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
    loadTemplates(user.id)
  }

  const loadTemplates = async (userId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('comment_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setTemplates(data)
    }
    setLoading(false)
  }

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    const { data, error } = await supabase
      .from('comment_templates')
      .insert({
        user_id: user.id,
        template_name: templateName,
        template_text: templateText,
      })
      .select()

    if (data) {
      setTemplates([data[0], ...templates])
      setTemplateName('')
      setTemplateText('')
      setShowAddForm(false)
    }
  }

  const handleDelete = async (templateId: string) => {
    const { error } = await supabase
      .from('comment_templates')
      .delete()
      .eq('id', templateId)

    if (!error) {
      setTemplates(templates.filter(t => t.id !== templateId))
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
              <Link href="/posts" className="text-gray-600 hover:text-gray-900">
                All Posts
              </Link>
              <Link href="/templates" className="text-linkedin font-medium">
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
          <h1 className="text-3xl font-bold mb-2">Comment Templates</h1>
          <p className="text-gray-600">Save reusable comment templates for faster engagement</p>
        </div>

        <div className="mb-6">
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Create Template'}
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">New Template</h2>
            <form onSubmit={handleAddTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Thoughtful Question"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-linkedin focus:border-linkedin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Text *
                </label>
                <textarea
                  required
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  placeholder="Great insight! How do you think this will impact..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-linkedin focus:border-linkedin"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use placeholders like [author name] or [topic] to customize later
                </p>
              </div>
              <Button type="submit">Save Template</Button>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center text-gray-500 py-12">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-12 bg-white rounded-lg">
              No templates yet. Create your first template to speed up commenting!
            </div>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{template.template_name}</h3>
                  <Button 
                    variant="outline" 
                    className="text-sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    Delete
                  </Button>
                </div>
                <p className="text-gray-700 mb-4">{template.template_text}</p>
                <div className="text-xs text-gray-500">
                  Used {template.times_used} times
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
