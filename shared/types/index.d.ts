export interface Guest {
    _id?: string;
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    guestCode: string;
    organizationId: string;
    location: string;
    personToSee: string;
    purpose?: string;
    signInTime: Date;
    signOutTime?: Date;
    expectedDuration: number;
    minVisitDuration: number;
    idCardNumber?: string;
    idCardAssigned: boolean;
    status: 'signed-in' | 'signed-out' | 'expired';
    securityNotified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Organization {
    _id?: string;
    name: string;
    email: string;
    password: string;
    contactPerson: string;
    phone: string;
    address: string;
    locations: string[];
    staffMembers: string[];
    minGuestVisitMinutes: number;
    qrCodeUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface QRCodeData {
    organizationId: string;
    organizationName: string;
    expiresAt?: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    organization: Omit<Organization, 'password'>;
    expiresIn: string;
}
export interface GuestRegistrationRequest {
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    organizationId: string;
    location: string;
    personToSee: string;
    purpose?: string;
    expectedDuration: number;
}
export interface GuestSignOutRequest {
    guestCode: string;
    organizationId: string;
}
export interface DashboardStats {
    totalGuests: number;
    activeGuests: number;
    todayGuests: number;
    pendingIdAssignments: number;
}
export interface GuestsListResponse {
    guests: Guest[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export type GuestStatus = 'signed-in' | 'signed-out' | 'expired';
export type OrganizationRole = 'admin' | 'security' | 'staff';
//# sourceMappingURL=index.d.ts.map