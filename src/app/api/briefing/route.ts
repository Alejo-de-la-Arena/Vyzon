import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL = 'gemini-2.5-flash'

/** Strip optional ```json ... ``` markdown wrapping Gemini sometimes adds */
function cleanJSON(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
}

/* ─────────────────── PROMPTS ─────────────────────────────────────────────── */

function buildValidatePrompt(message: string, locale: string): string {
  const isES = locale === 'es'
  if (isES) {
    return `Sos el asesor técnico de VYZON, una agencia de desarrollo web premium de Buenos Aires.

Un cliente describió su proyecto. Tu tarea es evaluar si hay información suficiente para generar una propuesta técnica profesional.

Mensaje del cliente: "${message}"

Información mínima necesaria para generar una propuesta útil:
- Qué tipo de producto (web, app, automatización, e-commerce, etc.)
- Para qué negocio o industria / qué problema resuelve
- Alguna idea del alcance o funcionalidades clave

Si el mensaje tiene estas tres cosas (aunque sea implícitamente), es sufficient=true.
Si falta información clave, hacé 2 preguntas muy específicas y concretas.

Responde ÚNICAMENTE con JSON válido, sin markdown, sin texto extra:
{
  "sufficient": true o false,
  "ack": "Reconocimiento breve y cálido de lo que entendiste (máx 1 oración, informal y directo)",
  "questions": ["Pregunta específica 1?", "Pregunta específica 2?"]
}
Si sufficient=true, questions puede ser [].`
  }
  return `You are VYZON's technical advisor, a premium web development agency from Buenos Aires.

A client described their project. Evaluate whether there's enough information to generate a professional technical proposal.

Client message: "${message}"

Minimum info needed for a useful proposal:
- Type of product (web, app, automation, e-commerce, etc.)
- Business/industry or problem it solves
- Some idea of scope or key features

If the message covers these three (even implicitly), sufficient=true.
If key info is missing, ask 2 specific and concrete questions.

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "sufficient": true or false,
  "ack": "Brief warm acknowledgment of what you understood (max 1 sentence, direct and professional)",
  "questions": ["Specific question 1?", "Specific question 2?"]
}
If sufficient=true, questions can be [].`
}

function buildGeneratePrompt(message: string, history: string, locale: string): string {
  const isES = locale === 'es'
  const prices = isES ? `
- Landing simple: USD 500 - 1.200
- Landing premium: USD 1.200 - 2.500
- Sitio corporativo: USD 1.500 - 3.500
- E-commerce básico: USD 2.000 - 5.000
- E-commerce completo: USD 5.000 - 10.000
- Web app / MVP: USD 3.000 - 18.000
- Automatización de procesos: USD 800 - 7.000
- Chatbot / asistente IA: USD 1.000 - 5.000` : `
- Simple landing: USD 500 - 1,200
- Premium landing: USD 1,200 - 2,500
- Corporate website: USD 1,500 - 3,500
- Basic e-commerce: USD 2,000 - 5,000
- Full e-commerce: USD 5,000 - 10,000
- Web app / MVP: USD 3,000 - 18,000
- Process automation: USD 800 - 7,000
- Chatbot / AI assistant: USD 1,000 - 5,000`

  const context = history
    ? (isES ? `\nContexto adicional de la conversación:\n${history}` : `\nAdditional conversation context:\n${history}`)
    : ''

  if (isES) {
    return `Sos el asesor técnico de VYZON, una agencia de desarrollo web premium de Buenos Aires.

Generá un documento técnico PERSONALIZADO y ESPECÍFICO para este proyecto.

Brief del cliente: "${message}"${context}

Precios de referencia VYZON (mercado LATAM, en USD):${prices}

Reglas:
- El documento debe ser 100% personalizado al negocio específico del cliente (no genérico)
- Mencioná el tipo de negocio, industria o contexto del cliente en la descripción
- Elegí el stack más adecuado para el proyecto específico
- El rango de inversión debe basarse en los precios de referencia (nunca inventes precios fuera de rango)
- Los próximos pasos deben ser concretos e inmediatos, no vagos
- La pregunta_cierre debe ser accionable y específica para avanzar en la conversación comercial

Respondé ÚNICAMENTE con JSON válido, sin markdown, sin texto extra:
{
  "tipo": "Nombre descriptivo del tipo de proyecto (ej: E-commerce para ropa independiente)",
  "descripcion": "Descripción técnica del proyecto específico, 2-3 oraciones. Mencioná el negocio o industria del cliente.",
  "stack": ["Tech1", "Tech2", "Tech3", "Tech4", "Tech5"],
  "stack_justification": "Por qué este stack específico es el correcto para este proyecto (1-2 oraciones)",
  "timeline": {
    "total": "X a Y días hábiles",
    "fases": [
      { "nombre": "Discovery", "duracion": "1-2d" },
      { "nombre": "Diseño UX/UI", "duracion": "2-3d" },
      { "nombre": "Desarrollo", "duracion": "X-Xd" },
      { "nombre": "QA & Deploy", "duracion": "1-2d" }
    ]
  },
  "inversion": {
    "rango": "USD X.XXX - X.XXX",
    "nota": "Nota breve sobre qué factores afectan el precio final (1 oración)"
  },
  "incluye": [
    "Entregable específico 1",
    "Entregable específico 2",
    "Entregable específico 3",
    "Entregable específico 4"
  ],
  "proximos_pasos": [
    "Acción concreta e inmediata 1",
    "Acción concreta 2",
    "Acción concreta 3"
  ],
  "pregunta_cierre": "Una pregunta accionable y específica para avanzar (ej: ¿Cuándo necesitás tener el sitio listo?)"
}`
  }

  return `You are VYZON's technical advisor, a premium web development agency from Buenos Aires.

Generate a PERSONALIZED and SPECIFIC technical document for this project.

Client brief: "${message}"${context}

VYZON reference pricing (LATAM market, USD):${prices}

Rules:
- Document must be 100% personalized to the client's specific business (not generic)
- Mention the business type, industry or context in the description
- Choose the best stack for this specific project
- Investment range must be based on reference prices (never invent out-of-range prices)
- Next steps must be concrete and immediate, not vague
- closing question must be actionable and specific to move the commercial conversation forward

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "tipo": "Descriptive project type name (e.g.: E-commerce for independent apparel brand)",
  "descripcion": "Technical description of the specific project, 2-3 sentences. Mention the client's business or industry.",
  "stack": ["Tech1", "Tech2", "Tech3", "Tech4", "Tech5"],
  "stack_justification": "Why this specific stack is right for this project (1-2 sentences)",
  "timeline": {
    "total": "X to Y business days",
    "fases": [
      { "nombre": "Discovery", "duracion": "1-2d" },
      { "nombre": "UX/UI Design", "duracion": "2-3d" },
      { "nombre": "Development", "duracion": "X-Xd" },
      { "nombre": "QA & Deploy", "duracion": "1-2d" }
    ]
  },
  "inversion": {
    "rango": "USD X,XXX - X,XXX",
    "nota": "Brief note on what factors affect the final price (1 sentence)"
  },
  "incluye": [
    "Specific deliverable 1",
    "Specific deliverable 2",
    "Specific deliverable 3",
    "Specific deliverable 4"
  ],
  "proximos_pasos": [
    "Concrete immediate action 1",
    "Concrete action 2",
    "Concrete action 3"
  ],
  "pregunta_cierre": "One actionable specific question to advance (e.g.: When do you need the site ready?)"
}`
}

