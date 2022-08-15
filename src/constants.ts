import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { Product } from './entities/product.entity';
import { User } from './entities/user.entity';

config();
const { JWT_SECRET, JWT_EXPIRATION_TIME } = process.env;

export const jwtConfig = JwtModule.register({
  secret: JWT_SECRET,
  signOptions: { expiresIn: `${JWT_EXPIRATION_TIME}` },
});

export const ModuleConfigs = {
  app: {
    entities: [User, Product],
  },
  auth: {
    entities: [User],
  },
};

export const GET_ALL_ENTITIES = () => [
  ...new Set(
    [].concat.apply(
      [],
      Object.keys(ModuleConfigs).map((key, val) =>
        [].concat.apply([], ModuleConfigs[key].entities),
      ),
    ),
  ),
];

export const appMessages = {
  productCreated: 'new product created successfully',
  registerSuccessful: 'user registered successfully',
};

export const appErrors = {
  dupEmailQuery: '',
  saveUser: 'could not save user to db',
};
