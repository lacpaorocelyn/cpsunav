import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Report } from './report.entity';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Body() reportData: Partial<Report>) {
    return this.reportsService.create(reportData);
  }

  @Get()
  async findAll() {
    return this.reportsService.findAll();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() reportData: Partial<Report>) {
    return this.reportsService.update(+id, reportData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }
}
