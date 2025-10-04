/**
 * DevOps Agent - Agent spécialisé en infrastructure et déploiement
 * Capable de gérer CI/CD, monitoring, et automatisation d'infrastructure
 */

const Agent = require('../Agent');

class DevOpsAgent extends Agent {
  constructor(config = {}) {
    super({
      id: config.id || 'devops_' + Date.now(),
      name: config.name || 'DevOps Engineer',
      type: 'devops',
      specialization: 'infrastructure_automation',
      capabilities: [
        'ci_cd_pipeline',
        'containerization',
        'infrastructure_as_code',
        'monitoring_setup',
        'security_hardening',
        'load_balancing',
        'database_management',
        'backup_automation',
        'performance_monitoring',
        'deployment_automation'
      ],
      config: {
        cloudProvider: 'aws', // 'aws', 'gcp', 'azure', 'digital_ocean'
        containerTech: 'docker', // 'docker', 'podman', 'containerd'
        orchestration: 'docker-compose', // 'docker-compose', 'kubernetes', 'swarm'
        cicdTool: 'github-actions', // 'github-actions', 'gitlab-ci', 'jenkins'
        monitoringStack: 'prometheus', // 'prometheus', 'grafana', 'datadog'
        ...config
      }
    });
    
    this.infrastructureTemplates = new Map();
    this.deploymentScripts = new Map();
    this.initializeTemplates();
  }

