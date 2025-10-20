const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Create email transporter
// Configure these via Firebase Functions config or environment variables
const createTransporter = () => {
  // Supports Gmail, Outlook, Microsoft 365, and custom SMTP
  const emailService = process.env.EMAIL_SERVICE || "gmail";

  if (emailService === "outlook") {
    // Outlook/Hotmail/Microsoft 365
    return nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else if (emailService === "gmail") {
    // Gmail
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password for Gmail
      },
    });
  } else {
    // Custom SMTP (for other providers)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
};

/**
 * Sends an invitation email when a new permission is created
 */
exports.sendInvitationEmail = onDocumentCreated(
    "permissions/{permissionId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with the event");
        return;
      }

      const permissionData = snapshot.data();
      const {projectId, userId, userEmail, role, invitedBy} = permissionData;

      // Skip if this is an owner permission (created when project is created)
      if (role === "owner" && userId === invitedBy) {
        console.log("Skipping owner self-permission");
        return;
      }

      try {
        // Get project details
        const projectDoc = await admin
            .firestore()
            .collection("projects")
            .doc(projectId)
            .get();

        if (!projectDoc.exists) {
          console.error(`Project ${projectId} not found`);
          return;
        }

        const project = projectDoc.data();
        const projectName = project.name || "Untitled Project";

        // Get inviter details
        const inviterDoc = await admin.auth().getUser(invitedBy);
        const inviterName = inviterDoc.displayName || inviterDoc.email;

        // Construct project URL
        const projectUrl = `${process.env.APP_URL || "http://localhost:5173"}/p/${projectId}`;

        // Email content
        const mailOptions = {
          from: `"Canvisia" <${process.env.EMAIL_USER}>`,
          to: userEmail,
          subject: `You've been invited to collaborate on "${projectName}"`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  border-radius: 8px 8px 0 0;
                  text-align: center;
                }
                .content {
                  background: #f9fafb;
                  padding: 30px;
                  border-radius: 0 0 8px 8px;
                }
                .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #3B82F6;
                  color: white !important;
                  text-decoration: none;
                  border-radius: 6px;
                  margin: 20px 0;
                  font-weight: 500;
                }
                .button:hover {
                  background-color: #2563EB;
                }
                .info-box {
                  background: white;
                  border-left: 4px solid #3B82F6;
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
                .footer {
                  text-align: center;
                  color: #6B7280;
                  font-size: 12px;
                  margin-top: 30px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1 style="margin: 0;">🎨 Canvisia</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Collaborative Canvas Platform</p>
              </div>

              <div class="content">
                <h2>You've Been Invited!</h2>
                <p>Hi there,</p>
                <p><strong>${inviterName}</strong> has invited you to collaborate on the project <strong>"${projectName}"</strong>.</p>

                <div class="info-box">
                  <strong>Your access level:</strong> ${role === "editor" ? "Can edit" : "Can view"}<br>
                  <strong>Project:</strong> ${projectName}
                </div>

                <p>Click the button below to view the project:</p>

                <center>
                  <a href="${projectUrl}" class="button">Open Project</a>
                </center>

                <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${projectUrl}" style="color: #3B82F6;">${projectUrl}</a>
                </p>

                <div class="footer">
                  <p>This is an automated email from Canvisia. Please do not reply to this email.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
            You've Been Invited!

            ${inviterName} has invited you to collaborate on "${projectName}".

            Your access level: ${role === "editor" ? "Can edit" : "Can view"}

            Open the project: ${projectUrl}

            ---
            This is an automated email from Canvisia.
          `,
        };

        // Send email
        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully:", info.messageId);
        console.log(`Invitation sent to ${userEmail} for project ${projectName}`);
      } catch (error) {
        console.error("Error sending invitation email:", error);
        // Don't throw - we don't want to fail the permission creation
      }
    }
);
