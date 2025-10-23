'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { PhotoIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const imageCredits = [
  {
    section: 'Hero Section',
    images: [
      {
        id: 'photo-1582735689369-4fe89db7114c',
        description: 'Laundry delivery service background',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1582735689369-4fe89db7114c',
      },
    ],
  },
  {
    section: 'Behind the Scenes Process Gallery',
    images: [
      {
        id: 'photo-1517677208171-0bc6725a3e60',
        description: 'Modern laundromat facility interior',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1517677208171-0bc6725a3e60',
      },
      {
        id: 'photo-1556745753-b2904692b3cd',
        description: 'Professional laundry team at work',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1556745753-b2904692b3cd',
      },
      {
        id: 'photo-1545173168-9f1947eebb7f',
        description: 'Quality inspection and garment care',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1545173168-9f1947eebb7f',
      },
      {
        id: 'photo-1582735689369-4fe89db7114c',
        description: 'Professional cleaning process',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1582735689369-4fe89db7114c',
      },
      {
        id: 'photo-1610557892470-55d9e80c0bce',
        description: 'Fresh folded laundry packaging',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1610557892470-55d9e80c0bce',
      },
      {
        id: 'photo-1566576721346-d4a3b4eaeb55',
        description: 'Delivery driver in action',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1566576721346-d4a3b4eaeb55',
      },
    ],
  },
  {
    section: 'Services Showcase',
    images: [
      {
        id: 'photo-1556745753-b2904692b3cd',
        description: 'Professional dry cleaning garments',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1556745753-b2904692b3cd',
      },
      {
        id: 'photo-1610557892470-55d9e80c0bce',
        description: 'Clean folded towels and linens',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1610557892470-55d9e80c0bce',
      },
      {
        id: 'photo-1516762689617-e1cffcef479d',
        description: 'Tailor performing alterations',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1516762689617-e1cffcef479d',
      },
      {
        id: 'photo-1519741497674-611481863552',
        description: 'Wedding dress special care',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1519741497674-611481863552',
      },
    ],
  },
  {
    section: 'Customer Testimonials',
    images: [
      {
        id: 'photo-1494790108377-be9c29b29330',
        description: 'Professional woman portrait (Sarah Mitchell)',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1494790108377-be9c29b29330',
      },
      {
        id: 'photo-1507003211169-0a1dd7228f2d',
        description: 'Entrepreneur portrait (James Chen)',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1507003211169-0a1dd7228f2d',
      },
      {
        id: 'photo-1438761681033-6461ffad8d80',
        description: 'Real estate agent portrait (Emily Rodriguez)',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1438761681033-6461ffad8d80',
      },
      {
        id: 'photo-1500648767791-00dcc994a43e',
        description: 'Doctor portrait (Michael Thompson)',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1500648767791-00dcc994a43e',
      },
      {
        id: 'photo-1534528741775-53994a69daeb',
        description: 'Interior designer portrait (Lisa Park)',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1534528741775-53994a69daeb',
      },
    ],
  },
  {
    section: 'Partners Page',
    images: [
      {
        id: 'photo-1517677208171-0bc6725a3e60',
        description: 'Laundromat partner facility',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1517677208171-0bc6725a3e60',
      },
    ],
  },
  {
    section: 'Drive & Earn Page',
    images: [
      {
        id: 'photo-1566576721346-d4a3b4eaeb55',
        description: 'Delivery driver background',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1566576721346-d4a3b4eaeb55',
      },
    ],
  },
  {
    section: 'Footer Call-to-Action',
    images: [
      {
        id: 'photo-1610557892470-55d9e80c0bce',
        description: 'Fresh clean folded laundry background',
        photographer: 'Unsplash Contributor',
        url: 'https://unsplash.com/photos/1610557892470-55d9e80c0bce',
      },
    ],
  },
];

export default function ImageCreditsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-brand-navy to-slate-900">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <PhotoIcon className="w-12 h-12 text-brand-orange" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Image Credits
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're grateful to the talented photographers on Unsplash who make their work freely available.
              All images are used under the{' '}
              <a
                href="https://unsplash.com/license"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-orange hover:text-orange-400 underline"
              >
                Unsplash License
              </a>
              .
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Unsplash License Summary */}
      <section className="py-12 bg-white border-b border-gray-200">
        <Container size="narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-display font-bold text-brand-navy mb-4">
              About the Unsplash License
            </h2>
            <p className="text-gray-700 mb-4">
              All photos used on this website are sourced from{' '}
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:text-blue-700 font-semibold"
              >
                Unsplash.com
              </a>
              , a platform providing freely usable images.
            </p>
            <p className="text-gray-700 mb-4">
              Under the Unsplash License, images can be used for free for commercial and non-commercial purposes without
              permission from or attributing the photographer or Unsplash. However, we choose to provide attribution
              as a gesture of gratitude and support for the photography community.
            </p>
            <a
              href="https://unsplash.com/license"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-orange hover:text-orange-600 font-semibold"
            >
              Read Full License Terms
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
          </motion.div>
        </Container>
      </section>

      {/* Image Credits by Section */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="space-y-12">
            {imageCredits.map((section, sectionIndex) => (
              <motion.div
                key={section.section}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: sectionIndex * 0.1, duration: 0.6 }}
              >
                <h2 className="text-3xl font-display font-bold text-brand-navy mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-brand-orange to-brand-primary rounded-full" />
                  {section.section}
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.images.map((image, imageIndex) => (
                    <motion.div
                      key={`${image.id}-${imageIndex}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: imageIndex * 0.05, duration: 0.4 }}
                      className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all border border-gray-100 overflow-hidden group"
                    >
                      {/* Image Preview */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={`https://images.unsplash.com/${image.id}?w=600&q=80&auto=format&fit=crop`}
                          alt={image.description}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Image Info */}
                      <div className="p-6">
                        <p className="text-sm text-gray-600 mb-3">{image.description}</p>
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">Photo by:</span>{' '}
                            {image.photographer}
                          </p>
                          <p className="text-xs text-gray-500 font-mono break-all">
                            <span className="font-semibold text-gray-700">ID:</span> {image.id}
                          </p>
                          <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-brand-primary hover:text-blue-700 font-semibold mt-2"
                          >
                            View on Unsplash
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-brand-primary to-brand-lavender">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Support Photographers on Unsplash
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              If you enjoyed these photos, consider visiting Unsplash to discover more incredible work
              and support the photography community.
            </p>
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-primary font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Visit Unsplash
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </a>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}
