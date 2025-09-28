#!/usr/bin/env python3
"""
Backend API Testing for Lucky Shot Pool Hall Management System
Tests the FastAPI backend endpoints and verifies functionality.
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
    return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("❌ Could not find REACT_APP_BACKEND_URL in frontend/.env")
    sys.exit(1)

API_BASE = f"{BACKEND_URL}/api"

def test_backend_health():
    """Test basic backend connectivity and health"""
    print("🔍 Testing Backend Health...")
    
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("✅ Backend health check passed")
                return True
            else:
                print(f"❌ Unexpected response: {data}")
                return False
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_status_endpoints():
    """Test status check CRUD operations"""
    print("\n🔍 Testing Status Check Endpoints...")
    
    # Test POST /api/status
    test_data = {
        "client_name": "test_client_revenue_verification"
    }
    
    try:
        # Create status check
        response = requests.post(f"{API_BASE}/status", json=test_data, timeout=10)
        if response.status_code == 200:
            created_status = response.json()
            print("✅ POST /api/status - Status check created successfully")
            print(f"   Created ID: {created_status.get('id')}")
            print(f"   Client Name: {created_status.get('client_name')}")
            
            # Verify required fields
            if not created_status.get('id') or not created_status.get('timestamp'):
                print("❌ Missing required fields in response")
                return False
                
        else:
            print(f"❌ POST /api/status failed with status {response.status_code}")
            return False
            
        # Test GET /api/status
        response = requests.get(f"{API_BASE}/status", timeout=10)
        if response.status_code == 200:
            status_list = response.json()
            print("✅ GET /api/status - Status checks retrieved successfully")
            print(f"   Total status checks: {len(status_list)}")
            
            # Verify our test data is in the list
            test_found = any(s.get('client_name') == 'test_client_revenue_verification' for s in status_list)
            if test_found:
                print("✅ Test status check found in list")
            else:
                print("❌ Test status check not found in list")
                return False
                
        else:
            print(f"❌ GET /api/status failed with status {response.status_code}")
            return False
            
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Status endpoint test failed: {e}")
        return False

def test_cors_headers():
    """Test CORS configuration"""
    print("\n🔍 Testing CORS Configuration...")
    
    try:
        response = requests.options(f"{API_BASE}/", timeout=10)
        headers = response.headers
        
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers'
        ]
        
        cors_ok = True
        for header in cors_headers:
            if header in headers:
                print(f"✅ {header}: {headers[header]}")
            else:
                print(f"❌ Missing CORS header: {header}")
                cors_ok = False
                
        return cors_ok
        
    except requests.exceptions.RequestException as e:
        print(f"❌ CORS test failed: {e}")
        return False

def verify_frontend_backend_integration():
    """Verify that frontend can communicate with backend"""
    print("\n🔍 Testing Frontend-Backend Integration...")
    
    print(f"   Frontend URL configured: {BACKEND_URL}")
    print(f"   API Base URL: {API_BASE}")
    
    # Test that the URLs are properly configured
    if not BACKEND_URL.startswith('https://'):
        print("❌ Backend URL should use HTTPS in production")
        return False
        
    if '/api' not in API_BASE:
        print("❌ API routes should be prefixed with /api")
        return False
        
    print("✅ URL configuration looks correct")
    return True

def run_backend_tests():
    """Run all backend tests"""
    print("=" * 60)
    print("🚀 LUCKY SHOT POOL HALL - BACKEND API TESTING")
    print("=" * 60)
    
    test_results = []
    
    # Test backend health
    test_results.append(("Backend Health", test_backend_health()))
    
    # Test status endpoints
    test_results.append(("Status Endpoints", test_status_endpoints()))
    
    # Test CORS
    test_results.append(("CORS Configuration", test_cors_headers()))
    
    # Test integration
    test_results.append(("Frontend-Backend Integration", verify_frontend_backend_integration()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 BACKEND TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<30} {status}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend tests passed!")
        return True
    else:
        print("⚠️  Some backend tests failed")
        return False

if __name__ == "__main__":
    success = run_backend_tests()
    sys.exit(0 if success else 1)