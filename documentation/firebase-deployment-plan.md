# Firebase Deployment Plan - Subdomain Approach

> **Isntgram Deployment to Firebase** - Complete guide for deploying to `isntgram.mjames.dev`

[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Cloud Functions](https://img.shields.io/badge/Cloud_Functions-Python-blue?style=flat)](https://cloud.google.com/functions)
[![Cloud SQL](https://img.shields.io/badge/Cloud_SQL-PostgreSQL-green?style=flat)](https://cloud.google.com/sql)

## 🎯 Deployment Strategy

**Target**: `isntgram.mjames.dev` (subdomain approach)
**Architecture**: Firebase Hosting (Frontend) + Cloud Functions (Backend) + Cloud SQL (Database)

### Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   Database      │
│                 │    │                  │    │                 │
│ Firebase Hosting│◄──►│ Cloud Functions  │◄──►│ Cloud SQL       │
│ isntgram.mjames │    │ Python/Flask     │    │ PostgreSQL      │
│ .dev            │    │ API Endpoints    │    │ Instance        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Pre-Deployment Checklist

### ✅ Prerequisites

- [ ] Firebase account with billing enabled
- [ ] Google Cloud project with Cloud SQL API enabled
- [ ] AWS S3 bucket configured for image storage
- [ ] Domain `mjames.dev` already hosted on Firebase
- [ ] Node.js 18+ and Python 3.11+ installed locally

### ✅ Required Services

- [ ] Firebase Hosting (Frontend)
- [ ] Cloud Functions (Backend API)
- [ ] Cloud SQL (PostgreSQL Database)
- [ ] Cloud Storage (Optional - for file uploads)

## 🚀 Phase 1: Firebase Project Setup

### Step 1.1: Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

### Step 1.2: Initialize Firebase Project

```bash
# Navigate to project root
cd /Users/mjames/Code/Isntgram

# Initialize Firebase project
firebase init

# Select the following options:
# - Choose "Use an existing project" or create new
# - Select "Hosting: Configure files for Firebase Hosting"
# - Select "Functions: Configure a Cloud Functions directory and its files"
# - Choose Python runtime for Functions
# - Install dependencies: Yes
```

### Step 1.3: Configure Firebase Project Structure

```bash
# Expected structure after initialization:
Isntgram/
├── firebase.json
├── .firebaserc
├── functions/
│   ├── main.py
│   ├── requirements.txt
│   └── app/ (copied from root app/)
└── build/ (Vite output)
```

## 🏗️ Phase 2: Frontend Configuration

### Step 2.1: Update Vite Configuration

```javascript
// vite.config.js - Update server proxy for production
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: process.env.NODE_ENV === 'production' 
        ? 'https://us-central1-your-project.cloudfunctions.net' 
        : 'http://127.0.0.1:8080',
      changeOrigin: true,
    },
  },
},
```

### Step 2.2: Create Firebase Hosting Configuration

```json
// firebase.json
{
  "hosting": {
    "target": "isntgram",
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "python311"
  },
  "targets": {
    "isntgram": {
      "hosting": {
        "site": "isntgram"
      }
    }
  }
}
```

### Step 2.3: Update Package.json Scripts

```json
{
  "scripts": {
    "build:prod": "tsc && vite build",
    "deploy:frontend": "npm run build:prod && firebase deploy --only hosting:isntgram",
    "deploy:functions": "firebase deploy --only functions",
    "deploy:all": "npm run build:prod && firebase deploy",
    "deploy:staging": "npm run build:prod && firebase deploy --only hosting:isntgram --project staging"
  }
}
```

## 🔧 Phase 3: Backend Cloud Functions Setup

### Step 3.1: Create Cloud Functions Entry Point

```python
# functions/main.py
import functions_framework
from flask import Flask, request
import sys
import os

# Add app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app import app

@functions_framework.http
def isntgram_api(request):
    """HTTP Cloud Function for Isntgram API."""
    with app.request_context(request.environ):
        return app.full_dispatch_request()
```

### Step 3.2: Copy Backend Code to Functions

```bash
# Copy the entire app directory to functions
cp -r app/ functions/

# Copy requirements and config files
cp requirements.txt functions/
cp config.py functions/
cp -r config/ functions/
```

### Step 3.3: Update Functions Requirements

```txt
# functions/requirements.txt
functions-framework==3.*
flask==3.1.1
flask-sqlalchemy==3.1.1
flask-migrate==4.0.5
flask-login==0.6.3
flask-wtf==1.2.1
flask-cors==4.0.0
psycopg2-binary==2.9.9
boto3==1.34.0
gunicorn==21.2.0
```

### Step 3.4: Update App Configuration for Cloud Functions

```python
# functions/app/__init__.py - Add at the top
import os
os.environ['FLASK_ENV'] = 'production'

# Update database configuration
if os.environ.get('FLASK_ENV') == 'production':
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 10,
        'pool_recycle': 300,
        'pool_pre_ping': True
    }
```

## 🗄️ Phase 4: Database Setup

### Step 4.1: Create Cloud SQL Instance

```bash
# Create PostgreSQL instance
gcloud sql instances create isntgram-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=02:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=02

# Create database
gcloud sql databases create isntgram --instance=isntgram-db

# Set up user
gcloud sql users set-password postgres \
  --instance=isntgram-db \
  --password=your-secure-password
```

### Step 4.2: Configure Database Connection

```bash
# Get connection info
gcloud sql instances describe isntgram-db --format="value(connectionName)"

# Expected output: your-project:us-central1:isntgram-db
```

### Step 4.3: Set Environment Variables

```bash
# Set Firebase Functions environment variables
firebase functions:config:set \
  database.url="postgresql://postgres:password@/isntgram?host=/cloudsql/your-project:us-central1:isntgram-db" \
  aws.access_key_id="your-aws-key" \
  aws.secret_access_key="your-aws-secret" \
  aws.bucket_name="isntgram" \
  flask.secret_key="your-secret-key"
```

## 🔐 Phase 5: Security & Environment Configuration

### Step 5.1: Configure CORS for Production

```python
# functions/app/__init__.py - Update CORS configuration
from flask_cors import CORS

if os.environ.get('FLASK_ENV') == 'production':
    CORS(app, origins=[
        'https://isntgram.mjames.dev',
        'https://www.isntgram.mjames.dev'
    ])
else:
    CORS(app)
```

### Step 5.2: Update CSRF Configuration

```python
# functions/app/__init__.py - Update CSRF settings
@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=True,  # Always secure in production
        samesite='Strict',
        httponly=True,
        domain='.mjames.dev'  # Allow subdomain access
    )
    return response
```

### Step 5.3: Configure AWS S3 for Production

```python
# functions/app/api/aws_routes.py - Update S3 configuration
import boto3
import os

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name='us-east-1'
)
```

## 🚀 Phase 6: Deployment Process

### Step 6.1: Build and Test Locally

```bash
# Build frontend
npm run build:prod

# Test functions locally
cd functions
functions-framework --target=isntgram_api --port=8080

# Test in another terminal
curl http://localhost:8080/api/auth
```

### Step 6.2: Deploy Backend First

```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Verify deployment
curl https://us-central1-your-project.cloudfunctions.net/isntgram_api/api/auth
```

### Step 6.3: Deploy Frontend

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting:isntgram

# Verify deployment
curl -I https://isntgram.mjames.dev
```

### Step 6.4: Set Up Custom Domain

```bash
# Add custom domain in Firebase Console
# 1. Go to Firebase Console → Hosting
# 2. Click "Add custom domain"
# 3. Enter: isntgram.mjames.dev
# 4. Follow DNS configuration instructions
```

## 🔄 Phase 7: CI/CD Setup

### Step 7.1: Create GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run type-check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:prod
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
          channelId: live
```

### Step 7.2: Set Up Firebase Service Account

```bash
# Generate service account key
firebase projects:list
firebase projects:addfirebase your-project-id

# Download service account key
firebase projects:list
# Copy the service account key to GitHub Secrets as FIREBASE_SERVICE_ACCOUNT
```

## 📊 Phase 8: Monitoring & Maintenance

### Step 8.1: Set Up Monitoring

```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Set up logging
firebase functions:config:set logging.level="INFO"
```

### Step 8.2: Database Migration

```bash
# Run database migrations
cd functions
flask db upgrade

# Verify tables
flask db current
```

### Step 8.3: Performance Optimization

```bash
# Enable Cloud CDN
gcloud compute url-maps create isntgram-lb \
  --default-service isntgram-backend

# Set up caching headers
firebase hosting:channel:deploy preview --expires 1d
```

## 🧪 Phase 9: Testing & Validation

### Step 9.1: API Testing

```bash
# Test authentication
curl -X POST https://us-central1-your-project.cloudfunctions.net/isntgram_api/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123",
    "confirm_password": "TestPassword123"
  }'

# Test frontend
curl -I https://isntgram.mjames.dev
```

### Step 9.2: End-to-End Testing

```bash
# Test complete user flow
# 1. Visit https://isntgram.mjames.dev
# 2. Register new account
# 3. Upload image
# 4. Create post
# 5. Like and comment
# 6. Follow other users
```

## 🔧 Phase 10: Troubleshooting

### Common Issues & Solutions

#### Issue 1: CORS Errors

```python
# Solution: Update CORS configuration
CORS(app, origins=['https://isntgram.mjames.dev'], supports_credentials=True)
```

#### Issue 2: Database Connection Errors

```bash
# Solution: Check Cloud SQL connection
gcloud sql instances describe isntgram-db
gcloud sql connect isntgram-db --user=postgres
```

#### Issue 3: Function Timeout

```python
# Solution: Increase timeout in firebase.json
{
  "functions": {
    "timeoutSeconds": 540
  }
}
```

#### Issue 4: Build Errors

```bash
# Solution: Clear cache and rebuild
rm -rf build/ node_modules/
npm install
npm run build:prod
```

## 📈 Phase 11: Production Optimization

### Performance Optimization

```bash
# Enable Cloud CDN
gcloud compute url-maps create isntgram-cdn

# Set up caching
firebase hosting:channel:deploy production --expires 30d
```

### Security Hardening

```bash
# Enable HTTPS redirect
firebase hosting:channel:deploy production --only hosting

# Set security headers
# Add to firebase.json headers section
```

### Cost Optimization

```bash
# Monitor usage
gcloud billing budgets create isntgram-budget \
  --billing-account=your-billing-account \
  --budget-amount=50USD \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=0.9
```

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] Firebase CLI installed and logged in
- [ ] Google Cloud project created with billing enabled
- [ ] Cloud SQL API enabled
- [ ] AWS S3 bucket configured
- [ ] Domain DNS configured

### Backend Deployment

- [ ] Cloud Functions deployed successfully
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] API endpoints responding
- [ ] CORS configured correctly

### Frontend Deployment

- [ ] Build completed without errors
- [ ] Firebase Hosting deployed
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Static assets loading

### Post-Deployment

- [ ] End-to-end testing completed
- [ ] Performance monitoring active
- [ ] Error logging configured
- [ ] Backup strategy implemented
- [ ] CI/CD pipeline working

## 🎯 Success Metrics

### Performance Targets

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms
- **Image Upload Time**: < 5 seconds

### Reliability Targets

- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%
- **Recovery Time**: < 5 minutes

### Cost Targets

- **Monthly Cost**: < $50
- **Storage Growth**: < 10GB/month
- **Bandwidth**: < 100GB/month

## 📞 Support & Maintenance

### Monitoring Tools

- Firebase Console: Hosting & Functions
- Google Cloud Console: SQL & Monitoring
- AWS Console: S3 & CloudWatch

### Maintenance Schedule

- **Daily**: Check error logs
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit

### Emergency Contacts

- Firebase Support: <https://firebase.google.com/support>
- Google Cloud Support: <https://cloud.google.com/support>
- AWS Support: <https://aws.amazon.com/support>

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Ready for Implementation
