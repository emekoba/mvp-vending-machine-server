import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { userErrors } from 'src/constants';
import {
  FetchUserRes,
  LoginReq,
  LoginRes,
  RegisterReq,
  RegisterRes,
  UpdateUserReq,
  UpdateUserRes,
} from 'src/dto/user.dto';
import { User } from 'src/entities/user.entity';
import { fromEnum, isEmpty, toEnum } from 'src/utils/helpers';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { UserRoles } from 'src/enums';

config();
const { BCRYPT_SALT } = process.env;
@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  revisePayload(user: User): User {
    // delete user.id;
    delete user.password;
    delete user.token;

    return user;
  }

  async verifyToken(
    req,
    resp,
    options?: { noTimeout: boolean; useCookies: boolean },
  ) {
    let decodedId: string;
    let decodedDate: Date;

    if (options.useCookies) {
      // console.log(Object.keys(req));

      const token = req.cookies['jwt'];

      try {
        const { id, date } = await this.jwtService.verifyAsync(token);

        decodedId = id;
        decodedDate = date;
      } catch (e) {
        Logger.error(e);

        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: userErrors.noCookieTokenPassed + e,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    } else {
      const { authorization } = req.headers;

      if (!authorization) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: userErrors.noAuthTokenPassed,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      try {
        const token = (authorization as string).match(
          /(?<=([b|B]earer )).*/g,
        )?.[0];

        const { id, date } = await this.jwtService.verifyAsync(token);

        decodedId = id;
        decodedDate = date;
      } catch (e) {
        Logger.error(e);

        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: userErrors.invalidToken + e,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    if (!decodedId) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: userErrors.invalidToken,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const foundUser = await this.userRepo.findOne({
        where: { id: decodedId },
      });

      if (!foundUser) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: userErrors.noTokenIdMatch,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      req.body.user = foundUser;
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'could not verify token',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async checkUserExists(userId?: string, username?: string) {}

  async register(payload: RegisterReq): Promise<RegisterRes> {
    let { username, password, role, deposit } = payload;

    let duplicateUser: User, createdUser: User;

    //* check if user with same name already exists
    try {
      duplicateUser = await this.userRepo.findOne({
        where: { username },
      });
    } catch {
      Logger.error(userErrors.dupEmailQuery);

      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: userErrors.dupEmailQuery,
        },
        HttpStatus.CONFLICT,
      );
    }

    if (duplicateUser) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: username + ' : ' + 'username already taken',
        },
        HttpStatus.CONFLICT,
      );
    }

    //* save new user values
    try {
      password = await bcrypt.hash(password, parseInt(BCRYPT_SALT));
      createdUser = await this.userRepo.save({
        username,
        password,
        role: toEnum({
          value: role,
          enum: UserRoles,
        }),
        deposit,
      });
    } catch (e) {
      Logger.error(e);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.saveUser + e,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    //* remove confidential fields
    createdUser = this.revisePayload(createdUser);

    return {
      createdUser,
      success: true,
    };
  }

  async fetchUser(userId: string): Promise<FetchUserRes> {
    let foundUser: User;

    //* check if username already exists
    try {
      foundUser = await this.userRepo.findOne({
        where: { id: userId },
      });
    } catch {
      Logger.error(userErrors.findUser);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.findUser,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    //* If user not found throw error
    if (!foundUser) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `user with id ${userId} does not exist`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    //* remove confidential fields
    foundUser = this.revisePayload(foundUser);

    return {
      user: {
        ...foundUser,
        role: fromEnum({
          value: foundUser.role,
          enum: UserRoles,
        }),
      },
      success: true,
    };
  }

  async updateUser(payload: UpdateUserReq): Promise<UpdateUserRes> {
    const { userId, username, role, deposit } = payload;

    let updatedUser: User, foundUser: User, duplicateUsername: User;

    //* check if user exists
    try {
      foundUser = await this.userRepo.findOne({
        where: { id: userId },
      });
    } catch {
      Logger.error(userErrors.findUser);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.findUser,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    if (!foundUser) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `user with id ${userId} does not exist`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    //* check if username already exists
    if (username) {
      try {
        duplicateUsername = await this.userRepo.findOne({
          where: { username },
        });
      } catch {
        Logger.error(userErrors.findUser);

        throw new HttpException(
          {
            status: HttpStatus.NOT_IMPLEMENTED,
            error: userErrors.findUser,
          },
          HttpStatus.NOT_IMPLEMENTED,
        );
      }

      if (duplicateUsername) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            error: userErrors.usernameTaken,
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    //* update user values
    try {
      updatedUser = await this.userRepo.save({
        ...foundUser,
        username: isEmpty(username) ? foundUser.username : username,
        deposit: isEmpty(deposit) ? foundUser.deposit : deposit,
        role: isEmpty(role)
          ? foundUser.role
          : toEnum({
              value: role,
              enum: UserRoles,
            }),
      });
    } catch (e) {
      Logger.error(e);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.saveUser + e,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    //* remove confidential fields
    updatedUser = this.revisePayload(updatedUser);

    return {
      success: true,
      updatedUser: {
        ...updatedUser,
        role: fromEnum({
          value: foundUser.role,
          enum: UserRoles,
        }),
      },
    };
  }

  async deleteUser(userId: string): Promise<any> {
    try {
      this.userRepo.delete({ id: userId });
    } catch {
      Logger.error(userErrors.findUser);

      return { success: false };
    }

    return { success: true };
  }

  async login(payload: LoginReq): Promise<LoginRes> {
    const { username, password } = payload;

    let foundUser: User, token: any;

    //* check if username already exists
    try {
      foundUser = await this.userRepo.findOne({
        where: { username },
      });
    } catch {
      Logger.error(userErrors.findUser);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.findUser,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    //* If user not found throw error
    if (!foundUser) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `user with username ${username} does not exists`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    //* compare provided with password in DB
    try {
      if (!(await bcrypt.compare(password, foundUser.password))) {
        Logger.error(userErrors.invalidPassword);

        throw new HttpException(
          {
            status: HttpStatus.NOT_IMPLEMENTED,
            error: userErrors.invalidPassword,
          },
          HttpStatus.NOT_IMPLEMENTED,
        );
      }
    } catch (exp) {
      Logger.error(exp);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.checkingPassword + exp,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    //* generate jwt token
    try {
      token = {
        id: foundUser.id,
        date: new Date().getTime(),
      };
      token = await this.jwtService.signAsync({ id: foundUser.id });
    } catch (exp) {
      Logger.error(exp);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.tokenCreate + exp,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    //* save token to user row
    try {
      foundUser = await this.userRepo.save({
        ...foundUser,
        token,
      });
    } catch (exp) {
      Logger.error(exp);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.userTokenUpdate + exp,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    //* remove confidential fields
    foundUser = this.revisePayload(foundUser);

    return {
      success: true,
      token,
      user: {
        ...foundUser,
        role: fromEnum({
          value: foundUser.role,
          enum: UserRoles,
        }),
      },
    };
  }
}
