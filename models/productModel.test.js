import productModel from './productModel';

// inspired by https://www.npmjs.com/package/mockingoose with some reference to GitHub Copilot
describe('Product Model', () => {
  const product1 = {
    _id: '67af4353dd4bf679e3c4d02f',
    name: 'product',
    slug: 'product',
    description: 'product',
    price: 100,
    category: '67af4353dd4bf679e3c4d02f',
    quantity: 100,
    photo: {
      // https://chatgpt.com/share/67af4982-89b8-8004-a111-9daee97b5a96
      data: {
        data: [1, 2, 3, 4],
        type: 'Buffer',
      },
    },
    shipping: true,
  };

  const product2 = {
    _id: '67af4353dd4bf679e3c4d030',
    name: 'product',
    slug: 'product',
    description: 'product',
    price: 200,
    category: '67af4353dd4bf679e3c4d030',
    quantity: 200,
    photo: {
      data: {
        data: [1, 2, 3, 4],
        type: 'Buffer',
      },
      contentType: 'image/png',
    },
    shipping: true,
  };

  it('should error out if name is not provided', () => {
    const productModelWithoutName = { ...product1, name: undefined };

    return productModel.create(productModelWithoutName).catch((error) => {
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('should error out if slug is not provided', () => {
    const productModelWithoutSlug = { ...product1, slug: undefined };

    // inspired by GitHub Copilot
    return productModel.create(productModelWithoutSlug).catch((error) => {
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('should error out if description is not provided', () => {
    const productModelWithoutDescription = {
      ...product1,
      description: undefined,
    };

    return productModel
      .create(productModelWithoutDescription)
      .catch((error) => {
        // inspired by GitHub Copilot
        expect(error).toBeInstanceOf(Error);
      });
  });

  it('should error out if price is not provided', () => {
    const productModelWithoutPrice = { ...product1, price: undefined };

    return productModel.create(productModelWithoutPrice).catch((error) => {
      // inspired by GitHub Copilot
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('should error out if category is not provided', () => {
    const productModelWithoutCategory = { ...product1, category: undefined };

    return productModel.create(productModelWithoutCategory).catch((error) => {
      // inspired by GitHub Copilot
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('should error out if quantity is not provided', () => {
    const productModelWithoutQuantity = { ...product1, quantity: undefined };

    return productModel.create(productModelWithoutQuantity).catch((error) => {
      // inspired by GitHub Copilot
      expect(error).toBeInstanceOf(Error);
    });
  });
});
