import { randomUUID } from 'node:crypto'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { checkBriefingRateLimit } from '@/lib/briefing-rate-limit'
import { briefingRequestSchema, hasAllowedOrigin, type BriefingRequest } from '@/lib/briefing-security'

const MODEL = 'gemini-2.5-flash'
const GEMINI_TIMEOUT_MS = 12_000

type ErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_ORIGIN'
  | 'IP_RATE_LIMITED'
  | 'GLOBAL_RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE'
  | 'REQUEST_TIMEOUT'
  | 'INTERNAL_ERROR'

function cleanJSON(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
}

function buildValidatePrompt(message: string, locale: BriefingRequest['locale']): string {
  if (locale === 'es') {
    return `Sos el asesor técnico de VYZON, una agencia de desarrollo web premium de Buenos Aires.

Un cliente describió su proyecto. Evaluá si hay información suficiente para generar una propuesta técnica profesional.

Mensaje del cliente: "${message}"

Información mínima: tipo de producto, negocio/industria o problema, y alcance o funcionalidades clave.
Si el mensaje tiene las tres cosas (aunque sea implícitamente), sufficient=true. Si falta información clave, hacé 2 preguntas específicas y concretas.

Respondé ÚNICAMENTE con JSON válido:
{
  "sufficient": true o false,
  "ack": "Reconocimiento breve y cálido de lo que entendiste (máx 1 oración)",
  "questions": ["Pregunta específica 1?", "Pregunta específica 2?"]
}
Si sufficient=true, questions puede ser [].`
  }

  return `You are VYZON's technical advisor, a premium web development agency from Buenos Aires.

Evaluate whether the client message contains enough information for a professional technical proposal.

Client message: "${message}"

Required information: product type, business/industry or problem, and some scope or key features.
If all three are present, even implicitly, set sufficient=true. Otherwise ask 2 specific, concrete questions.

Respond ONLY with valid JSON:
{
  "sufficient": true or false,
  "ack": "Brief warm acknowledgment of what you understood (max 1 sentence)",
  "questions": ["Specific question 1?", "Specific question 2?"]
}
If sufficient=true, questions can be [].`
}

function buildGeneratePrompt(message: string, history: string, locale: BriefingRequest['locale']): string {
  const context = history
    ? locale === 'es'
      ? `\nContexto adicional de la conversación:\n${history}`
      : `\nAdditional conversation context:\n${history}`
    : ''

  if (locale === 'es') {
    return `Sos el asesor técnico de VYZON, una agencia de desarrollo web premium de Buenos Aires.

Generá un documento técnico personalizado y específico para este proyecto.

Brief del cliente: "${message}"${context}

Precios de referencia VYZON (mercado LATAM, USD): landing simple 500-1.200; landing premium 1.200-2.500; sitio corporativo 1.500-3.500; e-commerce básico 2.000-5.000; e-commerce completo 5.000-10.000; web app/MVP 3.000-18.000; automatización 800-7.000; chatbot/asistente IA 1.000-5.000.

Reglas: personalizá el documento al negocio; elegí el stack adecuado; mantené el rango dentro de los precios de referencia; proponé pasos inmediatos y una pregunta de cierre accionable.

Respondé ÚNICAMENTE con JSON válido:
{
  "tipo": "Nombre descriptivo del tipo de proyecto",
  "descripcion": "Descripción técnica específica, 2-3 oraciones",
  "stack": ["Tech1", "Tech2", "Tech3", "Tech4", "Tech5"],
  "stack_justification": "Por qué este stack es correcto",
  "timeline": { "total": "X a Y días hábiles", "fases": [{ "nombre": "Discovery", "duracion": "1-2d" }, { "nombre": "Diseño UX/UI", "duracion": "2-3d" }, { "nombre": "Desarrollo", "duracion": "X-Xd" }, { "nombre": "QA & Deploy", "duracion": "1-2d" }] },
  "inversion": { "rango": "USD X.XXX - X.XXX", "nota": "Nota breve sobre factores de precio" },
  "incluye": ["Entregable 1", "Entregable 2", "Entregable 3", "Entregable 4"],
  "proximos_pasos": ["Acción 1", "Acción 2", "Acción 3"],
  "pregunta_cierre": "Pregunta accionable"
}`
  }

  return `You are VYZON's technical advisor, a premium web development agency from Buenos Aires.

Generate a personalized and specific technical document for this project.

Client brief: "${message}"${context}

VYZON reference prices (LATAM, USD): simple landing 500-1,200; premium landing 1,200-2,500; corporate website 1,500-3,500; basic e-commerce 2,000-5,000; full e-commerce 5,000-10,000; web app/MVP 3,000-18,000; automation 800-7,000; AI assistant 1,000-5,000.

Rules: personalize it to the business, select an appropriate stack, stay within reference prices, provide immediate next steps, and close with an actionable question.

Respond ONLY with valid JSON:
{
  "tipo": "Descriptive project type",
  "descripcion": "Specific technical description, 2-3 sentences",
  "stack": ["Tech1", "Tech2", "Tech3", "Tech4", "Tech5"],
  "stack_justification": "Why this stack is right",
  "timeline": { "total": "X to Y business days", "fases": [{ "nombre": "Discovery", "duracion": "1-2d" }, { "nombre": "UX/UI Design", "duracion": "2-3d" }, { "nombre": "Development", "duracion": "X-Xd" }, { "nombre": "QA & Deploy", "duracion": "1-2d" }] },
  "inversion": { "rango": "USD X,XXX - X,XXX", "nota": "Brief pricing note" },
  "incluye": ["Deliverable 1", "Deliverable 2", "Deliverable 3", "Deliverable 4"],
  "proximos_pasos": ["Action 1", "Action 2", "Action 3"],
  "pregunta_cierre": "Actionable question"
}`
}

