import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll() {
    return this.userModel.find().select('-password').sort({ createdAt: -1 });
  }

  async create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  async update(id: string, data: Partial<User>) {
    return this.userModel
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
      .select('-password');
  }
}
