import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CategoryRepository } from 'src/category/category.repository';
import { checkValisIsObject } from 'src/common/common';
import { ParamPaginationDto } from 'src/common/param-pagination.dto';
import { CreateProductDto } from 'src/product/dto/create-product.dto';
import { Product } from 'src/product/model/product.schema';
import { ProductRepository } from 'src/product/product.repository';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async createProduct(createProduct: CreateProductDto) {
    let { category_id, ...data } = createProduct;

    checkValisIsObject(category_id, 'category_id');

    const category = await this.categoryRepository.findOne(category_id);

    if (!category) {
      throw new NotFoundException('Khong tim thay category');
    }

    const product = {
      _id: new Types.ObjectId(),
      category_id: Types.ObjectId.createFromHexString(category_id),
      ...data,
    };

    try {
      return await this.productRepository.create(product as Product);
    } catch (error) {
      throw new UnprocessableEntityException('Ten san pham da ton tai');
    }
  }

  uploadMainImage(id: Types.ObjectId, { image_id, image_url }) {
    return this.productRepository.uploadMainFile(id, { image_id, image_url });
  }

  uploadExtraImages(
    id: Types.ObjectId,
    files: { image_id: string; image_url: string },
  ) {
    return this.productRepository.uploadExtraFiles(id, files);
  }

  findAll(params: ParamPaginationDto) {
    const { page, limit, sort, keyword } = params;

    const newSort = sort != 'asc' ? 'desc' : 'asc';

    return this.productRepository.findAll(page, limit, newSort, keyword);
  }

  async deleteById(id: string) {
    checkValisIsObject(id, 'product id');

    const product = await this.productRepository.deleteOne(id);

    if (!product) {
      throw new NotFoundException('Khong tim thay product');
    }

    return product;
  }

  async updateById(id: string, updateProduct: UpdateProductDto) {
    checkValisIsObject(id, 'product id');
    checkValisIsObject(updateProduct.category_id, 'category_id');

    const { category_id, ...data } = updateProduct;

    const category = await this.categoryRepository.findOne(category_id);

    if (!category) {
      throw new NotFoundException('Khong tim thay category');
    }

    const product = await this.productRepository.updateOne(id, {
      _id: new Types.ObjectId(id),
      category_id: new Types.ObjectId(category_id),
      ...data,
    });
    if (!product) {
      throw new NotFoundException('Khong tim thay product');
    }

    return product;
  }
  async findById(id: string) {
    checkValisIsObject(id, 'product id');

    const product = await this.productRepository.findOne(id);
    if (!product) {
      throw new NotFoundException('Khong tim thay product');
    }
    return product;
  }

  async deleteExtraImages(id: string, image_id: string[]) {
    checkValisIsObject(id, 'product id');
    const product = await this.productRepository.deleteExtraImages(
      new Types.ObjectId(id),
      image_id,
    );

    if (!product) {
      throw new NotFoundException('Khong tim thay product');
    }

    return product;
  }

  async updateStock(id: string, stock: number) {
    return await this.productRepository.updateStock(
      new Types.ObjectId(id),
      stock,
    );
  }

  async updateStatus(id: string, status: boolean) {
    console.log('status', status);
    checkValisIsObject(id, 'product id');
    const product = await this.productRepository.updateStatus(id, status);

    if (!product) {
      throw new NotFoundException('Khong tim thay product');
    }

    return product;
  }

  async findByCategory(category_id: string) {
    if (category_id === 'all') {
      return await this.productRepository.findAll(1, 1000, 'asc', '');
    }
    const category = await this.categoryRepository.findOne(category_id);

    let listProducts: Product[] = [];
    let i = 0;
    const products = await this.productRepository.findByCategory({
      category_id,
    });
    listProducts.push(...products);
    await this.hierarchical(listProducts, category, category_id);

    return listProducts;
  }

  private async hierarchical(
    listProducts: Product[],
    category: any,
    category_id: string,
  ) {
    if (category.children.length > 0) {
      for (const child of category.children) {
        const products = await this.productRepository.findByCategory({
          category_id: child._id,
        });
        listProducts.push(...products);

        await this.hierarchical(listProducts, child, category_id);
      }
    }
  }
}
