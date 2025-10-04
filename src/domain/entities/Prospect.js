/**
 * Entité Prospect - Modèle de domaine
 * Contient la logique métier pure
 */

class Prospect {
  constructor({
    id = null,
    name,
    company,
    title,
    linkedinUrl,
    location = null,
    email = null,
    emailSource = null,
    emailVerified = false,
    score = 0,
    tags = '',
    dateAdded = null,
    status = 'Nouveau',
    messageSent = '',
    followupCount = 0,
    notes = ''
  }) {
    // Validation required fields (company is optional)
    if (!name || !title) {
      throw new Error('Prospect doit avoir un nom et un titre');
    }

    this.id = id || this.generateId();
    this.name = this.sanitizeName(name);
    this.company = this.sanitizeCompany(company);
    this.title = this.sanitizeTitle(title);
    this.linkedinUrl = this.validateLinkedInUrl(linkedinUrl);
    this.location = location;
    this.email = this.validateEmail(email);
    this.emailSource = emailSource;
    this.emailVerified = emailVerified;
    this.score = Math.max(0, Math.min(100, score));
    this.tags = tags;
    this.dateAdded = dateAdded || new Date().toISOString().split('T')[0];
    this.status = this.validateStatus(status);
    this.messageSent = messageSent;
    this.followupCount = Math.max(0, followupCount);
    this.notes = notes;

    // Métadonnées
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // Méthodes de validation
  sanitizeName(name) {
    return name.trim().replace(/\s+/g, ' ');
  }

  sanitizeCompany(company) {
    if (!company || company.trim() === '') {
      return 'Unknown Company';
    }
    return company.trim().replace(/\s+/g, ' ');
  }

  sanitizeTitle(title) {
    return title.trim().replace(/\s+/g, ' ');
  }

  validateLinkedInUrl(url) {
    if (!url) return null;
    if (url.includes('linkedin.com/in/')) {
      return url;
    }
    return null;
  }

  validateEmail(email) {
    if (!email) return null;
    if (email.includes('not_unlocked') || email.includes('email_not_found')) {
      return null;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : null;
  }

  validateStatus(status) {
    const validStatuses = ['Nouveau', 'Contacté', 'Intéressé', 'Qualifié', 'Converti', 'Rejeté'];
    return validStatuses.includes(status) ? status : 'Nouveau';
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Méthodes métier
  hasEmail() {
    return this.email && this.email !== '';
  }

  hasLinkedIn() {
    return this.linkedinUrl && this.linkedinUrl !== '';
  }

  needsEmailSearch() {
    return !this.hasEmail();
  }

  canBeContacted() {
    return this.hasEmail() && this.status !== 'Rejeté';
  }

  updateEmail(email, source = null, verified = false) {
    this.email = this.validateEmail(email);
    this.emailSource = source;
    this.emailVerified = verified;
    this.updatedAt = new Date().toISOString();
    
    if (this.hasEmail()) {
      this.addTag(`email:${source}`);
      if (verified) {
        this.addTag('verified');
      }
    }
  }

  updateStatus(newStatus) {
    const oldStatus = this.status;
    this.status = this.validateStatus(newStatus);
    this.updatedAt = new Date().toISOString();
    
    if (oldStatus !== this.status) {
      this.addNote(`Status changed from ${oldStatus} to ${this.status}`);
    }
  }

  addTag(tag) {
    const tags = this.tags.split(' ').filter(t => t.length > 0);
    if (!tags.includes(tag)) {
      tags.push(tag);
      this.tags = tags.join(' ');
    }
  }

  removeTag(tag) {
    const tags = this.tags.split(' ').filter(t => t.length > 0 && t !== tag);
    this.tags = tags.join(' ');
  }

  addNote(note) {
    const timestamp = new Date().toISOString().split('T')[0];
    const noteWithDate = `[${timestamp}] ${note}`;
    
    if (this.notes) {
      this.notes += ` | ${noteWithDate}`;
    } else {
      this.notes = noteWithDate;
    }
  }

  incrementFollowup() {
    this.followupCount++;
    this.updatedAt = new Date().toISOString();
    this.addNote(`Follow-up ${this.followupCount} sent`);
  }

  // Export pour CRM
  toCrmFormat() {
    return [
      this.id,
      this.name,
      this.company,
      this.title,
      this.linkedinUrl || '',
      this.email || '',
      this.emailSource || '',
      this.location || '',
      this.dateAdded,
      this.status,
      this.messageSent,
      this.followupCount.toString(),
      this.notes
    ];
  }

  // Export pour API
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      company: this.company,
      title: this.title,
      linkedinUrl: this.linkedinUrl,
      location: this.location,
      email: this.email,
      emailSource: this.emailSource,
      emailVerified: this.emailVerified,
      score: this.score,
      tags: this.tags,
      dateAdded: this.dateAdded,
      status: this.status,
      messageSent: this.messageSent,
      followupCount: this.followupCount,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Factory method pour créer depuis CRM
  static fromCrmData(crmRow) {
    const [id, name, company, title, linkedinUrl, email, emailSource, location, dateAdded, status, messageSent, followupCount, notes] = crmRow;
    
    return new Prospect({
      id,
      name,
      company,
      title,
      linkedinUrl,
      email,
      emailSource,
      location,
      dateAdded,
      status,
      messageSent,
      followupCount: parseInt(followupCount) || 0,
      notes
    });
  }

  // Factory method pour créer depuis Apollo/API
  static fromApiData(apiData) {
    return new Prospect({
      name: apiData.name,
      company: apiData.organization?.name || apiData.company,
      title: apiData.title,
      linkedinUrl: apiData.linkedin_url || apiData.linkedinUrl,
      location: apiData.location,
      email: apiData.email,
      score: apiData.score || 0,
      tags: apiData.tags || ''
    });
  }
}

module.exports = Prospect;