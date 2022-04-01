import { CommercetoolsAuth0 } from '../CommercetoolsAuth0'
import { Cart } from '@gradientedge/commercetools-utils'
import { mockCart, mockClientGrantResponse, mockConfig, mockCustomer } from './mocks'
import { CommercetoolsAuth0Error } from '../error'
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

  describe('preRegistrationSync', () => {
    it('should return the customer object when successfully created in commercetools', async () => {
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .post('/test-project-key/customers', {
          email: 'jimmy@gradientedge.com',
          authenticationMode: 'ExternalAuth',
        })
        .reply(200, { customer: mockCustomer })
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      const result = await commercetoolsAuth0.preRegistrationSync({
        user: {
          email: 'jimmy@gradientedge.com',
        },
      })

      expect(result).toEqual(mockCustomer)
    })

    it('should throw an error if the customer already exists', async () => {
      let error: any
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .post('/test-project-key/customers', {
          email: 'jimmy@gradientedge.com',
          authenticationMode: 'ExternalAuth',
        })
        .reply(400, {
          statusCode: 400,
          message: 'There is already an existing customer with the provided email.',
          errors: [
            {
              code: 'DuplicateField',
              message: 'There is already an existing customer with the provided email.',
              duplicateValue: 'jimmy@gradientedge.com',
              field: 'email',
            },
          ],
        })
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      try {
        await commercetoolsAuth0.preRegistrationSync({
          user: {
            email: 'jimmy@gradientedge.com',
          },
        })
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(CommercetoolsAuth0Error)
      expect(error.message).toBe('Customer [jimmy@gradientedge.com] already exists in commercetools')
      expect(error.code).toBe('CUSTOMER_EXISTS')
    })

    it('should throw an error if there was an unexpected error creating the customer', async () => {
      let error: any
      nock('https://api.europe-west1.gcp.commercetools.com', {
        reqheaders: {
          authorization: 'Bearer test-access-token',
        },
      })
        .post('/test-project-key/customers', {
          email: 'jimmy@gradientedge.com',
          authenticationMode: 'ExternalAuth',
        })
        .reply(400)
      const commercetoolsAuth0 = new CommercetoolsAuth0(mockConfig)

      try {
        await commercetoolsAuth0.preRegistrationSync({
          user: {
            email: 'jimmy@gradientedge.com',
          },
        })
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(CommercetoolsAuth0Error)
      expect(error.message).toBe('Error creating customer in commercetools: Request failed with status code 400')
      expect(error.code).toBe('UNEXPECTED_ERROR')
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
})
