import { DatabaseModule } from './database/database.module';
import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryModule } from 'src/category/category.module';
import { ProductModule } from 'src/product/product.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CustomerModule } from './customer/customer.module';
import { CartModule } from './cart/model/cart.module';
import { MailModule } from './mail/mail.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrderModule } from './order/model/order.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    CategoryModule,
    ProductModule,
    CloudinaryModule,
    CustomerModule,
    CartModule,
    MailModule,
    CheckoutModule,
    OrderModule,
    ReportModule,
  ],
})
export class AppModule {}
