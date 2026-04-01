import { PrismaClient } from '../app/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required for seeding')
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // Clean up existing data
  await prisma.activityLog.deleteMany()
  await prisma.deliverable.deleteMany()
  await prisma.projectUpdate.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.onboardingTask.deleteMany()
  await prisma.welcomeDocument.deleteMany()
  await prisma.agreement.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.project.deleteMany()
  await prisma.client.deleteMany()
  await prisma.tutorialArticle.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleaned existing data')

  // Admin user
  const adminPassword = await hash('ChangeMe123!', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fullweb.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Created admin user:', adminUser.email)

  // Client user
  const clientPassword = await hash('ClientPass123!', 12)
  const clientUser = await prisma.user.create({
    data: {
      email: 'client@example.com',
      name: 'John Smith',
      password: clientPassword,
      role: 'CLIENT',
    },
  })
  console.log('✅ Created client user:', clientUser.email)

  // Client record
  const client = await prisma.client.create({
    data: {
      userId: clientUser.id,
      companyName: 'Acme Corp',
      contactName: 'John Smith',
      contactEmail: 'john@acmecorp.com',
      phone: '+1 555 123 4567',
      website: 'https://acmecorp.com',
      notes: 'Premium client, handle with care.',
      status: 'ACTIVE',
    },
  })
  console.log('✅ Created client:', client.companyName)

  // Project
  const project = await prisma.project.create({
    data: {
      clientId: client.id,
      name: 'Acme Corp Website Redesign',
      description: 'Complete redesign of the Acme Corp website with modern design, improved UX, and full CMS integration.',
      packageName: 'Premium Web Package',
      status: 'ACTIVE',
      scope: '- Homepage redesign\n- 5 inner pages\n- Blog section\n- Contact form\n- CMS integration\n- SEO optimization',
      startDate: new Date('2024-01-15'),
      estimatedEndDate: new Date('2024-04-15'),
      kickoffLink: 'https://cal.com/fullweb/kickoff',
      kickoffDate: new Date('2024-01-20'),
    },
  })
  console.log('✅ Created project:', project.name)

  // Invoices
  await prisma.invoice.createMany({
    data: [
      {
        projectId: project.id,
        clientId: client.id,
        amount: 2500,
        dueDate: new Date('2024-01-31'),
        status: 'PAID',
        description: 'Website Redesign - Deposit (50%)',
        paymentLink: 'https://stripe.com/pay/inv_001',
      },
      {
        projectId: project.id,
        clientId: client.id,
        amount: 2500,
        dueDate: new Date('2024-04-15'),
        status: 'UNPAID',
        description: 'Website Redesign - Final Payment (50%)',
        paymentLink: 'https://stripe.com/pay/inv_002',
      },
    ],
  })
  console.log('✅ Created invoices')

  // Agreement
  await prisma.agreement.create({
    data: {
      projectId: project.id,
      clientId: client.id,
      title: 'Website Redesign Service Agreement',
      fileUrl: 'https://example.com/agreements/acme-corp-agreement.pdf',
      fileName: 'acme-corp-service-agreement.pdf',
      status: 'PENDING',
    },
  })
  console.log('✅ Created agreement')

  // Welcome Document
  await prisma.welcomeDocument.create({
    data: {
      projectId: project.id,
      clientId: client.id,
      title: 'Welcome to Your Fullweb Portal',
      content: `Welcome to your Fullweb client portal, John!

We're excited to work with you on the Acme Corp Website Redesign. This portal is your central hub for everything related to your project.

Here's what you can do here:
• Track project progress and milestones
• View and pay invoices
• Access deliverables and files
• Read project updates from our team
• Complete onboarding tasks

Your dedicated project manager is available Monday–Friday, 9am–6pm EST.

If you have any questions, don't hesitate to reach out at hello@fullweb.agency.

Let's build something amazing together! 🚀`,
    },
  })
  console.log('✅ Created welcome document')

  // Onboarding Tasks
  await prisma.onboardingTask.createMany({
    data: [
      { projectId: project.id, clientId: client.id, title: 'Review and sign the service agreement', completed: true, order: 1 },
      { projectId: project.id, clientId: client.id, title: 'Complete the brand questionnaire', completed: true, order: 2 },
      { projectId: project.id, clientId: client.id, title: 'Provide existing brand assets (logos, fonts, colors)', completed: true, order: 3 },
      { projectId: project.id, clientId: client.id, title: 'Share access to your current website CMS', completed: false, order: 4 },
      { projectId: project.id, clientId: client.id, title: 'Schedule kickoff call with your project manager', completed: false, order: 5 },
    ],
  })
  console.log('✅ Created onboarding tasks')

  // Milestones
  await prisma.milestone.createMany({
    data: [
      { projectId: project.id, title: 'Discovery & Strategy', description: 'Initial research, competitor analysis, and project strategy.', dueDate: new Date('2024-01-31'), completed: true, order: 1 },
      { projectId: project.id, title: 'Design Mockups', description: 'Homepage and key page wireframes and visual designs.', dueDate: new Date('2024-02-28'), completed: true, order: 2 },
      { projectId: project.id, title: 'Development', description: 'Full website development with CMS integration.', dueDate: new Date('2024-03-31'), completed: false, order: 3 },
      { projectId: project.id, title: 'Review & Launch', description: 'Client review, revisions, and final launch.', dueDate: new Date('2024-04-15'), completed: false, order: 4 },
    ],
  })
  console.log('✅ Created milestones')

  // Project Updates
  await prisma.projectUpdate.createMany({
    data: [
      {
        projectId: project.id,
        title: 'Development Phase Started',
        content: 'We\'ve kicked off the development phase! The approved designs are now being converted into code. Our team is working on the homepage and key landing pages first. Expected completion: end of March.',
        createdAt: new Date('2024-03-01'),
      },
      {
        projectId: project.id,
        title: 'Design Mockups Approved',
        content: 'Great news — the design mockups have been approved! We went through two rounds of revisions and landed on a fantastic final design. The team is thrilled with how it came out.',
        createdAt: new Date('2024-02-20'),
      },
      {
        projectId: project.id,
        title: 'Project Kickoff Complete',
        content: 'We had a fantastic kickoff call today! We\'ve aligned on project goals, timeline, and communication. The discovery phase has officially begun.',
        createdAt: new Date('2024-01-22'),
      },
    ],
  })
  console.log('✅ Created project updates')

  // Deliverables
  await prisma.deliverable.createMany({
    data: [
      {
        projectId: project.id,
        title: 'Homepage Design Mockup',
        description: 'Final approved homepage design in Figma',
        fileUrl: 'https://figma.com/file/example-homepage',
        fileName: 'homepage-design-v2.fig',
        fileType: 'figma',
      },
      {
        projectId: project.id,
        title: 'Brand Style Guide',
        description: 'Complete brand guidelines including typography, colors, and usage rules',
        fileUrl: 'https://example.com/files/brand-style-guide.pdf',
        fileName: 'acme-brand-style-guide.pdf',
        fileType: 'pdf',
      },
    ],
  })
  console.log('✅ Created deliverables')

  // Tutorial Articles
  const tutorials = [
    {
      title: 'Getting Started with Your Portal',
      slug: 'getting-started',
      content: `Welcome to your Fullweb client portal! This guide will help you navigate the features available to you.

## Dashboard
Your dashboard gives you a quick overview of your project status, onboarding progress, and recent updates.

## Navigation
Use the left sidebar to navigate between sections:
- **Overview**: Your main dashboard
- **Project**: Detailed project information
- **Invoices**: View and pay invoices
- **Timeline**: Project milestones
- **Updates**: Latest news from your team

## Getting Help
If you need assistance, contact us at hello@fullweb.agency.`,
      order: 1,
    },
    {
      title: 'How to Pay an Invoice',
      slug: 'how-to-pay-invoice',
      content: `Paying your invoices is simple through your portal.

## Steps
1. Navigate to the **Invoices** section
2. Find the invoice you want to pay
3. Click the **Pay Now** button
4. You'll be redirected to our secure payment page
5. Complete the payment with your preferred method

## Accepted Payment Methods
- Credit/Debit Card (Visa, Mastercard, Amex)
- Bank Transfer (ACH)
- PayPal

## Receipts
You'll receive an email receipt after successful payment.`,
      order: 2,
    },
    {
      title: 'Understanding Your Project Timeline',
      slug: 'project-timeline',
      content: `Your project timeline shows all milestones from start to finish.

## Milestones
Each milestone represents a major phase of your project:
- ✅ Completed milestones are shown with a filled circle
- ○ Upcoming milestones are shown with an empty circle

## Dates
Each milestone has an estimated completion date. Dates may shift slightly based on feedback cycles and scope changes.

## Questions?
If you have questions about a specific milestone, reach out to your project manager.`,
      order: 3,
    },
    {
      title: 'How to Provide Feedback',
      slug: 'providing-feedback',
      content: `Great feedback helps us deliver better results. Here's how to give effective feedback.

## Tips for Good Feedback
1. **Be specific**: Instead of "I don't like it", say "The header font feels too heavy"
2. **Reference examples**: Share links to designs you admire
3. **Prioritize**: Tell us what matters most to you

## Feedback Process
1. Review the deliverable
2. Note your feedback points
3. Email your project manager or reply to the update

## Review Rounds
Your package includes two rounds of revisions per deliverable.`,
      order: 4,
    },
    {
      title: 'Website Maintenance Guide',
      slug: 'website-maintenance',
      content: `After your website launches, here's how to keep it running smoothly.

## Monthly Tasks
- Check for plugin/theme updates
- Review website analytics
- Test contact forms and key functionality
- Back up your website

## Content Updates
Use your CMS to update:
- Blog posts
- Team member pages
- Product/service listings
- Contact information

## When to Contact Us
Reach out to our team for:
- Technical issues you can't resolve
- Design changes
- New feature additions
- Security concerns`,
      order: 5,
    },
  ]

  for (const tutorial of tutorials) {
    await prisma.tutorialArticle.create({ data: tutorial })
  }
  console.log('✅ Created tutorial articles')

  // Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { userId: adminUser.id, action: 'CREATE_CLIENT', description: 'Created client: Acme Corp' },
      { userId: adminUser.id, action: 'CREATE_PROJECT', description: 'Created project: Acme Corp Website Redesign' },
      { userId: adminUser.id, action: 'CREATE_INVOICE', description: 'Created invoice: $2,500 (Paid)' },
      { userId: adminUser.id, action: 'CREATE_INVOICE', description: 'Created invoice: $2,500 (Unpaid)' },
      { userId: clientUser.id, action: 'LOGIN', description: 'Client logged into portal' },
    ],
  })
  console.log('✅ Created activity logs')

  console.log('\n🎉 Seed complete!')
  console.log('\nCredentials:')
  console.log('Admin: admin@fullweb.com / ChangeMe123!')
  console.log('Client: client@example.com / ClientPass123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
