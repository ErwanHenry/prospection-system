/**
 * Project Entity - Core Domain
 * Représente un projet de prospection ou de développement
 */

class Project {
  constructor({
    id,
    name,
    description,
    type = 'prospection', // 'prospection', 'development', 'analysis'
    requirements = {},
    status = 'created',
    priority = 'medium',
    assignedAgents = [],
    tasks = [],
    deliverables = [],
    timeline = {},
    budget = null,
    client = {},
    metadata = {}
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.requirements = requirements;
    this.status = status; // 'created', 'planning', 'in_progress', 'testing', 'completed', 'failed', 'cancelled'
    this.priority = priority; // 'low', 'medium', 'high', 'urgent'
    this.assignedAgents = assignedAgents;
    this.tasks = tasks;
    this.deliverables = deliverables;
    this.timeline = {
      startDate: null,
      endDate: null,
      estimatedDuration: null,
      actualDuration: null,
      milestones: [],
      ...timeline
    };
    this.budget = budget;
    this.client = client;
    this.metadata = metadata;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.progress = 0; // 0-100%
  }

  // Gestion du statut du projet
  updateStatus(newStatus, reason = '') {
    const previousStatus = this.status;
    this.status = newStatus;
    this.updatedAt = new Date();
    
    // Log du changement de statut
    if (!this.metadata.statusHistory) {
      this.metadata.statusHistory = [];
    }
    
    this.metadata.statusHistory.push({
      from: previousStatus,
      to: newStatus,
      reason,
      timestamp: new Date()
    });

    // Actions automatiques selon le statut
    switch (newStatus) {
      case 'in_progress':
        if (!this.timeline.startDate) {
          this.timeline.startDate = new Date();
        }
        break;
      case 'completed':
        this.timeline.endDate = new Date();
        this.progress = 100;
        this.calculateActualDuration();
        break;
      case 'failed':
      case 'cancelled':
        this.timeline.endDate = new Date();
        this.calculateActualDuration();
        break;
    }
  }

  // Gestion des agents assignés
  assignAgent(agentId, role = '') {
    if (!this.isAgentAssigned(agentId)) {
      this.assignedAgents.push({
        agentId,
        role,
        assignedAt: new Date(),
        status: 'active'
      });
      this.updatedAt = new Date();
    }
  }

  unassignAgent(agentId) {
    this.assignedAgents = this.assignedAgents.filter(a => a.agentId !== agentId);
    this.updatedAt = new Date();
  }

  isAgentAssigned(agentId) {
    return this.assignedAgents.some(a => a.agentId === agentId && a.status === 'active');
  }

  getAgentsByRole(role) {
    return this.assignedAgents.filter(a => a.role === role && a.status === 'active');
  }

  // Gestion des tâches
  addTask(task) {
    this.tasks.push({
      ...task,
      id: task.id || this.generateTaskId(),
      projectId: this.id,
      createdAt: new Date(),
      status: task.status || 'pending'
    });
    this.updatedAt = new Date();
    this.recalculateProgress();
  }

  updateTask(taskId, updates) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        ...updates,
        updatedAt: new Date()
      };
      this.updatedAt = new Date();
      this.recalculateProgress();
    }
  }

  getTasksByStatus(status) {
    return this.tasks.filter(t => t.status === status);
  }

  getTasksByAgent(agentId) {
    return this.tasks.filter(t => t.assignedTo === agentId);
  }

  // Calcul de la progression
  recalculateProgress() {
    if (this.tasks.length === 0) {
      this.progress = 0;
      return;
    }

    const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    this.progress = Math.round((completedTasks / this.tasks.length) * 100);
  }

  // Gestion des livrables
  addDeliverable(deliverable) {
    this.deliverables.push({
      ...deliverable,
      id: deliverable.id || this.generateDeliverableId(),
      projectId: this.id,
      createdAt: new Date(),
      status: deliverable.status || 'pending'
    });
    this.updatedAt = new Date();
  }

  markDeliverableCompleted(deliverableId, result = {}) {
    const deliverable = this.deliverables.find(d => d.id === deliverableId);
    if (deliverable) {
      deliverable.status = 'completed';
      deliverable.completedAt = new Date();
      deliverable.result = result;
      this.updatedAt = new Date();
    }
  }

  // Gestion du timeline
  addMilestone(milestone) {
    this.timeline.milestones.push({
      ...milestone,
      id: milestone.id || this.generateMilestoneId(),
      projectId: this.id,
      createdAt: new Date()
    });
    this.updatedAt = new Date();
  }

  calculateActualDuration() {
    if (this.timeline.startDate && this.timeline.endDate) {
      this.timeline.actualDuration = this.timeline.endDate - this.timeline.startDate;
    }
  }

  // Analyse du projet
  getProjectAnalytics() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.getTasksByStatus('completed').length;
    const failedTasks = this.getTasksByStatus('failed').length;
    const inProgressTasks = this.getTasksByStatus('in_progress').length;
    
    const totalDeliverables = this.deliverables.length;
    const completedDeliverables = this.deliverables.filter(d => d.status === 'completed').length;
    
    return {
      projectId: this.id,
      name: this.name,
      status: this.status,
      progress: this.progress,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        failed: failedTasks,
        inProgress: inProgressTasks,
        pending: totalTasks - completedTasks - failedTasks - inProgressTasks
      },
      deliverables: {
        total: totalDeliverables,
        completed: completedDeliverables,
        pending: totalDeliverables - completedDeliverables
      },
      timeline: {
        startDate: this.timeline.startDate,
        endDate: this.timeline.endDate,
        estimatedDuration: this.timeline.estimatedDuration,
        actualDuration: this.timeline.actualDuration,
        isOnTime: this.isOnTime()
      },
      agents: {
        assigned: this.assignedAgents.length,
        active: this.assignedAgents.filter(a => a.status === 'active').length
      }
    };
  }

  isOnTime() {
    if (!this.timeline.estimatedDuration || !this.timeline.startDate) {
      return null;
    }
    
    const now = new Date();
    const expectedEndDate = new Date(this.timeline.startDate.getTime() + this.timeline.estimatedDuration);
    
    if (this.status === 'completed') {
      return this.timeline.endDate <= expectedEndDate;
    } else {
      return now <= expectedEndDate;
    }
  }

  // Méthodes utilitaires
  generateTaskId() {
    return `task_${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateDeliverableId() {
    return `deliverable_${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMilestoneId() {
    return `milestone_${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sérialisation
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      requirements: this.requirements,
      status: this.status,
      priority: this.priority,
      assignedAgents: this.assignedAgents,
      tasks: this.tasks,
      deliverables: this.deliverables,
      timeline: this.timeline,
      budget: this.budget,
      client: this.client,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      progress: this.progress
    };
  }

  static fromJSON(data) {
    const project = new Project(data);
    project.createdAt = new Date(data.createdAt);
    project.updatedAt = new Date(data.updatedAt);
    
    // Convertir les dates dans les tâches et livrables
    project.tasks = project.tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : null
    }));
    
    project.deliverables = project.deliverables.map(deliverable => ({
      ...deliverable,
      createdAt: new Date(deliverable.createdAt),
      completedAt: deliverable.completedAt ? new Date(deliverable.completedAt) : null
    }));
    
    return project;
  }
}

module.exports = Project;