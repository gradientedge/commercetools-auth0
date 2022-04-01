import { Cart, CommercetoolsApi, Customer, CustomerSignInResult } from '@gradientedge/commercetools-utils'
import { CommercetoolsAuth0Error } from './error'
import {
  AssignAnonymousCartToAccountCustomerParams,
  CommercetoolsAuth0Config,
  CreateCustomerParams,
  PostLoginSyncParams,
  MergeAnonymousToAccountCartParams,
  MergeCartParams,
  GetCartParams,
  PostRegistrationSyncParams,
} from './types'
import { COMMERCETOOLS_REQUIRED_SCOPES } from './constants'
import { CommercetoolsAuth0ErrorCode } from './error/codes'

export class CommercetoolsAuth0 {
  public readonly client: CommercetoolsApi
  public readonly config: CommercetoolsAuth0Config

  constructor(options: CommercetoolsAuth0Config) {
    this.config = options
    this.client = new CommercetoolsApi({
      ...options.commercetools,
      clientScopes: COMMERCETOOLS_REQUIRED_SCOPES,
    })
  }

  /**
   * Post-login synchronisation functionality
   *
   * This method should be called when the post-login action is executed.
   * When this method is called, the Auth0 user may or may not be associated with a customer
   * in commercetools. This will be determined based on whether or not a value is provided for
   * {@see PostLoginSyncParams.accountCustomerId}.
   *
   * We expect {@see PostLoginSyncParams.accountCustomerId} to only be undefined when the
   * user has logged in via a third party OAuth provider such as Google. When logging in using
   * Google, the {@see preRegistrationSync} method would not have been called, and so we need
   * to create a customer account in commercetools in this method instead.
   *
   * If {@see PostLoginSyncParams.accountCustomerId} is a string, then it means the customer
   * already exists in commercetools. This is probably because they registered by entering their
   * email and password in the Auth0 sign-up form, which would have then triggered the
   * pre-registration flow and a call to {@see preRegistrationSync}, resulting in the customer
   * account being created in commercetools.
   *
   * Regardless of which of the above scenarios applies, we end up with the id of a
   * commercetools account customer. If we were
   */
  public async postLoginSync(options: PostLoginSyncParams): Promise<Customer | null> {
    let customer: Customer | null = null
    let accountCustomerId: string | undefined = options.accountCustomerId
    if (!accountCustomerId) {
      customer = await this.createCustomer(options)
      accountCustomerId = customer.id
    }
    if (options.mergeCart && options.anonymousCustomerId) {
      await this.mergeCart({
        storeKey: options.storeKey,
        anonymousCustomerId: options.anonymousCustomerId,
        accountCustomerId,
      })
    }
    return customer
  }

  /**
   * Post-registration synchronisation functionality
   *
   * This method should be called when the post-registration action is executed.
   * It is used to set the `externalId` on the commercetools customer based on the
   * given Auth0 user id.
   */
  public async postRegistrationSync(options: PostRegistrationSyncParams): Promise<void> {
    let customer: Customer | null = null

    try {
      customer = await this.client.getCustomerById({
        storeKey: options.storeKey,
        id: options.accountCustomerId,
      })
    } catch (e) {
      throw new CommercetoolsAuth0Error('Unable to retrieve customer', {
        code: CommercetoolsAuth0ErrorCode.UNEXPECTED_ERROR,
        originalError: e,
      })
    }

    try {
      await this.client.updateCustomerById({
        id: options.accountCustomerId,
        storeKey: options.storeKey,
        data: {
          version: customer.version,
          actions: [
            {
              action: 'setExternalId',
              externalId: options.userId,
            },
          ],
        },
      })
    } catch (e) {
      throw new CommercetoolsAuth0Error('Unable to set `externalId`', {
        code: CommercetoolsAuth0ErrorCode.UNEXPECTED_ERROR,
        originalError: e,
      })
    }
  }

