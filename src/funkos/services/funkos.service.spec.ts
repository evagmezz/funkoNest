import { Test, TestingModule } from '@nestjs/testing'
import { FunkosService } from './funkos.service'

describe('FunkosService', () => {
  let service: FunkosService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkosService],
    }).compile()

    service = module.get<FunkosService>(FunkosService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
