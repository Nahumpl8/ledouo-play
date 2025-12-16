import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationEmailRequest {
  type: "event" | "experience";
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation?: string;
  paymentMethod?: string;
  totalAmount?: number;
  endTime?: string;
}

const generateEventReservationEmail = (data: ReservationEmailRequest): string => {
  const paymentInfo = data.paymentMethod === 'transfer' 
    ? `
      <tr>
        <td style="padding: 24px; background: #FFF9E6; border-radius: 12px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #B8860B;">
            💳 Datos para transferencia
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">
            <strong>Banco:</strong> BBVA
          </p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">
            <strong>Cuenta:</strong> 0123456789
          </p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">
            <strong>CLABE:</strong> 012345678901234567
          </p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">
            <strong>Beneficiario:</strong> Le Duo CDMX
          </p>
          <p style="margin: 16px 0 0 0; font-size: 13px; color: #888;">
            Tu lugar se reservará por 48 horas. Envía tu comprobante de pago a admin@leduo.mx
          </p>
        </td>
      </tr>
    `
    : `
      <tr>
        <td style="padding: 24px; background: #F0F7F5; border-radius: 12px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1e3932;">
            💵 Pago en efectivo
          </h3>
          <p style="margin: 0; font-size: 14px; color: #666;">
            Acude a Le Duo Centro para realizar tu pago antes del evento.
          </p>
        </td>
      </tr>
    `;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reservación - Le Duo</title>
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
                ¡Reservación Confirmada! 🎉
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #3D3D3D;">
                Hola <strong>${data.guestName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #3D3D3D;">
                Tu reservación para <strong>${data.eventTitle}</strong> ha sido confirmada.
              </p>
              
              <!-- Detalles del evento -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                          <span style="font-size: 14px; color: #888;">📅 Fecha</span>
                          <span style="float: right; font-size: 14px; font-weight: 600; color: #333;">${data.eventDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                          <span style="font-size: 14px; color: #888;">🕐 Hora</span>
                          <span style="float: right; font-size: 14px; font-weight: 600; color: #333;">${data.eventTime}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                          <span style="font-size: 14px; color: #888;">📍 Lugar</span>
                          <span style="float: right; font-size: 14px; font-weight: 600; color: #333;">${data.eventLocation || 'Le Duo Centro'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: #888;">💰 Total</span>
                          <span style="float: right; font-size: 16px; font-weight: 700; color: #1e3932;">$${data.totalAmount || 0} MXN</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              ${paymentInfo}
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #E8E4DC;" />
              
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #888888;">
                Si tienes alguna duda, contáctanos en admin@leduo.mx o al WhatsApp: 55 1234 5678
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
                <a href="https://instagram.com/leduo.mx" target="_blank" style="color: #5C6B4A; text-decoration: none;">@leduo.mx</a>
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

const generateExperienceReservationEmail = (data: ReservationEmailRequest): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Experiencia - Le Duo</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F5F0E8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 520px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px; background: linear-gradient(135deg, #1e3932 0%, #2d5a4e 100%); border-radius: 16px 16px 0 0;">
              <img src="https://i.ibb.co/fRrrygx/sello-Leduo.png" alt="Le Duo" style="height: 60px; width: auto;" />
              <h1 style="margin: 20px 0 0 0; font-size: 24px; font-weight: 600; color: #FFFFFF; letter-spacing: 0.5px;">
                ¡Experiencia Reservada! 🎨
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #3D3D3D;">
                Hola <strong>${data.guestName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #3D3D3D;">
                Tu lugar para <strong>${data.eventTitle}</strong> está confirmado.
              </p>
              
              <!-- Detalles de la experiencia -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px; background: linear-gradient(135deg, #f0f7f5 0%, #e8f4f0 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px;">
                    <div style="text-align: center; margin-bottom: 16px;">
                      <span style="font-size: 48px;">🎨</span>
                    </div>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(30,57,50,0.1);">
                          <span style="font-size: 14px; color: #666;">📅 Fecha</span>
                          <span style="float: right; font-size: 15px; font-weight: 600; color: #1e3932;">${data.eventDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(30,57,50,0.1);">
                          <span style="font-size: 14px; color: #666;">🕐 Horario</span>
                          <span style="float: right; font-size: 15px; font-weight: 600; color: #1e3932;">${data.eventTime}${data.endTime ? ` - ${data.endTime}` : ''}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <span style="font-size: 14px; color: #666;">📍 Lugar</span>
                          <span style="float: right; font-size: 15px; font-weight: 600; color: #1e3932;">Le Duo Centro</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Info importante -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; background: #FFF9E6; border-radius: 12px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #B8860B;">
                      📝 Información importante
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #666; line-height: 1.8;">
                      <li>Llega 10 minutos antes de tu horario</li>
                      <li>Los materiales están incluidos</li>
                      <li>Puedes usar ropa cómoda (se puede manchar)</li>
                      <li>La experiencia incluye una bebida</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #E8E4DC;" />
              
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #888888;">
                Si tienes alguna duda o necesitas reprogramar, contáctanos en admin@leduo.mx
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
                <a href="https://instagram.com/leduo.mx" target="_blank" style="color: #5C6B4A; text-decoration: none;">@leduo.mx</a>
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
  console.log("=== send-reservation-email function called ===");
  console.log("Timestamp:", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ReservationEmailRequest = await req.json();
    console.log("Received payload:", {
      type: payload.type,
      guestEmail: payload.guestEmail,
      eventTitle: payload.eventTitle
    });

    if (!payload.guestEmail || !payload.guestName || !payload.eventTitle) {
      console.error("ERROR: Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: guestEmail, guestName, eventTitle" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate appropriate email template
    const isExperience = payload.type === "experience";
    const html = isExperience 
      ? generateExperienceReservationEmail(payload)
      : generateEventReservationEmail(payload);

    const subject = isExperience
      ? `🎨 Confirmación: ${payload.eventTitle} - Le Duo`
      : `🎉 Reservación Confirmada: ${payload.eventTitle} - Le Duo`;

    console.log("Sending email...");
    console.log("To:", payload.guestEmail);
    console.log("Subject:", subject);
    console.log("Type:", payload.type);

    const emailResponse = await resend.emails.send({
      from: "Le Duo <no-reply@leduo.mx>",
      to: [payload.guestEmail],
      subject: subject,
      html: html,
    });

    console.log("=== EMAIL SENT ===");
    console.log("Resend response:", JSON.stringify(emailResponse));

    return new Response(
      JSON.stringify({ success: true, message: "Reservation email sent", emailId: emailResponse?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("=== FATAL ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
