"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const GuestSchema = new mongoose_1.Schema({
    guestName: {
        type: String,
        required: [true, 'Guest name is required'],
        trim: true,
        maxlength: [100, 'Guest name cannot exceed 100 characters']
    },
    guestPhone: {
        type: String,
        required: [true, 'Guest phone is required'],
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    guestEmail: {
        type: String,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        default: null
    },
    guestCode: {
        type: String,
        required: true,
        unique: true,
        length: 6,
        match: [/^\d{6}$/, 'Guest code must be a 6-digit number']
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization ID is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    personToSee: {
        type: String,
        required: [true, 'Person to see is required'],
        trim: true
    },
    purpose: {
        type: String,
        trim: true,
        maxlength: [200, 'Purpose cannot exceed 200 characters']
    },
    signInTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    signOutTime: {
        type: Date,
        default: null
    },
    expectedDuration: {
        type: Number,
        required: [true, 'Expected duration is required'],
        min: [5, 'Expected duration must be at least 5 minutes'],
        max: [480, 'Expected duration cannot exceed 8 hours']
    },
    minVisitDuration: {
        type: Number,
        required: true,
        min: [5, 'Minimum visit duration must be at least 5 minutes']
    },
    idCardNumber: {
        type: String,
        default: null,
        trim: true
    },
    idCardAssigned: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['signed-in', 'signed-out', 'expired'],
        default: 'signed-in'
    },
    securityNotified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Indexes for better performance
// Note: guestCode already has unique index, so we don't need to duplicate it
GuestSchema.index({ organizationId: 1 });
GuestSchema.index({ status: 1 });
GuestSchema.index({ signInTime: 1 });
GuestSchema.index({ createdAt: 1 });
// Compound indexes
GuestSchema.index({ organizationId: 1, status: 1 });
GuestSchema.index({ organizationId: 1, signInTime: 1 });
exports.default = mongoose_1.default.model('Guest', GuestSchema);
