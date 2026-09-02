import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActivityLog,
  ActivityLogDocument,
} from './schemas/activity-log.schema.js';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async create(data: {
    user: string;
    action: string;
    entity: string;
    entityId: string;
    details?: string;
  }) {
    return this.activityLogModel.create(data);
  }

  async findAll() {
    return this.activityLogModel
      .find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
  }
}
