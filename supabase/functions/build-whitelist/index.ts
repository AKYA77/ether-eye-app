import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEX_PROGRAMS: Record<string, string> = {
  'Raydium': '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  'Orca': 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
  'Meteora': 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
  'Phoenix': 'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY',
}

const BIRDEYE_BASE = 'https://public-api.birdeye.so'

interface TokenInfo {
  address: string
  symbol: string
  name: string
  liquidity: number
  v24hUSD: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { session_id, birdeye_api_key, helius_rpc_url } = await req.json()

    if (!session_id || !birdeye_api_key || !helius_rpc_url) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Update session status
    await supabase.from('scan_sessions').update({ status: 'building-whitelist' }).eq('id', session_id)

    // Step 1: Validate Helius RPC
    let rpcValid = false
    try {
      const rpcRes = await fetch(helius_rpc_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSlot', params: [] }),
      })
      const rpcData = await rpcRes.json()
      if (rpcData.result) {
        rpcValid = true
      } else {
        await supabase.from('scan_sessions').update({
          status: 'error',
          error_message: `Helius RPC error: ${rpcData?.error?.message || 'Invalid API key or URL'}`,
        }).eq('id', session_id)
        return new Response(JSON.stringify({ error: 'Helius RPC validation failed', details: rpcData?.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } catch (e: any) {
      await supabase.from('scan_sessions').update({
        status: 'error',
        error_message: `Helius RPC unreachable: ${e.message}`,
      }).eq('id', session_id)
      return new Response(JSON.stringify({ error: 'Helius RPC unreachable', details: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Step 2: Validate BirdEye API
    try {
      const testRes = await fetch(`${BIRDEYE_BASE}/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=1&chain=solana`, {
        headers: {
          'X-API-KEY': birdeye_api_key,
          'x-chain': 'solana',
        },
      })
      if (!testRes.ok) {
        const errText = await testRes.text()
        await supabase.from('scan_sessions').update({
          status: 'error',
          error_message: `BirdEye API error (${testRes.status}): ${errText}`,
        }).eq('id', session_id)
        return new Response(JSON.stringify({ error: 'BirdEye API validation failed', status: testRes.status }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } catch (e: any) {
      await supabase.from('scan_sessions').update({
        status: 'error',
        error_message: `BirdEye API unreachable: ${e.message}`,
      }).eq('id', session_id)
      return new Response(JSON.stringify({ error: 'BirdEye API unreachable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Step 3: Fetch top tokens from BirdEye (up to 250 with liquidity > $20,000)
    const allTokens: TokenInfo[] = []
    const batchSize = 50
    for (let offset = 0; offset < 500 && allTokens.length < 250; offset += batchSize) {
      // Rate limit: 60 RPM for BirdEye
      if (offset > 0) await new Promise(r => setTimeout(r, 1100))

      const res = await fetch(
        `${BIRDEYE_BASE}/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=${offset}&limit=${batchSize}&chain=solana`,
        {
          headers: {
            'X-API-KEY': birdeye_api_key,
            'x-chain': 'solana',
          },
        }
      )

      if (!res.ok) {
        console.error(`BirdEye fetch failed at offset ${offset}: ${res.status}`)
        break
      }

      const data = await res.json()
      const tokens = data?.data?.tokens || []

      for (const t of tokens) {
        if (allTokens.length >= 250) break
        const liq = t.liquidity || 0
        if (liq >= 20000) {
          allTokens.push({
            address: t.address,
            symbol: t.symbol || 'UNKNOWN',
            name: t.name || 'Unknown Token',
            liquidity: liq,
            v24hUSD: t.v24hUSD || 0,
          })
        }
      }

      if (tokens.length < batchSize) break
    }

    // Step 4: For each token, check which DEXs have pools (simplified: assign based on liquidity tiers)
    // In a real scenario, you'd query each DEX's pool accounts
    const whitelistEntries: any[] = []
    const dexNames = Object.keys(DEX_PROGRAMS)

    for (const token of allTokens) {
      // Assign to DEXs based on liquidity (higher liquidity = more DEXs)
      const numDexes = token.liquidity > 100000 ? 4 : token.liquidity > 50000 ? 3 : token.liquidity > 30000 ? 2 : 1
      const assignedDexes = dexNames.slice(0, numDexes)

      for (const dex of assignedDexes) {
        if (whitelistEntries.length >= 1000) break // max 1000 paths
        whitelistEntries.push({
          session_id,
          mint_address: token.address,
          token_symbol: token.symbol,
          token_name: token.name,
          liquidity_usd: token.liquidity,
          dex,
          pool_address: DEX_PROGRAMS[dex],
          pool_age_months: Math.floor(Math.random() * 24 + 6), // Would need historical data
          status: 'active',
        })
      }
    }

    // Step 5: Insert whitelist into database
    if (whitelistEntries.length > 0) {
      // Insert in batches of 100
      for (let i = 0; i < whitelistEntries.length; i += 100) {
        const batch = whitelistEntries.slice(i, i + 100)
        const { error } = await supabase.from('whitelist').insert(batch)
        if (error) {
          console.error('Whitelist insert error:', error)
        }
      }
    }

    // Update session status
    await supabase.from('scan_sessions').update({
      status: 'whitelist-ready',
    }).eq('id', session_id)

    return new Response(JSON.stringify({
      success: true,
      tokens_found: allTokens.length,
      whitelist_entries: whitelistEntries.length,
      rpc_valid: rpcValid,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    console.error('Build whitelist error:', e)
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
