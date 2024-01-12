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
import { Paginate, PaginateQuery } from 'nestjs-paginate'

@Controller('api/funkos')
@UseInterceptors(CacheInterceptor)
export class FunkosController {
  constructor(private readonly funkosService: FunkosService) {}

  @Get()
  @CacheKey('all_funkos')
  @CacheTTL(60)
  findAll(@Paginate() query: PaginateQuery) {
    return this.funkosService.findAll(query)
  }

  @Get(':id')
  @CacheKey('one_funko')
  @CacheTTL(60)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.funkosService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  create(@Body() createFunkoDto: CreateFunkoDto) {
    return this.funkosService.create(createFunkoDto)
  }

  @Put(':id')
  @HttpCode(201)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    return this.funkosService.update(id, updateFunkoDto)
  }

  @Patch(':id/image')
  @HttpCode(201)
  @UseGuards(FunkoExistsGuard)
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
  remove(@Param('id', ParseIntPipe) id: number) {
    //return this.funkosService.remove(id)
    return this.funkosService.isDeletedToTrue(id)
  }
}
