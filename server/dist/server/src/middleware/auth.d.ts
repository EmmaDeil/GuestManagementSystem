import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    organization?: any;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export default authenticateToken;
//# sourceMappingURL=auth.d.ts.map