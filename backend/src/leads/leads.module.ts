import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from './schemas/lead.schema.js';
import { LeadsController } from './leads.controller.js';
import { LeadsService } from './leads.service.js';
import { ActivityLogModule } from '../activity-log/activity-log.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Lead.name,
        schema: LeadSchema,
      },
    ]),
    ActivityLogModule,
    AuthModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
