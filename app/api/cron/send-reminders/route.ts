import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current time
    const now = new Date().toISOString()

    // Get posts that need reminders
    const { data: posts, error } = await supabaseAdmin
      .from('saved_posts')
      .select(`
        *,
        profiles!inner (
          email,
          full_name
        )
      `)
      .lt('scheduled_for', now)
      .eq('reminder_sent', false)

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'No reminders to send' })
    }

    // Send emails for each post
    const results = await Promise.all(
      posts.map(async (post: any) => {
        try {
          const profile = post.profiles

          const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'Relay <noreply@tryrelay.com>', // Change this to your verified domain
            to: profile.email,
            subject: `Time to engage with ${post.post_author}'s post!`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { 
                      display: inline-block; 
                      padding: 12px 24px; 
                      background: #0077B5; 
                      color: white; 
                      text-decoration: none; 
                      border-radius: 4px;
                      margin: 20px 0;
                    }
                    .post-info { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h2>⏰ Time to Engage on LinkedIn!</h2>
                    <p>Hi ${profile.full_name || 'there'},</p>
                    <p>You scheduled a reminder to engage with this LinkedIn post:</p>
                    
                    <div class="post-info">
                      <strong>Author:</strong> ${post.post_author}<br>
                      ${post.post_preview ? `<strong>Preview:</strong> ${post.post_preview}<br>` : ''}
                      ${post.comment_text ? `<strong>Your comment draft:</strong> ${post.comment_text}` : ''}
                    </div>

                    <a href="${post.post_url}" class="button">View Post on LinkedIn</a>

                    <p style="margin-top: 30px; font-size: 14px; color: #666;">
                      Once you've commented, mark it as done in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Relay dashboard</a>.
                    </p>
                  </div>
                </body>
              </html>
            `,
          })

          if (emailError) {
            console.error('Error sending email:', emailError)
            return { post_id: post.id, success: false, error: emailError }
          }

          // Mark reminder as sent
          await supabaseAdmin
            .from('saved_posts')
            .update({ reminder_sent: true })
            .eq('id', post.id)

          return { post_id: post.id, success: true }
        } catch (err) {
          console.error('Error processing post:', err)
          return { post_id: post.id, success: false, error: err }
        }
      })
    )

    return NextResponse.json({
      message: `Processed ${results.length} reminders`,
      results,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}