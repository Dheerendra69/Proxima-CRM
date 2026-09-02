import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LeadStatus } from '../../common/enums/lead-status.enum.js';

export type LeadDocument = HydratedDocument<Lead>;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  company: string;

  @Prop({ type: String })
  source: string;

  @Prop({
    type: String,
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  assignedTo: Types.ObjectId;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
