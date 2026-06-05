export function extractBearerToken(authorization?: string): string {
  if (!authorization) {
    return '';
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return '';
  }

  return token;
}
