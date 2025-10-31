import { Injectable, Logger } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';

export interface NarrativeRequest {
  topic: string;
  format: 'blog' | 'video' | 'social' | 'email';
  targetEmotion?: 'curiosity' | 'urgency' | 'hope' | 'fear' | 'joy' | 'surprise';
  storyStructure?: 'hero_journey' | 'problem_solution' | 'before_after' | 'cliffhanger';
  length?: 'short' | 'medium' | 'long';
}

export interface NarrativeOutput {
  hook: string;
  mainNarrative: string;
  emotionalArc: EmotionalArc[];
  psychologicalTriggers: PsychologicalTrigger[];
  storyBeats: StoryBeat[];
  resonanceScore: number; // 0-100
  viralPotential: number; // 0-100
}

export interface EmotionalArc {
  segment: string;
  emotion: string;
  intensity: number; // 0-100
  trigger: string;
}

export interface PsychologicalTrigger {
  type: string;
  location: string;
  description: string;
  effectiveness: number; // 0-100
}

export interface StoryBeat {
  beat: string;
  content: string;
  purpose: string;
  emotionalImpact: string;
}

@Injectable()
export class NeuralNarrativeService {
  private readonly logger = new Logger('NeuralNarrative');
  private readonly anthropic: Anthropic;

  // 47-point psychological trigger framework
  private readonly psychologicalTriggers = [
    'Scarcity', 'Social Proof', 'Authority', 'Reciprocity', 'Commitment', 'Liking',
    'Unity', 'Loss Aversion', 'Anchoring', 'Framing', 'Decoy Effect', 'Bandwagon',
    'FOMO', 'Curiosity Gap', 'Pattern Interrupt', 'Contrast Principle', 'Priming',
    'Endowment Effect', 'Sunk Cost', 'Status Quo Bias', 'Availability Heuristic',
    'Confirmation Bias', 'Dunning-Kruger', 'Halo Effect', 'Mere Exposure',
    'Negativity Bias', 'Optimism Bias', 'Recency Effect', 'Serial Position',
    'Von Restorff', 'Zeigarnik', 'Door in Face', 'Foot in Door', 'Low-Ball',
    'That\'s Not All', 'Peak-End Rule', 'Self-Serving Bias', 'Spotlight Effect',
    'Sunk-Cost Fallacy', 'Survivorship Bias', 'Cognitive Dissonance', 'Choice Paradox',
    'Analysis Paralysis', 'Hyperbolic Discounting', 'Present Bias', 'Action Bias',
    'Information Gap', 'Mystery Box',
  ];

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate compelling narrative using psychological triggers
   */
  async generateNarrative(request: NarrativeRequest): Promise<NarrativeOutput> {
    this.logger.log(`Generating ${request.format} narrative for "${request.topic}"...`);

    const narrative = await this.generateWithAI(request);

    this.logger.log(`Generated narrative with ${narrative.resonanceScore}/100 resonance score`);
    return narrative;
  }

