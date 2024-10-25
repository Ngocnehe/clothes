import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CheckoutDto } from 'src/checkout/dto/checkout.dto';
import { Cart } from 'src/cart/model/cart.schema';
import { Order } from './order.schema';
import { Types } from 'mongoose';
import { ParamPaginationDto } from 'src/common/param-pagination.dto';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async create(customer_id: string, carts: Cart[], checkoutDto: CheckoutDto) {
    let total: number = 0;
    let product_cost: number = 0;

    const { address, phone_number, email } = checkoutDto;

    carts?.forEach((item: any) => {
      const sale = item.product_id.price * (item.product_id.sale / 100);
      total += (item.product_id.price - sale) * item.quantity;

      product_cost += item.product_id.cost * item.quantity;
    });

    const newOrder: Order = {
      _id: new Types.ObjectId(),
      customer_id: new Types.ObjectId(customer_id),
      address,
      phone_number,
      email,
      delivery: new Date(),
      total: total + 30000,
      product_cost: product_cost,
      shipping_cost: 30000,
      order_detail: [],
    };

    const newOrderDetail = carts.map((item: any) => {
      const sale = item.product_id.price * (item.product_id.sale / 100);
      return {
        _id: new Types.ObjectId(),
        product_id: new Types.ObjectId(item.product_id._id),
        order_id: new Types.ObjectId(newOrder._id),
        quantity: item.quantity,
        product_cost: item.product_id.cost * item.quantity,
        total: (item.product_id.price - sale) * item.quantity,
      };
    });
    return this.orderRepository.create(newOrder, newOrderDetail);
  }

  findAll(params: ParamPaginationDto) {
    const { page, limit, sort, keyword } = params;

    const newSort = sort != 'asc' ? 'desc' : 'asc';

    return this.orderRepository.findAll(page, limit, newSort, keyword);
  }

  findOne(id: string) {
    return this.orderRepository.findOne(id);
  }

  findByCustomer(customer_id: string) {
    return this.orderRepository.findByCustomer(customer_id);
  }
}
