import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ActivityLogDocument = HydratedDocument<ActivityLog>;

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  action: string;

  @Prop({
    type: String,
    required: true,
  })
  entity: string;

  @Prop({
    type: String,
    required: true,
  })
  entityId: string;

  @Prop({
    type: String,
  })
  details: string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
