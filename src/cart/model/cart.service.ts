import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { Cart } from 'src/cart/model/cart.schema';
import { ProductRepository } from 'src/product/product.repository';
import { CartRepository } from './cart.repository';
import { AddCartDto } from './dto/add-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly repository: CartRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async addCart(customer_id: string, addCart: AddCartDto) {
    const product = await this.productRepo.findOne(addCart.product_id);

    const cart = await this.repository.findByCustomerAndProduct(
      customer_id,
      addCart.product_id,
    );

    if (!cart) {
      if (product.stock < addCart.quantity) {
        throw new BadRequestException('Sản phẩm k đủ');
      }
      const newCart: Cart = {
        _id: new Types.ObjectId(),
        customer_id: new Types.ObjectId(customer_id),
        product_id: new Types.ObjectId(addCart.product_id),
        quantity: addCart.quantity,
      };
      return await this.repository.create(newCart);
    }

    if (cart.quantity + addCart.quantity <= 0) {
      throw new BadRequestException('Số lượng sản phẩm <= 0');
    }

    if (cart.quantity + addCart.quantity > product.stock) {
      throw new BadRequestException('Sản phẩm k đủ');
    }

    return await this.repository.addCartByCustomerAndProduct(
      customer_id,
      addCart,
    );
  }
  async findByCustomer(customer_id: string) {
    return await this.repository.findByCustomer(customer_id);
  }

  async deleteByCustomerAndProduct(customer_id: string, product_id: string) {
    return await this.repository.deleteByCustomerAndProduct(
      customer_id,
      product_id,
    );
    const cart = await this.repository.deleteByCustomerAndProduct(
      customer_id,
      product_id,
    );
    if (!cart) {
      throw new BadRequestException('Không tìm thấy cart');
    }
    return cart;
  }

  async deleteCartCustomer(customer_id: string) {
    return await this.repository.deleteByCustomer(customer_id);
  }
}
