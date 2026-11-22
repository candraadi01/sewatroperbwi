// Keep the legacy URL inert for clients that still have the old payment UI.
export function POST(_request: Request) {
  return new Response(null, { status: 404 });
}
