import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { OrderDetail } from './order-detail.scheme';

@Schema({ versionKey: false })
export class Order {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Customer' })
  customer_id: Types.ObjectId;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  phone_number: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: Date, default: Date.now() })
  delivery: Date;

  @Prop({ type: Number, default: 0 })
  total: number;

  @Prop({ type: Number, default: 0 })
  product_cost: number;

  @Prop({ type: Number, default: 0 })
  shipping_cost: number;

  @Prop({ type: [Types.ObjectId], ref: OrderDetail.name })
  order_detail: Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  created_at?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
