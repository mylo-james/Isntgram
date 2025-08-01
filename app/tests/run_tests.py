#!/usr/bin/env python3
"""
Simple test runner for Isntgram backend API tests
Run with: python app/tests/run_tests.py
"""
import subprocess
import sys
import os

def run_tests():
    """Run all backend API tests."""
    print("🧪 Running Isntgram Backend API Tests")
    print("=" * 50)
    
    # Change to project root
    os.chdir('/Users/mjames/Code/Isntgram')
    
    # Run pytest with our single comprehensive test file
    cmd = [
        '.venv/bin/python', '-m', 'pytest', 
        'app/tests/test_backend_routes.py',
        '-v', '--tb=short'
    ]
    
    result = subprocess.run(cmd, capture_output=False)
    
    if result.returncode == 0:
        print("\n✅ All tests passed! Backend is ready.")
    else:
        print("\n❌ Some tests failed. Check output above.")
    
    return result.returncode

if __name__ == "__main__":
    sys.exit(run_tests())
