# Firebase Deployment Quickstart

> **Quick Reference Guide** - Essential commands and steps for deploying Isntgram to `isntgram.mjames.dev`

## 🚀 Essential Commands

### Initial Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting
firebase init functions

# Select options:
# - Use existing project or create new
# - Public directory: build
# - Single-page app: Yes
# - Functions runtime: Python 3.11
```

### Build & Deploy
```bash
# Build frontend
npm run build:prod

# Deploy backend (Cloud Functions)
firebase deploy --only functions

# Deploy frontend (Firebase Hosting)
firebase deploy --only hosting:isntgram

# Deploy everything
firebase deploy
```

### Database Setup
```bash
# Create Cloud SQL instance
gcloud sql instances create isntgram-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create isntgram --instance=isntgram-db

# Set password
gcloud sql users set-password postgres \
  --instance=isntgram-db \
  --password=your-secure-password
```

### Environment Variables
```bash
# Set Firebase Functions config
firebase functions:config:set \
  database.url="postgresql://postgres:password@/isntgram?host=/cloudsql/your-project:us-central1:isntgram-db" \
  aws.access_key_id="your-aws-key" \
  aws.secret_access_key="your-aws-secret" \
  aws.bucket_name="isntgram"
```

## 📁 Required Files

### firebase.json
```json
{
  "hosting": {
    "target": "isntgram",
    "public": "build",
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  },
  "functions": {
    "source": "functions",
    "runtime": "python311"
  },
  "targets": {
    "isntgram": {
      "hosting": {"site": "isntgram"}
    }
  }
}
```

### functions/main.py
```python
import functions_framework
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
from app import app

@functions_framework.http
def isntgram_api(request):
    with app.request_context(request.environ):
        return app.full_dispatch_request()
```

### functions/requirements.txt
```txt
functions-framework==3.*
flask==3.1.1
flask-sqlalchemy==3.1.1
flask-migrate==4.0.5
flask-login==0.6.3
flask-wtf==1.2.1
flask-cors==4.0.0
psycopg2-binary==2.9.9
boto3==1.34.0
```

## 🔧 Configuration Updates

### Update vite.config.js
```javascript
server: {
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

### Update package.json scripts
```json
{
  "scripts": {
    "build:prod": "tsc && vite build",
    "deploy:frontend": "npm run build:prod && firebase deploy --only hosting:isntgram",
    "deploy:functions": "firebase deploy --only functions",
    "deploy:all": "npm run build:prod && firebase deploy"
  }
}
```

## 🧪 Testing Commands

### Local Testing
```bash
# Test functions locally
cd functions
functions-framework --target=isntgram_api --port=8080

# Test API
curl http://localhost:8080/api/auth

# Test frontend build
npm run build:prod
npm run preview
```

### Production Testing
```bash
# Test deployed API
curl https://us-central1-your-project.cloudfunctions.net/isntgram_api/api/auth

# Test frontend
curl -I https://isntgram.mjames.dev
```

## 🔍 Troubleshooting

### Common Issues
```bash
# CORS errors - Update CORS in functions/app/__init__.py
CORS(app, origins=['https://isntgram.mjames.dev'])

# Database connection - Check Cloud SQL
gcloud sql instances describe isntgram-db

# Build errors - Clear cache
rm -rf build/ node_modules/
npm install
npm run build:prod

# Function timeout - Update firebase.json
{
  "functions": {
    "timeoutSeconds": 540
  }
}
```

### Debug Commands
```bash
# Check Firebase project
firebase projects:list

# Check functions logs
firebase functions:log

# Check hosting status
firebase hosting:sites:list

# Check database connection
gcloud sql connect isntgram-db --user=postgres
```

## 📊 Monitoring

### Performance Checks
```bash
# Check function performance
firebase functions:log --only isntgram_api

# Check hosting performance
firebase hosting:channel:list

# Check database performance
gcloud sql instances describe isntgram-db
```

### Cost Monitoring
```bash
# Check billing
gcloud billing accounts list

# Set up budget alerts
gcloud billing budgets create isntgram-budget \
  --billing-account=your-billing-account \
  --budget-amount=50USD
```

## 🚨 Emergency Procedures

### Rollback Deployment
```bash
# Rollback to previous version
firebase hosting:releases:list
firebase hosting:releases:rollback VERSION_ID
```

### Database Backup
```bash
# Create backup
gcloud sql backups create --instance=isntgram-db

# Restore from backup
gcloud sql backups restore BACKUP_ID --instance=isntgram-db
```

### Emergency Contacts
- **Firebase Support**: https://firebase.google.com/support
- **Google Cloud Support**: https://cloud.google.com/support
- **AWS Support**: https://aws.amazon.com/support

---

**Quick Reference** - Use with main deployment plan for complete setup 