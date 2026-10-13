/** Only allow the intended in-app return route, never arbitrary URLs. */
export function authDestination(next: string | string[] | undefined): '/add-child' | '/(tabs)' {
  return next === '/add-child' ? '/add-child' : '/(tabs)';
}
