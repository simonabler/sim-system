
export class User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phoneCompany: string;
  phonePrivate: string;
  token: string;

  constructor() {
    this.email = '';
    this.firstName = '';
    this.lastName = '';
    this.phoneCompany = '';
  }
}

