import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(pin: string, fullName?: string) {
    const year = new Date().getFullYear();
    let studentId: string;
    let existingUser;

    // Keep generating until unique
    do {
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digits
      studentId = `${year}-${randomNum}`;
      existingUser = await this.usersService.findByStudentId(studentId);
    } while (existingUser);

    const hashedPassword = await bcrypt.hash(pin, 10);
    const user = await this.usersService.create({
      studentId,
      password: hashedPassword,
      fullName,
    });

    const { password, ...result } = user;
    return result;
  }

  async login(studentId: string, pin: string) {
    const user = await this.usersService.findByStudentId(studentId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pin, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, studentId: user.studentId };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        studentId: user.studentId,
        fullName: user.fullName,
      },
    };
  }
}
