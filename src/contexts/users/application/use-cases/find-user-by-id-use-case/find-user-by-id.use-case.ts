import {
  UserNotFoundException,
  UserPrimitive,
  UserRepository,
} from '../../../domain';
import { FindUserByIdDto } from './find-user-by-id.dto';
import { Injectable } from '../../../../shared/dependency-injection/injectable';

@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    findUserByIdDto: FindUserByIdDto,
  ): Promise<{ user: UserPrimitive }> {
    const user = await this.userRepository.findById(findUserByIdDto.id);

    if (!user) throw new UserNotFoundException(findUserByIdDto.id);

    return { user: user.toValue() };
  }
}
