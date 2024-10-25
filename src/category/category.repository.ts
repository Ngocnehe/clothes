import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/category/dto/update-category.dto';
import { Category } from 'src/category/model/category.schema';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name) private readonly model: Model<Category>,
  ) {}

  async create(category: CreateCategoryDto) {
    const newCategory = await new this.model({
      _id: new Types.ObjectId(),
      ...category,
    }).save();

    if (newCategory.parent_id) {
      await this.model.findOneAndUpdate(
        { _id: newCategory.parent_id },
        { $addToSet: { children: newCategory._id } },
        { new: true },
      );
    }

    return newCategory;
  }

  async findOne(id: string) {
    return await this.model
      .findOne({ _id: id })
      .populate({
        path: 'children',
        populate: {
          path: 'children',
          populate: { path: 'children', populate: { path: 'children' } },
        },
      })
      .lean<Category>(true);
  }

  async findAll(
    page: number,
    limit: number,
    sort: 'asc' | 'desc',
    keyword: any,
  ) {
    return await this.model
      .find(keyword ? { $or: [{ name: new RegExp(keyword, 'i') }] } : {})
      .skip((page - 1) * limit)
      .sort({ name: sort })
      .limit(limit)
      .populate({
        path: 'children',
        populate: {
          path: 'children',
          populate: { path: 'children', populate: { path: 'children' } },
        },
      })
      .lean<Category[]>(true);
  }

  async deleteOne(id: string) {
    return await this.model.findOneAndDelete({ _id: id });
  }

  async updateOne(
    id: string,
    categoryOld: Category,
    categoryNew: UpdateCategoryDto,
  ) {
    const updateCategory = await this.model.findOneAndUpdate(
      { _id: id },
      categoryNew,
      {
        new: true,
      },
    );

    if (categoryNew.parent_id) {
      await this.model.updateOne(
        { _id: updateCategory.parent_id },
        { $addToSet: { children: updateCategory._id } },
      );
    }

    if (
      categoryOld.parent_id &&
      categoryOld.parent_id.toString() !== categoryNew.parent_id
    ) {
      await this.model.updateOne(
        { _id: categoryOld.parent_id },
        { $pull: { children: categoryOld._id } },
      );
    }

    return updateCategory;
  }

  async updateStatusById(id: string, status: boolean) {
    return await this.model
      .findOneAndUpdate({ _id: id }, { status }, { new: true })
      .lean<Category>(true);
  }

  async findAllGetName() {
    return await this.model.find().lean<Category[]>(true);
  }
}
