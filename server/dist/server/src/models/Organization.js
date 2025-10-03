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
const OrganizationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true,
        maxlength: [100, 'Organization name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    contactPerson: {
        type: String,
        required: [true, 'Contact person is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    locations: [{
            type: String,
            trim: true
        }],
    staffMembers: [{
            type: String,
            trim: true
        }],
    minGuestVisitMinutes: {
        type: Number,
        default: 15,
        min: [5, 'Minimum visit time cannot be less than 5 minutes'],
        max: [480, 'Minimum visit time cannot exceed 8 hours']
    },
    qrCodeUrl: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Indexes for better performance
// Note: email already has unique index, so we don't need to duplicate it
OrganizationSchema.index({ isActive: 1 });
exports.default = mongoose_1.default.model('Organization', OrganizationSchema);
//# sourceMappingURL=Organization.js.map