/* ─────────────────── ROUTE HANDLER ──────────────────────────────────────── */

export async function POST(req: NextRequest) {
  // Diagnostic logs — step 1
  const apiKey = process.env.GEMINI_API_KEY
  console.log('[/api/briefing] GEMINI_API_KEY exists:', !!apiKey)
  console.log('[/api/briefing] GEMINI_API_KEY length:', apiKey?.length ?? 0)

  try {
    const body = await req.json()
    const { message, history = '', locale = 'es', step } = body as {
      message: string
      history?: string
      locale?: string
      step: 'validate' | 'generate'
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }
    if (!apiKey) {
      console.error('[/api/briefing] API key not found. Available env keys (non-sensitive):', Object.keys(process.env).filter(k => k.toLowerCase().includes('key') || k.toLowerCase().includes('api')))
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // thinkingConfig is not yet in SDK types for gemini-2.5-flash — cast needed
    interface ExtGenConfig { responseMimeType: string; temperature: number; maxOutputTokens: number; thinkingConfig: { thinkingBudget: number } }
    const genConfig: ExtGenConfig = {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: step === 'generate' ? 4096 : 1024,
      thinkingConfig: { thinkingBudget: 0 },
    }
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: genConfig as Parameters<typeof genAI.getGenerativeModel>[0]['generationConfig'],
    })

    if (step === 'validate') {
      const prompt = buildValidatePrompt(message, locale)
      console.log('[/api/briefing] calling Gemini validate...')
      const result = await model.generateContent(prompt)
      const text   = cleanJSON(result.response.text())
      console.log('[/api/briefing] validate raw response:', text.slice(0, 200))
      const parsed = JSON.parse(text)
      return NextResponse.json(parsed)
    }

    if (step === 'generate') {
      const prompt = buildGeneratePrompt(message, history, locale)
      console.log('[/api/briefing] calling Gemini generate...')
      const result = await model.generateContent(prompt)
      const text   = cleanJSON(result.response.text())
      console.log('[/api/briefing] generate raw response (first 300):', text.slice(0, 300))
      const parsed = JSON.parse(text)
      return NextResponse.json({ document: parsed })
    }

    return NextResponse.json({ error: 'Invalid step' }, { status: 400 })

  } catch (err) {
    // Step 4 — full error log
    console.error('[/api/briefing] Full error:', err)
    console.error('[/api/briefing] Error message:', err instanceof Error ? err.message : String(err))
    console.error('[/api/briefing] Error stack:', err instanceof Error ? err.stack : 'no stack')
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
