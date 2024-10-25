import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  buildPagination,
  checkExtraFiles,
  checkFileImage,
  checkMainFile,
} from 'src/common/common';
import { ParamPaginationDto } from 'src/common/param-pagination.dto';
import { CreateProductDto } from 'src/product/dto/create-product.dto';
import { ProductService } from 'src/product/product.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleAuthGuard } from 'src/auth/guards/role-jwt.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { Role } from 'src/auth/decorator/role.enum';

@Controller('products')
export class ProductController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly productService: ProductService,
  ) {}
  @Get('/c/:id')
  async getProductByCategory(@Param('id') id: string) {
    return this.productService.findByCategory(id);
  }

  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'main_image' }, { name: 'extra_images' }]),
  )
  async create(
    @Body() product: CreateProductDto,
    @UploadedFiles()
    files: {
      main_image: Express.Multer.File[];
      extra_images: Express.Multer.File[];
    },
  ) {
    checkFileImage(files);

    if (files.main_image && files.main_image.length > 1) {
      throw new BadRequestException('main_image chỉ nhận 1 file');
    }

    const newProduct = await this.productService.createProduct(product);

    if (files.main_image) {
      this.cloudinaryService
        .uploadFile(files.main_image[0], 'products/' + newProduct._id)
        .then((result) => {
          this.productService.uploadMainImage(newProduct._id, {
            image_id: result.public_id,
            image_url: result.url,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    if (files.extra_images) {
      files.extra_images.forEach(async (file) => {
        this.cloudinaryService
          .uploadFile(file, 'products/' + newProduct._id)
          .then((result) => {
            this.productService.uploadExtraImages(newProduct._id, {
              image_id: result.public_id,
              image_url: result.url,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }

    return 'Đã tạo product thành công ';
  }

  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Get()
  async getAll(@Query() params: ParamPaginationDto) {
    const products = await this.productService.findAll(params);
    return buildPagination(products, params);
  }

  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const product = await this.productService.deleteById(id);

    await this.cloudinaryService.deleteById(`products/${product._id}`);

    return id;
  }

  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Put(':id')
  update(@Param('id') id: string, @Body() product: UpdateProductDto) {
    return this.productService.updateById(id, product);
  }

  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Put(':id/main_image')
  @UseInterceptors(FileInterceptor('main_image'))
  async updateImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    checkMainFile(file);

    if (!file) {
      throw new BadRequestException('Không nhận được file!');
    }

    const product = await this.productService.findById(id);

    const result = await this.cloudinaryService.uploadFile(
      file,
      'products/' + product._id,
    );

    if (product.image_id) {
      await this.cloudinaryService.deleteImage(product.image_id);
    }

    const newProduct = await this.productService.uploadMainImage(product._id, {
      image_id: result.public_id,
      image_url: result.url,
    });

    return id;
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Put(':id/delete_images')
  async deleteImages(
    @Param('id') id: string,
    @Body('image_ids') image_ids: string[],
  ) {
    image_ids.forEach((image) => {
      this.cloudinaryService.deleteImage(image);
    });
    await this.productService.deleteExtraImages(id, image_ids);
    return id;
  }

  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Put(':id/add_images')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'extra_images' }]))
  async addImages(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      extra_images: Express.Multer.File[];
    },
  ) {
    checkExtraFiles(files.extra_images);
    if (!files.extra_images) {
      throw new BadRequestException('Không nhận được file!');
    }
    const uploadPromises = files.extra_images.map(async (file) => {
      const result = await this.cloudinaryService.uploadFile(
        file,
        'products/' + id,
      );
      this.productService.uploadExtraImages(new Types.ObjectId(id), {
        image_id: result.public_id,
        image_url: result.url,
      });
    });

    await Promise.all(uploadPromises);

    return id;
  }

  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Query('status') status: boolean) {
    return this.productService.updateStatus(id, status);
  }
}
