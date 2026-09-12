import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const authorization = await auth();
    const user = await currentUser();

    if (!authorization.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { email, boardId, boardTitle, role, inviteLink, inviterName } =
      await request.json();

    if (!email || !boardId || !inviteLink) {
      return Response.json(
        { success: false, error: "Missing required fields (email, boardId, inviteLink)" },
        { status: 400 }
      );
    }

    const senderName =
      inviterName ||
      user?.fullName ||
      user?.firstName ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "A teammate";

    const title = boardTitle || "Collaborative Whiteboard";

    const roleName =
      role === "editor"
        ? "Editor (Can create and edit)"
        : role === "commenter"
          ? "Commenter (Can view and comment)"
          : "Viewer (Read-only)";

    const subject = `${senderName} invited you to collaborate on "${title}" on Slate`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; }
    .invite-card { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0; }
    .board-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 6px 0; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #dbeafe; color: #1e40af; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; margin: 20px 0; }
    .footer { padding: 20px 24px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5; }
    .link-text { word-break: break-all; color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Slate Whiteboard</h1>
    </div>
    <div class="content">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
        Hello,
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        <strong>${senderName}</strong> has invited you to collaborate on a whiteboard:
      </p>
      
      <div class="invite-card">
        <div class="board-title">🎨 ${title}</div>
        <span class="badge">Role: ${roleName}</span>
      </div>

      <div style="text-align: center;">
        <a href="${inviteLink}" class="btn" target="_blank" rel="noopener noreferrer">Open Board in Slate</a>
      </div>

      <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 24px;">
        Or copy and paste this link into your browser:<br />
        <a href="${inviteLink}" class="link-text" target="_blank" rel="noopener noreferrer">${inviteLink}</a>
      </p>
    </div>
    <div class="footer">
      You received this email because you were invited to collaborate on Slate.<br />
      Start brainstorming, wireframing, and diagramming together in real-time.
    </div>
  </div>
</body>
</html>
`;

    const inviterEmail =
      user?.emailAddresses?.[0]?.emailAddress || "";

    let resendErrorDetail: string | null = null;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const fromEmail =
          process.env.RESEND_FROM || "Slate <onboarding@resend.dev>";
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject,
            html: htmlContent,
            reply_to: inviterEmail || undefined,
          }),
        });

        if (resendRes.ok) {
          const resendData = await resendRes.json();
          return Response.json({
            success: true,
            delivered: true,
            provider: "resend",
            id: resendData.id,
            inviteLink,
            inviterEmail,
          });
        } else {
          const errData = await resendRes.text();
          console.warn("Resend delivery notice:", errData);
          try {
            const parsed = JSON.parse(errData);
            resendErrorDetail = parsed.message || errData;
          } catch {
            resendErrorDetail = errData;
          }
        }
      } catch (err) {
        console.error("Error connecting to Resend:", err);
      }
    }

    // 2. Direct webmail & mailto URLs to send directly from the user's signed-in account
    const mailtoSubject = encodeURIComponent(
      `${senderName} invited you to "${title}" on Slate`
    );
    const mailtoBody = encodeURIComponent(
      `Hi,\n\n${senderName} has invited you to collaborate on "${title}" on Slate.\n\nYou can access the board directly using this link:\n${inviteLink}\n\nYour assigned access: ${roleName}\n\nSee you on the board!`
    );
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${mailtoSubject}&body=${mailtoBody}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${mailtoSubject}&body=${mailtoBody}`;
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}&subject=${mailtoSubject}&body=${mailtoBody}`;

    return Response.json({
      success: true,
      delivered: false,
      provider: "none",
      resendError: resendErrorDetail,
      mailtoUrl,
      gmailUrl,
      outlookUrl,
      inviterEmail,
      inviteLink,
      message:
        "Invite link created! Ready to send directly from your signed-in account.",
    });
  } catch (error) {
    console.error("Error in /api/send-invite:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
