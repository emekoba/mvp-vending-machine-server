import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Match } from 'src/utils/decorators';
import { User } from 'src/entities/user.entity';

export class LoginReq {
  @IsNotEmpty()
  @IsEmail()
  email?: string;
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

export class RegisterReq {
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsEmail()
  @IsOptional()
  @ValidateIf((o) => !o.phoneNumber || o.email)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(12)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  //@Matches((?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]))
  password: string;

  @IsNotEmpty()
  @Match('password')
  confirmPassword: string;
}

export class RegisterRes {
  success: boolean;
  createdUser: User;
}
