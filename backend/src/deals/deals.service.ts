import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deal, DealDocument } from './schemas/deal.schema.js';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';

@Injectable()
export class DealsService {
  constructor(
    @InjectModel(Deal.name)
    private readonly dealModel: Model<DealDocument>,
  ) {}

  async create(dto: CreateDealDto) {
    return this.dealModel.create({
      ...dto,
      expectedCloseDate: dto.expectedCloseDate
        ? new Date(dto.expectedCloseDate)
        : undefined,
    });
  }

  async findAll(page = 1, limit = 10, search?: string, stage?: string) {
    const filter: any = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: 'i',
      };
    }

    if (stage) {
      filter.stage = stage;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.dealModel
        .find(filter)
        .populate('lead')
        .populate('assignedTo', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      this.dealModel.countDocuments(filter),
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
    const deal = await this.dealModel
      .findById(id)
      .populate('lead')
      .populate('assignedTo', 'name email');

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async update(id: string, dto: UpdateDealDto) {
    const deal = await this.dealModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        expectedCloseDate: dto.expectedCloseDate
          ? new Date(dto.expectedCloseDate)
          : undefined,
      },
      { new: true },
    );

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async remove(id: string) {
    const deal = await this.dealModel.findByIdAndDelete(id);

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return {
      message: 'Deal deleted successfully',
    };
  }
}
