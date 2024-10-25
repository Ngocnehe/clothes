import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './cart.schema';
import { Model } from 'mongoose';
import { AddCartDto } from './dto/add-cart.dto';

@Injectable()
export class CartRepository {
  constructor(@InjectModel(Cart.name) private readonly model: Model<Cart>) {}
  async create(cart: Cart) {
    return await this.model.create(cart);
  }

  async findByCustomerAndProduct(customer_id: string, product_id: string) {
    return await this.model
      .findOne({ customer_id, product_id })
      .populate('product_id')
      .populate('customer_id')
      .lean<Cart>(true);
  }

  async findByCustomer(customer_id: string) {
    return await this.model
      .find({ customer_id })
      .populate('product_id')
      .populate('customer_id')
      .lean<Cart[]>(true);
  }
  async addCartByCustomerAndProduct(customer_id: string, addCart: AddCartDto) {
    return await this.model
      .findOneAndUpdate(
        { customer_id, product_id: addCart.product_id },
        { $inc: { quantity: addCart.quantity } }, // increase: tăng dần
        { new: true },
      )
      .lean<Cart>(true);
  }

  async deleteByCustomerAndProduct(customer_id: string, product_id: string) {
    return await this.model
      .findOneAndDelete({ customer_id, product_id })
      .lean<Cart>(true);
  }

  async deleteByCustomer(customer_id: string) {
    return await this.model.deleteMany({ customer_id }).lean<Cart>(true);
  }
}
