import { CommercetoolsAuth0 } from '../CommercetoolsAuth0'
import { Cart } from '@gradientedge/commercetools-utils'
import { mockCart, mockClientGrantResponse, mockConfig, mockCustomer } from './mocks'
import nock from 'nock'
import _ from 'lodash'

describe('CommercetoolsAuth0', () => {
  beforeAll(() => {
    nock.disableNetConnect()
    nock('https://auth.europe-west1.gcp.commercetools.com', {
      encodedQueryParams: true,
    })
      .persist()
      .post(
        '/oauth/token',
        'grant_type=client_credentials&scope=manage_customers%3Atest-project-key+manage_orders%3Atest-project-key',
      )
      .reply(200, mockClientGrantResponse)
  })

  afterAll(() => {
    nock.enableNetConnect()
  })

  beforeEach(() => {})

  describe('postLoginSync', () => {
    it('should create the customer if no `accountCustomerId` provided', async () => {
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .post('/test-project-key/customers', {
          email: 'jimmy@gradientedge.com',
          firstName: 'Jimmy',
          lastName: 'Thomson',
          authenticationMode: 'ExternalAuth',
        })
        .reply(200, { customer: mockCustomer })
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      const result = await commercetoolsAuth0.postLoginSync({
        mergeCart: true,
        user: {
          email: 'jimmy@gradientedge.com',
          firstName: 'Jimmy',
          lastName: 'Thomson',
        },
      })

      expect(result).toEqual(mockCustomer)
    })

    it('should not return a customer if the `accountCustomerId` is provided', async () => {
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      const result = await commercetoolsAuth0.postLoginSync({
        accountCustomerId: 'account-customer-id-guid',
        mergeCart: true,
        user: {
          id: 'auth0|12345678901234567890',
          email: 'jimmy@gradientedge.com',
          firstName: 'Jimmy',
          lastName: 'Thomson',
        },
      })

      expect(result).toBeNull()
    })

    it('should attempt to merge carts when both an anonymous and account customer id are available', async () => {
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)
      commercetoolsAuth0.mergeCart = jest.fn<Promise<Cart | null>, any>().mockResolvedValue(mockCart)

      const result = await commercetoolsAuth0.postLoginSync({
        accountCustomerId: 'account-customer-id-guid',
        anonymousCustomerId: 'anonymous-customer-id-guid',
        mergeCart: true,
        user: {
          id: 'auth0|12345678901234567890',
          email: 'jimmy@gradientedge.com',
          firstName: 'Jimmy',
          lastName: 'Thomson',
        },
      })

      expect(result).toBeNull()
      expect(commercetoolsAuth0.mergeCart).toHaveBeenCalledWith({
        accountCustomerId: 'account-customer-id-guid',
        anonymousCustomerId: 'anonymous-customer-id-guid',
      })
    })

    it('should not attempt to merge carts if the `mergeCart` value is false', async () => {
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)
      commercetoolsAuth0.mergeCart = jest.fn<Promise<Cart | null>, any>().mockResolvedValue(mockCart)

      const result = await commercetoolsAuth0.postLoginSync({
        accountCustomerId: 'account-customer-id-guid',
        anonymousCustomerId: 'anonymous-customer-id-guid',
        mergeCart: false,
        user: {
          id: 'auth0|12345678901234567890',
          email: 'jimmy@gradientedge.com',
          firstName: 'Jimmy',
          lastName: 'Thomson',
        },
      })

      expect(result).toBeNull()
      expect(commercetoolsAuth0.mergeCart).not.toHaveBeenCalled()
    })
  })

  describe('postRegistrationSync', () => {
    it("should update the commercetools customer's`externalId` with the Auth0 user id", async () => {
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .get('/test-project-key/customers/account-customer-id')
        .reply(200, { customer: mockCustomer })
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .post('/test-project-key/customers/account-customer-id', {
          actions: [{ action: 'setExternalId', externalId: 'auth0-user-id' }],
        })
        .reply(200, { customer: mockCustomer })
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      await commercetoolsAuth0.postRegistrationSync({
        userId: 'auth0-user-id',
        accountCustomerId: 'account-customer-id',
      })
    })
  })

  describe('assignAnonymousCartToAccountCustomer', () => {
    it('should set the customer id on the anonymous cart', async () => {
      const mockAnonymousCart = _.cloneDeep({
        ...mockCart,
        id: 'anonymous-cart-id',
        anonymousId: 'anonymous-customer-id',
      })
      const mockUpdatedCart = _.cloneDeep({
        ...mockAnonymousCart,
        customerId: 'account-customer-id',
      })
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .post('/test-project-key/carts/anonymous-cart-id', {
          version: 9,
          actions: [{ action: 'setCustomerId', customerId: 'account-customer-id' }],
        })
        .reply(200, mockUpdatedCart)
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      const result = await commercetoolsAuth0.assignAnonymousCartToAccountCustomer({
        accountCustomerId: 'account-customer-id',
        anonymousCustomerCart: mockAnonymousCart,
      })

      expect(result).toEqual(mockUpdatedCart)
    })

    it("should return null if there's any sort of error", async () => {
      const mockAnonymousCart = _.cloneDeep({
        ...mockCart,
        id: 'anonymous-cart-id',
        anonymousId: 'anonymous-customer-id',
      })
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .post('/test-project-key/carts/anonymous-cart-id', {
          version: 9,
          actions: [{ action: 'setCustomerId', customerId: 'account-customer-id' }],
        })
        .reply(400)
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      const result = await commercetoolsAuth0.assignAnonymousCartToAccountCustomer({
        accountCustomerId: 'account-customer-id',
        anonymousCustomerCart: mockAnonymousCart,
      })

      expect(result).toBeNull()
    })
  })

  describe('mergeAnonymousToAccountCart', () => {
    it('should not attempt to merge when the provided cart has no customer id', async () => {
      const mockAnonymousCart = _.cloneDeep({
        ...mockCart,
        id: 'anonymous-cart-id',
        anonymousId: 'anonymous-customer-id',
      })
      const mockCustomerCart = _.cloneDeep({
        ...mockCart,
        id: 'anonymous-cart-id',
        customerId: undefined,
      })
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      const result = await commercetoolsAuth0.mergeAnonymousToAccountCart({
        accountCustomerCart: mockCustomerCart,
        anonymousCustomerCart: mockAnonymousCart,
      })

      expect(result).toBeNull()
    })

    it('should defer to `assignAnonymousCartToAccountCustomer`', async () => {
      const mockAnonymousCart = _.cloneDeep({
        ...mockCart,
        id: 'anonymous-cart-id',
        anonymousId: 'anonymous-customer-id',
      })
      const mockCustomerCart = _.cloneDeep({
        ...mockCart,
        id: 'anonymous-cart-id',
        customerId: 'account-customer-id',
      })
      const mockUpdatedCart = _.cloneDeep({
        ...mockAnonymousCart,
        customerId: 'account-customer-id',
      })
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .post('/test-project-key/carts/anonymous-cart-id', {
          version: 9,
          actions: [{ action: 'setCustomerId', customerId: 'account-customer-id' }],
        })
        .reply(200, mockUpdatedCart)
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      const result = await commercetoolsAuth0.mergeAnonymousToAccountCart({
        accountCustomerCart: mockCustomerCart,
        anonymousCustomerCart: mockAnonymousCart,
      })

      expect(result).toEqual(mockUpdatedCart)
    })
  })

  describe('createCustomer', () => {
    it('should return the customer when created successfully', async () => {
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .post('/test-project-key/customers', {
          email: 'jimmy@gradientedge.com',
          firstName: 'Jimmy',
          lastName: 'Thomson',
          externalId: 'auth0|12345678901234567890',
          authenticationMode: 'ExternalAuth',
        })
        .reply(200, { customer: mockCustomer })
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      const result = await commercetoolsAuth0.createCustomer({
        user: {
          id: 'auth0|12345678901234567890',
          email: 'jimmy@gradientedge.com',
          firstName: 'Jimmy',
          lastName: 'Thomson',
        },
      })

      expect(result).toEqual(mockCustomer)
    })
  })

  describe('getActiveCart', () => {
    it("should retrieve the anonymous customer cart when the `customerType` is set to 'anonymous'", async () => {
      const mockAnonymousCart = _.cloneDeep({ ...mockCart, anonymousId: 'anonymous-customer-id' })
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .get('/test-project-key/carts')
        .query({
          where: ['anonymousId = "anonymous-customer-id"', 'cartState = "Active"'],
          sort: 'lastModifiedAt desc',
        })
        .reply(200, {
          count: 1,
          total: 1,
          results: [mockAnonymousCart],
        })

      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      const result = await commercetoolsAuth0.getActiveCart({
        customerType: 'anonymous',
        customerId: 'anonymous-customer-id',
      })

      expect(result).toEqual(mockAnonymousCart)
    })

    it("should retrieve the account customer cart when the `customerType` is set to 'account'", async () => {
      const mockCustomerCart = _.cloneDeep({
        ...mockCart,
        anonymousId: 'anonymous-customer-id',
        customerId: 'account-customer-id',
      })
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .get('/test-project-key/carts')
        .query({
          where: ['customerId = "account-customer-id"', 'cartState = "Active"'],
          sort: 'lastModifiedAt desc',
        })
        .reply(200, {
          count: 1,
          total: 1,
          results: [mockCustomerCart],
        })

      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      const result = await commercetoolsAuth0.getActiveCart({
        customerType: 'account',
        customerId: 'account-customer-id',
      })

      expect(result).toEqual(mockCustomerCart)
    })
  })
})
