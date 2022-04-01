import { Cart, Region } from '@gradientedge/commercetools-utils'

export interface CommercetoolsAuth0Config {
  commercetools: {
    clientId: string
    clientSecret: string
    region: Region
    projectKey: string
  }
}

export interface PostLoginSyncParams {
  /**
   * Only defined if the customer has logged in in after having already
   * added something to their cart as an anonymous customer
   */
  anonymousCustomerId?: string
  /**
   * Only defined if the logged in user profile has a commercetools
   * customer account id associated with it
   */
  accountCustomerId?: string
  /**
   * The key of the commercetools store that this customer relates to
   *
   * Not required if customers are global.
   */
  storeKey?: string
  /**
   * User profile data as provided by Auth0
   */
  user: {
    id?: string
    email: string
    firstName?: string
    lastName?: string
  }

  /**
   * Whether to merge the carts (if available)
   *
   * true - standard commercetools cart merging functionality will be used
   * false - no cart merging takes place
   * use_anonymous - the anonymous customer's cart will be used
   */
  mergeCart: true | false | 'use_anonymous'
}

export interface PostRegistrationSyncParams {
  /**
   * The customer id of the newly registered customer
   */
  accountCustomerId: string
  /**
   * The key of the commercetools store that this customer relates to
   *
   * Not required if customers are global.
   */
  storeKey?: string
  /**
   * The Auth0 user id
   */
  userId: string
}

export interface CreateCustomerParams {
  storeKey?: string
  user: {
    id?: string
    email: string
    firstName?: string
    lastName?: string
  }
}

export interface GetAnonymousCustomerCartParams {
  storeKey?: string
  anonymousCustomerId: string
}

export interface GetCartParams {
  storeKey?: string
  customerId: string
  customerType: 'anonymous' | 'account'
}

export interface MergeCartParams {
  storeKey?: string
  accountCustomerId: string
  anonymousCustomerId: string
}

export interface AssignAnonymousCartToAccountCustomerParams {
  storeKey?: string
  anonymousCustomerCart: Cart
  accountCustomerId: string
}

export interface MergeAnonymousToAccountCartParams {
  storeKey?: string
  anonymousCustomerCart: Cart
  accountCustomerCart: Cart
}
