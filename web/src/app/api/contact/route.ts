import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactEmailTemplate = (name: string, email: string, message: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #000000;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #e54545 0%, #ff6b6b 100%); padding: 2px; border-radius: 16px;">
      <div style="background: #0a0a0a; border-radius: 14px; padding: 30px;">
        <h1 style="color: #ffffff; margin-bottom: 20px; font-size: 24px;">New Message from ${name}</h1>
        
        <div style="background: #1a1a1a; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #ffffff;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0 0 10px 0; color: #ffffff;"><strong>Email:</strong> ${email}</p>
        </div>

        <div style="background: #1a1a1a; padding: 20px; border-radius: 12px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 12px;">Message:</h2>
          <p style="color: #9ca3af; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <p style="color: #4b5563; font-size: 12px;">
        This message was sent from the Phono contact form.
      </p>
    </div>
  </div>
</body>
</html>
`;

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "lakgarg2002@gmail.com",
      subject: `New Contact Form Message from ${name}`,
      html: contactEmailTemplate(name, email, message),
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
