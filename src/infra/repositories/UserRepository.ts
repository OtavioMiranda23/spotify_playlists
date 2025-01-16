import User from "../../entity/User";
import { Database  as SqliteDatabase}  from "sqlite3";

export default class UserRepository {
  constructor (readonly db: SqliteDatabase) {}
  
  getCountByEmail(email: string) {
    return this.db.run("SELECT COUNT(*) FROM users WHERE (email) = ?", email);
  }

  save(user: User) {
    return this.db.run("INSERT INTO users (id, username, email, hash) VALUES (?, ?, ?, ?)", user.uuid, user.username, user.email, user.password )
  }
}