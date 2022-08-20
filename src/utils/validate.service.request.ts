import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ValidateServiceRequest {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  authenticateServiceRequest = async (bearerToken: string) => {
    // get the decoded payload and header
    const token = bearerToken && bearerToken.split(' ');
    if (!token || !token[1]) {
      throw new UnauthorizedException('no bearer token');
    }

    if (!token[1]) {
      throw new UnauthorizedException();
    }

    const access: User = await this.userRepo.findOne({
      where: { token: token[1] },
    });
    if (!access) {
      throw new UnauthorizedException('invalid token');
    }
  };
}
