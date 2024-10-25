import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/role.decorator';
import { Role } from 'src/auth/decorator/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleAuthGuard } from 'src/auth/guards/role-jwt.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ParamPaginationDto } from 'src/common/param-pagination.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { User } from 'src/user/model/user.schema';
import { UserService } from 'src/user/user.service';
import { buildPagination } from 'src/common/common';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    const { _id } = req.user;
    return this.service.getOne(_id);
  }

  // Tạo user
  @UseGuards(JwtAuthGuard, RoleAuthGuard)
  @Roles(Role.ADMIN)
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.service.create(createUserDto);
  }

  // Lấy tất cả, có tìm kiếm
  // @UseGuards(JwtAuthGuard, RoleAuthGuard)
  // @Roles(Role.ADMIN)
  @Get()
  async getAllUsers(@Query() page: ParamPaginationDto) {
    const listUsers = await this.service.getAll(page);
    return buildPagination<User>(listUsers, page);
  }

  // Sửa user
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  updateUser(@Param('id') _id: string, @Body() updateUser: UpdateUserDto) {
    return this.service.updateUser(_id, updateUser);
  }

  // Xoá user
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') _id: string) {
    await this.service.deleteUser(_id);

    return 'Xoá user thành công!';
  }

  // Lấy user theo id
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  getUserById(@Param('id') _id: string) {
    return this.service.getOne(_id);
  }

  // Thay đổi trạng thái user theo id
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Put(':id/status')
  updateStatusUser(@Param('id') _id: string, @Query('status') status: boolean) {
    return this.service.updateStatusUser(_id, status);
  }
}
