import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  user: {
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const generatePasswordResetEmail = (
  userName: string,
  resetLink: string
): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recupera tu cuenta - Le Duo</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F5F0E8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 520px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          
          <!-- Header con Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px; background: linear-gradient(135deg, #5C6B4A 0%, #4A5A3A 100%); border-radius: 16px 16px 0 0;">
              <img src="https://eohpjvbbrvktqyacpcmn.supabase.co/storage/v1/object/public/wallet-images/logo-white.png" alt="Le Duo" style="height: 60px; width: auto;" />
              <h1 style="margin: 20px 0 0 0; font-size: 24px; font-weight: 600; color: #FFFFFF; letter-spacing: 0.5px;">
                Recupera tu cuenta
              </h1>
            </td>
          </tr>
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #3D3D3D;">
                Hola${userName ? ` <strong>${userName}</strong>` : ''},
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #3D3D3D;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Le Duo</strong>.
              </p>
              
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #3D3D3D;">
                Haz clic en el botón de abajo para crear una nueva contraseña:
              </p>
              
              <!-- Botón CTA -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #5C6B4A 0%, #4A5A3A 100%); color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(92, 107, 74, 0.3);">
                      Restablecer mi contraseña
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.6; color: #888888; text-align: center;">
                Este enlace expira en 24 horas.
              </p>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #E8E4DC;" />
              
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #888888;">
                Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu cuenta permanecerá protegida.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px 40px; background-color: #FAFAF8; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #5C6B4A;">
                Le Duo Coffee
              </p>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #888888;">
                Colima 124, Roma Norte, CDMX
              </p>
              <p style="margin: 0; font-size: 13px; color: #888888;">
                <a href="https://instagram.com/leduo.mx" target="_blank" style="color: #5C6B4A; text-decoration: none;">@leduo.mx</a>
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Copyright -->
        <p style="margin: 24px 0 0 0; font-size: 12px; color: #AAAAAA;">
          © ${new Date().getFullYear()} Le Duo. Todos los derechos reservados.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-auth-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthEmailRequest = await req.json();
    console.log("Received auth email request:", {
      email: payload.user.email,
      type: payload.email_data.email_action_type,
    });

    const { user, email_data } = payload;
    const userName = user.user_metadata?.name || "";
    
    // Construir el enlace de reset
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const resetLink = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

    let subject = "";
    let html = "";

    switch (email_data.email_action_type) {
      case "recovery":
        subject = "Recupera tu cuenta de Le Duo ☕";
        html = generatePasswordResetEmail(userName, resetLink);
        break;
      case "signup":
        subject = "¡Bienvenido a Le Duo! ☕";
        html = generatePasswordResetEmail(userName, resetLink); // Por ahora usa el mismo template
        break;
      case "magiclink":
        subject = "Tu enlace de acceso a Le Duo ☕";
        html = generatePasswordResetEmail(userName, resetLink);
        break;
      default:
        subject = "Mensaje de Le Duo ☕";
        html = generatePasswordResetEmail(userName, resetLink);
    }

    console.log("Sending email via Resend to:", user.email);
    
    const emailResponse = await resend.emails.send({
      from: "Le Duo <no-reply@leduo.mx>",
      to: [user.email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
