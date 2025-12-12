# Supabase Email Templates for DMflow

Custom branded email templates for Supabase authentication emails. These templates match the DMflow theme with purple/pink gradient branding.

## 📧 Available Templates

1. **Confirmation** - Email verification for new signups
2. **Magic Link** - Passwordless login
3. **Recovery** - Password reset
4. **Invite** - User invitation
5. **Email Change** - Email address change confirmation

## 🎨 Brand Colors

- Primary Gradient: Purple (#a855f7) to Pink (#ec4899)
- Background: Dark theme (#1a1a2e, #16213e)
- Text: White/Light gray
- Accent: Purple/Pink gradient

## 📝 How to Update Templates in Supabase

1. Go to your Supabase Dashboard
2. Navigate to: **Authentication** → **Email Templates**
3. Select the template you want to update
4. Copy the HTML from the corresponding section below
5. Paste into the template editor
6. Click **Save**

---

## 1. Confirmation Email (Signup)

**Subject:** `Welcome to DMflow - Confirm Your Email`

**HTML Template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f0f23;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
              <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(45deg, #a855f7, #ec4899); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                📨
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Welcome to DMflow!
              </h1>
              <p style="margin: 12px 0 0; color: #a0a0a0; font-size: 16px;">
                Instagram DM Automation Platform
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 22px; font-weight: 600;">
                Confirm Your Email Address
              </h2>
              <p style="margin: 0 0 24px; color: #d0d0d0; font-size: 16px; line-height: 1.6;">
                Thanks for signing up! Please confirm your email address to get started with DMflow. Click the button below to verify your account.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(45deg, #a855f7, #ec4899); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #888888; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #a855f7; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
              
              <p style="margin: 32px 0 0; padding-top: 24px; border-top: 1px solid #2a2a3e; color: #888888; font-size: 14px; line-height: 1.5;">
                <strong>Alternative:</strong> Enter this code on the confirmation page:<br>
                <span style="display: inline-block; margin-top: 8px; padding: 12px 24px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; color: #a855f7; font-size: 24px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                  {{ .Token }}
                </span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid #2a2a3e;">
              <p style="margin: 0 0 8px; color: #888888; font-size: 14px; text-align: center;">
                This link will expire in 24 hours.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              <p style="margin: 16px 0 0; color: #666666; font-size: 12px; text-align: center;">
                © 2024 DMflow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Magic Link Email

**Subject:** `Your DMflow Magic Link`

**HTML Template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Magic Link</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f0f23;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
              <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(45deg, #a855f7, #ec4899); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                ✨
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Your Magic Link
              </h1>
              <p style="margin: 12px 0 0; color: #a0a0a0; font-size: 16px;">
                Passwordless login to DMflow
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 22px; font-weight: 600;">
                Click to Sign In
              </h2>
              <p style="margin: 0 0 24px; color: #d0d0d0; font-size: 16px; line-height: 1.6;">
                Click the button below to securely sign in to your DMflow account. No password needed!
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(45deg, #a855f7, #ec4899); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);">
                      Sign In to DMflow
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #888888; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #a855f7; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
              
              <p style="margin: 32px 0 0; padding-top: 24px; border-top: 1px solid #2a2a3e; color: #888888; font-size: 14px; line-height: 1.5;">
                <strong>Alternative:</strong> Enter this code on the login page:<br>
                <span style="display: inline-block; margin-top: 8px; padding: 12px 24px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; color: #a855f7; font-size: 24px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                  {{ .Token }}
                </span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid #2a2a3e;">
              <p style="margin: 0 0 8px; color: #888888; font-size: 14px; text-align: center;">
                This link will expire in 1 hour.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                If you didn't request this link, you can safely ignore this email.
              </p>
              <p style="margin: 16px 0 0; color: #666666; font-size: 12px; text-align: center;">
                © 2024 DMflow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Recovery Email (Password Reset)

**Subject:** `Reset Your DMflow Password`

**HTML Template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f0f23;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
              <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(45deg, #a855f7, #ec4899); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                🔒
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Reset Your Password
              </h1>
              <p style="margin: 12px 0 0; color: #a0a0a0; font-size: 16px;">
                DMflow Account Security
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 22px; font-weight: 600;">
                Password Reset Request
              </h2>
              <p style="margin: 0 0 24px; color: #d0d0d0; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for {{ .Email }}. Click the button below to create a new password.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(45deg, #a855f7, #ec4899); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #888888; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #a855f7; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
              
              <p style="margin: 32px 0 0; padding-top: 24px; border-top: 1px solid #2a2a3e; color: #888888; font-size: 14px; line-height: 1.5;">
                <strong>Alternative:</strong> Enter this code on the reset page:<br>
                <span style="display: inline-block; margin-top: 8px; padding: 12px 24px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; color: #a855f7; font-size: 24px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                  {{ .Token }}
                </span>
              </p>
              
              <div style="margin: 32px 0 0; padding: 16px; background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 8px;">
                <p style="margin: 0; color: #eab308; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid #2a2a3e;">
              <p style="margin: 0 0 8px; color: #888888; font-size: 14px; text-align: center;">
                This link will expire in 1 hour.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                For security reasons, password reset links expire quickly.
              </p>
              <p style="margin: 16px 0 0; color: #666666; font-size: 12px; text-align: center;">
                © 2024 DMflow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Invite Email

**Subject:** `You've been invited to DMflow`

**HTML Template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f0f23;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
              <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(45deg, #a855f7, #ec4899); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                🎉
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                You've been invited!
              </h1>
              <p style="margin: 12px 0 0; color: #a0a0a0; font-size: 16px;">
                Join DMflow and start automating your Instagram DMs
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 22px; font-weight: 600;">
                Welcome to the Team
              </h2>
              <p style="margin: 0 0 24px; color: #d0d0d0; font-size: 16px; line-height: 1.6;">
                You've been invited to join DMflow at {{ .SiteURL }}. Click the button below to accept the invitation and create your account.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(45deg, #a855f7, #ec4899); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #888888; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #a855f7; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
              
              <p style="margin: 32px 0 0; padding-top: 24px; border-top: 1px solid #2a2a3e; color: #888888; font-size: 14px; line-height: 1.5;">
                <strong>Alternative:</strong> Enter this code on the invitation page:<br>
                <span style="display: inline-block; margin-top: 8px; padding: 12px 24px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; color: #a855f7; font-size: 24px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                  {{ .Token }}
                </span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid #2a2a3e;">
              <p style="margin: 0 0 8px; color: #888888; font-size: 14px; text-align: center;">
                This invitation will expire in 7 days.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>
              <p style="margin: 16px 0 0; color: #666666; font-size: 12px; text-align: center;">
                © 2024 DMflow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. Email Change Confirmation

**Subject:** `Confirm Your New Email Address`

**HTML Template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f0f23;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
              <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(45deg, #a855f7, #ec4899); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                ✉️
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Confirm Email Change
              </h1>
              <p style="margin: 12px 0 0; color: #a0a0a0; font-size: 16px;">
                Update your DMflow account email
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 22px; font-weight: 600;">
                Verify Your New Email
              </h2>
              <p style="margin: 0 0 24px; color: #d0d0d0; font-size: 16px; line-height: 1.6;">
                You requested to change your email address from <strong style="color: #ffffff;">{{ .Email }}</strong> to <strong style="color: #ffffff;">{{ .NewEmail }}</strong>. Click the button below to confirm this change.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(45deg, #a855f7, #ec4899); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);">
                      Confirm Email Change
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #888888; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #a855f7; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
              
              <div style="margin: 32px 0 0; padding: 16px; background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 8px;">
                <p style="margin: 0; color: #eab308; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Important:</strong> If you didn't request this email change, please ignore this email and contact support immediately.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid #2a2a3e;">
              <p style="margin: 0 0 8px; color: #888888; font-size: 14px; text-align: center;">
                This link will expire in 24 hours.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                Your email will remain unchanged until you confirm.
              </p>
              <p style="margin: 16px 0 0; color: #666666; font-size: 12px; text-align: center;">
                © 2024 DMflow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📋 Quick Setup Steps

1. **Go to Supabase Dashboard**
   - Navigate to: **Authentication** → **Email Templates**

2. **For each template:**
   - Click on the template name (Confirmation, Magic Link, Recovery, etc.)
   - Update the **Subject** field with the subject from above
   - Replace the **HTML Content** with the template HTML from above
   - Click **Save**

3. **Test the templates:**
   - Send a test email from the Supabase dashboard
   - Or trigger the auth flow in your app

## 🎨 Template Features

- ✅ Dark theme matching DMflow branding
- ✅ Purple/Pink gradient buttons
- ✅ Responsive design (mobile-friendly)
- ✅ Alternative OTP code display
- ✅ Security notices where appropriate
- ✅ Professional footer with branding

## 🔧 Customization

You can customize:
- Colors: Update gradient colors in the button styles
- Logo: Replace emoji with your logo image URL
- Copy: Modify the text to match your brand voice
- Expiration times: Update the expiration messages

---

**Note:** These templates use Go template syntax (`{{ .Variable }}`). Supabase will automatically replace these with actual values when sending emails.

