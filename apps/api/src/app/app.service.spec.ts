import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return API information', () => {
      expect(service.getData()).toEqual({ 
        name: 'TurboVets API',
        version: '1.0.0',
        status: 'active'
      });
    });
  });
});
