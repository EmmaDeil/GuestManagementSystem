"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const guests_1 = __importDefault(require("./routes/guests"));
const organizations_1 = __importDefault(require("./routes/organizations"));
const qr_1 = __importDefault(require("./routes/qr"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to MongoDB
(0, database_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Guest Management API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/organizations', organizations_1.default);
app.use('/api/guests', guests_1.default);
app.use('/api/qr', qr_1.default);
app.use('/api/dashboard', dashboard_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=index.js.map