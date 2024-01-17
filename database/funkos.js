db.createUser({
  user: 'admin',
  pwd: 'admin1234',
  roles: [
    {
      role: 'readWrite',
      db: 'funkosMongo',
    },
  ],
})

db = db.getSiblingDB('funkosMongo')

db.createCollection('orders')

db.orders.insertMany([
  {
    _id: ObjectId('6536518de9b0d305f193b5ef'),
    userId: 1,
    client: {
      name: 'Juan Perez',
      email: 'juanperez@gmail.com',
      phone: '+34123456789',
      address: {
        street: 'Calle Mayor',
        number: '10',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
        zip: '28001',
      },
    },
    orderLine: [
      {
        funkoId: 1,
        funkoPrice: 2.9,
        quantity: 2,
        total: 5.8,
      },
      {
        funkoId: 2,
        funkoPrice: 2.9,
        quantity: 2,
        total: 5.8,
      },
    ],
    createdAt: '2023-10-23T12:57:17.3411925',
    updatedAt: '2023-10-23T12:57:17.3411925',
    isDeleted: false,
    totalItems: 3,
    total: 11.6,
  },
])
