import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { Cart, CartSchema } from './cart.schema';
import { DatabaseModule } from 'src/database/database.module';
import { Product } from 'src/product/model/product.schema';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    ProductModule,
  ],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartModule {}
