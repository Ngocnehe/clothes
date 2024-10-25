import { Injectable, Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CartModule } from 'src/cart/model/cart.module';
import { Product } from 'src/product/model/product.schema';
import { OrderModule } from 'src/order/model/order.module';
import { MailModule } from 'src/mail/mail.module';
import { ProductModule } from 'src/product/product.module';
import { CheckoutService } from './checkout.service';
import { CustomerModule } from 'src/customer/customer.module';

@Module({
  imports: [CartModule, ProductModule, OrderModule, MailModule, CustomerModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
