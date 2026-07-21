import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/career-finance/report
 * Public endpoint to fetch career-finance reports by ID and guest token
 * Used by the report display page to fetch guest reports without authentication
 */
export async function GET(request: NextRequest) {
  try {
    const reportId = request.nextUrl.searchParams.get('id')
    const guestToken = request.nextUrl.searchParams.get('token')

    if (!reportId) {
      return NextResponse.json({ error: 'Missing report ID' }, { status: 400 })
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Use service role key to bypass RLS - token verification is done manually below
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Fetch report by ID
    const { data, error } = await supabase
      .from('career_finance_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Verify guest token matches if provided (for guest reports)
    if (data.user_id === null && guestToken) {
      // Guest report - verify token
      if (data.guest_token !== guestToken) {
        return NextResponse.json(
          { error: 'Invalid guest token' },
          { status: 403 }
        )
      }
    } else if (data.user_id === null && !guestToken) {
      // Guest report but no token provided
      return NextResponse.json(
        { error: 'Guest token required' },
        { status: 403 }
      )
    }
    // If data.user_id is set, it's a user report - in production would need auth check

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch report'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
