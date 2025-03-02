import productModel from './productModel';
import { describe } from 'node:test';

const mockingoose = require('mockingoose');

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

  const multipleProducts = [product1, product2];

  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should be able to be get all products', () => {
    mockingoose(productModel).toReturn(multipleProducts, 'find');

    return productModel.find().then((products) => {
      expect(JSON.parse(JSON.stringify(products))).toEqual(multipleProducts);
    });
  });

  it('should be able to get a product by id', () => {
    mockingoose(productModel).toReturn(product1, 'findOne');

    return productModel
      .findOne({ _id: '67af4353dd4bf679e3c4d02f' })
      .then((product) => {
        expect(JSON.parse(JSON.stringify(product))).toEqual(product1);
      });
  });

  it('should be able to create a product', () => {
    mockingoose(productModel).toReturn(product1, 'save');

    return productModel.create(product1).then((product) => {
      expect(JSON.parse(JSON.stringify(product))).toEqual(product1);
    });
  });

  it('should be able to create a product without a photo', () => {
    const productModelWithoutPhoto = {
      ...product1,
      photo: undefined,
    };

    mockingoose(productModel).toReturn(productModelWithoutPhoto, 'save');
    return productModel.create(productModelWithoutPhoto).then((product) => {
      expect(JSON.parse(JSON.stringify(product))).toEqual(
        productModelWithoutPhoto
      );
    });
  });

  it('should be able to create a product without shipping information', () => {
    const productModelWithoutShipping = {
      ...product1,
      shipping: undefined,
    };

    mockingoose(productModel).toReturn(productModelWithoutShipping, 'save');
    return productModel.create(productModelWithoutShipping).then((product) => {
      expect(JSON.parse(JSON.stringify(product))).toEqual(
        productModelWithoutShipping
      );
    });
  });

  it('should be able to update a product', () => {
    // mock the creation of the prodict first
    mockingoose(productModel).toReturn(product1, 'save');

    return productModel.create(product1).then((product) => {
      // modify the product
      product.price = 5000;

      // mock the update of the product
      mockingoose(productModel).toReturn(product, 'findOneAndUpdate');

      // now check if the update work
      return productModel
        .findOneAndUpdate({ _id: '67af4353dd4bf679e3c4d02f' }, { price: 5000 })
        .then((updatedProduct) => {
          expect(JSON.parse(JSON.stringify(updatedProduct))).toEqual(
            JSON.parse(JSON.stringify(product))
          );
        });
    });
  });

  it('should error out if name is not provided', () => {
    const productModelWithoutName = { ...product1, name: undefined };
    mockingoose(productModel).toReturn(productModelWithoutName, 'save');

    return productModel.create(productModelWithoutName).catch((error) => {
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('should error out if slug is not provided', () => {
    const productModelWithoutSlug = { ...product1, slug: undefined };
    mockingoose(productModel).toReturn(productModelWithoutSlug, 'save');

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
    mockingoose(productModel).toReturn(productModelWithoutDescription, 'save');

    return productModel
      .create(productModelWithoutDescription)
      .catch((error) => {
        // inspired by GitHub Copilot
        expect(error).toBeInstanceOf(Error);
      });
  });

  it('should error out if price is not provided', () => {
    const productModelWithoutPrice = { ...product1, price: undefined };
    mockingoose(productModel).toReturn(productModelWithoutPrice, 'save');

    return productModel.create(productModelWithoutPrice).catch((error) => {
      // inspired by GitHub Copilot
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('should error out if category is not provided', () => {
    const productModelWithoutCategory = { ...product1, category: undefined };
    mockingoose(productModel).toReturn(productModelWithoutCategory, 'save');

    return productModel.create(productModelWithoutCategory).catch((error) => {
      // inspired by GitHub Copilot
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('should error out if quantity is not provided', () => {
    const productModelWithoutQuantity = { ...product1, quantity: undefined };
    mockingoose(productModel).toReturn(productModelWithoutQuantity, 'save');

    return productModel.create(productModelWithoutQuantity).catch((error) => {
      // inspired by GitHub Copilot
      expect(error).toBeInstanceOf(Error);
    });
  });
});
