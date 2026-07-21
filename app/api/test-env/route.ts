import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const apiKey2 = process.env.ANTHROPIC_API_KEY_2
  const allKeys = Object.keys(process.env).filter(k => k.includes('ANTHROPIC') || k.includes('API'))
  
  return NextResponse.json({
    anthropicApiKeyExists: !!apiKey,
    anthropicApiKey2Exists: !!apiKey2,
    apiKeyPreview: apiKey ? apiKey.substring(0, 15) + '...' : 'NOT SET',
    allEnvVarsWithApiOrKey: allKeys,
    allEnvVarCount: Object.keys(process.env).length,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  })
}
