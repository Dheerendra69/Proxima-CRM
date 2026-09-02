import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Deal, DealSchema } from './schemas/deal.schema.js';
import { DealsController } from './deals.controller.js';
import { DealsService } from './deals.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Deal.name,
        schema: DealSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [DealsController],
  providers: [DealsService],
})
export class DealsModule {}
