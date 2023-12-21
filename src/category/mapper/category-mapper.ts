import { Injectable } from '@nestjs/common'
import { CategoryDto } from '../dto/category.dto'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { plainToClass } from 'class-transformer'
import { Category } from '../entities/category.entity'

@Injectable()
export class CategoryMapper {
  toEntity(
    createCategoryDto: CreateCategoryDto | UpdateCategoryDto,
  ): Category {
    const category = new Category()
    return { ...createCategoryDto, ...category }
  }

  toDto(category: CategoryDto): CategoryDto {
    return plainToClass(CategoryDto, category)
  }
}
