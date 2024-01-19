import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FunkosService } from '../services/funkos.service'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { FunkoExistsGuard } from '../guards/funko-exists-guard'
import { extname, parse } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { JwtAuthGuard } from '../../auth/guards/roles-auth.guard'
import { Roles, RolesAuthGuard } from '../../auth/guards/jwt-auth.guard'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { FunkoDto } from '../dto/funko.dto'

@Controller('api/funkos')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiTags('Funkos')
export class FunkosController {
  constructor(private readonly funkosService: FunkosService) {}

  @Get()
  @CacheKey('all_funkos')
  @CacheTTL(60)
  @ApiResponse({
    status: 200,
    description:
      'Returned all funkos paginated by limit, page, sortBy, filter and search',
    type: Paginated<Promise<FunkoDto[]>>,
  })
  @ApiQuery({
    description: 'Filter by limit',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filter by page',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filter by sortBy, ASC or DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filter by filter: name, category, collection, number',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filter by search: name, category, collection, number',
    name: 'search',
    required: false,
    type: String,
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.funkosService.findAll(query)
  }

  @Get(':id')
  @CacheKey('one_funko')
  @CacheTTL(60)
  @ApiResponse({
    status: 200,
    description: 'Returned one funko',
    type: FunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Funko id',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Funko not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.funkosService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiResponse({
    status: 201,
    description: 'Funko created',
    type: FunkoDto,
  })
  @ApiBody({
    description: 'Funko data',
    type: CreateFunkoDto,
  })
  @ApiBadRequestResponse({
    description: 'Category does not exist',
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  create(@Body() createFunkoDto: CreateFunkoDto) {
    return this.funkosService.create(createFunkoDto)
  }

  @Put(':id')
  @HttpCode(201)
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiResponse({
    status: 201,
    description: 'Funko updated',
    type: FunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Funko id',
    type: Number,
  })
  @ApiBody({
    description: 'Funko data',
    type: UpdateFunkoDto,
  })
  @ApiBadRequestResponse({
    description: 'Category does not exist',
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  @ApiNotFoundResponse({
    description: 'Funko id not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    return this.funkosService.update(id, updateFunkoDto)
  }

  @Patch(':id/image')
  @HttpCode(201)
  @UseGuards(FunkoExistsGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Funko image updated',
    type: FunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Funko id',
    type: Number,
  })
  @ApiProperty({
    name: 'file',
    description: 'Image file',
    type: 'string',
    format: 'binary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File image',
    type: FileInterceptor('file'),
  })
  @ApiBadRequestResponse({
    description: 'Invalid id',
  })
  @ApiNotFoundResponse({
    description: 'Funko id not found',
  })
  @ApiBadRequestResponse({
    description:
      'File type not allowed. Allowed extensions are jpg, png and gif',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const { name } = parse(file.originalname)
          const fileName = `${uuidv4()}_${name.replace(/\s/g, '')}`
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
        const maxFileSize = 1024 * 1024
        if (!allowedMimes.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'File type not allowed. Allowed extensions are jpg, png and gif',
            ),
            false,
          )
        } else if (file.size > maxFileSize) {
          cb(
            new BadRequestException('File size exceeds the limit of 1MB'),
            false,
          )
        } else {
          cb(null, true)
        }
      },
    }),
  )
  updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.funkosService.updateImage(id, file)
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Funko deleted',
  })
  @ApiParam({
    name: 'id',
    description: 'Funko id',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Funko id not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid id',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    //return this.funkosService.remove(id)
    return this.funkosService.isDeletedToTrue(id)
  }
}
