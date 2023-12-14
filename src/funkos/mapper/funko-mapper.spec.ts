import { Test, TestingModule } from '@nestjs/testing'
import { FunkoMapper } from './funko-mapper'

describe('FunkoMapper', () => {
  let provider: FunkoMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkoMapper],
    }).compile()

    provider = module.get<FunkoMapper>(FunkoMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
})
