import { Injectable } from '@nestjs/common'
import { CategoryDto } from '../dto/category.dto'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { plainToClass } from 'class-transformer'
import { Category } from '../entities/category.entity'

/**
 * Clase que proporciona métodos para mapear datos relacionados con las categorías.
 */
@Injectable()
export class CategoryMapper {
  /**
   * Convierte un objeto CreateCategoryDto o UpdateCategoryDto en un objeto Category.
   *
   * @param {CreateCategoryDto | UpdateCategoryDto} createCategoryDto - Objeto a ser convertido en una entidad Category.
   * @returns {Category} - Entidad Category resultante del mapeo.
   */
  toEntity(createCategoryDto: CreateCategoryDto | UpdateCategoryDto): Category {
    const category = new Category()
    return { ...createCategoryDto, ...category }
  }

  /**
   * Convierte un objeto CategoryDto en un objeto CategoryDto utilizando class-transformer.
   *
   * @param {CategoryDto} category - Objeto de tipo CategoryDto a ser convertido.
   * @returns {CategoryDto} - Objeto de tipo CategoryDto resultante del mapeo.
   */
  toDto(category: CategoryDto): CategoryDto {
    return plainToClass(CategoryDto, category)
  }
}
