import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Truck, Clock, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 lg:text-7xl">
              Premium Dry Cleaning,
              <span className="block text-primary-600">Delivered to You</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600 lg:text-2xl">
              Schedule pickup, track your order in real-time, and get your clothes back
              fresh and perfectly cleaned. Professional care, on your schedule.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/business">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  For Businesses
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-600" />
                <span>10,000+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-600" />
                <span>4.9★ Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-600" />
                <span>Same-Day Pickup Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              How DryJets Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Getting professional dry cleaning has never been easier. Just three simple steps.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Truck className="h-12 w-12 text-primary-600" />}
              title="1. Schedule Pickup"
              description="Choose your time slot. Our driver arrives at your door to collect your items."
            />
            <FeatureCard
              icon={<Clock className="h-12 w-12 text-primary-600" />}
              title="2. Professional Cleaning"
              description="Expert cleaners handle your garments with care using premium eco-friendly products."
            />
            <FeatureCard
              icon={<Shield className="h-12 w-12 text-primary-600" />}
              title="3. Fresh Delivery"
              description="Track your order in real-time. Get notified when your clean clothes are on the way."
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gray-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Services for Everyone
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              From individuals to large enterprises, we have a solution for you.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <ServiceCard
              title="For Consumers"
              description="Personal laundry and dry cleaning for busy professionals and families."
              features={[
                'On-demand pickup & delivery',
                'Wardrobe management',
                'Loyalty rewards',
                'Real-time tracking',
              ]}
              href="/consumer"
            />
            <ServiceCard
              title="For Businesses"
              description="Corporate solutions for hotels, restaurants, salons, and offices."
              features={[
                'Bulk order discounts',
                'Invoice management',
                'Recurring schedules',
                'Team accounts',
              ]}
              href="/business"
              featured
            />
            <ServiceCard
              title="For Enterprises"
              description="Multi-location management for chains and large organizations."
              features={[
                'Centralized billing',
                'Branch management',
                'API integrations',
                'Custom pricing',
              ]}
              href="/enterprise"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Ready to Experience Premium Dry Cleaning?
          </h2>
          <p className="mb-8 text-xl text-primary-100">
            Join thousands of satisfied customers. Get started in minutes.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold">DryJets</h3>
              <p className="text-sm text-gray-600">
                Premium dry cleaning and laundry services delivered to your door.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/business">For Business</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            © 2025 DryJets. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function ServiceCard({
  title,
  description,
  features,
  href,
  featured = false,
}: {
  title: string;
  description: string;
  features: string[];
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-8 ${
        featured
          ? 'border-primary-600 bg-white shadow-lg'
          : 'border-gray-200 bg-white'
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary-600 px-4 py-1 text-sm font-semibold text-white">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="mb-2 text-2xl font-bold text-gray-900">{title}</h3>
      <p className="mb-6 text-gray-600">{description}</p>
      <ul className="mb-8 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-600" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={href}>
        <Button
          variant={featured ? 'default' : 'outline'}
          className="w-full"
        >
          Learn More
        </Button>
      </Link>
    </div>
  );
}
