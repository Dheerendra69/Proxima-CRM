import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './schemas/lead.schema.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { ActivityLogService } from '../activity-log/activity-log.service.js';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name)
    private readonly leadModel: Model<LeadDocument>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async create(dto: CreateLeadDto, userId: string) {
    const lead = await this.leadModel.create(dto);

    await this.activityLogService.create({
      user: userId,
      action: 'CREATE',
      entity: 'Lead',
      entityId: lead._id.toString(),
    });

    return lead;
  }
  async findAll(page = 1, limit = 10, search?: string, status?: string) {
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.leadModel
        .find(filter)
        .populate('assignedTo', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      this.leadModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const lead = await this.leadModel
      .findById(id)
      .populate('assignedTo', 'name email');

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, userId: string) {
    const lead = await this.leadModel.findByIdAndUpdate(id, dto, { new: true });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    await this.activityLogService.create({
      user: userId,
      action: 'UPDATE',
      entity: 'Lead',
      entityId: id,
    });

    return lead;
  }

  async remove(id: string, userId: string) {
    const lead = await this.leadModel.findByIdAndDelete(id);

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    await this.activityLogService.create({
      user: userId,
      action: 'DELETE',
      entity: 'Lead',
      entityId: id,
    });

    return {
      message: 'Lead deleted successfully',
    };
  }
}
