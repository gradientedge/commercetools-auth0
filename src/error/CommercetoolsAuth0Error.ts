import { CommercetoolsAuth0ErrorCode } from './codes'
import { ExtendedError, ExtendedErrorOptions } from '@gradientedge/error'

export class CommercetoolsAuth0Error extends ExtendedError {
  /**
   * Convenience mechanism for identifying that the error that's
   * just been caught is a CommercetoolsAuth0Error.
   */
  public readonly isCommercetoolsAuth0Error = true

  constructor(message: string, options?: ExtendedErrorOptions) {
    super(message, { ...options, code: options?.code ?? CommercetoolsAuth0ErrorCode.UNEXPECTED_ERROR })

    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, CommercetoolsAuth0Error.prototype)
  }
}
