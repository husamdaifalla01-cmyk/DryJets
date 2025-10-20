'use client';

/**
 * Help & Support Page - Customer Support Center
 *
 * Features:
 * - FAQ accordion with common questions
 * - Support ticket submission form
 * - Knowledge base links (placeholder)
 * - Live chat integration (placeholder)
 * - Contact information
 */

import * as React from 'react';
import { HelpCircle, MessageSquare, Book, Mail, Phone, Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button-v2';
import { Card } from '@/components/ui/card-v2';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'How do I create a new order?',
    answer: 'Click the "Add New Order" button on the dashboard. Fill in customer information, select services, and choose payment method. Orders are automatically saved.',
  },
  {
    question: 'What should I do if the internet goes down?',
    answer: 'DryJets works offline automatically. Continue creating orders as normal - they will be saved locally and sync when the connection is restored. Look for the offline indicator in the header.',
  },
  {
    question: 'How do I track equipment maintenance?',
    answer: 'Go to the Equipment page to view all machines. Each machine shows health scores, maintenance schedules, and alerts. Click on a machine for detailed telemetry data.',
  },
  {
    question: 'Can I export reports?',
    answer: 'Yes! Go to the Reports page, select the report type you need, and click the "Export" button. Reports can be downloaded as CSV or PDF files.',
  },
  {
    question: 'How do I manage team members?',
    answer: 'Navigate to Settings → Team tab. You can invite new members, assign roles, and manage permissions. Only owners and managers can add team members.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'We support credit/debit cards via Stripe, as well as cash and "pay later" options. Payment settings can be configured in Settings → Integrations.',
  },
];

const quickLinks = [
  { title: 'Getting Started Guide', icon: Book, href: '#' },
  { title: 'Video Tutorials', icon: Book, href: '#' },
  { title: 'API Documentation', icon: Book, href: '#' },
  { title: 'Release Notes', icon: Book, href: '#' },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [ticketForm, setTicketForm] = React.useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: '',
  });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit support ticket to API
    console.log('Support ticket submitted:', ticketForm);
    alert('Support ticket submitted successfully! We\'ll respond within 24 hours.');
    setTicketForm({ subject: '', category: 'technical', priority: 'medium', description: '' });
  };

  return (
    <div className="container mx-auto py-6 lg:py-10 px-4 lg:px-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Find answers and get assistance</p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Live Chat</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Available 24/7</p>
          <Button variant="outline" size="sm" className="w-full">Start Chat</Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email Support</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-3">support@dryjets.com</p>
          <Button variant="outline" size="sm" className="w-full">Send Email</Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Phone className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone Support</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1-800-DRY-JETS</p>
          <Button variant="outline" size="sm" className="w-full">Call Now</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 text-gray-500 transition-transform duration-200',
                        openFaq === index && 'transform rotate-180'
                      )}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Ticket Form */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Send className="h-5 w-5" />
              Submit a Support Ticket
            </h2>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  placeholder="Please provide as much detail as possible..."
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700">
                <Send className="h-4 w-4 mr-2" />
                Submit Ticket
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar - Quick Links */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Book className="h-5 w-5" />
              Knowledge Base
            </h3>
            <div className="space-y-2">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={index}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-gray-500 group-hover:text-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600">
                      {link.title}
                    </span>
                  </a>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary-50 to-success-50 dark:from-primary-900/20 dark:to-success-900/20 border-primary-200 dark:border-primary-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Need Immediate Help?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Our support team is available 24/7 to assist you with urgent issues.
            </p>
            <Button className="w-full bg-primary-600 hover:bg-primary-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Live Chat
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">API</span>
                <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Database</span>
                <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Payments</span>
                <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded">Operational</span>
              </div>
            </div>
            <a href="#" className="text-xs text-primary-600 hover:text-primary-700 mt-3 inline-block">
              View Status Page →
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
