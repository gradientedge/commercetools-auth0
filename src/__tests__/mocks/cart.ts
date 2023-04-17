import { Cart } from '@gradientedge/commercetools-utils'

export const mockCart: Cart = {
  id: '1f58098b-9f72-4f81-83f8-211a3e08ac11',
  version: 9,
  createdAt: '2022-03-30T14:32:15.976Z',
  lastModifiedAt: '2022-03-31T16:28:06.261Z',
  lastModifiedBy: {
    clientId: 'FYTbzMtvt52dNHGdQo4r8BQU',
  },
  createdBy: {
    clientId: 'o4GKl0K8LtE_yVNJuvnoNoNj',
  },
  customerId: '77a25b4e-6864-45fe-98c7-0d3490f6b4b9',
  anonymousId: '107896b9-bcba-4c24-8f01-0269ba08e47e',
  shippingMode: 'Single',
  shipping: [],
  lineItems: [
    {
      id: 'd85d1ed6-f779-40da-93d8-0204099b0a13',
      productId: 'cb41e0da-9ec7-4413-8071-61a9e1c9f36d',
      productKey: 'prod4000125',
      name: {
        en: 'Test product',
      },
      productType: {
        typeId: 'product-type',
        id: '7e02825c-ed5a-4c6f-bf95-964946214aaa',
      },
      productSlug: {
        'en-GB': 'codex-orks-2018-fre',
        en: 'codex-orks-2018-fre',
      },
      variant: {
        id: 1,
        sku: '01030103010',
        prices: [
          {
            id: 'd66c538f-e7a2-4f2b-b875-f5dcbe158a34',
            value: {
              type: 'centPrecision',
              currencyCode: 'GBP',
              centAmount: 2500,
              fractionDigits: 2,
            },
          },
        ],
        images: [],
        attributes: [],
        assets: [],
      },
      price: {
        id: 'd66c538f-e7a2-4f2b-b875-f5dcbe158a34',
        value: {
          type: 'centPrecision',
          currencyCode: 'GBP',
          centAmount: 2500,
          fractionDigits: 2,
        },
      },
      quantity: 1,
      discountedPricePerQuantity: [],
      distributionChannel: {
        typeId: 'channel',
        id: '149f909a-0b2c-472e-8231-a362b2f7c652',
      },
      addedAt: '2022-03-30T14:32:45.814Z',
      lastModifiedAt: '2022-03-30T14:32:45.814Z',
      state: [
        {
          quantity: 1,
          state: {
            typeId: 'state',
            id: '8e8ad359-58d1-4892-950d-99783cf42bc4',
          },
        },
      ],
      priceMode: 'Platform',
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'GBP',
        centAmount: 2500,
        fractionDigits: 2,
      },
      lineItemMode: 'Standard',
      taxedPricePortions: [],
      perMethodTaxRate: [],
    },
  ],
  cartState: 'Active',
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'GBP',
    centAmount: 2500,
    fractionDigits: 2,
  },
  customLineItems: [],
  discountCodes: [],
  inventoryMode: 'None',
  taxMode: 'Disabled',
  taxRoundingMode: 'HalfEven',
  taxCalculationMode: 'LineItemLevel',
  refusedGifts: [],
  origin: 'Customer',
  itemShippingAddresses: [],
  store: {
    typeId: 'store',
    key: 'ge-mach-uk',
  },
  totalLineItemQuantity: 1,
}
