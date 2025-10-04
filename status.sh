#!/bin/bash

echo "🔍 Guest Management System Status Check"
echo "========================================"
echo ""

# Check backend
echo "📦 Checking Backend (http://localhost:5000)..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend is running"
    backend_status=$(curl -s http://localhost:5000/api/health | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"//')
    echo "   Status: $backend_status"
else
    echo "❌ Backend is not responding"
fi

echo ""

# Check frontend
echo "🌐 Checking Frontend (http://localhost:3000)..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎯 Quick Links:"
echo "   Admin Dashboard: http://localhost:3000/admin/dashboard"
echo "   Guest Registration: http://localhost:3000"
echo "   API Health: http://localhost:5000/api/health"
echo ""