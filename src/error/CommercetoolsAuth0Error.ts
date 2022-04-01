/**
 * Options for the {@see ExtendedError} constructor
 */
export interface CommercetoolsAuth0ErrorOptions {
  code?: string
  data?: Record<string, any> | undefined
  originalError?: unknown
}

export class CommercetoolsAuth0Error extends Error {
  /**
   * Convenience mechanism for identifying that the error that's
   * just been caught is a CommercetoolsAuth0Error.
   */
  public readonly isCommercetoolsAuth0Error = true

  public readonly code: string | undefined
  public data?: Record<string, any>
  public readonly originalError: unknown

  constructor(message: string, options?: CommercetoolsAuth0ErrorOptions) {
    super(message)
    this.code = options?.code
    this.data = options?.data
    this.originalError = options?.originalError

    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, CommercetoolsAuth0Error.prototype)
  }
}
