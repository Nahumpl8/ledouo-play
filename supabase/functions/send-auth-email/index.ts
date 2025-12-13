import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoveryEmailRequest {
  email: string;
  type: "recovery" | "signup" | "magiclink";
  redirectTo?: string;
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
          
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px; background: linear-gradient(135deg, #5C6B4A 0%, #4A5A3A 100%); border-radius: 16px 16px 0 0;">
              <img src="https://i.ibb.co/fRrrygx/sello-Leduo.png" alt="Le Duo" style="height: 60px; width: auto;" />
              <h1 style="margin: 20px 0 0 0; font-size: 24px; font-weight: 600; color: #FFFFFF; letter-spacing: 0.5px;">
                Recupera tu cuenta
              </h1>
            </td>
          </tr>
          
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
                Este enlace expira en 1 hora.
              </p>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #E8E4DC;" />
              
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #888888;">
                Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu cuenta permanecerá protegida.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px 32px 40px; background-color: #FAFAF8; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #5C6B4A;">
                Le Duo Coffee, Matcha & Bread
              </p>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #888888;">
                Colima 124, Roma Norte, CDMX
              </p>
              <p style="margin: 0; font-size: 13px; color: #888888;">
                <a href="https://instagram.com/leduo.mx" target="_blank" style="color: #5C6B4A; text-decoration: none;">admin@leduo.mx</a>
              </p>
              <p style="margin: 0; font-size: 13px; color: #888888;">
                <a href="https://tiktok.com/@leduo.mx" target="_blank" style="color: #5C6B4A; text-decoration: none;">@leduo.mx</a>
              </p>
            </td>
          </tr>
          
        </table>
        
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
    const rawBody = await req.text();

    if (!rawBody || rawBody.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Empty request body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload: RecoveryEmailRequest = JSON.parse(rawBody);
    console.log("Processing recovery for:", payload.email);

    if (!payload.email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user profile for personalization
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name")
      .eq("email", payload.email)
      .single();

    const userName = profile?.name || "";

    // URL de redirección: Usamos la que viene del front o el fallback a producción
    const redirectTo = payload.redirectTo || "https://www.leduo.mx/app/reset-password";
    console.log("Redirecting to:", redirectTo);

    // --- CORRECCIÓN CLAVE AQUÍ ---
    // Generar el link pasando 'redirectTo' en las opciones.
    // Supabase se encarga de codificar todo correctamente.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: payload.email,
      options: {
        redirectTo: redirectTo
      }
    });

    if (linkError) {
      console.error("Error generating link:", linkError);
      return new Response(
        JSON.stringify({ error: linkError.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Usamos el action_link directamente. 
    // Este link apunta a la API de Supabase, verifica el token, y luego redirige al usuario a tu frontend.
    const resetLink = linkData.properties.action_link;
    console.log("Generated Valid Link:", resetLink);

    // Generate email HTML
    const subject = "Recupera tu cuenta de Le Duo ☕";
    const html = generatePasswordResetEmail(userName, resetLink);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Le Duo <no-reply@leduo.mx>",
      to: [payload.email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Recovery email sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);