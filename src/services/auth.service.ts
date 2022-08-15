import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { appErrors } from 'src/constants';
import { RegisterReq, RegisterRes } from 'src/dto/auth.dto';
import { User } from 'src/entities/user.entity';
import { isEmpty, toEnum } from 'src/utils/helpers';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { UserRoles } from 'src/enums';

config();
const { BCRYPT_SALT } = process.env;
const SALT = parseInt(BCRYPT_SALT);
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async register(payload: RegisterReq): Promise<RegisterRes> {
    let { firstName, lastName, email, password, role } = payload;

    let duplicatePhoneNumber: User, duplicateEmail: User, createdUser: User;

    //* check if email already exists
    if (!isEmpty(email)) {
      try {
        duplicateEmail = await this.userRepo.findOne({
          where: { email },
        });
      } catch {
        Logger.error(appErrors.dupEmailQuery);

        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            error: appErrors.dupEmailQuery,
          },
          HttpStatus.CONFLICT,
        );
      }
      if (duplicateEmail) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            error: email + ' : ' + 'email already exists',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    //* save new user values
    try {
      password = await bcrypt.hash(password, parseInt(BCRYPT_SALT));

      try {
        createdUser = await this.userRepo.save({
          firstName,
          lastName,
          email,
          password,
          role: toEnum({
            value: role,
            enum: UserRoles,
          }),
        });
      } catch (e) {
        Logger.error(e);

        throw new HttpException(
          {
            status: HttpStatus.NOT_IMPLEMENTED,
            error: appErrors.saveUser + e,
          },
          HttpStatus.NOT_IMPLEMENTED,
        );
      }
    } catch (exp) {
      Logger.error(exp);

      if (exp.errno !== 1062) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_ACCEPTABLE,
            error: exp,
          },
          HttpStatus.NOT_ACCEPTABLE,
        );
      } else {
        throw new HttpException(
          {
            status: HttpStatus.NOT_ACCEPTABLE,
            error: 'user already exists',
          },
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
    }

    return {
      createdUser,
      success: true,
    };
  }
}
