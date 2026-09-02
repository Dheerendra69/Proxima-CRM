import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DealStage } from '../../common/enums/deal-stage.enum.js';

export class CreateDealDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsString()
  lead?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}