  async processTask(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'setup_docker_environment':
        return await this.setupDockerEnvironment(data);
      case 'create_ci_cd_pipeline':
        return await this.createCICDPipeline(data);
      case 'setup_monitoring':
        return await this.setupMonitoring(data);
      case 'configure_database':
        return await this.configureDatabase(data);
      case 'setup_reverse_proxy':
        return await this.setupReverseProxy(data);
      case 'implement_backup_strategy':
        return await this.implementBackupStrategy(data);
      case 'security_hardening':
        return await this.securityHardening(data);
      case 'performance_optimization':
        return await this.performanceOptimization(data);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  // ========== CONTAINERISATION ==========

  async setupDockerEnvironment(dockerData) {
    const { services = [], environment = 'development' } = dockerData;
    
    console.log(`🐳 DevOps configure l'environnement Docker pour ${environment}`);
    
    const dockerSetup = {
      environment,
      services,
      dockerfile: this.generateDockerfile(dockerData),
      dockerCompose: this.generateDockerCompose(dockerData),
      dockerIgnore: this.generateDockerIgnore(),
      healthChecks: this.generateHealthChecks(services),
      entrypoints: this.generateEntrypoints(services)
    };

    // Mémoriser la configuration
    this.remember(`docker_setup_${environment}`, dockerSetup);
    
    return {
      dockerSetup,
      files: {
        'Dockerfile': dockerSetup.dockerfile,
        'docker-compose.yml': dockerSetup.dockerCompose,
        '.dockerignore': dockerSetup.dockerIgnore
      },
      scripts: dockerSetup.entrypoints,
      nextSteps: this.getDockerNextSteps(dockerData)
    };
  }

  generateDockerfile(dockerData) {
    const { nodeVersion = '18', services = [] } = dockerData;
    
    return `# Dockerfile - Graixl Prospection System
FROM node:${nodeVersion}-alpine

# Métadonnées
LABEL maintainer="Graixl Team"
LABEL version="1.0.0"
LABEL description="Prospection System Backend"

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Europe/Paris

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S graixl -u 1001

# Répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY yarn.lock* ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY --chown=graixl:nodejs . .

# Installer des outils système nécessaires
RUN apk add --no-cache \\
    chromium \\
    nss \\
    freetype \\
    harfbuzz \\
    ca-certificates \\
    ttf-freefont \\
    && rm -rf /var/cache/apk/*

# Variables d'environnement pour Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Créer les répertoires nécessaires
RUN mkdir -p /app/logs /app/data /app/temp
RUN chown -R graixl:nodejs /app

# Passer à l'utilisateur non-root
USER graixl

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD node healthcheck.js

# Point d'entrée
CMD ["node", "server.js"]`;
  }

  generateDockerCompose(dockerData) {
    const { environment = 'development', services = [] } = dockerData;
    
    let compose = `# Docker Compose - Graixl Prospection System
version: '3.8'

services:
  # Application principale
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: graixl-app
    restart: unless-stopped
    ports:
      - "\${APP_PORT:-3000}:3000"
    environment:
      - NODE_ENV=\${NODE_ENV:-production}
      - DATABASE_URL=\${DATABASE_URL:-mongodb://mongo:27017/graixl}
      - REDIS_URL=\${REDIS_URL:-redis://redis:6379}
      - JWT_SECRET=\${JWT_SECRET:-your-secret-key}
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
      - ./temp:/app/temp
    depends_on:
      - mongo
      - redis
    networks:
      - graixl-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.graixl.rule=Host(\`app.graixl.local\`)"
      - "traefik.http.services.graixl.loadbalancer.server.port=3000"

  # Base de données MongoDB
  mongo:
    image: mongo:6.0
    container_name: graixl-mongo
    restart: unless-stopped
    ports:
      - "\${MONGO_PORT:-27017}:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=\${MONGO_ROOT_USER:-admin}
      - MONGO_INITDB_ROOT_PASSWORD=\${MONGO_ROOT_PASSWORD:-secure-password}
      - MONGO_INITDB_DATABASE=\${MONGO_DB:-graixl}
    volumes:
      - mongo_data:/data/db
      - ./docker/mongo/init:/docker-entrypoint-initdb.d
    networks:
      - graixl-network

  # Cache Redis
  redis:
    image: redis:7-alpine
    container_name: graixl-redis
    restart: unless-stopped
    ports:
      - "\${REDIS_PORT:-6379}:6379"
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD:-secure-redis-password}
    volumes:
      - redis_data:/data
    networks:
      - graixl-network

  # Reverse Proxy Traefik
  traefik:
    image: traefik:v3.0
    container_name: graixl-traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Dashboard
    command:
      - "--api.dashboard=true"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@graixl.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./docker/traefik/acme.json:/acme.json
    networks:
      - graixl-network`;

    // Ajouter les services de monitoring si demandés
    if (services.includes('monitoring')) {
      compose += this.generateMonitoringServices();
    }

    compose += `

# Volumes persistants
volumes:
  mongo_data:
    driver: local
  redis_data:
    driver: local

# Réseau interne
networks:
  graixl-network:
    driver: bridge`;

    return compose;
  }

  generateMonitoringServices() {
    return `

  # Monitoring - Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: graixl-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./docker/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - graixl-network

  # Visualisation - Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: graixl-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=\${GRAFANA_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./docker/grafana/provisioning:/etc/grafana/provisioning
    networks:
      - graixl-network

  # Collecteur de métriques
  node-exporter:
    image: prom/node-exporter:latest
    container_name: graixl-node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - graixl-network`;
  }

  // ========== CI/CD PIPELINE ==========

  async createCICDPipeline(pipelineData) {
    const { provider = 'github-actions', stages = [], environment } = pipelineData;
    
    console.log(`🚀 DevOps crée le pipeline CI/CD pour ${provider}`);
    
    const pipeline = {
      provider,
      stages,
      environment,
      workflow: this.generateWorkflowFile(pipelineData),
      scripts: this.generateDeploymentScripts(pipelineData),
      secrets: this.generateSecretsTemplate(pipelineData)
    };
    
    return {
      pipeline,
      files: {
        '.github/workflows/deploy.yml': pipeline.workflow,
        'scripts/deploy.sh': pipeline.scripts.deploy,
        'scripts/test.sh': pipeline.scripts.test
      },
      secrets: pipeline.secrets,
      nextSteps: this.getPipelineNextSteps(pipelineData)
    };
  }

  generateWorkflowFile(pipelineData) {
    return `# GitHub Actions Workflow - Graixl Prospection System
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: graixl/prospection-system

jobs:
  # Tests et validation
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run type checking
      run: npm run type-check

    - name: Run unit tests
      run: npm run test:unit
      env:
        NODE_ENV: test
        DATABASE_URL: mongodb://localhost:27017/graixl_test
        REDIS_URL: redis://localhost:6379

    - name: Run integration tests
      run: npm run test:integration
      env:
        NODE_ENV: test
        DATABASE_URL: mongodb://localhost:27017/graixl_test
        REDIS_URL: redis://localhost:6379

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  # Sécurité et qualité
  security:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run security audit
      run: npm audit --audit-level moderate

    - name: Run dependency check
      uses: securecodewarrior/github-action-add-sarif@v1
      with:
        sarif-file: security-audit.sarif

    - name: Scan for secrets
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: main
        head: HEAD

  # Build et publication Docker
  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: \${{ env.REGISTRY }}
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: \${{ steps.meta.outputs.tags }}
        labels: \${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # Déploiement automatique
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to production
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: \${{ secrets.PROD_HOST }}
        username: \${{ secrets.PROD_USER }}
        key: \${{ secrets.PROD_SSH_KEY }}
        script: |
          cd /opt/graixl
          docker-compose pull
          docker-compose up -d --remove-orphans
          docker system prune -f

    - name: Health check
      run: |
        timeout 300 bash -c 'until curl -f http://\${{ secrets.PROD_HOST }}/health; do sleep 5; done'

    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      if: always()
      with:
        status: \${{ job.status }}
        channel: '#deployments'
        webhook_url: \${{ secrets.SLACK_WEBHOOK }}`;
  }

  // ========== MONITORING ==========

  async setupMonitoring(monitoringData) {
    const { metrics = [], alerts = [], dashboards = [] } = monitoringData;
    
    console.log(`📊 DevOps configure le monitoring système`);
    
    const monitoring = {
      metrics,
      alerts,
      dashboards,
      prometheus: this.generatePrometheusConfig(monitoringData),
      grafana: this.generateGrafanaDashboards(dashboards),
      alertManager: this.generateAlertManagerConfig(alerts),
      healthChecks: this.generateApplicationHealthChecks()
    };
    
    return {
      monitoring,
      configs: {
        'prometheus.yml': monitoring.prometheus,
        'alertmanager.yml': monitoring.alertManager,
        'healthcheck.js': monitoring.healthChecks
      },
      dashboards: monitoring.grafana,
      nextSteps: this.getMonitoringNextSteps(monitoringData)
    };
  }

  generatePrometheusConfig(monitoringData) {
    return `# Prometheus Configuration - Graixl Monitoring
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'graixl-monitor'

# Règles d'alertes
rule_files:
  - "alerts.yml"

# Configuration Alertmanager
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

# Jobs de collecte des métriques
scrape_configs:
  # Application principale
  - job_name: 'graixl-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # Node Exporter (métriques système)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  # MongoDB Exporter
  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Traefik
  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik:8082']

  # Self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']`;
  }

  generateApplicationHealthChecks() {
    return `// Health Check Service - Graixl Prospection System
const http = require('http');
const mongoose = require('mongoose');
const redis = require('redis');

class HealthChecker {
    constructor() {
        this.checks = {
            database: this.checkDatabase.bind(this),
            redis: this.checkRedis.bind(this),
            external_apis: this.checkExternalAPIs.bind(this),
            memory: this.checkMemory.bind(this),
            disk: this.checkDisk.bind(this)
        };
    }

    async runAllChecks() {
        const results = {};
        const start = Date.now();
        
        for (const [name, check] of Object.entries(this.checks)) {
            try {
                results[name] = await check();
            } catch (error) {
                results[name] = {
                    status: 'unhealthy',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        const duration = Date.now() - start;
        const overallStatus = Object.values(results).every(r => r.status === 'healthy') 
            ? 'healthy' : 'unhealthy';
        
        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            duration: \`\${duration}ms\`,
            checks: results,
            version: process.env.APP_VERSION || '1.0.0'
        };
    }

    async checkDatabase() {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }
        
        await mongoose.connection.db.admin().ping();
        
        return {
            status: 'healthy',
            details: {
                state: 'connected',
                host: mongoose.connection.host,
                port: mongoose.connection.port
            }
        };
    }

    async checkRedis() {
        const client = redis.createClient(process.env.REDIS_URL);
        await client.connect();
        
        const pong = await client.ping();
        await client.disconnect();
        
        if (pong !== 'PONG') {
            throw new Error('Redis ping failed');
        }
        
        return {
            status: 'healthy',
            details: { response: pong }
        };
    }

    async checkExternalAPIs() {
        // Check critical external services
        const checks = [];
        
        // LinkedIn API check (mock)
        checks.push(this.checkEndpoint('https://api.linkedin.com', 'LinkedIn API'));
        
        // Email service check
        if (process.env.SMTP_HOST) {
            checks.push(this.checkSMTP());
        }
        
        const results = await Promise.allSettled(checks);
        const allHealthy = results.every(r => r.status === 'fulfilled');
        
        return {
            status: allHealthy ? 'healthy' : 'degraded',
            details: results
        };
    }

    async checkMemory() {
        const usage = process.memoryUsage();
        const totalMB = Math.round(usage.rss / 1024 / 1024);
        const heapMB = Math.round(usage.heapUsed / 1024 / 1024);
        
        // Alert if memory usage > 80% of available
        const memoryThreshold = parseInt(process.env.MEMORY_THRESHOLD_MB) || 512;
        const status = totalMB > memoryThreshold * 0.8 ? 'warning' : 'healthy';
        
        return {
            status,
            details: {
                rss: \`\${totalMB}MB\`,
                heapUsed: \`\${heapMB}MB\`,
                external: \`\${Math.round(usage.external / 1024 / 1024)}MB\`
            }
        };
    }

    async checkDisk() {
        const fs = require('fs').promises;
        
        try {
            const stats = await fs.stat('./');
            return {
                status: 'healthy',
                details: { accessible: true }
            };
        } catch (error) {
            throw new Error('Disk access failed');
        }
    }

    async checkEndpoint(url, name) {
        const https = require('https');
        
        return new Promise((resolve, reject) => {
            const req = https.get(url, { timeout: 5000 }, (res) => {
                if (res.statusCode < 400) {
                    resolve({ name, status: 'healthy' });
                } else {
                    reject(new Error(\`\${name} returned \${res.statusCode}\`));
                }
            });
            
            req.on('error', (error) => {
                reject(new Error(\`\${name} error: \${error.message}\`));
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(\`\${name} timeout\`));
            });
        });
    }
}

// Endpoint de health check
async function healthCheck() {
    const checker = new HealthChecker();
    
    try {
        const result = await checker.runAllChecks();
        const statusCode = result.status === 'healthy' ? 200 : 503;
        
        return {
            statusCode,
            body: result
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            }
        };
    }
}

// Utilisation comme script autonome ou module
if (require.main === module) {
    healthCheck().then(result => {
        console.log(JSON.stringify(result.body, null, 2));
        process.exit(result.statusCode === 200 ? 0 : 1);
    });
} else {
    module.exports = { HealthChecker, healthCheck };
}`;
  }

  // ========== MÉTHODES UTILITAIRES ==========

  initializeTemplates() {
    this.infrastructureTemplates.set('docker', this.getDockerTemplate());
    this.infrastructureTemplates.set('cicd', this.getCICDTemplate());
    this.infrastructureTemplates.set('monitoring', this.getMonitoringTemplate());
  }

  getDockerNextSteps(dockerData) {
    return [
      'Configurer les volumes persistants',
      'Implémenter les health checks',
      'Optimiser la taille des images',
      'Configurer les secrets Docker'
    ];
  }

  getPipelineNextSteps(pipelineData) {
    return [
      'Configurer les tests d\'intégration',
      'Ajouter la signature des images',
      'Implémenter le rollback automatique',
      'Configurer les notifications'
    ];
  }

  getMonitoringNextSteps(monitoringData) {
    return [
      'Configurer les alertes critiques',
      'Créer les dashboards personnalisés',
      'Implémenter les SLIs/SLOs',
      'Configurer la rétention des métriques'
    ];
  }

  generateDockerIgnore() {
    return `# Docker Ignore - Graixl Prospection System

# Développement
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.yarn-integrity

# Tests
coverage
*.tgz
.nyc_output

# Environnements
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Temporaires
temp
tmp
.tmp

# Git
.git
.gitignore
README.md
CHANGELOG.md

# CI/CD
.github
.gitlab-ci.yml
Jenkinsfile

# Documentation
docs
*.md

# Docker
Dockerfile*
docker-compose*
.dockerignore`;
  }
}

module.exports = DevOpsAgent;