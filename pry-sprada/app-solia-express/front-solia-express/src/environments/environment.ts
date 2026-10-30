/**
 * Base environment used by production builds.
 *
 * apiUrl must end in /api without a trailing slash.
 * primeUiLicense is reserved for the applicable PrimeUI license key.
 * Do not commit commercial license keys.
 */
export const environment = {
  production: true,
  appName: 'Solia Express',
  apiUrl: 'http://localhost:4000/api',
  requireAuth: true,
  primeUiLicense: '',
};
