import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';

import auth from '@config/auth';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { IDateProvider } from '@shared/container/providers/DateProvider/IDateProvider';
import { AppError } from '@shared/errors/AppError';

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: {
    name: string;
    email: string;
  };
  token: string;
  refresh_token: string;
}

@injectable()
class AuthenticateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UsersTokensRepository')
    private usersTokensRepository: IUsersTokensRepository,

    @inject('DateProvider')
    private dateProvider: IDateProvider,
  ) { }

  async execute({ email, password }: IRequest): Promise<IResponse> {
    // User exists ?
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Email/password is incorrect!');
    }

    // Confirm password
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError('Email/password is incorrect!');
    }

    // Generate JWT
    const token = sign({}, auth.secret_token, {
      subject: user.id,
      expiresIn: auth.expires_in_token,
    });

    // Generate Refresh Token
    const refresh_token = sign({ email }, auth.secret_refresh_token, {
      subject: user.id,
      expiresIn: auth.expires_in_refresh_token,
    });

    const expires_date = this.dateProvider.addDays(
      auth.expires_day_refresh_token,
    );

    await this.usersTokensRepository.create({
      user_id: user.id,
      refresh_token,
      expires_date,
    });

    const tokenReturn: IResponse = {
      user: {
        name: user.name,
        email: user.email,
      },
      token,
      refresh_token,
    };

    return tokenReturn;
  }
}

export { AuthenticateUserUseCase };
