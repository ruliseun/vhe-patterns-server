export interface ICreatePermission {
  permissionName: string;
  description: string;
}

export interface ICreateRole {
  roleName: string;
  permissions: number[];
}

export interface IRoleMatrix {
  permissions: { name: string; description: string }[];
  roles: string[];
  matrix: {
    [permissionName: string]: {
      description: string;
      roles: { [roleName: string]: boolean };
    };
  };
}
