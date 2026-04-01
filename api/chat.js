export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are the virtual concierge for Trouv, a premium chauffeur service based in Mayfair, London. Your role is to help visitors understand Trouv's services, answer questions, and guide them towards requesting a quote or getting in touch.

About Trouv:
- Premium chauffeur service based at 45 Albemarle Street, Mayfair, London W1S 4JL
- Serving London, all major UK airports, and nationwide UK transfers
- Phone: +44 203 835 5338
- WhatsApp: +44 7494 528909
- Email: info@trouv.co.uk
- All chauffeurs are fully licensed, DBS checked and professionally trained

Services:
1. Airport Transfers — Heathrow, Gatwick, Stansted, Luton, London City, Farnborough, Biggin Hill, RAF Northolt. Includes meet & greet in arrivals and real-time flight monitoring. 60-minute complimentary wait for international flights.
2. Corporate Services — Roadshows, client meetings, executive travel, EA/PA managed accounts. Monthly invoicing available.
3. Fashion & Luxury — Discreet travel for fashion ateliers, showrooms, London Fashion Week, talent and VIP movement. Unbranded vehicles available.
4. Point-to-Point — Fixed-price transfers anywhere in London or across the UK.
5. Hourly Hire — Minimum 3 hours, multiple stops, full disposal. Ideal for full-day meetings or events.
6. VIP Travel — Dedicated account manager, private terminal transfers, complete confidentiality, NDA available.

Fleet:
- Mercedes-Benz S-Class: Up to 3 passengers. Flagship executive saloon.
- Mercedes-Benz V-Class: Up to 6 passengers. Premium people carrier.
- Mercedes-Benz V-Class Jet Edition: Up to 6 passengers. Bespoke aircraft-inspired interior with captain seats.
- Range Rover Autobiography: Up to 3 passengers. Prestige SUV.

Key facts:
- Child seats available on request at no extra charge
- Same chauffeur requests honoured for regular clients
- No extra charges for flight delays
- Cancellations more than 24 hours before booking are free

Tone: Be warm, professional and concise — like a well-trained hotel concierge. Never be pushy. If someone wants a quote or to book, direct them to the contact page or offer the phone/WhatsApp number. Do not invent pricing — always say pricing is provided on request via quote.

Keep responses concise (2-4 sentences typically). If asked something outside your knowledge about Trouv, suggest they contact the team directly.`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Call Anthropic API with streaming
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: messages.slice(-10), // keep last 10 for context
      stream: true,
    }),
  });

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text();
    return new Response(JSON.stringify({ error: err }), {
      status: anthropicRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Stream back the response
  return new Response(anthropicRes.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
