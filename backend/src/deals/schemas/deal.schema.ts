import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DealStage } from '../../common/enums/deal-stage.enum.js';

export type DealDocument = HydratedDocument<Deal>;

@Schema({ timestamps: true })
export class Deal {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  value: number;

  @Prop({
    type: String,
    enum: DealStage,
    default: DealStage.NEW,
  })
  stage: DealStage;

  @Prop({
    type: Date,
  })
  expectedCloseDate: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Lead',
  })
  lead: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  assignedTo: Types.ObjectId;
}

export const DealSchema = SchemaFactory.createForClass(Deal);
