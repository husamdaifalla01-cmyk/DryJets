'use client';

import React, { useState } from 'react';
import { useParams } from 'next/link';
import Link from 'next/link';
import { useProfile } from '@/lib/hooks/useProfile';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandTextarea, CommandInput } from '@/components/command/CommandInput';
import { DataPanel, CommandPanel } from '@/components/command/CommandPanel';
import { StatusBadge } from '@/components/command/StatusBadge';
import { ArrowLeft, Sparkles, Copy, Send, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORM_INFO, Platform } from '@/types/connection';

/**
 * CONTENT REPURPOSING PAGE
 *
 * Transform one piece of content into 50+ platform-optimized posts.
 * Features input methods, platform selection, and output preview.
 */

const ALL_PLATFORMS: Platform[] = ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube'];

export default function ContentPage() {
  const params = useParams();
  const profileId = params.id as string;
  const { data: profile } = useProfile(profileId);

  const [inputMethod, setInputMethod] = useState<'paste' | 'upload' | 'url'>('paste');
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(ALL_PLATFORMS);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [outputs, setOutputs] = useState<any[]>([]);

  const wordCount = content.trim().split(/\s+/).length;

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleRepurpose = () => {
    setIsRepurposing(true);
    // Simulate API call
    setTimeout(() => {
      setOutputs([
        { platform: 'twitter', content: 'Check out this amazing insight about AI marketing automation! 🚀 #MarketingAI #Automation', score: 95 },
        { platform: 'linkedin', content: 'The future of marketing automation is here. Our latest analysis shows that AI-powered platforms can reduce costs by 99% while increasing reach by 300%. Here\'s what you need to know...', score: 92 },
        { platform: 'facebook', content: 'Want to revolutionize your marketing strategy? Discover how AI automation is changing the game for SMBs. Learn more in our latest post! 💡', score: 88 },
      ]);
      setIsRepurposing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={`/profiles/${profileId}`}
        className="inline-flex items-center gap-2 text-text-tertiary hover:text-neon-cyan transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO PROFILE
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-cyan mb-2">
          CONTENT REPURPOSING
        </h1>
        <p className="text-text-tertiary">
          Transform one piece of content into 50+ platform-optimized posts
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-6">
          <CommandPanel>
            <h3 className="text-sm text-text-tertiary uppercase mb-4">SOURCE CONTENT</h3>

            {/* Input Method Tabs */}
            <div className="flex gap-2 mb-4">
              {(['paste', 'upload', 'url'] as const).map((method) => (
                <button
                  key={method}
                  className={cn(
                    'px-4 py-2 text-sm uppercase font-mono transition-all',
                    inputMethod === method
                      ? 'bg-neon-cyan text-bg-primary'
                      : 'bg-bg-elevated text-text-tertiary hover:text-text-primary'
                  )}
                  onClick={() => setInputMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Paste Text */}
            {inputMethod === 'paste' && (
              <div>
                <CommandTextarea
                  className="w-full h-64"
                  placeholder="Paste your blog post, article, or content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex justify-between mt-2 text-sm text-text-tertiary">
                  <span>{wordCount} words</span>
                  <span>{Math.ceil(wordCount / 200)} min read</span>
                </div>
              </div>
            )}

            {/* Upload File */}
            {inputMethod === 'upload' && (
              <div className="border-2 border-dashed border-border-emphasis h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-text-tertiary">Drop file here or click to upload</p>
                  <p className="text-text-tertiary text-xs mt-2">Supports .txt, .md, .docx</p>
                </div>
              </div>
            )}

            {/* Import URL */}
            {inputMethod === 'url' && (
              <div>
                <CommandInput
                  className="w-full"
                  placeholder="https://example.com/blog/post"
                />
                <CommandButton className="mt-4 w-full">FETCH CONTENT</CommandButton>
              </div>
            )}
          </CommandPanel>

          {/* Platform Selection */}
          <DataPanel>
            <h3 className="text-sm text-text-tertiary uppercase mb-4">TARGET PLATFORMS</h3>
            <div className="grid grid-cols-2 gap-3">
              {ALL_PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  className={cn(
                    'flex items-center gap-3 p-3 border-2 transition-all',
                    selectedPlatforms.includes(platform)
                      ? 'border-neon-cyan bg-neon-cyan/10'
                      : 'border-border-emphasis hover:border-neon-cyan'
                  )}
                  onClick={() => togglePlatform(platform)}
                >
                  <div className={cn(
                    'w-5 h-5 border-2 flex items-center justify-center',
                    selectedPlatforms.includes(platform)
                      ? 'border-neon-cyan bg-neon-cyan'
                      : 'border-border-emphasis'
                  )}>
                    {selectedPlatforms.includes(platform) && (
                      <Check className="w-4 h-4 text-bg-primary" />
                    )}
                  </div>
                  <span className="text-sm">{PLATFORM_INFO[platform].name}</span>
                </button>
              ))}
            </div>
          </DataPanel>

          {/* Repurpose Button */}
          <CommandButton
            className="w-full"
            onClick={handleRepurpose}
            loading={isRepurposing}
            disabled={!content || selectedPlatforms.length === 0}
          >
            <Sparkles className="w-4 h-4" />
            REPURPOSE CONTENT
          </CommandButton>
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          {outputs.length === 0 ? (
            <CommandPanel>
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-neon-cyan mx-auto mb-4" />
                <h3 className="font-bold mb-2">READY TO REPURPOSE</h3>
                <p className="text-text-tertiary text-sm">
                  Add your content and select platforms to generate optimized posts
                </p>
              </div>
            </CommandPanel>
          ) : (
            <>
              <h3 className="text-sm text-text-tertiary uppercase">
                GENERATED OUTPUTS ({outputs.length})
              </h3>
              {outputs.map((output, idx) => (
                <DataPanel key={idx}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase">
                        {PLATFORM_INFO[output.platform as Platform].name}
                      </span>
                    </div>
                    <StatusBadge status={output.score > 90 ? 'active' : output.score > 80 ? 'generating' : 'paused'}>
                      {output.score}% MATCH
                    </StatusBadge>
                  </div>
                  <div className="bg-bg-primary p-3 border-l-2 border-neon-cyan mb-3">
                    <p className="text-sm whitespace-pre-wrap">{output.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <CommandButton size="sm" variant="ghost">
                      <Copy className="w-3 h-3" />
                      COPY
                    </CommandButton>
                    <CommandButton size="sm">
                      <Send className="w-3 h-3" />
                      PUBLISH
                    </CommandButton>
                  </div>
                </DataPanel>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
