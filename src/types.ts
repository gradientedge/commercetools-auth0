import { Cart, Region } from '@gradientedge/commercetools-utils'
import { CustomerDraft } from '@gradientedge/commercetools-utils/dist/typings/models'

export interface CommercetoolsAuth0Config {
  commercetools: {
    clientId: string
    clientSecret: string
    region: Region
    projectKey: string
    timeoutMs?: number
    deleteObsoleteCarts?: true | false
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
   * The key of the commercetools store that the customer is logging in to
   *
   * Not required if customers are global.
   */
  storeKey?: string
  /**
   * A list of store keys that you want to associate the customer with
   */
  stores?: string[]
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
   * Any additional customer data that need to be passed in
   */
  data?: Partial<CustomerDraft> | null

  /**
   * Whether to merge the carts (if available)
   *
   * true - standard commercetools cart merging functionality will be used
   * false - no cart merging takes place
   * use_anonymous - the anonymous customer's cart will be used
   */
  mergeCart: true | false | 'use_anonymous'
}

export interface CreateCustomerParams {
  storeKey?: string
  stores?: string[]
  user: {
    id?: string
    email: string
    firstName?: string
    lastName?: string
    stores?: string[]
  }
  data?: Partial<CustomerDraft> | null
}

export interface GetCartParams {
  storeKey?: string
  customerId: string
  customerType: 'anonymous' | 'account'
  limit?: number
}

export interface MergeCartParams {
  storeKey?: string
  accountCustomerId: string
  anonymousCustomerId: string
}

export interface DeleteObsoleteCartParams extends GetCartParams {
  activeCartId: string
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

export interface CustomerDetails {
  id: string
  firstName?: string
  lastName?: string
  customerGroupKey?: string
  newUserCreated: boolean
}
