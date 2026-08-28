import { firestoreDb } from "../../../shared/infrastructure/firebaseAdmin";
import { UserEntity } from "../domain/user.entity";

export class UserRepository {
  private collection = firestoreDb.collection("users");

  public async findByFirebaseUid(firebaseUid: string): Promise<UserEntity | null> {
    const snapshot = await this.collection
      .where("firebaseUid", "==", firebaseUid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as UserEntity;
  }

  public async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return { ...doc.data(), id: doc.id } as UserEntity;
  }

  public async create(user: UserEntity): Promise<UserEntity> {
    await this.collection.doc(user.id).set(user);
    return user;
  }

  public async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const updatedAt = new Date().toISOString();
    const updatedData = { ...updates, updatedAt };

    await docRef.update(updatedData);

    const refreshed = await docRef.get();
    return { ...refreshed.data(), id: refreshed.id } as UserEntity;
  }
}

export const userRepository = new UserRepository();
