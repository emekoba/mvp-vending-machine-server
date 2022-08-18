import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { Product } from './entities/product.entity';
import { User } from './entities/user.entity';

config();
const { JWT_SECRET, JWT_EXPIRATION_TIME } = process.env;

export const validTransactionAmount = ['5', '10', '20', '50', '100'];

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

export const userMessages = {
  productCreated: 'new product created successfully ',
  registerSuccessful: 'user registered successfully ',
  loginSuccess: 'login successful ',
  fetchedUser: 'user fetched successfully ',
  updateSuccessful: 'user updated successfully ',
  deletedUser: 'user deleted successfully ',
};

export const userErrors = {
  findUser: 'error querying user db ',
  saveUser: 'could not save user to db ',
  updateUser: 'could not update user to db ',
  dupEmailQuery: 'query for duplicate email failed ',
  invalidPassword: '',
  checkingPassword: 'password check failed ',
  tokenCreate: '',
  userTokenUpdate: '',
  loginFailed: 'login failed',
  fetchFailed: 'failed to fetch user ',
  updateFailed: 'failed to update user ',
  noTokenIdMatch: 'invalid destructured Id',
  invalidToken: 'token expired. Please login to continue',
  noCookieTokenPassed: '',
  noAuthTokenPassed: '',
  deleteFailed: 'failed to delete user ',
  usernameTaken: 'username already taken',
};

export const productMessages = {
  createdProduct: 'product created successfully ',
  fetchedProduct: 'product found and fetched successfully ',
  fetchedAllProducts: 'all products fetched successfully ',
  updateSuccessful: 'product updated successfully ',
  deletedSuccessful: 'product deleted successfully ',
};

export const productErrors = {
  createProduct: 'failed to create product ',
  saveProduct: 'failed to save product ',
  queryProduct: 'failed to query product ',
  fetchFailed: 'failed to fetch product ',
  updateFailed: 'failed to update product ',
  deleteFailed: 'failed to delete product ',
};

export const transactionMessages = {
  depositSuccessful: 'deposit successful ',
  resetSuccessful: 'reset successful ',
};

export const transactionErrors = {
  invalidAmount:
    'users can deposit only 5, 10, 20, 50 and 100 cent coins into their vending machine account ',
  depositFailed: 'faild to deposit amount ',
  walletEmpty: 'your account is empty. deposit some money to continue ',
  notBuyer: 'User must be buyer to proceed ',
  resetFailed: 'Failed to reset user ',
};
