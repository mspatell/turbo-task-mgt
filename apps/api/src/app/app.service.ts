import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { name: string; version: string; status: string } {
    return { 
      name: 'TurboVets API',
      version: '1.0.0',
      status: 'active'
    };
  }
}
