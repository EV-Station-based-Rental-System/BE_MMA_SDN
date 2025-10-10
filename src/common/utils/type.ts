export type BaseJwtUserPayload = {
  _id: string;
  email: string;
  fullName: string;
  roles: string;
};

export type RenterJwtUserPayload = BaseJwtUserPayload & {
  driver_license_no?: string;
  address?: string;
  date_of_birth?: Date;
  risk_score?: number;
};

export type StaffJwtUserPayload = BaseJwtUserPayload & {
  employee_code: string;
  position: string;
  hire_date: Date;
};

export type AdminJwtUserPayload = BaseJwtUserPayload & {
  title?: string;
  notes?: string;
  hire_date: Date;
};
