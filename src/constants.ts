/**
 * The commercetools scopes required in order for this package to function
 */
export const COMMERCETOOLS_REQUIRED_SCOPES = [
  'manage_customers', // For querying and creating customers
  'manage_orders', // For querying and updating carts
]

/**
 * The default milliseconds timeout value when making requests to commercetools
 */
export const DEFAULT_REQUEST_TIMEOUT_MS = 5000
