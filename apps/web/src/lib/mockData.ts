export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'In Progress' | 'Planning' | 'Completed';
  progress: number;
  taskCount: number;
  completedTaskCount: number;
  dueDate: string;
  lead: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
  assignee: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  badge: 'created' | 'completed' | 'updated';
}

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Customer Portal Redesign',
    description: 'Modernizing the self-service web portal with Next.js and Supabase Auth.',
    status: 'In Progress',
    progress: 68,
    taskCount: 12,
    completedTaskCount: 8,
    dueDate: 'Nov 15, 2026',
    lead: 'Alex Chen',
  },
  {
    id: 'proj-2',
    name: 'Mobile App API Migration',
    description: 'Decomposing monolith into NestJS microservices with OpenAPI schemas.',
    status: 'In Progress',
    progress: 42,
    taskCount: 18,
    completedTaskCount: 7,
    dueDate: 'Dec 01, 2026',
    lead: 'Rishika Gupta',
  },
  {
    id: 'proj-3',
    name: 'AI Smart Task Assistant',
    description: 'Context-bounded advisory agent for drafting task proposals and subtasks.',
    status: 'Planning',
    progress: 15,
    taskCount: 8,
    completedTaskCount: 1,
    dueDate: 'Dec 20, 2026',
    lead: 'Sarah Jenkins',
  },
  {
    id: 'proj-4',
    name: 'Security & RBAC Hardening',
    description: 'Auditing JWT claims verification and resource-scoped authorization policies.',
    status: 'Completed',
    progress: 100,
    taskCount: 6,
    completedTaskCount: 6,
    dueDate: 'Oct 25, 2026',
    lead: 'David Kim',
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Implement Supabase SSR cookie session handler',
    description: 'Set up PKCE authentication callback and secure session refresh in Next.js.',
    projectId: 'proj-1',
    projectName: 'Customer Portal Redesign',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: 'Tomorrow',
    assignee: 'Alex Chen',
  },
  {
    id: 'task-2',
    title: 'Validate JWT signature with remote Supabase JWKS',
    description: 'Configure gateway guard with jose verifier for asymmetric signing keys.',
    projectId: 'proj-2',
    projectName: 'Mobile App API Migration',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: 'Oct 28',
    assignee: 'Rishika Gupta',
  },
  {
    id: 'task-3',
    title: 'Design idempotent UserProfile provisioning logic',
    description: 'Ensure atomic upsert prevents race conditions on simultaneous first sign-ins.',
    projectId: 'proj-2',
    projectName: 'Mobile App API Migration',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: 'Oct 28',
    assignee: 'Rishika Gupta',
  },
  {
    id: 'task-4',
    title: 'Build task status transition buttons in UI',
    description: 'Allow team members to move tasks across To Do, In Progress, and Done boards.',
    projectId: 'proj-1',
    projectName: 'Customer Portal Redesign',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: 'Nov 02',
    assignee: 'Sarah Jenkins',
  },
  {
    id: 'task-5',
    title: 'Define JSON schema for AI task draft generation',
    description: 'Drafting subtasks requires strict enum validation before persistence.',
    projectId: 'proj-3',
    projectName: 'AI Smart Task Assistant',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: 'Nov 10',
    assignee: 'David Kim',
  },
  {
    id: 'task-6',
    title: 'Benchmark PostgreSQL connection pooler under peak load',
    description: 'Verify Supavisor transaction pool capacity against target latency SLOs.',
    projectId: 'proj-4',
    projectName: 'Security & RBAC Hardening',
    status: 'TODO',
    priority: 'LOW',
    dueDate: 'Nov 12',
    assignee: 'Alex Chen',
  },
];

export const RECENT_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    user: 'Rishika Gupta',
    action: 'completed task',
    target: 'Validate JWT signature with remote Supabase JWKS',
    time: '25 minutes ago',
    badge: 'completed',
  },
  {
    id: 'act-2',
    user: 'Alex Chen',
    action: 'updated status of',
    target: 'Customer Portal Redesign',
    time: '1 hour ago',
    badge: 'updated',
  },
  {
    id: 'act-3',
    user: 'Sarah Jenkins',
    action: 'created new project',
    target: 'AI Smart Task Assistant',
    time: '3 hours ago',
    badge: 'created',
  },
  {
    id: 'act-4',
    user: 'David Kim',
    action: 'completed audit on',
    target: 'Security & RBAC Hardening',
    time: 'Yesterday',
    badge: 'completed',
  },
];

export const DEMO_AI_SUGGESTIONS = [
  {
    id: 'ai-sug-1',
    title: 'Implement Database Connection Health Probe',
    projectId: 'proj-2',
    projectName: 'Mobile App API Migration',
    priority: 'HIGH' as const,
    estimatedHours: '3 hours',
    rationale:
      'Identified from architecture requirement 6.1: Connection pooling needs an active health check before deployment.',
    subtasks: [
      'Add /health/db probe to identity-service',
      'Set timeout threshold to 1500ms',
      'Return 503 Service Unavailable when pool exhausts',
    ],
  },
  {
    id: 'ai-sug-2',
    title: 'Configure Asymmetric Key Rotation Cache',
    projectId: 'proj-4',
    projectName: 'Security & RBAC Hardening',
    priority: 'MEDIUM' as const,
    estimatedHours: '2 hours',
    rationale:
      'Supabase JWKS signing keys can rotate automatically; gateway should safely refresh cached keys on signature mismatch.',
    subtasks: [
      'Configure jose JWKS cache maxAge',
      'Add fallback retry on kid mismatch',
      'Log key rotation events to audit trail',
    ],
  },
];

export const DEMO_WORKSPACE = {
  name: 'Acme Product Engineering',
  slug: 'acme-eng',
  role: 'Workspace Admin (Demo)',
  totalMembers: 8,
  createdAt: 'Oct 2026',
  plan: 'Team Tier',
};
