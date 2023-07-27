import { Customer } from '@gradientedge/commercetools-utils'
import { CustomerDetails } from '../../types'

export const mockCustomer: Customer = {
  id: '47d9dc26-03cf-40c7-90ab-fe531df37f29',
  version: 20,
  createdAt: '2022-01-05T01:07:09.311Z',
  lastModifiedAt: '2022-02-07T05:40:52.444Z',
  createdBy: {
    clientId: 'fNaweEOCN1ldsnY4sS4Hv_2y',
    anonymousId: 'c30bef37-cfd4-42ac-9b1b-1778c93556fd',
  },
  email: 'jimmy@gradientedge.com',
  firstName: 'Jimmy',
  lastName: 'Thomson',
  middleName: '',
  title: '',
  salutation: '',
  password: '****A20=',
  addresses: [],
  shippingAddressIds: [],
  billingAddressIds: [],
  isEmailVerified: false,
  stores: [],
  authenticationMode: 'ExternalAuth',
}

export const mockGraphQlCustomer = {
  customer: {
    firstName: 'Jimmy',
    lastName: 'Thomson',
    customerGroup: {
      key: 'gold',
    },
  },
}

export const mockCustomerDetails: CustomerDetails = {
  id: 'account-customer-id-guid',
  firstName: 'Jimmy',
  lastName: 'Thomson',
  groupKey: 'gold',
  isNewCustomer: false,
}
