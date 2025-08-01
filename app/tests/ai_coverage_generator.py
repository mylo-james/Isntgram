#!/usr/bin/env python3
"""
AI-Driven 100% Backend Test Coverage Generator
Systematic implementation following the process outlined
"""

import subprocess
import sys
import os
import json
from datetime import datetime
from pathlib import Path

# Processing order as defined in our plan
PROCESSING_ORDER = [
    # Priority 1: Core functionality  
    'app/api/auth_routes.py',
    'app/api/user_routes.py', 
    'app/api/post_routes.py',
    
    # Priority 2: Social features
    'app/api/comment_routes.py',
    'app/api/like_routes.py',
    'app/api/follow_routes.py',
    
    # Priority 3: Supporting features
    'app/api/aws_routes.py',
    'app/api/search_routes.py',
    'app/api/profile_routes.py',
    'app/api/note_routes.py',
    
    # Priority 4: Data models
    'app/models/user.py',
    'app/models/post.py',
    'app/models/comment.py',
    'app/models/like.py',
    'app/models/follow.py',
    
    # Priority 5: Validation schemas
    'app/schemas/auth_schemas.py',
    'app/schemas/user_schemas.py', 
    'app/schemas/post_schemas.py',
    'app/schemas/comment_schemas.py',
    'app/schemas/like_schemas.py',
    
    # Priority 6: Utilities
    'app/utils/api_utils.py',
    'app/utils/caching.py',
    'app/utils/rate_limiting.py',
    'app/utils/documentation.py'
]

def get_current_coverage():
    """Get current test coverage statistics"""
    try:
        result = subprocess.run([
            '.venv/bin/python', '-m', 'pytest', 
            'app/tests', '--cov=app', 
            '--cov-report=json', '--quiet'
        ], capture_output=True, text=True, cwd='/Users/mjames/Code/Isntgram')
        
        if os.path.exists('coverage.json'):
            with open('coverage.json', 'r') as f:
                coverage_data = json.load(f)
            return coverage_data['totals']
        return None
    except Exception as e:
        print(f"❌ Error getting coverage: {e}")
        return None

def analyze_file_for_testing(file_path):
    """
    AI analyzes a Python file to determine test requirements
    """
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Basic analysis 
        lines = content.split('\n')
        functions = [line.strip() for line in lines if line.strip().startswith('def ')]
        classes = [line.strip() for line in lines if line.strip().startswith('class ')]
        routes = [line.strip() for line in lines if '@' in line and 'route' in line]
        
        analysis = {
            'file_path': file_path,
            'file_name': os.path.basename(file_path).replace('.py', ''),
            'file_type': determine_file_type(file_path),
            'functions': functions,
            'classes': classes,
            'routes': routes,
            'line_count': len(lines),
            'complexity_score': len(functions) + len(classes) + len(routes)
        }
        
        return analysis
    except Exception as e:
        print(f"❌ Error analyzing {file_path}: {e}")
        return None

def determine_file_type(file_path):
    """Determine the type of file for testing strategy"""
    if '/api/' in file_path:
        return 'route'
    elif '/models/' in file_path:
        return 'model'
    elif '/schemas/' in file_path:
        return 'schema'
    elif '/utils/' in file_path:
        return 'util'
    else:
        return 'other'

def check_existing_test_file(file_path):
    """
    Check if a test file exists for the given file path
    """
    # Extract the file name without extension
    file_name = os.path.basename(file_path).replace('.py', '')
    
    # Map file paths to their test files
    test_file_mapping = {
        'app/api/auth_routes.py': 'app/tests/test_auth_routes.py',
        'app/api/user_routes.py': 'app/tests/test_user_routes.py',
        'app/api/post_routes.py': 'app/tests/test_post_routes.py',
        'app/api/comment_routes.py': 'app/tests/test_comment_routes.py',
        'app/api/like_routes.py': 'app/tests/test_like_routes.py',
        'app/api/follow_routes.py': 'app/tests/test_follow_routes.py',
        'app/api/aws_routes.py': 'app/tests/test_aws_routes.py',
        'app/api/search_routes.py': 'app/tests/test_search_routes.py',
        'app/api/profile_routes.py': 'app/tests/test_profile_routes.py',
        'app/api/note_routes.py': 'app/tests/test_note_routes.py',
        # Model tests are in a comprehensive test file
        'app/models/user.py': 'app/tests/test_models.py',
        'app/models/post.py': 'app/tests/test_models.py',
        'app/models/comment.py': 'app/tests/test_models.py',
        'app/models/like.py': 'app/tests/test_models.py',
        'app/models/follow.py': 'app/tests/test_models.py',
        # Schema tests
        'app/schemas/auth_schemas.py': 'app/tests/test_auth_schemas.py',
        'app/schemas/user_schemas.py': 'app/tests/test_user_schemas.py',
        'app/schemas/post_schemas.py': 'app/tests/test_post_schemas.py',
        'app/schemas/comment_schemas.py': 'app/tests/test_comment_schemas.py',
        'app/schemas/like_schemas.py': 'app/tests/test_like_schemas.py',
        # Utility tests
        'app/utils/api_utils.py': 'app/tests/test_api_utils.py',
    }
    
    test_file_path = test_file_mapping.get(file_path)
    
    if test_file_path and os.path.exists(test_file_path):
        # Count test methods in the file
        try:
            with open(test_file_path, 'r') as f:
                content = f.read()
                # Count test methods (lines starting with "def test_")
                test_count = len([line for line in content.split('\n') 
                                if line.strip().startswith('def test_')])
            return {
                'exists': True,
                'path': test_file_path,
                'test_count': test_count
            }
        except Exception as e:
            print(f"❌ Error reading test file {test_file_path}: {e}")
            return {
                'exists': True,
                'path': test_file_path,
                'test_count': 0
            }
    else:
        return {
            'exists': False,
            'path': f'app/tests/test_{file_name}.py',
            'test_count': 0
        }

