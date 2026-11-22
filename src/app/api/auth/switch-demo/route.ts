// Reject legacy account-switch requests without creating a session.
export function POST() {
  return new Response(null, { status: 404 });
}
