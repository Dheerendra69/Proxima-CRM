import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ActivityLog,
  ActivityLogSchema,
} from './schemas/activity-log.schema.js';
import { ActivityLogService } from './activity-log.service.js';
import { ActivityLogController } from './activity-log.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ActivityLog.name,
        schema: ActivityLogSchema,
      },
    ]),
    AuthModule,
  ],
  providers: [ActivityLogService],
  controllers: [ActivityLogController],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
