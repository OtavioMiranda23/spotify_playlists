import User from "../entity/User";
import bcrypt from 'bcrypt';
import UserRepository from "../infra/repositories/UserRepository";

export default class CreateUser {
  constructor(readonly repository: UserRepository) {}

  async execute(inputUser: InputUser) {
    const hashedPassword = await bcrypt.hash(inputUser.password, 10); 
    const user = User.create(inputUser.username, inputUser.email, hashedPassword);
    const hasEmailRegistred = this.repository.getCountByEmail(user.email);
    if (hasEmailRegistred) throw new Error("User email already registred");
    this.repository.save(user);
  }
}

type InputUser = {
  username: string,
  email: string,
  password: string,
}