import { BaseDBEntity } from "@/lib/database/types";

export interface Permission extends BaseDBEntity {
  name: string;
  description: string;
}
export default Permission;
