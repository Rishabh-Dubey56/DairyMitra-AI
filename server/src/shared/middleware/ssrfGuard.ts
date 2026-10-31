import { BadRequestError } from '../errors/AppError.js';
import { ErrorCodes } from '../constants/errorCodes.js';

const DISALLOWED_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254', 'metadata.google.internal']);

export function validateSafeUrl(urlString: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new BadRequestError('Invalid URL format', ErrorCodes.INVALID_PARAMETERS);
  }

  // Enforce HTTP / HTTPS protocols only
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new BadRequestError(`Unsupported URL protocol '${parsed.protocol}'. Only http and https are allowed.`, ErrorCodes.SSRF_ATTEMPT_BLOCKED);
  }

  // Block private/internal addresses
  const host = parsed.hostname.toLowerCase();
  if (
    DISALLOWED_HOSTNAMES.has(host) ||
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    (host.startsWith('172.') && parseInt(host.split('.')[1] || '0', 10) >= 16 && parseInt(host.split('.')[1] || '0', 10) <= 31) ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    throw new BadRequestError('SSRF Protection: Access to private/internal network addresses is prohibited.', ErrorCodes.SSRF_ATTEMPT_BLOCKED);
  }

  return parsed;
}
