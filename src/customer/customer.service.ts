import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import * as bcrypt from 'bcrypt';
import { checkValisIsObject } from 'src/common/common';
import { ParamPaginationDto } from 'src/common/param-pagination.dto';
import { UpdateCustomerDto } from './dto/update-customer';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class CustomerService {
  constructor(
    private readonly repository: CustomerRepository,
    private readonly mailService: MailService,
  ) {}

  async create(customer: CreateCustomerDto) {
    customer.password = bcrypt.hashSync(customer.password, 10);
    try {
      return await this.repository.create(customer);
    } catch (error) {
      throw new UnprocessableEntityException('email đã tồn tại');
    }
  }

  async findById(id: string) {
    checkValisIsObject(id, 'customer id');
    const customer = await this.repository.findOne(id);
    if (!customer) {
      throw new UnauthorizedException('Không tìm thấy customer');
    }
    return customer;
  }

  findAll(params: ParamPaginationDto) {
    const { page, limit, sort, keyword } = params;

    const newSort = sort != 'asc' ? 'desc' : 'asc';

    return this.repository.findAll(page, limit, newSort, keyword);
  }

  async updateById(id: string, customerUpdate: UpdateCustomerDto) {
    checkValisIsObject(id, 'customer id');
    const customer = await this.repository.updateOne(id, customerUpdate);
    if (!customer) {
      throw new NotFoundException('Không tìm thấy customer');
    }

    return customer;
  }
  async updatePassword(id: string, oldPassword: string, newPassword: string) {
    const customer = await this.repository.findOne(id);
    const isValid = bcrypt.compareSync(oldPassword, customer.password);
    if (!isValid) {
      throw new NotFoundException('Mật khẩu cũ không đúng');
    }

    const hashNewPassowrd = bcrypt.hashSync(newPassword, 10);
    return this.repository.updatePassword(id, hashNewPassowrd);
  }

  async forgotPassword(email: string) {
    const customer = await this.repository.findbyEmail(email);
    if (!customer) {
      throw new NotFoundException('Không tìm thấy customer');
    }

    if (customer.status === false) {
      throw new UnauthorizedException('Tài khoản đã bị khoá');
    }

    const token = uuidv4();

    await this.repository.randomResetPassword(customer._id, token);

    await this.mailService.forgotPassword(
      email,
      `http://localhost:5173/reset-password?token=${token}`,
    );

    return customer;
  }

  async resetPassswordToken(token: string, password: string) {
    const customer = await this.repository.resetPassword(token);

    if (!customer) {
      throw new NotFoundException('Không tìm thấy customer');
    }

    const hashPassword = bcrypt.hashSync(password, 10);
    return this.repository.updatePassword(
      customer._id.toHexString(),
      hashPassword,
    );
  }

  async updateStatus(id: string, status: boolean) {
    checkValisIsObject(id, 'customer id');
    const customer = await this.repository.updateStatusById(id, status);

    if (!customer) {
      throw new NotFoundException('Khong tim thay customer');
    }

    return customer;
  }
}
