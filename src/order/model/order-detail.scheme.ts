import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false })
export class OrderDetail {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
  product_id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Order' })
  order_id: Types.ObjectId;

  @Prop({ type: Number, min: 0 })
  quantity: number;

  @Prop({ type: Number, min: 0 })
  product_cost: number;

  @Prop({ type: Number, min: 0 })
  total: number;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
