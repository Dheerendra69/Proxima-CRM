import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { AppModule } from './app.module.js';
import { User } from './users/schemas/user.schema.js';
import { Lead } from './leads/schemas/lead.schema.js';
import { Deal } from './deals/schemas/deal.schema.js';
import { Role } from './common/enums/role.enum.js';
import { LeadStatus } from './common/enums/lead-status.enum.js';
import { DealStage } from './common/enums/deal-stage.enum.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const leadModel = app.get<Model<Lead>>(getModelToken(Lead.name));

  const dealModel = app.get<Model<Deal>>(getModelToken(Deal.name));

  await userModel.deleteMany({});
  await leadModel.deleteMany({});
  await dealModel.deleteMany({});

  const password = await bcrypt.hash('Password@123', 10);

  const users = await userModel.insertMany([
    {
      name: 'Admin User',
      email: 'admin@proxima.com',
      password,
      role: Role.ADMIN,
    },
    {
      name: 'Agent One',
      email: 'agent1@proxima.com',
      password,
      role: Role.AGENT,
    },
    {
      name: 'Agent Two',
      email: 'agent2@proxima.com',
      password,
      role: Role.AGENT,
    },
  ]);

  const leads = await leadModel.insertMany([
    {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '9876543210',
      company: 'TechCorp',
      source: 'Website',
      status: LeadStatus.NEW,
      assignedTo: users[1]._id,
    },
    {
      name: 'Priya Singh',
      email: 'priya@example.com',
      phone: '9876543211',
      company: 'StartupHub',
      source: 'LinkedIn',
      status: LeadStatus.QUALIFIED,
      assignedTo: users[2]._id,
    },
    {
      name: 'Amit Kumar',
      email: 'amit@example.com',
      phone: '9876543212',
      company: 'CloudWorks',
      source: 'Referral',
      status: LeadStatus.CONTACTED,
      assignedTo: users[1]._id,
    },
  ]);

  await dealModel.insertMany([
    {
      title: 'TechCorp Enterprise Deal',
      value: 150000,
      stage: DealStage.NEW,
      expectedCloseDate: new Date('2026-10-15'),
      lead: leads[0]._id,
      assignedTo: users[1]._id,
    },
    {
      title: 'StartupHub Premium Deal',
      value: 250000,
      stage: DealStage.WON,
      expectedCloseDate: new Date('2026-09-15'),
      lead: leads[1]._id,
      assignedTo: users[2]._id,
    },
    {
      title: 'CloudWorks Deal',
      value: 100000,
      stage: DealStage.IN_PROGRESS,
      expectedCloseDate: new Date('2026-11-01'),
      lead: leads[2]._id,
      assignedTo: users[1]._id,
    },
  ]);

  console.log('Seed completed');

  await app.close();
}

bootstrap();
