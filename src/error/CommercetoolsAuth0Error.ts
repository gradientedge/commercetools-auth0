import { CommercetoolsAuth0ErrorCode } from './codes'

export class CommercetoolsAuth0Error extends Error {
  /**
   * Convenience mechanism for identifying that the error that's
   * just been caught is a CommercetoolsAuth0Error.
   */
  public readonly isCommercetoolsAuth0Error = true
  public code: string | undefined

  constructor(message: string, code?: string) {
    super(message)
    this.code = code ?? CommercetoolsAuth0ErrorCode.UNEXPECTED_ERROR

    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, CommercetoolsAuth0Error.prototype)
  }

  toJSON() {
    return {
      isCommercetoolsAuth0Error: true,
      code: this.code,
    }
  }
}
