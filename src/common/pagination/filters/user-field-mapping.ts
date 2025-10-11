import { FilterField } from 'src/common/utils/type';

export const UserFieldMapping: Record<string, FilterField> = {
  role: {
    field: 'role',
    type: 'string',
  },
  search: {
    field: 'search',
    type: 'string',
    customWhere: (value: string) => {
      const regex = new RegExp(value, 'i');
      return [
        { email: regex },
        { full_name: regex },
        { phone_number: regex },
      ];
    },
  },
  position: {
    field: 'roleExtra.position',
    type: 'string',
  },
  employee_code: {
    field: 'roleExtra.employee_code',
    type: 'string',
  },
  is_active: {
    field: 'is_active',
    type: 'boolean',
  },
};
