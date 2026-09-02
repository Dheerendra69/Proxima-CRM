import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto, @Req() req: any) {
    return this.leadsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.leadsService.findAll(page, limit, search, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateLeadDto,
    @Req() req: any,
  ) {
    return this.leadsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string, @Req() req: any) {
    return this.leadsService.remove(id, req.user.userId);
  }
}
