import { Post, User, Notification, Comment } from './types';

export const CURRENT_USER: User = {
  name: 'Alex Rivera',
  handle: '@arivera',
  avatarUrl: 'https://picsum.photos/seed/alex/200/200',
  bio: 'Product Designer & AI Optimist. Building interfaces for the next era of computing.',
  location: 'San Francisco, CA',
  website: 'discuzz.ai/arivera',
  stats: {
    followers: 1205,
    following: 5
  }
};

export const MOCK_USERS: User[] = [
  {
    name: "Sarah Chen",
    handle: "@schen_tech",
    avatarUrl: "https://picsum.photos/seed/sarah/200/200",
    bio: "Tech ethicist. Writing about the intersection of code and consciousness.",
    location: "New York, NY",
    stats: { followers: 8900, following: 120 }
  },
  {
    name: "David Miller",
    handle: "@d_miller",
    avatarUrl: "https://picsum.photos/seed/david/200/200",
    bio: "Accelerationist. Building the future, fast.",
    location: "Austin, TX",
    stats: { followers: 5400, following: 890 }
  },
  {
    name: "Elena Rostova",
    handle: "@elena_ai",
    avatarUrl: "https://picsum.photos/seed/elena/200/200",
    bio: "AI Researcher @DeepMind. Focused on human-machine collaboration.",
    location: "London, UK",
    stats: { followers: 12500, following: 340 }
  },
  {
    name: "Marcus Johnson",
    handle: "@marcus_j",
    avatarUrl: "https://picsum.photos/seed/marcus/200/200",
    bio: "Systems Architect. Complexity theory enthusiast.",
    location: "Berlin, DE",
    stats: { followers: 3200, following: 450 }
  },
  {
    name: "Priya Patel",
    handle: "@priya_dev",
    avatarUrl: "https://picsum.photos/seed/priya/200/200",
    bio: "Frontend Wizard. making the web silky smooth.",
    location: "Toronto, CA",
    stats: { followers: 4100, following: 670 }
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'Sarah Chen',
      handle: '@schen_tech',
      avatarUrl: 'https://picsum.photos/seed/sarah/200/200'
    },
    postPreview: "The future of UI is not graphical, it's contextual...",
    timestamp: Date.now() - 1800000,
    read: false
  },
  {
    id: '2',
    type: 'reply',
    user: {
      name: 'David Miller',
      handle: '@d_miller',
      avatarUrl: 'https://picsum.photos/seed/david/200/200'
    },
    postPreview: "We need to rethink how we approach...",
    timestamp: Date.now() - 3600000,
    read: true
  },
  {
    id: '3',
    type: 'follow',
    user: {
      name: 'Elena Rostova',
      handle: '@elena_ai',
      avatarUrl: 'https://picsum.photos/seed/elena/200/200'
    },
    timestamp: Date.now() - 86400000,
    read: true
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    authorName: 'Sarah Chen',
    authorHandle: '@schen_tech',
    content: "Remote work isn't just a perk; it's the primary filter for organizational efficiency. If your company can't operate asynchronously, you don't have a culture problem, you have a documentation problem.",
    imageUrl: "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?q=80&w=2000&auto=format&fit=crop",
    timestamp: Date.now() - 3600000,
    likes: 1240,
    replyCount: 89,
    avatarUrl: 'https://picsum.photos/seed/sarah/200/200',
    contextProfile: {
      intent: "To challenge the narrative that remote work kills culture, arguing instead that it reveals operational weaknesses.",
      tone: "Assertive, professional, analytical.",
      assumptions: "Assumes that documentation is the backbone of scalability.",
      audience: "Tech founders, operations managers, HR leaders.",
      coreArgument: "Asynchronous workflows force better documentation, which is a net positive regardless of location."
    }
  },
  {
    id: '2',
    authorName: 'David Miller',
    authorHandle: '@d_miller',
    content: "We are over-indexing on AI safety to the detriment of AI utility. The precautionary principle is stifling innovation in areas where the risk profile is actually negligible.",
    timestamp: Date.now() - 7200000,
    likes: 850,
    replyCount: 245,
    avatarUrl: 'https://picsum.photos/seed/david/200/200',
    contextProfile: {
      intent: "To shift the window of discourse towards accelerationism.",
      tone: "Frustrated, urgent, forward-looking.",
      assumptions: "Current regulations are based on sci-fi fears rather than empirical data.",
      audience: "Policy makers, AI researchers.",
      coreArgument: "Stifling innovation now has a higher opportunity cost than the hypothetical risks of unchecked AI."
    }
  },
  {
    id: '3',
    authorName: 'Elena Rostova',
    authorHandle: '@elena_ai',
    content: "The Turing Test is dead. The new benchmark for AI isn't 'can it trick a human?', it's 'can it collaborate with a human to produce something neither could create alone?'. Co-creativity is the metric.",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop",
    timestamp: Date.now() - 15000000,
    likes: 3200,
    replyCount: 156,
    avatarUrl: 'https://picsum.photos/seed/elena/200/200',
    contextProfile: {
      intent: "To redefine AI evaluation metrics from deception to collaboration.",
      tone: "Visionary, inspiring, academic.",
      assumptions: "Human-AI collaboration is the end goal, not autonomous replacement.",
      audience: "AI researchers, designers, artists.",
      coreArgument: "Utility in collaboration is a more valuable metric than imitation of humanity."
    }
  },
  {
    id: '4',
    authorName: 'Marcus Johnson',
    authorHandle: '@marcus_j',
    content: "Complexity is the enemy of execution. We build systems to manage chaos, but often those systems become the chaos themselves. Simplification is the ultimate sophistication.",
    imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=2000&auto=format&fit=crop",
    timestamp: Date.now() - 25000000,
    likes: 420,
    replyCount: 45,
    avatarUrl: 'https://picsum.photos/seed/marcus/200/200',
    contextProfile: {
      intent: "To advocate for radical simplification in systems architecture.",
      tone: "Critical, philosophical.",
      assumptions: "Most complexity is artificial and unnecessary.",
      audience: "Engineers, Product Managers.",
      coreArgument: "Systems designed to manage complexity often introduce more complexity; reduction is better than management."
    }
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: {
        name: 'David Miller',
        handle: '@d_miller',
        avatarUrl: 'https://picsum.photos/seed/david/200/200'
    },
    content: "This ignores the serendipity of hallway conversations. Documentation is cold; culture is warm.",
    timestamp: Date.now() - 1800000
  },
  {
    id: 'c2',
    author: {
        name: 'Sarah Chen (AI Delegate)',
        handle: '@schen_tech',
        avatarUrl: 'https://picsum.photos/seed/sarah/200/200'
    },
    content: "I'd argue that relying on 'hallway serendipity' excludes anyone not in that specific hallway. Documentation democratizes information. Warmth can exist in how we communicate asynchronously, it doesn't require physical proximity.",
    timestamp: Date.now() - 1790000,
    isAiResponse: true,
    replyToId: 'c1'
  }
];