  /**
   * Merge the anonymous customer's cart with the account customer's cart
   *
   * If the anonymous customer has an active cart, then we either assign that cart to
   * the logged in customer if they don't already have an active cart, or we merge
   * the contents of the anonymous customer's active cart with the contents of the
   * account customer's active cart.
   */
  public async mergeCart(options: MergeCartParams): Promise<Cart | null> {
    let cart: Cart | null = null
    let anonymousCustomerCart: Cart | null = null
    let accountCustomerCart: Cart | null = null

    const settlements = await Promise.allSettled([
      this.getActiveCart({
        customerType: 'anonymous',
        customerId: options.anonymousCustomerId,
        storeKey: options.storeKey,
      }),
      this.getActiveCart({
        customerType: 'account',
        customerId: options.accountCustomerId,
        storeKey: options.storeKey,
      }),
    ])

    if (settlements[0].status === 'fulfilled') {
      anonymousCustomerCart = settlements[0].value
    }
    if (settlements[1].status === 'fulfilled') {
      accountCustomerCart = settlements[1].value
    }

    if (anonymousCustomerCart) {
      if (!accountCustomerCart) {
        cart = await this.assignAnonymousCartToAccountCustomer({
          storeKey: options.storeKey,
          anonymousCustomerCart,
          accountCustomerId: options.accountCustomerId,
        })
      } else {
        cart = await this.mergeAnonymousToAccountCart({
          storeKey: options.storeKey,
          anonymousCustomerCart,
          accountCustomerCart,
        })
      }
    }

    return cart
  }

  /**
   * Get the active cart for a given anonymous/account customer id
   *
   * A customer's active cart is defined as their most recently modified cart which
   * has a `cartState` of `Active`.
   */
  public async getActiveCart(options: GetCartParams): Promise<Cart | null> {
    let cart: Cart | null = null

    try {
      const carts = await this.client.queryCarts({
        storeKey: options.storeKey,
        params: {
          where: [`anonymousId = "${options.customerId}"`, 'cartState = "Active"'],
          sort: 'lastModifiedAt desc',
        },
      })
      if (carts.count) {
        cart = carts.results[0]
      }
    } catch (e) {
      console.log(`Error querying cart with [${options?.customerType}]Id of [${options?.customerId}]`)
    }

    return cart
  }

  /**
   * Create the customer in commercetools
   *
   * @param options
   */
  public async createCustomer(options: CreateCustomerParams): Promise<Customer> {
    let signInResult: CustomerSignInResult
    try {
      signInResult = await this.client.createAccount({
        storeKey: options.storeKey,
        data: {
          email: options.user.email,
          firstName: options.user.firstName,
          lastName: options.user.lastName,
          externalId: options.user.id,
          authenticationMode: 'ExternalAuth',
        },
      })
    } catch (e: any) {
      if (e.isCommercetoolsError) {
        if (e.status === 400) {
          const errors = e.data?.response?.data?.errors
          if (errors?.[0]?.code === 'DuplicateField' && errors?.[0]?.field === 'email') {
            throw new CommercetoolsAuth0Error(`Customer [${options.user.email}] already exists in commercetools`, {
              code: CommercetoolsAuth0ErrorCode.CUSTOMER_EXISTS,
              originalError: e,
            })
          }
        }
      }
      throw new CommercetoolsAuth0Error(`Error creating customer in commercetools: ${e.message}`, {
        originalError: e,
      })
    }
    return signInResult.customer
  }

  /**
   * Assign the anonymous cart over to the account customer
   */
  public async assignAnonymousCartToAccountCustomer(
    options: AssignAnonymousCartToAccountCustomerParams,
  ): Promise<Cart | null> {
    let cart: Cart | null
    try {
      cart = await this.client.updateCartById({
        id: options.anonymousCustomerCart.id,
        version: options.anonymousCustomerCart.version,
        storeKey: options.storeKey,
        actions: [
          {
            action: 'setCustomerId',
            customerId: options.accountCustomerId,
          },
        ],
      })
    } catch (e: any) {
      console.log(`Failed to assign anonymous cart: ${e.message}`)
      cart = null
    }

    return cart
  }

  /**
   * Merge the anonymous cart with the account cart
   *
   * Currently we're just re-routing this logic back to the
   * {@see assignAnonymousCartToAccountCustomer} method. We will
   * implement additional merging logic here at a later point.
   */
  public async mergeAnonymousToAccountCart(options: MergeAnonymousToAccountCartParams): Promise<Cart | null> {
    if (options.accountCustomerCart.customerId) {
      return this.assignAnonymousCartToAccountCustomer({
        ...options,
        accountCustomerId: options.accountCustomerCart.customerId,
      })
    }
    return null
  }
}
