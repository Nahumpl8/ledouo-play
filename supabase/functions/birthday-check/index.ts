import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const walletServerUrl = Deno.env.get('APPLE_WALLET_SERVER_URL') || 'https://ledouo-play-production.up.railway.app'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('[Birthday Check] Iniciando verificación de cumpleaños...')

    // 1. Obtener configuración de cumpleaños
    const { data: configData, error: configError } = await supabase
      .from('birthday_config')
      .select('*')
      .limit(1)
      .single()

    if (configError || !configData) {
      console.error('[Birthday Check] Error obteniendo config:', configError)
      return new Response(
        JSON.stringify({ error: 'Configuración no encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!configData.is_active) {
      console.log('[Birthday Check] Sistema de cumpleaños desactivado')
      return new Response(
        JSON.stringify({ message: 'Sistema desactivado', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const today = new Date()
    const currentYear = today.getFullYear()
    const todayMonth = today.getMonth() + 1
    const todayDay = today.getDate()

    // Calcular fecha para pre-cumpleaños (7 días antes por defecto)
    const preBirthdayDate = new Date(today)
    preBirthdayDate.setDate(preBirthdayDate.getDate() + configData.days_before_notification)
    const preBirthdayMonth = preBirthdayDate.getMonth() + 1
    const preBirthdayDay = preBirthdayDate.getDate()

    console.log(`[Birthday Check] Hoy: ${todayMonth}/${todayDay}, Pre-cumple check: ${preBirthdayMonth}/${preBirthdayDay}`)

    // 2. Obtener usuarios con cumpleaños hoy o en X días
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email, dob')
      .not('dob', 'is', null)

    if (profilesError) {
      console.error('[Birthday Check] Error obteniendo perfiles:', profilesError)
      return new Response(
        JSON.stringify({ error: 'Error obteniendo perfiles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let processed = 0
    let preBirthdayNotifications = 0
    let birthdayNotifications = 0

    for (const profile of profiles || []) {
      if (!profile.dob) continue

      const dob = new Date(profile.dob)
      const dobMonth = dob.getMonth() + 1
      const dobDay = dob.getDate()

      // Verificar si es el día del cumpleaños
      const isBirthday = dobMonth === todayMonth && dobDay === todayDay

      // Verificar si es X días antes del cumpleaños
      const isPreBirthday = dobMonth === preBirthdayMonth && dobDay === preBirthdayDay

      if (!isBirthday && !isPreBirthday) continue

      const notificationType = isBirthday ? 'birthday' : 'pre_birthday'
      const message = isBirthday ? configData.birthday_message : configData.pre_birthday_message

      // 3. Verificar si ya se envió notificación este año
      const { data: existingLog } = await supabase
        .from('birthday_notifications_log')
        .select('id')
        .eq('user_id', profile.id)
        .eq('notification_type', notificationType)
        .eq('year', currentYear)
        .single()

      if (existingLog) {
        console.log(`[Birthday Check] Ya notificado: ${profile.name} (${notificationType})`)
        continue
      }

      console.log(`[Birthday Check] Procesando ${notificationType} para: ${profile.name}`)

      // 4. Si es cumpleaños, crear reward
      if (isBirthday) {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // Válido por 7 días

        await supabase.from('rewards').insert({
          user_id: profile.id,
          type: 'birthday_gift',
          value: configData.birthday_gift,
          description: `${configData.birthday_gift} + ${configData.birthday_discount}% OFF - ¡Feliz Cumpleaños!`,
          source: 'birthday_system',
          expires_at: expiresAt.toISOString()
        })

        birthdayNotifications++
      } else {
        preBirthdayNotifications++
      }

      // 5. Crear promoción temporal para este usuario
      const expiresAt = isBirthday 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
        : new Date(dob.setFullYear(currentYear)) // Hasta el cumpleaños

      await supabase.from('wallet_promotions').insert({
        title: isBirthday ? '🎂 ¡Feliz Cumpleaños!' : '🎂 ¡Tu semana especial se acerca!',
        message: message,
        target_type: 'specific_users',
        target_users: [profile.id],
        is_active: true,
        expires_at: expiresAt.toISOString()
      })

      // 6. Registrar que se envió la notificación
      await supabase.from('birthday_notifications_log').insert({
        user_id: profile.id,
        notification_type: notificationType,
        year: currentYear
      })

      // 7. Notificar al dispositivo Apple Wallet del usuario
      try {
        const walletProxySecret = Deno.env.get('WALLET_PROXY_SECRET')
        await fetch(`${walletServerUrl}/api/wallet/notify-update`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Wallet-Notify-Secret': walletProxySecret || ''
          },
          body: JSON.stringify({ userId: profile.id })
        })
      } catch (e) {
        console.error(`[Birthday Check] Error notificando dispositivo:`, e)
      }

      processed++
    }

    console.log(`[Birthday Check] Completado. Pre-cumpleaños: ${preBirthdayNotifications}, Cumpleaños: ${birthdayNotifications}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed,
        preBirthdayNotifications,
        birthdayNotifications
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Birthday Check] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
