import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const adminEmailTemplate = (name: string, email: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>New Early Access Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #000000;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #e54545 0%, #ff6b6b 100%); padding: 2px; border-radius: 16px;">
      <div style="background: #0a0a0a; border-radius: 14px; padding: 30px;">
        <h1 style="color: #ffffff; margin-bottom: 20px; font-size: 24px;">New Early Access Request</h1>
        <div style="background: #1a1a1a; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #ffffff;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0; color: #ffffff;"><strong>Email:</strong> ${email}</p>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">A new user has requested early access to Phono.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const userEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Phono</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #000000;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #e54545 0%, #ff6b6b 100%); padding: 2px; border-radius: 16px;">
      <div style="background: #0a0a0a; border-radius: 14px; padding: 40px;">
        <h1 style="color: #ffffff; margin-bottom: 20px; font-size: 28px; text-align: center;">Welcome to Phono, ${name}! 🎵</h1>
        
        <p style="color: #9ca3af; font-size: 16px; margin-bottom: 24px; text-align: center;">
          Thank you for joining our early access waitlist. You're now part of an exclusive group who will be first to experience Phono's music collection management platform.
        </p>

        <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px;">What's Next?</h2>
          <ul style="color: #9ca3af; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 12px;">We'll notify you as soon as early access is available</li>
            <li style="margin-bottom: 12px;">You'll be among the first to try our music collection features</li>
            <li style="margin-bottom: 12px;">You'll receive exclusive updates about our progress</li>
          </ul>
        </div>

        <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 32px;">
          Stay tuned for updates! We're excited to have you on this journey.
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <p style="color: #4b5563; font-size: 12px;">
        © 2024 Phono. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    // Send notification email to admin
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "lakgarg2002@gmail.com",
      subject: `New Early Access Request from ${name}`,
      html: adminEmailTemplate(name, email),
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Welcome to Phono's Early Access Waitlist! 🎵",
      html: userEmailTemplate(name),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
