/**
 * LinkedIn + Apollo Integration - Graixl
 * Import automatique de prospects depuis LinkedIn avec Apollo
 */

const axios = require('axios');

class LinkedInApolloProspector {
    constructor() {
        // Configuration Apollo (à configurer avec tes vraies clés)
        this.apolloApiKey = process.env.APOLLO_API_KEY || 'demo_key';
        this.apolloBaseUrl = 'https://api.apollo.io/v1';
        
        // Configuration LinkedIn (via RapidAPI ou direct)
        this.linkedinApiKey = process.env.LINKEDIN_API_KEY || 'demo_key';
        
        // Configuration alternative avec des scrapers
        this.useScrapingFallback = true;
    }

    // ========== MÉTHODES APOLLO ==========

    async searchApolloProspects(criteria) {
        try {
            const searchParams = {
                api_key: this.apolloApiKey,
                q_keywords: criteria.keywords || '',
                person_titles: criteria.titles || [],
                organization_locations: criteria.locations || [],
                organization_num_employees_ranges: criteria.companySizes || [],
                page: 1,
                per_page: 25
            };

            const response = await axios.post(`${this.apolloBaseUrl}/mixed_people/search`, searchParams);
            
            if (response.data && response.data.people) {
                return this.formatApolloResults(response.data.people);
            }
            
            return [];
        } catch (error) {
            console.log('Apollo API non disponible, utilisation du mode démo');
            return this.generateDemoProspects(criteria);
        }
    }

    async enrichApolloContact(email) {
        try {
            const enrichParams = {
                api_key: this.apolloApiKey,
                email: email
            };

            const response = await axios.post(`${this.apolloBaseUrl}/people/match`, enrichParams);
            return response.data.person || null;
        } catch (error) {
            console.log('Enrichissement Apollo échoué, utilisation des données de base');
            return null;
        }
    }

    // ========== MÉTHODES LINKEDIN ==========

    async searchLinkedInProfiles(searchQuery) {
        // Simulation de recherche LinkedIn (en production, utiliser LinkedIn Sales Navigator API)
        try {
            // Ici tu pourrais intégrer:
            // - LinkedIn Sales Navigator API
            // - PhantomBuster LinkedIn scraper
            // - Apify LinkedIn scraper
            // - Proxycurl LinkedIn API
            
            return this.simulateLinkedInSearch(searchQuery);
        } catch (error) {
            console.log('LinkedIn search failed, using demo data');
            return this.generateDemoLinkedInProfiles(searchQuery);
        }
    }

    async extractLinkedInProfile(profileUrl) {
        // Extraction détaillée d'un profil LinkedIn
        try {
            // Méthodes possibles:
            // 1. Proxycurl API
            // 2. ScrapIn API  
            // 3. LinkedIn unofficial API
            // 4. Puppeteer scraping

            return this.simulateProfileExtraction(profileUrl);
        } catch (error) {
            console.log('Profile extraction failed');
            return null;
        }
    }

    // ========== MÉTHODES HYBRIDES ==========

    async findProspectsHybrid(criteria) {
        const results = {
            apollo: [],
            linkedin: [],
            enriched: [],
            total: 0
        };

        try {
            // 1. Recherche Apollo
            const apolloProspects = await this.searchApolloProspects(criteria);
            results.apollo = apolloProspects;

            // 2. Recherche LinkedIn complémentaire
            const linkedinProspects = await this.searchLinkedInProfiles(criteria.keywords);
            results.linkedin = linkedinProspects;

            // 3. Enrichissement croisé
            const allProspects = [...apolloProspects, ...linkedinProspects];
            for (const prospect of allProspects) {
                if (prospect.email) {
                    const enriched = await this.enrichApolloContact(prospect.email);
                    if (enriched) {
                        results.enriched.push({
                            ...prospect,
                            ...enriched,
                            source: 'apollo_enriched'
                        });
                    }
                }
            }

            results.total = results.enriched.length;
            return results;

        } catch (error) {
            console.error('Hybrid search failed:', error);
            return this.generateDemoResults(criteria);
        }
    }

