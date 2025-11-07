import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PurchaseRequest {
  userId: string;
  amount: number;
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar rol de staff/admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['staff', 'admin'])

    if (!roles || roles.length === 0) {
      console.log('User is not staff/admin:', user.id)
      return new Response(
        JSON.stringify({ error: 'Acceso denegado. Solo staff puede registrar compras.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parsear body
    const { userId, amount, notes = '' }: PurchaseRequest = await req.json()

    if (!userId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'userId y amount (>0) son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing purchase:', { userId, amount, notes })

    // Calcular puntos: 1 punto por cada $10 pesos
    const pointsEarned = Math.floor(amount / 10)
    
    // 1 sello por compra
    const stampsEarned = 1

    // Obtener estado actual
    const { data: currentState, error: stateError } = await supabaseClient
      .from('customer_state')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (stateError || !currentState) {
      console.error('Error fetching customer state:', stateError)
      return new Response(
        JSON.stringify({ error: 'Cliente no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calcular nuevos totales
    const newPoints = currentState.cashback_points + pointsEarned
    const newStamps = currentState.stamps + stampsEarned
    const newRouletteVisits = currentState.roulette_visits_since_last_spin + 1

    console.log('New totals:', { newPoints, newStamps, newRouletteVisits })

    // Actualizar customer_state
    const { error: updateError } = await supabaseClient
      .from('customer_state')
      .update({
        cashback_points: newPoints,
        stamps: newStamps,
        last_visit: new Date().toISOString(),
        roulette_visits_since_last_spin: newRouletteVisits,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating customer state:', updateError)
      return new Response(
        JSON.stringify({ error: 'Error al actualizar puntos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Registrar visita
    const { error: visitError } = await supabaseClient
      .from('visits')
      .insert({
        user_id: userId,
        amount_spent: amount,
        cashback_earned: pointsEarned,
        stamps_earned: stampsEarned,
        notes: notes || `Compra: $${amount}`
      })

    if (visitError) {
      console.error('Error registering visit:', visitError)
    }

    // Si completó 8 sellos, crear recompensa
    let rewardCreated = false
    if (newStamps >= 8 && newStamps % 8 === 0) {
      const { error: rewardError } = await supabaseClient
        .from('rewards')
        .insert({
          user_id: userId,
          type: 'product',
          value: '1',
          description: 'Producto gratis por completar 8 sellos',
          source: 'stamps',
          redeemed: false
        })
      
      if (!rewardError) {
        rewardCreated = true
        console.log('Reward created for completing 8 stamps')
      } else {
        console.error('Error creating reward:', rewardError)
      }
    }

    console.log('Purchase processed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        points: {
          earned: pointsEarned,
          total: newPoints
        },
        stamps: {
          earned: stampsEarned,
          total: newStamps
        },
        rouletteVisits: newRouletteVisits,
        rewardCreated
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in register-purchase:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})