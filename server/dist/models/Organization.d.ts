import mongoose, { Document } from 'mongoose';
import { Organization } from '../types';
export interface IOrganization extends Omit<Organization, '_id'>, Document {
}
declare const _default: mongoose.Model<IOrganization, {}, {}, {}, mongoose.Document<unknown, {}, IOrganization, {}, {}> & IOrganization & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Organization.d.ts.map