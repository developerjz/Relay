import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find posts that are scheduled and past their scheduled time
    // and haven't had a reminder sent yet
    const now = new Date().toISOString()
    
    const { data: posts, error } = await supabaseAdmin
      .from('saved_posts')
      .select(`
        id,
        post_url,
        post_author,
        comment_text,
        scheduled_for,
        user_id,
        profiles (
          email,
          full_name
        )
      `)
      .eq('status', 'scheduled')
      .eq('reminder_sent', false)
      .lt('scheduled_for', now)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'No posts to send reminders for' })
    }

    const results = []

    for (const post of posts) {
      try {
        // Send email reminder
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'Relay <noreply@tryrelay.com>', // Change this to your verified domain
          to: post.profiles.email,
          subject: `Time to engage with ${post.post_author}'s post!`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #0077B5; color: white; padding: 20px; text-align: center; }
                  .content { background: #f9f9f9; padding: 20px; }
                  .button { display: inline-block; background: #0077B5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                  .comment-box { background: white; padding: 15px; border-left: 4px solid #0077B5; margin: 15px 0; }
                  .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>⏰ Time to Engage!</h1>
                  </div>
                  <div class="content">
                    <p>Hi ${post.profiles.full_name || 'there'},</p>
                    <p>You scheduled a comment on <strong>${post.post_author}'s</strong> LinkedIn post.</p>
                    
                    ${post.comment_text ? `
                      <div class="comment-box">
                        <strong>Your planned comment:</strong><br/>
                        ${post.comment_text}
                      </div>
                    ` : ''}
                    
                    <p>Click the button below to view the post and leave your comment:</p>
                    <a href="${post.post_url}" class="button">View Post & Comment</a>
                    
                    <p>After commenting, <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">mark it as done</a> in your dashboard.</p>
                  </div>
                  <div class="footer">
                    <p>You're receiving this because you scheduled an engagement reminder in Relay.</p>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">Manage your settings</a></p>
                  </div>
                </div>
              </body>
            </html>
          `,
        })

        if (emailError) {
          console.error(`Email error for post ${post.id}:`, emailError)
          results.push({ postId: post.id, success: false, error: emailError.message })
          continue
        }

        // Mark reminder as sent
        await supabaseAdmin
          .from('saved_posts')
          .update({ reminder_sent: true })
          .eq('id', post.id)

        results.push({ postId: post.id, success: true })
      } catch (postError) {
        console.error(`Error processing post ${post.id}:`, postError)
        results.push({ postId: post.id, success: false, error: String(postError) })
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} posts`,
      results
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
