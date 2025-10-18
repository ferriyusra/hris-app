export type EmployeeFormState = {
  status?: string;
  errors?: {
    id?: string[];
    full_name?: string[];
    position?: string[];
    phone_number?: string[];
    is_active?: string[];
    _form?: string[];
  };
};
