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
    entities: [],
  },
  user: {
    entities: [User],
  },
  product: {
    entities: [Product, User],
  },
  transactions: {
    entities: [Product, User],
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
  productCreated: 'new product created successfully ',
  registerSuccessful: 'user registered successfully ',
  loginSuccess: '',
  fetchedUser: '',
  updateSuccessful: '',
  deletedUser: 'user deleted successfully ',
};

export const appErrors = {
  findUser: 'error querying user db ',
  saveUser: 'could not save user to db ',
  dupEmailQuery: 'query for duplicate email failed ',
  invalidPassword: '',
  checkingPassword: '',
  tokenCreate: '',
  userTokenUpdate: '',
  loginFailed: '',
  fetchFailed: '',
  updateFailed: '',
  noTokenIdMatch: '',
  invalidToken: '',
  noCookieTokenPassed: '',
  noAuthTokenPassed: '',
  deleteFailed: '',
  usernameTaken: 'username already taken',
};

export const productMessages = {
  createdProduct: '',
  fetchedProduct: '',
  updateSuccessful: '',
  deletedSuccessful: '',
};

export const productErrors = {
  createProduct: '',
  saveProduct: '',
  findProduct: ' ',
  fetchFailed: '',
  updateFailed: '',
  deleteFailed: '',
};
