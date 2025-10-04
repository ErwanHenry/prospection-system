# 🚀 Production Deployment Guide

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Server Setup](#server-setup)
3. [Security Configuration](#security-configuration)
4. [Application Deployment](#application-deployment)
5. [Process Management](#process-management)
6. [Reverse Proxy Setup](#reverse-proxy-setup)
7. [SSL/TLS Configuration](#ssltls-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup Strategy](#backup-strategy)
10. [Performance Optimization](#performance-optimization)
11. [Docker Deployment](#docker-deployment)
12. [Cloud Deployment](#cloud-deployment)

---

## ✅ Pre-Deployment Checklist

### Environment Preparation
- [ ] **Server Requirements**: Ubuntu 20.04+ or CentOS 8+
- [ ] **Node.js Version**: 18.17.0 or higher
- [ ] **RAM**: Minimum 2GB, Recommended 4GB+
- [ ] **Storage**: Minimum 20GB free space
- [ ] **Network**: HTTP/HTTPS ports (80/443) accessible
- [ ] **Domain**: DNS configured and pointing to server

### Application Requirements
- [ ] **Environment Variables**: All production values configured
- [ ] **API Keys**: Apollo.io, OpenAI (if used), Google Cloud
- [ ] **Credentials**: Google OAuth credentials.json file
- [ ] **Email Setup**: Gmail App Password configured
- [ ] **SSL Certificate**: Valid SSL certificate obtained
- [ ] **Database**: Google Sheets configured and accessible

### Security Requirements
- [ ] **Firewall**: UFW or iptables configured
- [ ] **SSH Keys**: Password authentication disabled
- [ ] **User Account**: Non-root user created
- [ ] **Fail2Ban**: Intrusion prevention configured
- [ ] **Updates**: System packages updated

---

## 🖥️ Server Setup

### 1. Initial Server Configuration

**Update System:**
```bash
# Update package lists and upgrade system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx ufw fail2ban

# Create application user
sudo adduser --system --group --home /opt/prospection prospection
sudo usermod -aG sudo prospection
```

**Configure Firewall:**
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Verify status
sudo ufw status
```

### 2. Node.js Installation

**Install Node.js 18.x:**
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 8.x.x or higher
```

**Install Global Dependencies:**
```bash
# Install PM2 for process management
sudo npm install -g pm2

# Install additional utilities
sudo npm install -g nodemon eslint
```

### 3. Application Directory Setup

**Create Directory Structure:**
```bash
# Switch to application user
sudo su - prospection

# Create application directories
mkdir -p /opt/prospection/{app,logs,backups,ssl}
cd /opt/prospection/app

# Set permissions
sudo chown -R prospection:prospection /opt/prospection
chmod 755 /opt/prospection
```

---

## 🔒 Security Configuration

### 1. SSH Hardening

**Configure SSH:**
```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Add/modify these settings:
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

**Restart SSH:**
```bash
sudo systemctl restart ssh
```

### 2. Fail2Ban Configuration

**Configure Fail2Ban:**
```bash
# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Add custom jail for the application
sudo nano /etc/fail2ban/jail.d/prospection.conf
```

**Prospection Fail2Ban Configuration:**
```ini
[prospection-system]
enabled = true
port = http,https
protocol = tcp
filter = prospection-system
logpath = /opt/prospection/logs/app-*.log
maxretry = 5
bantime = 3600
findtime = 600

[prospection-auth]
enabled = true
port = http,https
protocol = tcp
filter = prospection-auth
logpath = /opt/prospection/logs/app-*.log
maxretry = 3
bantime = 7200
findtime = 300
```

**Create Filter Files:**
```bash
# Authentication failures filter
sudo nano /etc/fail2ban/filter.d/prospection-auth.conf
```

```ini
[Definition]
failregex = ^.*Authentication failed.*<HOST>.*$
            ^.*Invalid credentials.*<HOST>.*$
            ^.*Unauthorized access.*<HOST>.*$
ignoreregex =
```

### 3. System Limits Configuration

**Configure System Limits:**
```bash
# Edit limits configuration
sudo nano /etc/security/limits.conf

# Add limits for prospection user
prospection soft nofile 65536
prospection hard nofile 65536
prospection soft nproc 32768
prospection hard nproc 32768
```

---

## 📦 Application Deployment

### 1. Code Deployment

**Clone Repository:**
```bash
# Switch to application user
sudo su - prospection
cd /opt/prospection/app

# Clone the repository
git clone https://github.com/your-username/prospection-system.git .

# Set correct permissions
sudo chown -R prospection:prospection /opt/prospection/app
```

**Install Dependencies:**
```bash
# Install production dependencies
npm install --production --no-optional

# Verify installation
npm list --depth=0
```

### 2. Environment Configuration

**Create Production Environment File:**
```bash
# Create production environment file
nano /opt/prospection/app/.env.production
```

```bash
# Production Environment Configuration
NODE_ENV=production
PORT=8080

# Google Integration
GOOGLE_SPREADSHEET_ID=your_production_spreadsheet_id
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_PROJECT_ID=your_production_project_id

# Apollo.io Configuration
APOLLO_API_KEY=your_production_apollo_key

# Email Configuration
GMAIL_USER=your_production_email@domain.com
GMAIL_APP_PASSWORD=your_production_app_password

# LinkedIn Configuration
LINKEDIN_EMAIL=your_linkedin_email@domain.com
LINKEDIN_COOKIE=your_production_linkedin_cookie
LINKEDIN_SCRAPER_TYPE=apollo

# Security Settings
DAILY_LIMIT=100
DEFAULT_SEARCH_QUERY=CTO startup
ENABLE_AI_MESSAGES=true
ENABLE_AUTO_FOLLOWUP=true
FOLLOWUP_DELAY_DAYS=7

# Performance Settings
MAX_CONCURRENT_REQUESTS=5
REQUEST_DELAY_MS=2000
MEMORY_LIMIT_MB=1024
LOG_RETENTION_DAYS=30

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30
```

**Secure Environment File:**
```bash
# Set secure permissions
chmod 600 /opt/prospection/app/.env.production
chown prospection:prospection /opt/prospection/app/.env.production
```

### 3. Credentials Setup

**Upload Google Credentials:**
```bash
# Upload credentials.json to server
scp credentials.json prospection@your-server:/opt/prospection/app/

# Set secure permissions
sudo chown prospection:prospection /opt/prospection/app/credentials.json
sudo chmod 600 /opt/prospection/app/credentials.json
```

**SSL Certificates:**
```bash
# Create SSL directory
sudo mkdir -p /opt/prospection/ssl
sudo chown prospection:prospection /opt/prospection/ssl
sudo chmod 700 /opt/prospection/ssl
```

---

## 🔄 Process Management

### 1. PM2 Configuration

**Create PM2 Ecosystem File:**
```bash
# Create ecosystem configuration
nano /opt/prospection/app/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'prospection-system',
    script: './backend/server.js',
    instances: 2, // Use 2 instances for load balancing
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    // Logging
    log_file: '/opt/prospection/logs/pm2-combined.log',
    out_file: '/opt/prospection/logs/pm2-out.log',
    error_file: '/opt/prospection/logs/pm2-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Restart policy
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Memory management
    max_memory_restart: '1G',
    
    // Monitoring
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    
    // Environment
    env_file: '.env.production'
  }]
};
```

### 2. Start Application with PM2

**Deploy with PM2:**
```bash
# Start application in production mode
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup systemd -u prospection --hp /opt/prospection
# Follow the instructions provided by the command above

# Verify application is running
pm2 status
pm2 logs prospection-system
```

**PM2 Management Commands:**
```bash
# Monitor processes
pm2 monit

# Restart application
pm2 restart prospection-system

# Reload with zero downtime
pm2 reload prospection-system

# Stop application
pm2 stop prospection-system

# Delete application from PM2
pm2 delete prospection-system

# View logs
pm2 logs prospection-system --lines 100
```

---

## 🌐 Reverse Proxy Setup

### 1. Nginx Configuration

**Main Nginx Configuration:**
```bash
# Edit main nginx configuration
sudo nano /etc/nginx/nginx.conf
```

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # MIME
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # Include server configurations
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

**Site Configuration:**
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/prospection-system
```

```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/your-domain.com/chain.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self';" always;
    
    # Logging
    access_log /var/log/nginx/prospection-access.log main;
    error_log /var/log/nginx/prospection-error.log;
    
    # Root and index
    root /opt/prospection/app/frontend;
    index index.html;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    
    # API routes with rate limiting
    location /api/ {
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        
        # Proxy settings
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 16 8k;
    }
    
    # Authentication routes with stricter rate limiting
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static files
        location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:8080/api/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # Hide sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ ^/(\.env|package\.json|ecosystem\.config\.js|credentials\.json)$ {
        deny all;
    }
}
```

**Enable Site:**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/prospection-system /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## 🔐 SSL/TLS Configuration

### 1. Let's Encrypt Certificate

**Install Certbot:**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify certificate
sudo certbot certificates
```

**Auto-renewal Setup:**
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Custom SSL Certificate

**If using custom certificates:**
```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/private/prospection
sudo mkdir -p /etc/ssl/certs/prospection

# Upload certificates
sudo cp your-certificate.crt /etc/ssl/certs/prospection/
sudo cp your-private-key.key /etc/ssl/private/prospection/
sudo cp ca-certificate.crt /etc/ssl/certs/prospection/

# Set permissions
sudo chmod 600 /etc/ssl/private/prospection/*
sudo chmod 644 /etc/ssl/certs/prospection/*
```

---

## 📊 Monitoring & Logging

### 1. Application Monitoring

**Install Monitoring Tools:**
```bash
# Install htop for system monitoring
sudo apt install htop iotop nethogs

# Install log analysis tools
sudo apt install logwatch logrotate
```

**Create Monitoring Script:**
```bash
# Create monitoring script
sudo nano /opt/prospection/scripts/monitor.sh
```

```bash
#!/bin/bash

# System monitoring script
LOG_FILE="/opt/prospection/logs/monitor-$(date +%Y%m%d).log"

echo "=== System Monitor $(date) ===" >> $LOG_FILE

# System resources
echo "CPU Usage:" >> $LOG_FILE
top -bn1 | grep "Cpu(s)" >> $LOG_FILE

echo "Memory Usage:" >> $LOG_FILE
free -h >> $LOG_FILE

echo "Disk Usage:" >> $LOG_FILE
df -h >> $LOG_FILE

# Application status
echo "PM2 Status:" >> $LOG_FILE
pm2 jlist >> $LOG_FILE

# Network connections
echo "Network Connections:" >> $LOG_FILE
netstat -tlnp | grep :8080 >> $LOG_FILE

# Log file sizes
echo "Log File Sizes:" >> $LOG_FILE
du -sh /opt/prospection/logs/* >> $LOG_FILE

# Check application health
echo "Application Health:" >> $LOG_FILE
curl -s http://localhost:8080/api/health >> $LOG_FILE

echo "=== End Monitor ===" >> $LOG_FILE
echo "" >> $LOG_FILE
```

**Set up Cron Job:**
```bash
# Edit crontab
crontab -e

# Add monitoring job (every 15 minutes)
*/15 * * * * /opt/prospection/scripts/monitor.sh
```

### 2. Log Management

**Configure Logrotate:**
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/prospection-system
```

```
/opt/prospection/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 prospection prospection
    postrotate
        pm2 reload prospection-system
    endscript
}

/var/log/nginx/prospection-*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
```

### 3. System Metrics Collection

**Install and Configure Node Exporter (for Prometheus):**
```bash
# Download Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.0/node_exporter-1.6.0.linux-amd64.tar.gz
tar xzf node_exporter-1.6.0.linux-amd64.tar.gz
sudo cp node_exporter-1.6.0.linux-amd64/node_exporter /usr/local/bin/

# Create systemd service
sudo nano /etc/systemd/system/node_exporter.service
```

```ini
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=prospection
Group=prospection
Type=simple
ExecStart=/usr/local/bin/node_exporter --web.listen-address=:9100
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

**Start Service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

---

## 💾 Backup Strategy

### 1. Application Backup

**Create Backup Script:**
```bash
# Create backup script
nano /opt/prospection/scripts/backup.sh
```

```bash
#!/bin/bash

# Backup configuration
BACKUP_DIR="/opt/prospection/backups"
APP_DIR="/opt/prospection/app"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="prospection-backup-$DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

echo "Starting backup at $(date)"

# Backup application code (excluding node_modules)
tar -czf "$BACKUP_DIR/$BACKUP_NAME/app-code.tar.gz" \
  --exclude=node_modules \
  --exclude=logs \
  --exclude=.git \
  -C /opt/prospection app

# Backup configuration files
cp "$APP_DIR/.env.production" "$BACKUP_DIR/$BACKUP_NAME/"
cp "$APP_DIR/credentials.json" "$BACKUP_DIR/$BACKUP_NAME/"
cp "$APP_DIR/token.json" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 "$BACKUP_DIR/$BACKUP_NAME/"

# Backup logs (last 7 days)
find /opt/prospection/logs -name "*.log" -mtime -7 -exec cp {} "$BACKUP_DIR/$BACKUP_NAME/" \;

# Export Google Sheets data
curl -s "http://localhost:8080/api/sheets/data" > "$BACKUP_DIR/$BACKUP_NAME/crm-data-$DATE.json"

# Create backup info file
echo "Backup created: $(date)" > "$BACKUP_DIR/$BACKUP_NAME/backup-info.txt"
echo "Server: $(hostname)" >> "$BACKUP_DIR/$BACKUP_NAME/backup-info.txt"
echo "Application version: $(cat $APP_DIR/package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g')" >> "$BACKUP_DIR/$BACKUP_NAME/backup-info.txt"

# Compress entire backup
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"
rm -rf "$BACKUP_DIR/$BACKUP_NAME"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "prospection-backup-*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Upload to cloud storage (optional)
# aws s3 cp "$BACKUP_DIR/$BACKUP_NAME.tar.gz" s3://your-backup-bucket/
```

**Set Execute Permissions:**
```bash
chmod +x /opt/prospection/scripts/backup.sh
```

**Schedule Daily Backups:**
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/prospection/scripts/backup.sh >> /opt/prospection/logs/backup.log 2>&1
```

### 2. Database Backup (Google Sheets)

**Create CRM Backup Script:**
```bash
nano /opt/prospection/scripts/backup-crm.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/opt/prospection/backups/crm"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Export CRM data
curl -s "http://localhost:8080/api/prospects" > "$BACKUP_DIR/prospects-$DATE.json"
curl -s "http://localhost:8080/api/analytics" > "$BACKUP_DIR/analytics-$DATE.json"

# Keep last 14 days of CRM backups
find "$BACKUP_DIR" -name "prospects-*.json" -mtime +14 -delete
find "$BACKUP_DIR" -name "analytics-*.json" -mtime +14 -delete

echo "CRM backup completed: $DATE"
```

**Schedule CRM Backups:**
```bash
# Add to crontab (every 6 hours)
0 */6 * * * /opt/prospection/scripts/backup-crm.sh
```

---

## ⚡ Performance Optimization

### 1. Node.js Optimization

**Application Performance Settings:**
```bash
# Add to .env.production
NODE_OPTIONS=--max-old-space-size=2048
UV_THREADPOOL_SIZE=16
```

**PM2 Optimization:**
```javascript
// Update ecosystem.config.js
module.exports = {
  apps: [{
    name: 'prospection-system',
    script: './backend/server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    
    // Performance settings
    node_args: '--max-old-space-size=2048',
    max_memory_restart: '2G',
    
    // Advanced PM2 settings
    listen_timeout: 10000,
    kill_timeout: 5000,
    wait_ready: true,
    
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080,
      UV_THREADPOOL_SIZE: 16
    }
  }]
};
```

### 2. Nginx Optimization

**Performance Configuration:**
```nginx
# Add to nginx http block
http {
    # Worker optimization
    worker_processes auto;
    worker_connections 2048;
    
    # Buffer optimization
    client_body_buffer_size 16K;
    client_header_buffer_size 1k;
    client_max_body_size 8m;
    large_client_header_buffers 2 1k;
    
    # Timeout optimization
    client_body_timeout 12;
    client_header_timeout 12;
    keepalive_timeout 15;
    send_timeout 10;
    
    # Cache configuration
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g inactive=60m use_temp_path=off;
    
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=strict:10m rate=1r/s;
}
```

### 3. System Optimization

**Kernel Parameters:**
```bash
# Edit sysctl configuration
sudo nano /etc/sysctl.conf

# Add performance optimizations
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.core.rmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_default = 262144
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 65536 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.tcp_fin_timeout = 10
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 10000 65535

# Apply changes
sudo sysctl -p
```

---

## 🐳 Docker Deployment

### 1. Dockerfile

**Create Production Dockerfile:**
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production --silent

# Production stage
FROM node:18-alpine AS production

# Create app directory and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S prospection -u 1001

# Set working directory
WORKDIR /usr/src/app

# Copy application files
COPY --chown=prospection:nodejs . .
COPY --from=builder --chown=prospection:nodejs /app/node_modules ./node_modules

# Create required directories
RUN mkdir -p logs && \
    chown -R prospection:nodejs logs

# Switch to non-root user
USER prospection

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "backend/server.js"]
```

### 2. Docker Compose

**Production Docker Compose:**
```yaml
version: '3.8'

services:
  prospection-app:
    build: 
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: prospection-system
    restart: unless-stopped
    
    ports:
      - "3000:3000"
    
    environment:
      - NODE_ENV=production
      - PORT=3000
    
    env_file:
      - .env.production
    
    volumes:
      - ./logs:/usr/src/app/logs
      - ./credentials.json:/usr/src/app/credentials.json:ro
      - ./token.json:/usr/src/app/token.json
    
    networks:
      - prospection-network
    
    depends_on:
      - nginx
    
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: prospection-nginx
    restart: unless-stopped
    
    ports:
      - "80:80"
      - "443:443"
    
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/log/nginx:/var/log/nginx
    
    networks:
      - prospection-network
    
    depends_on:
      - prospection-app

  # Optional: Monitoring with Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: prospection-prometheus
    restart: unless-stopped
    
    ports:
      - "9090:9090"
    
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    
    networks:
      - prospection-network

networks:
  prospection-network:
    driver: bridge

volumes:
  prometheus-data:
```

**Deploy with Docker:**
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f prospection-app

# Scale application (multiple instances)
docker-compose up -d --scale prospection-app=3

# Update application
git pull
docker-compose build prospection-app
docker-compose up -d --no-deps prospection-app
```

---

## ☁️ Cloud Deployment

### 1. AWS Deployment

**AWS ECS with Fargate:**

```json
{
  "family": "prospection-system",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  
  "containerDefinitions": [
    {
      "name": "prospection-system",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/prospection-system:latest",
      
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      
      "secrets": [
        {
          "name": "GMAIL_APP_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:prospection/gmail-password"
        },
        {
          "name": "APOLLO_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:prospection/apollo-key"
        }
      ],
      
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/prospection-system",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/api/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### 2. Google Cloud Platform

**Cloud Run Deployment:**
```bash
# Build and deploy to Cloud Run
gcloud run deploy prospection-system \
  --image=gcr.io/PROJECT-ID/prospection-system \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,PORT=8080" \
  --set-secrets="GMAIL_APP_PASSWORD=gmail-password:latest,APOLLO_API_KEY=apollo-key:latest"
```

### 3. Azure Container Instances

**Azure Deployment:**
```bash
# Create container instance
az container create \
  --resource-group prospection-rg \
  --name prospection-system \
  --image myregistry.azurecr.io/prospection-system:latest \
  --cpu 2 \
  --memory 4 \
  --port 3000 \
  --environment-variables NODE_ENV=production PORT=3000 \
  --secure-environment-variables GMAIL_APP_PASSWORD=secret APOLLO_API_KEY=secret \
  --restart-policy Always
```

---

## 🎯 Post-Deployment Verification

### 1. Health Checks

**Verify Application Status:**
```bash
# Check application health
curl -f https://your-domain.com/api/health

# Check all services
systemctl status nginx
pm2 status
systemctl status fail2ban
```

### 2. Performance Testing

**Load Testing:**
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test application performance
ab -n 1000 -c 10 https://your-domain.com/api/health

# Test specific endpoints
ab -n 100 -c 5 -p search-data.json -T application/json https://your-domain.com/api/linkedin/search
```

### 3. Security Verification

**Security Scan:**
```bash
# Install nmap
sudo apt install nmap

# Scan open ports
nmap -sS -O your-domain.com

# Check SSL configuration
openssl s_client -connect your-domain.com:443

# Verify SSL rating
curl -s "https://api.ssllabs.com/api/v3/analyze?host=your-domain.com"
```

---

## 📋 Deployment Checklist

### Final Verification Checklist

- [ ] **Application Status**: All services running (PM2, Nginx, Fail2Ban)
- [ ] **Health Endpoints**: `/api/health` returns 200 OK
- [ ] **SSL Certificate**: Valid and properly configured
- [ ] **Performance**: Response times under acceptable thresholds
- [ ] **Security**: Firewall configured, unnecessary ports closed
- [ ] **Monitoring**: Log rotation and monitoring scripts active
- [ ] **Backups**: Backup scripts tested and scheduled
- [ ] **Error Handling**: Error pages configured
- [ ] **Rate Limiting**: API rate limits working
- [ ] **DNS**: Domain properly configured
- [ ] **CDN**: Content delivery network configured (if applicable)

### Rollback Plan

**If deployment fails:**
```bash
# Rollback to previous version
pm2 stop prospection-system
git checkout previous-stable-version
npm install --production
pm2 restart prospection-system

# Or restore from backup
tar -xzf /opt/prospection/backups/prospection-backup-YYYYMMDD_HHMMSS.tar.gz
# Follow restoration procedures
```

---

**🎉 Congratulations! Your AI-Powered LinkedIn Prospection System is now deployed in production!**

This deployment guide ensures your system is secure, scalable, and maintainable in a production environment. Remember to regularly update dependencies, monitor system performance, and maintain backups for optimal operation.