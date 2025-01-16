export default class User {
  uuid: string;
  username: string;
  email: string;
  password: string;

  constructor (uuid: string, username: string, email: string , password: string) {
    this.uuid = uuid;
    this.username = username;
    this.email = email;
    this.password = password
  }
  
  static create(username: string, email: string , password: string) {
    const regexValidPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const regexValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!username) throw new Error("Falsy username");
    if (!password) throw new Error("Falsy password");
    if (!regexValidPassword.test(password)) throw new Error("Invalid password");
    if (!email) throw new Error("Falsy email");
    if (!regexValidEmail.test(email)) throw new Error("Invalid password");
    const uuid = crypto.randomUUID()    
    return new User(uuid, username, email, password)
  }
}