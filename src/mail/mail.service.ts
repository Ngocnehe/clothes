import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Customer } from 'src/customer/model/customer.schema';
import { Order } from 'src/order/model/order.schema';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async placeOrder(order: Order, customer: Customer) {
    await this.mailerService.sendMail({
      to: order.email, // list of receivers
      from: 'lengoccldst@gmail.com', // sender address
      subject: 'Thanh toán hoá đơn thành công ✔', // Subject line
      template: 'place-order', // plaintext body
      context: {
        orderId: order._id, // dữ liệu để truyền vào template
        date: order.created_at,
        customer: {
          name: customer.name,
          address: order.address,
          phone_number: order.phone_number,
        },
        items: order.order_detail,
        total: order.total,
      },
    });
  }

  async forgotPassword(email: string, url: string) {
    await this.mailerService.sendMail({
      to: email, // list of receivers
      from: 'phuctapcode1604@gmail.com', // sender address
      subject: 'Thay đổi mật khẩu của bạn', // Subject line
      template: 'forgot-password', // plaintext body
      context: {
        url: url,
      },
    });
  }
}
