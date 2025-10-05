const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...\n');

  // 1. Create test campaign
  console.log('📊 Creating campaign...');
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Campagne Startup Tech Paris',
      status: 'ACTIVE',
      linkedinSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=CTO%20startup%20Paris',
      filters: {
        location: ['Paris', 'Île-de-France'],
        industry: ['Technology', 'Software'],
        jobTitles: ['CTO', 'Chief Technology Officer', 'VP Engineering']
      },
      maxProspects: 500,
      dailyLimit: 50,
      startDate: new Date('2025-10-06'),
    },
  });
  console.log(`✅ Campaign created: ${campaign.id}`);

  // 2. Create test prospects with different statuses
  console.log('\n👥 Creating prospects...');
  
  const prospects = [
    {
      campaignId: campaign.id,
      firstName: 'Jean',
      lastName: 'Dupont',
      fullName: 'Jean Dupont',
      company: 'TechStartup SAS',
      jobTitle: 'CTO',
      location: 'Paris, France',
      linkedinUrl: 'https://linkedin.com/in/jean-dupont',
      email: 'jean.dupont@techstartup.fr',
      emailScore: 95,
      status: 'TO_CONTACT',
      priority: 'HIGH',
      tags: ['startup', 'tech', 'decision-maker'],
    },
    {
      campaignId: campaign.id,
      firstName: 'Marie',
      lastName: 'Martin',
      fullName: 'Marie Martin',
      company: 'InnovateCo',
      jobTitle: 'VP Engineering',
      location: 'Paris, France',
      linkedinUrl: 'https://linkedin.com/in/marie-martin',
      email: 'marie.martin@innovateco.io',
      emailScore: 88,
      status: 'CONTACTED',
      priority: 'HIGH',
      tags: ['engineering', 'leadership'],
      lastContactedAt: new Date('2025-10-05'),
      messagesSent: 1,
    },
    {
      campaignId: campaign.id,
      firstName: 'Pierre',
      lastName: 'Dubois',
      fullName: 'Pierre Dubois',
      company: 'AI Solutions',
      jobTitle: 'Chief Technology Officer',
      location: 'Île-de-France, France',
      linkedinUrl: 'https://linkedin.com/in/pierre-dubois',
      email: 'p.dubois@aisolutions.fr',
      emailScore: 92,
      status: 'RESPONDED',
      priority: 'URGENT',
      tags: ['ai', 'hot-lead'],
      lastContactedAt: new Date('2025-10-03'),
      messagesSent: 2,
      responded: true,
    },
    {
      campaignId: campaign.id,
      firstName: 'Sophie',
      lastName: 'Bernard',
      fullName: 'Sophie Bernard',
      company: 'CloudTech',
      jobTitle: 'VP Technology',
      location: 'Paris, France',
      linkedinUrl: 'https://linkedin.com/in/sophie-bernard',
      email: 'sophie.bernard@cloudtech.com',
      emailScore: 85,
      status: 'QUALIFIED',
      priority: 'HIGH',
      tags: ['cloud', 'qualified'],
      lastContactedAt: new Date('2025-10-02'),
      messagesSent: 3,
      responded: true,
    },
    {
      campaignId: campaign.id,
      firstName: 'Thomas',
      lastName: 'Petit',
      fullName: 'Thomas Petit',
      company: 'DevOps Pro',
      jobTitle: 'CTO',
      location: 'Paris, France',
      linkedinUrl: 'https://linkedin.com/in/thomas-petit',
      status: 'TO_CONTACT',
      priority: 'MEDIUM',
      tags: ['devops'],
    },
    {
      campaignId: campaign.id,
      firstName: 'Isabelle',
      lastName: 'Moreau',
      fullName: 'Isabelle Moreau',
      company: 'DataCorp',
      jobTitle: 'VP Engineering',
      location: 'Paris, France',
      linkedinUrl: 'https://linkedin.com/in/isabelle-moreau',
      email: 'i.moreau@datacorp.fr',
      emailScore: 78,
      status: 'REJECTED',
      priority: 'LOW',
      tags: ['not-interested'],
      lastContactedAt: new Date('2025-09-28'),
      messagesSent: 2,
      notes: 'Not interested at this time',
    },
  ];

  for (const prospectData of prospects) {
    const prospect = await prisma.prospect.create({ data: prospectData });
    console.log(`✅ Prospect created: ${prospect.fullName} (${prospect.status})`);
  }

  // 3. Create message templates
  console.log('\n✉️  Creating message templates...');
  
  const templates = [
    {
      campaignId: campaign.id,
      type: 'FIRST_CONTACT',
      subject: 'Collaboration {{company}} - Graixl',
      body: `<p>Bonjour {{firstName}},</p>

<p>Je suis tombé sur votre profil et j'ai été impressionné par votre parcours chez <strong>{{company}}</strong>.</p>

<p>Chez Graixl, nous aidons les CTOs comme vous à automatiser leur prospection B2B avec de l'IA. Seriez-vous intéressé par un échange rapide ?</p>

<p>Je vous propose un créneau de 15 minutes : {{calendlyLink}}</p>

<p>Bien cordialement,<br>Erwan</p>`,
      delayDays: 0,
    },
    {
      campaignId: campaign.id,
      type: 'FOLLOW_UP_1',
      subject: 'Re: Collaboration {{company}}',
      body: `<p>Bonjour {{firstName}},</p>

<p>Je reviens vers vous concernant mon message précédent sur l'automatisation de prospection.</p>

<p>Quelques chiffres rapides :</p>
<ul>
  <li>+75% d'efficacité commerciale</li>
  <li>+45% de taux de réponse</li>
  <li>ROI visible en 30 jours</li>
</ul>

<p>Disponible cette semaine ? {{calendlyLink}}</p>

<p>Cordialement,<br>Erwan</p>`,
      delayDays: 3,
    },
    {
      campaignId: campaign.id,
      type: 'FOLLOW_UP_2',
      subject: 'Last try - {{company}}',
      body: `<p>Bonjour {{firstName}},</p>

<p>Je ne voudrais pas être insistant, mais je pense vraiment que Graixl pourrait aider {{company}} à scaler ses opérations commerciales.</p>

<p>Si ce n'est pas le bon moment, pas de souci ! Sinon, voici mon calendrier : {{calendlyLink}}</p>

<p>Bonne journée,<br>Erwan</p>`,
      delayDays: 7,
    },
  ];

  for (const templateData of templates) {
    const template = await prisma.messageTemplate.create({ data: templateData });
    console.log(`✅ Template created: ${template.type}`);
  }

  // 4. Create activities
  console.log('\n📝 Creating activities...');
  
  const respondedProspect = await prisma.prospect.findFirst({
    where: { status: 'RESPONDED' },
  });

  if (respondedProspect) {
    const activities = [
      {
        prospectId: respondedProspect.id,
        type: 'EMAIL_SENT',
        message: 'Premier contact envoyé',
        metadata: { subject: 'Collaboration AI Solutions - Graixl' },
      },
      {
        prospectId: respondedProspect.id,
        type: 'EMAIL_RECEIVED',
        message: 'Réponse positive reçue',
        metadata: { content: 'Intéressé, disponible mardi prochain' },
      },
      {
        prospectId: respondedProspect.id,
        type: 'STATUS_CHANGE',
        message: 'Statut changé: TO_CONTACT → RESPONDED',
      },
    ];

    for (const activityData of activities) {
      const activity = await prisma.activity.create({ data: activityData });
      console.log(`✅ Activity created: ${activity.type}`);
    }
  }

  console.log('\n✨ Test data seeding complete!\n');
  
  // Summary
  const campaignCount = await prisma.campaign.count();
  const prospectCount = await prisma.prospect.count();
  const templateCount = await prisma.messageTemplate.count();
  const activityCount = await prisma.activity.count();

  console.log('📊 Summary:');
  console.log(`   Campaigns: ${campaignCount}`);
  console.log(`   Prospects: ${prospectCount}`);
  console.log(`   Templates: ${templateCount}`);
  console.log(`   Activities: ${activityCount}`);
  
  await prisma.$disconnect();
}

seedTestData()
  .catch((error) => {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  });
