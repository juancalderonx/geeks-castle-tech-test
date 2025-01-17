import * as admin from 'firebase-admin';
import { Inject } from '@nestjs/common';
import { Injectable } from '../../../shared/dependency-injection/injectable';
import {
  Customer,
  CustomerNotFoundException,
  CustomerPrimitive,
  CustomerRepository,
} from '../../domain';
import { FirebaseConfigService } from '../../../shared/firebase/firebase-config.service';

@Injectable()
export class FirestoreCustomerRepository implements CustomerRepository {
  private collection: admin.firestore.CollectionReference;

  constructor(
    @Inject(FirebaseConfigService)
    firebaseConfigService: FirebaseConfigService,
  ) {
    this.collection = firebaseConfigService
      .getFirestore()
      .collection('customers');
  }

  async save(customer: Customer): Promise<void> {
    const { id, ...customerData } = customer.toValue();
    await this.collection.doc(id).set(customerData);
  }

  async findById(customerId: string): Promise<Customer | null> {
    const doc = await this.collection.doc(customerId).get();

    if (!doc.exists) throw new CustomerNotFoundException(customerId);

    const customerPrimitive = doc.data() as CustomerPrimitive;

    customerPrimitive.birthdate = this.mapCustomerBirthdate(
      customerPrimitive.birthdate,
    );

    return new Customer(customerPrimitive);
  }

  async update(id: string, updateData: Partial<Customer>): Promise<void> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) throw new CustomerNotFoundException(id);

    // Filtrar valores undefined
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined),
    );

    await docRef.update(filteredUpdateData);
  }

  /**
   * Map the birthdate to a Date object
   * @param birthdate Birthdate to map
   * @returns Birthdate as a Date object
   */
  private mapCustomerBirthdate(
    birthdate: admin.firestore.Timestamp | Date,
  ): Date {
    return birthdate instanceof admin.firestore.Timestamp
      ? birthdate.toDate()
      : birthdate;
  }
}
