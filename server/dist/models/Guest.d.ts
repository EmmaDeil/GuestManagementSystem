import mongoose, { Document } from 'mongoose';
import { Guest } from '../types';
export interface IGuest extends Omit<Guest, '_id'>, Document {
}
declare const _default: mongoose.Model<IGuest, {}, {}, {}, mongoose.Document<unknown, {}, IGuest, {}, {}> & IGuest & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Guest.d.ts.map