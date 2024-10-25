import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { Customer } from 'src/customer/model/customer.schema';

import { Product } from 'src/product/model/product.schema';

@Schema({ versionKey: false })
export class Cart {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: Customer.name })
  customer_id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: Product.name })
  product_id: Types.ObjectId;

  @Prop({ min: 0 })
  quantity: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
