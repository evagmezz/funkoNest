import { Test, TestingModule } from '@nestjs/testing'
import { FunkosController } from './funkos.controller'
import { FunkosService } from '../services/funkos.service'

describe('FunkosController', () => {
  let controller: FunkosController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FunkosController],
      providers: [FunkosService],
    }).compile()

    controller = module.get<FunkosController>(FunkosController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