def process_single_file(file_path):
    """
    Complete workflow for testing a single file
    """
    print(f"\\n🎯 Processing: {file_path}")
    print("-" * 50)
    
    # 1. Analyze file
    analysis = analyze_file_for_testing(file_path)
    if not analysis:
        return False
        
    print(f"📊 Analysis: {analysis['complexity_score']} complexity, {len(analysis['functions'])} functions, {len(analysis['routes'])} routes")
    
    # 2. Check existing tests
    test_info = check_existing_test_file(file_path)
    print(f"📋 Tests: {'✅ Exists' if test_info['exists'] else '❌ Missing'} ({test_info['test_count']} tests)")
    
    # 3. Return analysis for manual processing
    return {
        'file_path': file_path,
        'analysis': analysis,
        'test_info': test_info,
        'needs_work': not test_info['exists'] or test_info['test_count'] < analysis['complexity_score']
    }

def ai_generate_100_percent_coverage():
    """
    Main AI function to analyze what needs to be done for 100% coverage
    """
    print("🤖 AI Backend Test Coverage Analysis Starting...")
    print("=" * 60)
    
    # Get baseline coverage
    baseline = get_current_coverage()
    if baseline:
        print(f"📊 Current Coverage: {baseline['percent_covered']:.1f}% ({baseline['covered_lines']}/{baseline['num_statements']} lines)")
    else:
        print("📊 Current Coverage: Unable to determine")
    
    print(f"\\n🎯 Analyzing {len(PROCESSING_ORDER)} backend files...")
    print("=" * 60)
    
    # Process each file
    results = []
    needs_work_count = 0
    
    for file_path in PROCESSING_ORDER:
        if os.path.exists(file_path):
            result = process_single_file(file_path)
            if result:
                results.append(result)
                if result['needs_work']:
                    needs_work_count += 1
        else:
            print(f"⚠️  File not found: {file_path}")
    
    # Summary
    print(f"\\n📋 ANALYSIS SUMMARY")
    print("=" * 60)
    print(f"Files analyzed: {len(results)}")
    print(f"Files needing work: {needs_work_count}")
    print(f"Files with adequate tests: {len(results) - needs_work_count}")
    
    # Prioritized recommendations
    print(f"\\n🚀 NEXT STEPS (Priority Order)")
    print("=" * 60)
    
    priority_files = [r for r in results if r['needs_work']][:5]  # Top 5 priority
    
    for i, result in enumerate(priority_files, 1):
        analysis = result['analysis']
        test_info = result['test_info']
        
        print(f"{i}. {result['file_path']}")
        print(f"   Type: {analysis['file_type']}")
        print(f"   Complexity: {analysis['complexity_score']} (Functions: {len(analysis['functions'])}, Routes: {len(analysis['routes'])})")
        print(f"   Current Tests: {test_info['test_count']}")
        print(f"   Status: {'Update needed' if test_info['exists'] else 'Create new test file'}")
        print()
    
    return results

if __name__ == "__main__":
    results = ai_generate_100_percent_coverage()
    
    # Save results for reference
    output = {
        'timestamp': datetime.now().isoformat(),
        'analysis_results': results,
        'processing_order': PROCESSING_ORDER
    }
    
    with open('app/tests/coverage_analysis.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print("💾 Analysis saved to: app/tests/coverage_analysis.json")
    print("🎯 Ready to begin systematic test implementation!")
