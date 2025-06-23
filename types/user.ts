export interface Role {
  id: string;
  //   name: string;
  displayName: string;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  jobTitle: string | null;
  roles: Role[];
  password: string | null;
  status: boolean;
  isAdmin: boolean;
  isVerfied: boolean; // Keeping your typo as in the model
  token: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// For the edit form - only the fields admin can edit
export interface UserEditData {
  phone: string;
  status: boolean;
  emailVerified: Date | null;
  isAdmin: boolean;
  image: string | null;
  role: string | null; // Assuming role is a string ID of the role
}
