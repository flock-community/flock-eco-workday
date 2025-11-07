export interface User {
  id: string;
  name?: string;
  email?: string;
  authorities?: string[];
  accounts?: UserAccount[];
  created?: Date;
}

export interface UserGroup {
  id: string;
  name?: string;
  users?: string[];
}

export interface UserAccount {
  id: string;
}

export interface UserAccountPassword extends UserAccount {
  id: string;
}

export interface UserAccountOauth extends UserAccount {
  id: string;
  provider?: string;
}

export interface UserAccountKey extends UserAccount {
  id: string;
  key?: string;
}
