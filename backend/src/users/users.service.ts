import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByStudentId(studentId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { studentId } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    // If updating password, hash it
    if (attrs.password) {
      const salt = await bcrypt.genSalt(10);
      attrs.password = await bcrypt.hash(attrs.password, salt);
    }

    // Ensure studentId is not updated
    delete attrs.studentId;

    Object.assign(user, attrs);
    const saved = await this.usersRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }
}
