import { INestApplication, NotFoundException } from '@nestjs/common'
import { FunkosService } from '../../src/rest/funkos/services/funkos.service'
import { Test, TestingModule } from '@nestjs/testing'
import { FunkosController } from '../../src/rest/funkos/controller/funkos.controller'
import { FunkoDto } from '../../src/rest/funkos/dto/funko.dto'
import { CreateFunkoDto } from '../../src/rest/funkos/dto/create-funko.dto'
import { UpdateFunkoDto } from '../../src/rest/funkos/dto/update-funko.dto'
import * as request from 'supertest'

describe('FunkosController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = '/api/funkos'

  const funkoResponse: FunkoDto = {
    id: 1,
    name: 'funko 1',
    price: 10,
    quantity: 10,
    category: 'category 1',
  }

  const createFunkoDto: CreateFunkoDto = {
    name: 'funko 1',
    price: 10,
    quantity: 10,
    category: 'category 1',
  }

  const updateFunkoDto: UpdateFunkoDto = {
    name: 'funko 1',
    price: 10,
    quantity: 10,
    category: 'category 1',
  }

  const mockFunkoService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    isDeletedToTrue: jest.fn(),
  }
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FunkosController],
      providers: [
        FunkosService,
        {
          provide: FunkosService,
          useValue: mockFunkoService,
        },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })
  describe('GET /api/funkos', () => {
    it('should return an array of funkos', async () => {
      mockFunkoService.findAll.mockReturnValue([funkoResponse])
      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200)
      expect(body).toEqual([funkoResponse])
      expect(mockFunkoService.findAll).toHaveBeenCalledTimes(1)
    })
  })
  describe('GET /api/funkos/:id', () => {
    it('should return a funko', async () => {
      mockFunkoService.findOne.mockReturnValue(funkoResponse)
      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/1`)
        .expect(200)
      expect(body).toEqual(funkoResponse)
      expect(mockFunkoService.findOne).toHaveBeenCalledTimes(1)
    })
    it('should return a NotFoundException', async () => {
      mockFunkoService.findOne.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer()).get(`${myEndpoint}/1`).expect(404)
    })
  })
  describe('POST /api/funkos', () => {
    it('should create a funko', async () => {
      mockFunkoService.create.mockReturnValue(funkoResponse)
      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createFunkoDto)
        .expect(201)
      expect(body).toEqual(funkoResponse)
      expect(mockFunkoService.create).toHaveBeenCalledTimes(1)
    })
  })
  describe('PUT /api/funkos/:id', () => {
    it('should update a funko', async () => {
      mockFunkoService.update.mockReturnValue(funkoResponse)
      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/1`)
        .send(updateFunkoDto)
        .expect(201)
      expect(body).toEqual(funkoResponse)
      expect(mockFunkoService.update).toHaveBeenCalledTimes(1)
    })
    it('should return a NotFoundException', async () => {
      mockFunkoService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndpoint}/1`)
        .send(updateFunkoDto)
        .expect(404)
    })
  })
  describe('DELETE /api/funkos/:id', () => {
    it('should return a funko with isDeleted true', async () => {
      mockFunkoService.isDeletedToTrue.mockReturnValue(funkoResponse)
      await request(app.getHttpServer()).delete(`${myEndpoint}/1`).expect(204)
    })
    it('should return a NotFoundException', async () => {
      mockFunkoService.isDeletedToTrue.mockRejectedValue(
        new NotFoundException(),
      )
      await request(app.getHttpServer()).delete(`${myEndpoint}/1`).expect(404)
    })
  })
})