function errorResponse(code: ErrorCode, status: number): NextResponse {
  return NextResponse.json({ error: { code, message: 'Unable to complete the briefing.' } }, { status })
}

function logRequest(requestId: string, result: 'ok' | 'error', code: ErrorCode | 'OK', startedAt: number): void {
  console.info(JSON.stringify({
    service: 'briefing-api',
    requestId,
    result,
    code,
    durationMs: Date.now() - startedAt,
  }))
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID()
  const startedAt = Date.now()

  if (!hasAllowedOrigin(req.headers)) {
    logRequest(requestId, 'error', 'INVALID_ORIGIN', startedAt)
    return errorResponse('INVALID_ORIGIN', 403)
  }

  let request: BriefingRequest
  try {
    const body: unknown = await req.json()
    const parsed = briefingRequestSchema.safeParse(body)
    if (!parsed.success) {
      logRequest(requestId, 'error', 'INVALID_REQUEST', startedAt)
      return errorResponse('INVALID_REQUEST', 400)
    }
    request = parsed.data
  } catch {
    logRequest(requestId, 'error', 'INVALID_REQUEST', startedAt)
    return errorResponse('INVALID_REQUEST', 400)
  }

  const rateLimit = await checkBriefingRateLimit(req.headers)
  if (!rateLimit.allowed) {
    const code: ErrorCode = rateLimit.limit === 'global'
      ? 'GLOBAL_RATE_LIMITED'
      : rateLimit.limit === 'hourly' || rateLimit.limit === 'daily'
        ? 'IP_RATE_LIMITED'
        : 'SERVICE_UNAVAILABLE'
    logRequest(requestId, 'error', code, startedAt)
    return errorResponse(code, code === 'SERVICE_UNAVAILABLE' ? 503 : 429)
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    logRequest(requestId, 'error', 'INTERNAL_ERROR', startedAt)
    return errorResponse('INTERNAL_ERROR', 500)
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: request.step === 'generate' ? 1_500 : 512,
      },
    })
    const prompt = request.step === 'validate'
      ? buildValidatePrompt(request.message, request.locale)
      : buildGeneratePrompt(request.message, request.history, request.locale)
    const result = await model.generateContent(prompt, { timeout: GEMINI_TIMEOUT_MS })
    const response: unknown = JSON.parse(cleanJSON(result.response.text()))

    logRequest(requestId, 'ok', 'OK', startedAt)
    return request.step === 'validate'
      ? NextResponse.json(response)
      : NextResponse.json({ document: response })
  } catch (error: unknown) {
    const code: ErrorCode = error instanceof Error && /timeout|abort/i.test(error.message)
      ? 'REQUEST_TIMEOUT'
      : 'INTERNAL_ERROR'
    logRequest(requestId, 'error', code, startedAt)
    return errorResponse(code, 500)
  }
}
