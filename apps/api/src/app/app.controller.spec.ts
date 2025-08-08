import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    it('should return API information', () => {
      const result = { 
        name: 'TurboVets API',
        version: '1.0.0',
        status: 'active'
      };
      const appController = app.get<AppController>(AppController);
      expect(appController.getData()).toEqual(result);
    });
  });
});