  /**
   * Generate narrative using AI
   */
  private async generateWithAI(request: NarrativeRequest): Promise<NarrativeOutput> {
    const storyStructureGuide = this.getStoryStructureGuide(request.storyStructure || 'hero_journey');
    const emotionalGuide = this.getEmotionalGuide(request.targetEmotion || 'curiosity');

    const prompt = `You are a master storyteller and narrative designer specializing in viral content.

Create a compelling narrative for a dry cleaning/laundry marketplace (DryJets).

Topic: ${request.topic}
Format: ${request.format}
Target Emotion: ${request.targetEmotion || 'curiosity'}
Story Structure: ${request.storyStructure || 'hero_journey'}
Length: ${request.length || 'medium'}

${storyStructureGuide}

${emotionalGuide}

Psychological Triggers to Weave In:
${this.psychologicalTriggers.slice(0, 10).join(', ')}

CRITICAL REQUIREMENTS:
1. Hook must grab attention in first 3 seconds/lines
2. Create emotional resonance at sentence level
3. Build curiosity gaps that demand resolution
4. Use proven psychological triggers naturally
5. Include story beats that escalate tension
6. End with strong call-to-action or cliffhanger

Return JSON in this EXACT format:
{
  "hook": "Opening hook that grabs attention",
  "mainNarrative": "The complete narrative following story structure",
  "emotionalArc": [
    {
      "segment": "Opening",
      "emotion": "curiosity",
      "intensity": 80,
      "trigger": "Pattern interrupt - unexpected statistic"
    }
  ],
  "psychologicalTriggers": [
    {
      "type": "Scarcity",
      "location": "Second paragraph",
      "description": "Limited time offer creates urgency",
      "effectiveness": 85
    }
  ],
  "storyBeats": [
    {
      "beat": "Ordinary World",
      "content": "The text for this beat",
      "purpose": "Establish relatability",
      "emotionalImpact": "Recognition and connection"
    }
  ],
  "resonanceScore": 85,
  "viralPotential": 78
}

Return ONLY valid JSON.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result;
      }
    } catch (error) {
      this.logger.error(`Error generating narrative: ${error.message}`);
    }

    // Fallback
    return this.generateRuleBasedNarrative(request);
  }

  /**
   * Get story structure guide
   */
  private getStoryStructureGuide(structure: string): string {
    const guides = {
      hero_journey: `
Hero's Journey Structure:
1. Ordinary World: Show relatable current state (hassle of dry cleaning)
2. Call to Adventure: Present the problem/opportunity (DryJets solution)
3. Refusal of Call: Address objections ("Can I trust this?")
4. Meeting the Mentor: Introduce proof/authority
5. Crossing Threshold: First action step
6. Tests & Allies: Show benefits and social proof
7. Approach: Build anticipation
8. Ordeal: Moment of transformation
9. Reward: Show the payoff
10. Return: Call to action
`,
      problem_solution: `
Problem-Solution Structure:
1. Agitate the Problem: Make pain vivid and urgent
2. Amplify Consequences: Show cost of inaction
3. Introduce Solution: Present DryJets as answer
4. Prove It Works: Evidence and testimonials
5. Make It Easy: Remove friction
6. Call to Action: Clear next step
`,
      before_after: `
Before-After-Bridge Structure:
1. Before: Paint picture of current pain
2. After: Show transformed state
3. Bridge: DryJets is the path
4. Proof: Show it works
5. Action: Take first step
`,
      cliffhanger: `
Cliffhanger Structure (Serialized):
1. Hook: Start with intense moment
2. Backstory: Fill in context
3. Escalation: Build tension
4. Revelation: New information
5. Cliffhanger: Leave unresolved question
6. Tease: Hint at next installment
`,
    };

    return guides[structure] || guides.hero_journey;
  }

  /**
   * Get emotional guide
   */
  private getEmotionalGuide(emotion: string): string {
    const guides = {
      curiosity: `
Curiosity Tactics:
- Open information gaps immediately
- Use specific numbers that seem random (73% not 70%)
- Ask provocative questions
- Challenge common assumptions
- Tease insider knowledge
`,
      urgency: `
Urgency Tactics:
- Time-limited opportunities
- Scarcity signals
- Show what's at stake
- Countdown mechanics
- FOMO triggers
`,
      hope: `
Hope Tactics:
- Show transformation is possible
- Provide concrete path forward
- Share success stories
- Paint vivid "after" picture
- Remove obstacles
`,
      fear: `
Fear Tactics (Ethical):
- Highlight status quo risks
- Show cost of inaction
- Then provide safety/solution
- Never manipulate, always empower
`,
      joy: `
Joy Tactics:
- Celebrate wins
- Use humor and delight
- Share feel-good moments
- Create connection
- Spark positivity
`,
      surprise: `
Surprise Tactics:
- Subvert expectations
- Pattern interrupts
- Counterintuitive facts
- Plot twists
- Unexpected combinations
`,
    };

    return guides[emotion] || guides.curiosity;
  }

  /**
   * Rule-based fallback narrative generation
   */
  private generateRuleBasedNarrative(request: NarrativeRequest): NarrativeOutput {
    const hooks = {
      blog: 'What if I told you that 73% of people waste 4.2 hours per month on a task that should take 5 minutes?',
      video: 'Stop! Before you drive to the dry cleaners again, watch this.',
      social: 'The laundry hack that saved me 3 hours every week (and it\'s free).',
      email: 'I discovered something that changed how I think about dry cleaning forever.',
    };

    const narratives = {
      blog: `Most people don't realize they're hemorrhaging time and money on dry cleaning.

The average person makes 12 trips to the dry cleaner per year. Each trip takes 23 minutes (there and back). That's 4.6 hours annually just... driving.

But here's the twist: DryJets picks up your clothes, cleans them with eco-friendly methods, and delivers them back to you - all while you're doing literally anything else.

Sound too good to be true? That's what Sarah thought. She was skeptical. "What if they lose my clothes? What if the quality isn't good?"

Then she tried it once. Just once.

Now she's been a customer for 2 years. "I got my Saturdays back," she says. "I didn't realize how much mental energy I was spending on dry cleaning until I didn't have to think about it anymore."

The transformation isn't just about time. It's about freedom.

Ready to see what life looks like when dry cleaning just... handles itself?`,
      video: `[Scene: Person stressed, holding pile of dry cleaning]

This used to be my Saturday. Every. Single. Week.

Drive 15 minutes to the cleaners. Wait in line. Drive back. Pick up later. Repeat.

Then I found DryJets.

[Scene: Person using app on phone]

Now? I schedule a pickup. They grab my clothes. Clean them. And deliver them back.

I've reclaimed 12 hours this year. Twelve hours.

What would you do with an extra 12 hours?

[End screen: Download DryJets - Get 20% off]`,
    };

    return {
      hook: hooks[request.format] || hooks.blog,
      mainNarrative: narratives[request.format] || narratives.blog,
      emotionalArc: [
        { segment: 'Opening', emotion: 'curiosity', intensity: 80, trigger: 'Specific statistic (73%)' },
        { segment: 'Problem', emotion: 'frustration', intensity: 70, trigger: 'Relatable pain point' },
        { segment: 'Solution', emotion: 'hope', intensity: 85, trigger: 'Simple answer revealed' },
        { segment: 'Proof', emotion: 'trust', intensity: 75, trigger: 'Social proof (Sarah)' },
        { segment: 'Transformation', emotion: 'desire', intensity: 90, trigger: 'Vivid "after" state' },
        { segment: 'Action', emotion: 'urgency', intensity: 80, trigger: 'Direct question CTA' },
      ],
      psychologicalTriggers: [
        { type: 'Curiosity Gap', location: 'Hook', description: 'Specific stat creates mystery', effectiveness: 85 },
        { type: 'Loss Aversion', location: 'Problem section', description: 'Time hemorrhaging', effectiveness: 80 },
        { type: 'Social Proof', location: 'Middle', description: 'Sarah testimonial', effectiveness: 75 },
        { type: 'Contrast Principle', location: 'Before/After', description: 'Stressed vs Free', effectiveness: 82 },
        { type: 'Commitment', location: 'CTA', description: 'Just try once', effectiveness: 78 },
      ],
      storyBeats: [
        { beat: 'Hook', content: hooks[request.format], purpose: 'Grab attention', emotionalImpact: 'Curiosity' },
        { beat: 'Ordinary World', content: 'Monthly dry cleaning trips', purpose: 'Establish relatability', emotionalImpact: 'Recognition' },
        { beat: 'Problem', content: 'Time waste revelation', purpose: 'Amplify pain', emotionalImpact: 'Frustration' },
        { beat: 'Solution', content: 'DryJets introduction', purpose: 'Offer relief', emotionalImpact: 'Hope' },
        { beat: 'Proof', content: 'Sarah\'s transformation', purpose: 'Build trust', emotionalImpact: 'Belief' },
        { beat: 'Vision', content: 'Life with freedom', purpose: 'Paint desire', emotionalImpact: 'Aspiration' },
        { beat: 'CTA', content: 'Ready to transform?', purpose: 'Drive action', emotionalImpact: 'Urgency' },
      ],
      resonanceScore: 75,
      viralPotential: 68,
    };
  }

  /**
   * Analyze existing content for emotional resonance
   */
  async analyzeEmotionalResonance(content: string): Promise<{
    overallScore: number;
    emotionalArc: EmotionalArc[];
    triggers: PsychologicalTrigger[];
    improvements: string[];
  }> {
    this.logger.log('Analyzing emotional resonance...');

    const prompt = `Analyze this content for emotional resonance and psychological triggers:

${content}

Rate the emotional journey and identify psychological triggers used.

Return JSON:
{
  "overallScore": 75,
  "emotionalArc": [...],
  "triggers": [...],
  "improvements": ["suggestion 1", "suggestion 2"]
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error analyzing resonance: ${error.message}`);
    }

    return {
      overallScore: 60,
      emotionalArc: [],
      triggers: [],
      improvements: ['Add more specific examples', 'Strengthen emotional hooks', 'Include social proof'],
    };
  }

  /**
   * Generate cliffhanger for serialized content
   */
  async generateCliffhanger(currentContent: string, episode: number): Promise<{
    cliffhanger: string;
    nextEpisodeTease: string;
    openLoop: string;
  }> {
    const prompt = `Create a cliffhanger ending for episode ${episode} of serialized content about DryJets.

Current content summary:
${currentContent.substring(0, 500)}

Generate a cliffhanger that:
1. Leaves key question unanswered
2. Creates anticipation for next episode
3. Feels natural, not forced

Return JSON:
{
  "cliffhanger": "The cliffhanger ending",
  "nextEpisodeTease": "Tease for next episode",
  "openLoop": "The unresolved question"
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error generating cliffhanger: ${error.message}`);
    }

    return {
      cliffhanger: 'But what Sarah discovered next changed everything...',
      nextEpisodeTease: 'Next time: The secret method that tripled her results',
      openLoop: 'What was the discovery that changed everything?',
    };
  }
}
