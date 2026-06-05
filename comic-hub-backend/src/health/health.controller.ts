import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION ?? 'local',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }
}
