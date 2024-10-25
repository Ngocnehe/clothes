import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Customer {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  phone_number: string;

  @Prop({ enum: ['female', 'male'], required: true })
  gender: string;

  @Prop({ default: '' })
  image_id?: string;

  @Prop({ default: '' })
  image_url?: string;

  @Prop({ type: String, default: '' })
  reset_password_token?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
