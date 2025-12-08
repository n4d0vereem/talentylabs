import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type UserRole = 'ADMIN' | 'TALENT_MANAGER' | 'TALENT';

interface SendInvitationEmailParams {
  to: string;
  role: UserRole;
  inviteLink: string;
  agencyName: string;
  invitedByName: string;
}

export async function sendInvitationEmail({
  to,
  role,
  inviteLink,
  agencyName,
  invitedByName
}: SendInvitationEmailParams) {
  const roleLabels: Record<UserRole, string> = {
    ADMIN: 'Administrateur',
    TALENT_MANAGER: 'Talent Manager',
    TALENT: 'Talent'
  };
  
  const roleLabel = roleLabels[role];
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject: `Invitation à rejoindre ${agencyName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { padding: 30px 20px; background: #f9f9f9; }
              .button { 
                display: inline-block; 
                padding: 14px 32px; 
                background: #000; 
                color: #fff !important; 
                text-decoration: none; 
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">${agencyName}</h1>
              </div>
              <div class="content">
                <h2 style="margin-top: 0;">Vous avez été invité !</h2>
                <p>Bonjour,</p>
                <p>
                  <strong>${invitedByName}</strong> vous invite à rejoindre 
                  <strong>${agencyName}</strong> en tant que <strong>${roleLabel}</strong>.
                </p>
                <p>
                  Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte :
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteLink}" class="button">
                    Accepter l'invitation
                  </a>
                </div>
                <p style="font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                  ⏱️ Ce lien est valide pendant <strong>7 jours</strong>.
                </p>
                <p style="font-size: 12px; color: #999;">
                  Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
                </p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${agencyName}. Tous droits réservés.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });
    
    if (error) {
      console.error('❌ Erreur Resend:', error);
      throw new Error('Échec d\'envoi de l\'email');
    }
    
    console.log('✅ Email envoyé:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}
