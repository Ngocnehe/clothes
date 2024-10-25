import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './model/customer.schema';
import { Model, Types } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { checkValisIsObject } from 'src/common/common';
import { UpdateCustomerDto } from './dto/update-customer';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectModel(Customer.name) private readonly model: Model<Customer>,
  ) {}

  async create(customer: CreateCustomerDto) {
    return await this.model.create({
      _id: new Types.ObjectId(),
      ...customer,
    });
  }

  async findbyEmail(email: string) {
    return await this.model.findOne({ email }).lean<Customer>(true);
  }

  async findOne(id: string) {
    return await this.model.findOne({ _id: id }).lean<Customer>(true);
  }

  async findAll(
    page: number,
    limit: number,
    sort: 'asc' | 'desc',
    keyword: any,
  ) {
    return await this.model
      .find(
        keyword
          ? {
              $or: [
                { name: new RegExp(keyword, 'i') },
                { email: new RegExp(keyword, 'i') },
              ],
            }
          : {},
      )
      .skip((page - 1) * limit)
      .sort({ name: sort })
      .limit(limit)
      .lean<Customer[]>(true);
  }

  async updateOne(id: string, customerUpdate: UpdateCustomerDto) {
    return await this.model
      .findOneAndUpdate({ _id: id }, customerUpdate, { new: true })
      .lean<Customer>(true);
  }

  async updatePassword(id: string, password: string) {
    return await this.model
      .findOneAndUpdate(
        { _id: id },
        { password, reset_password_token: '' },
        { new: true },
      )
      .lean<Customer>(true);
  }

  async randomResetPassword(id: Types.ObjectId, token: string) {
    return await this.model
      .findOneAndUpdate(
        { _id: id },
        { reset_password_token: token },
        { new: true },
      )
      .lean<Customer>(true);
  }

  async resetPassword(token: string) {
    return await this.model
      .findOne({ reset_password_token: token })
      .lean<Customer>(true);
  }

  async updateStatusById(id: string, status: boolean) {
    return await this.model
      .findOneAndUpdate({ _id: id }, { status }, { new: true })
      .lean<Customer>(true);
  }
}
