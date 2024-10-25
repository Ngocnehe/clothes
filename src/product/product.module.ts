import { Module } from '@nestjs/common';
import { CategoryModule } from 'src/category/category.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { DatabaseModule } from 'src/database/database.module';
import { Product, ProductSchema } from 'src/product/model/product.schema';
import { ProductController } from 'src/product/product.controller';
import { ProductRepository } from 'src/product/product.repository';
import { ProductService } from 'src/product/product.service';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CloudinaryModule,
    CategoryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductRepository, ProductService],
})
export class ProductModule {}
