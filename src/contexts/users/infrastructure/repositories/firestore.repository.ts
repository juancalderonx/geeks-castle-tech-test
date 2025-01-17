import {
  User,
  UserNotFoundException,
  UserPrimitive,
  UserRepository,
} from '../../domain';
import { FirebaseConfigService } from '../../../shared/firebase/firebase-config.service';
import { Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Injectable } from '../../../shared/dependency-injection/injectable';

@Injectable()
export class FirestoreUserRepository implements UserRepository {
  private collection: admin.firestore.CollectionReference;

  constructor(
    @Inject(FirebaseConfigService)
    firebaseConfigService: FirebaseConfigService,
  ) {
    this.collection = firebaseConfigService.getFirestore().collection('users');
  }

  async save(user: User): Promise<void> {
    const { id } = user.toValue();
    await this.collection.doc(id).set(user.toValue());
  }

  async findById(userId: string): Promise<User | null> {
    const doc = await this.collection.doc(userId).get();

    if (!doc.exists) throw new UserNotFoundException(userId);

    const user = doc.data() as UserPrimitive;

    return user ? new User(user) : null;
  }
}
