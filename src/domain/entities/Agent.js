/**
 * Agent Entity - Core Domain
 * Représente un agent intelligent dans le système multi-agents
 */

class Agent {
  constructor({
    id,
    name,
    type,
    specialization,
    capabilities = [],
    status = 'idle',
    config = {},
    memory = new Map(),
    performance = {
      tasksCompleted: 0,
      successRate: 0,
      averageExecutionTime: 0
    }
  }) {
    this.id = id;
    this.name = name;
    this.type = type; // 'planificateur', 'testeur', 'backend-dev', 'frontend-dev', 'devops', 'chef-projet'
    this.specialization = specialization;
    this.capabilities = capabilities;
    this.status = status; // 'idle', 'working', 'error', 'offline'
    this.config = config;
    this.memory = memory; // Mémoire persistante de l'agent
    this.performance = performance;
    this.createdAt = new Date();
    this.lastActiveAt = new Date();
  }

  // Méthodes de base de l'agent
  async execute(task) {
    this.status = 'working';
    this.lastActiveAt = new Date();
    
    const startTime = Date.now();
    
    try {
      const result = await this.processTask(task);
      
      // Mise à jour des performances
      this.updatePerformance(Date.now() - startTime, true);
      this.status = 'idle';
      
      return {
        success: true,
        result,
        agentId: this.id,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
      
    } catch (error) {
      this.updatePerformance(Date.now() - startTime, false);
      this.status = 'error';
      
      return {
        success: false,
        error: error.message,
        agentId: this.id,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  async processTask(task) {
    // À implémenter dans les sous-classes
    throw new Error('processTask must be implemented by agent subclass');
  }

  updatePerformance(executionTime, success) {
    this.performance.tasksCompleted++;
    
    if (success) {
      const successCount = Math.round(this.performance.successRate * (this.performance.tasksCompleted - 1));
      this.performance.successRate = (successCount + 1) / this.performance.tasksCompleted;
    } else {
      const successCount = Math.round(this.performance.successRate * (this.performance.tasksCompleted - 1));
      this.performance.successRate = successCount / this.performance.tasksCompleted;
    }
    
    // Mise à jour du temps d'exécution moyen
    const totalTime = this.performance.averageExecutionTime * (this.performance.tasksCompleted - 1) + executionTime;
    this.performance.averageExecutionTime = totalTime / this.performance.tasksCompleted;
  }

  // Gestion de la mémoire de l'agent
  remember(key, value) {
    this.memory.set(key, {
      value,
      timestamp: new Date(),
      accessCount: (this.memory.get(key)?.accessCount || 0) + 1
    });
  }

  recall(key) {
    const memory = this.memory.get(key);
    if (memory) {
      memory.accessCount++;
      memory.lastAccessed = new Date();
      return memory.value;
    }
    return null;
  }

  forget(key) {
    this.memory.delete(key);
  }

  // Capacités de l'agent
  hasCapability(capability) {
    return this.capabilities.includes(capability);
  }

  addCapability(capability) {
    if (!this.hasCapability(capability)) {
      this.capabilities.push(capability);
    }
  }

  // Communication avec d'autres agents
  async sendMessage(targetAgentId, message) {
    // Sera implémenté via le système de messaging
    return {
      from: this.id,
      to: targetAgentId,
      message,
      timestamp: new Date()
    };
  }

  // Sérialisation pour persistance
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      specialization: this.specialization,
      capabilities: this.capabilities,
      status: this.status,
      config: this.config,
      memory: Array.from(this.memory.entries()),
      performance: this.performance,
      createdAt: this.createdAt,
      lastActiveAt: this.lastActiveAt
    };
  }

  static fromJSON(data) {
    const agent = new Agent(data);
    agent.memory = new Map(data.memory || []);
    agent.createdAt = new Date(data.createdAt);
    agent.lastActiveAt = new Date(data.lastActiveAt);
    return agent;
  }

  // Health check de l'agent
  getHealthStatus() {
    const now = Date.now();
    const lastActiveMs = now - this.lastActiveAt.getTime();
    const isHealthy = lastActiveMs < 300000; // 5 minutes
    
    return {
      agentId: this.id,
      name: this.name,
      status: this.status,
      isHealthy,
      lastActiveMs,
      performance: this.performance,
      memorySize: this.memory.size,
      capabilities: this.capabilities.length
    };
  }
}

module.exports = Agent;