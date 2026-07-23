import { BaseDBEntity } from "@/lib/database/types";

export interface Role extends BaseDBEntity {
  name: string;
  description: string;
  permissions: string[];
}
export default Role;