    // ========== ALTERNATIVES DE SCRAPING ==========

    async scrapingProspection(criteria) {
        // Méthodes de scraping alternatives quand les APIs ne sont pas disponibles
        const tools = [
            'PhantomBuster LinkedIn scraper',
            'Apify LinkedIn scraper', 
            'Octoparse LinkedIn automation',
            'Puppeteer custom scraper',
            'Selenium automation',
            'Scrapin.io API',
            'Proxycurl LinkedIn API'
        ];

        // Simulation avec données réalistes
        return this.generateRealisticProspects(criteria, tools);
    }

    // ========== FORMATAGE DES DONNÉES ==========

    formatApolloResults(apolloData) {
        return apolloData.map(person => ({
            id: person.id,
            email: person.email,
            name: `${person.first_name} ${person.last_name}`,
            firstName: person.first_name,
            lastName: person.last_name,
            title: person.title,
            company: person.organization?.name,
            industry: person.organization?.industry,
            location: person.city,
            linkedinUrl: person.linkedin_url,
            phone: person.phone_numbers?.[0]?.sanitized_number,
            source: 'apollo',
            confidence: person.email ? 0.9 : 0.6
        }));
    }

    // ========== GÉNÉRATION DE DONNÉES DÉMO ==========

    generateDemoProspects(criteria) {
        const demoProspects = [
            {
                id: 'demo_1',
                email: 'erwanhenry@hotmail.com',
                name: 'Erwan Henry',
                firstName: 'Erwan',
                lastName: 'Henry',
                title: 'CEO & Founder',
                company: 'Graixl',
                industry: 'Technology',
                location: 'Paris, France',
                linkedinUrl: 'https://linkedin.com/in/erwanhenry',
                source: 'demo_apollo',
                confidence: 0.95
            },
            {
                id: 'demo_2',
                email: 'marie.martin@techcorp.com',
                name: 'Marie Martin',
                firstName: 'Marie',
                lastName: 'Martin',
                title: 'VP Sales',
                company: 'TechCorp',
                industry: 'SaaS',
                location: 'Lyon, France',
                linkedinUrl: 'https://linkedin.com/in/mariemartin',
                source: 'demo_apollo',
                confidence: 0.88
            },
            {
                id: 'demo_3',
                email: 'pierre.dupont@innovation.fr',
                name: 'Pierre Dupont',
                firstName: 'Pierre',
                lastName: 'Dupont',
                title: 'Chief Technology Officer',
                company: 'Innovation Labs',
                industry: 'AI & Machine Learning',
                location: 'Nice, France',
                linkedinUrl: 'https://linkedin.com/in/pierredupont',
                source: 'demo_linkedin',
                confidence: 0.92
            }
        ];

        return demoProspects.filter(p => 
            !criteria.keywords || 
            p.title.toLowerCase().includes(criteria.keywords.toLowerCase()) ||
            p.company.toLowerCase().includes(criteria.keywords.toLowerCase())
        );
    }

    simulateLinkedInSearch(query) {
        return [
            {
                id: 'li_1',
                name: 'Sophie Bernard',
                title: 'Marketing Director',
                company: 'Digital Agency',
                location: 'Marseille',
                linkedinUrl: 'https://linkedin.com/in/sophiebernard',
                source: 'linkedin_search',
                confidence: 0.75
            }
        ];
    }

    generateDemoResults(criteria) {
        return {
            apollo: this.generateDemoProspects(criteria),
            linkedin: this.simulateLinkedInSearch(criteria.keywords),
            enriched: this.generateDemoProspects(criteria),
            total: 3,
            message: 'Mode démo - Utilise tes vraies clés API pour des résultats réels',
            availableIntegrations: [
                'Apollo.io API',
                'LinkedIn Sales Navigator', 
                'Proxycurl LinkedIn API',
                'PhantomBuster',
                'Apify LinkedIn Scraper'
            ]
        };
    }
}

module.exports = LinkedInApolloProspector;