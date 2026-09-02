import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deal, DealDocument } from '../deals/schemas/deal.schema.js';
import { DealStage } from '../common/enums/deal-stage.enum.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Deal.name)
    private readonly dealModel: Model<DealDocument>,
  ) {}

  async getStats() {
    const [pipeline, won, stages] = await Promise.all([
      this.dealModel.aggregate([
        {
          $match: {
            stage: {
              $nin: [DealStage.WON, DealStage.LOST],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$value' },
          },
        },
      ]),

      this.dealModel.aggregate([
        {
          $match: { stage: DealStage.WON },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$value' },
          },
        },
      ]),

      this.dealModel.aggregate([
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 },
            value: { $sum: '$value' },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),
    ]);

    const totalDeals = await this.dealModel.countDocuments();

    const wonDeals = await this.dealModel.countDocuments({
      stage: DealStage.WON,
    });

    return {
      totalPipeline: pipeline[0]?.total || 0,
      wonDealsValue: won[0]?.total || 0,
      conversionRate:
        totalDeals === 0
          ? 0
          : Number(((wonDeals / totalDeals) * 100).toFixed(2)),
      dealsByStage: stages,
    };
  }
}
