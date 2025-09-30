// Simple auth - no encryption needed
export function createSession(username: string): string {
  return `session_${username}_${Date.now()}`;
}

export function verifySession(session: string): boolean {
  return session?.startsWith('session_') || false;
}
