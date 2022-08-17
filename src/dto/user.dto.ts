import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from 'src/utils/decorators';
import { User } from 'src/entities/user.entity';

export class RegisterReq {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  deposit: string;

  @IsString()
  @MinLength(8)
  @MaxLength(12)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @IsNotEmpty()
  @Match('password')
  confirmPassword: string;
}

export class RegisterRes {
  success: boolean;
  createdUser: User;
}

export class FetchUserRes {
  user: User;
  success: boolean;
}

export class UpdateUserReq {
  @IsString()
  @IsNotEmpty()
  userId: string;
  username: string;
  role: string;
  deposit: string;
}

export class UpdateUserRes {
  success: boolean;
  updatedUser: User;
}

export class LoginReq {
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsNotEmpty()
  password: string;
}

export class LoginRes {
  user: User;
  success: boolean;
  token: string;
}
