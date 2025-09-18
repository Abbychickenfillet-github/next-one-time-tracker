// eslint-disable-next-line no-unused-vars
let options = {
  amount: 1500,
  currency: 'TWD',
  orderId: '20211216003',
  packages: [
    {
      id: 'c99abc79-3b29-4f40-8851-bc618ca57856',
      amount: 1500,
      products: [
        {
          name: 'Product Name1',
          quantity: 1,
          price: 500,
        },
        {
          name: 'Product Name2',
          quantity: 2,
          price: 500,
        },
      ],
    },
  ],
  redirectUrls: {
    confirmUrl: 'http://localhost:3001/pay-confirm',
    cancelUrl: 'http://localhost:3001/pay-cancel',
  },
}
