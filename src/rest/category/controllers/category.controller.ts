import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CategoryService } from '../services/category.service'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { JwtAuthGuard } from '../../auth/guards/roles-auth.guard'
import { Roles, RolesAuthGuard } from '../../auth/guards/jwt-auth.guard'

@Controller('api/category')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @CacheKey('all_categories')
  @CacheTTL(60)
  @Roles('USER')
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.categoryService.findAll(query)
  }

  @Get(':id')
  @CacheKey('one_category')
  @CacheTTL(60)
  @Roles('USER')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoryService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto)
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto)
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('ADMIN')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    //return await this.categoryService.remove(id)
    return await this.categoryService.changeIsActive(id)
  }
}
