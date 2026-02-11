import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  async create(reportData: Partial<Report>, user?: any): Promise<Report> {
    const report = this.reportsRepository.create({
      ...reportData,
      user,
    });
    return this.reportsRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return this.reportsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async update(
    id: number,
    reportData: Partial<Report>,
  ): Promise<Report | null> {
    await this.reportsRepository.update(id, reportData);
    return this.reportsRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.reportsRepository.delete(id);
  }
}
