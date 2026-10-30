'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, type NavView } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardView } from '../components/DashboardView';
import { ProjectsView } from '../components/ProjectsView';
import { TasksView } from '../components/TasksView';
import { AiAssistantView } from '../components/AiAssistantView';
import { ProfileView, type UserProfileData } from '../components/ProfileView';
import { AuthModal } from '../components/AuthModal';
import { createClient } from '../lib/supabase/client';
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  RECENT_ACTIVITIES,
  type Project,
  type TaskItem,
  type Activity,
} from '../lib/mockData';

export default function AppShell() {
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [activities, setActivities] = useState<Activity[]>(RECENT_ACTIVITIES);
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals state
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Sync profile from API Gateway
  const syncUserProfile = async (accessToken?: string) => {
    try {
      let token = accessToken;
      if (!token) {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
      }
      if (!token) return;

      setIsProfileLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/profiles/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setProfile(json.data);
        }
      }
    } catch (err) {
      console.warn('Could not sync user profile from API Gateway:', (err as Error).message);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Update profile in database via API Gateway
  const handleUpdateProfile = async (updateDto: { displayName?: string; bio?: string }): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return false;

      setIsSavingProfile(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/profiles/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updateDto),
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setProfile(json.data);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Check for active Supabase session on client load
  useEffect(() => {
    const isConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );

    if (!isConfigured) return;

    try {
      const supabase = createClient();

      // 1. Initial user check
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setUserEmail(user.email);
        }
      });

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          syncUserProfile(session.access_token);
        }
      });

      // 2. Auth state change listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          if (session.access_token) {
            syncUserProfile(session.access_token);
          }
        } else {
          setUserEmail(null);
          setProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // Safe fallback if Supabase client cannot be initialized
    }
  }, []);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUserEmail(null);
      setProfile(null);

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        user: 'You',
        action: 'signed out from',
        target: 'Supabase Auth',
        time: 'Just now',
        badge: 'updated',
      };
      setActivities((prev) => [newActivity, ...prev]);
    } catch {
      setUserEmail(null);
      setProfile(null);
    }
  };

  const handleAuthSuccess = (email: string) => {
    setUserEmail(email);
    syncUserProfile();
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      user: email,
      action: 'authenticated via',
      target: 'Supabase Auth',
      time: 'Just now',
      badge: 'created',
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // 1. Create Project Handler
  const handleCreateProject = (
    newProjData: Omit<Project, 'id' | 'progress' | 'taskCount' | 'completedTaskCount'>,
  ) => {
    const newProject: Project = {
      ...newProjData,
      id: `proj-${Date.now()}`,
      progress: 0,
      taskCount: 0,
      completedTaskCount: 0,
    };

    setProjects((prev) => [newProject, ...prev]);

    // Add activity
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      user: userEmail || 'You',
      action: 'created project',
      target: newProject.name,
      time: 'Just now',
      badge: 'created',
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // 2. Add Task Handler
  const handleAddTask = (newTaskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...newTaskData,
      id: `task-${Date.now()}`,
    };

    setTasks((prev) => [newTask, ...prev]);

    // Update project stats
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === newTask.projectId) {
          const updatedTotal = p.taskCount + 1;
          const updatedDone = newTask.status === 'DONE' ? p.completedTaskCount + 1 : p.completedTaskCount;
          const updatedProgress = Math.round((updatedDone / updatedTotal) * 100);
          return {
            ...p,
            taskCount: updatedTotal,
            completedTaskCount: updatedDone,
            progress: updatedProgress,
          };
        }
        return p;
      }),
    );

    // Add activity
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      user: userEmail || 'You',
      action: 'added task',
      target: newTask.title,
      time: 'Just now',
      badge: 'created',
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // 3. Update Task Status Handler
  const handleUpdateTaskStatus = (
    taskId: string,
    newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE',
  ) => {
    const existingTask = tasks.find((t) => t.id === taskId);
    if (!existingTask || existingTask.status === newStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    // Update Project metrics dynamically
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === existingTask.projectId) {
          const wasDone = existingTask.status === 'DONE';
          const isNowDone = newStatus === 'DONE';
          const updatedDone = isNowDone
            ? p.completedTaskCount + 1
            : wasDone
            ? Math.max(0, p.completedTaskCount - 1)
            : p.completedTaskCount;
          const updatedProgress = p.taskCount > 0 ? Math.round((updatedDone / p.taskCount) * 100) : 0;
          return {
            ...p,
            completedTaskCount: updatedDone,
            progress: updatedProgress,
          };
        }
        return p;
      }),
    );

    // Add activity
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      user: userEmail || 'You',
      action: newStatus === 'DONE' ? 'completed task' : 'updated status of',
      target: existingTask.title,
      time: 'Just now',
      badge: newStatus === 'DONE' ? 'completed' : 'updated',
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          activeView={activeView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
          onOpenCreateTask={() => setIsAddTaskModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
          userEmail={userEmail}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
        />

        <main>
          {activeView === 'dashboard' && (
            <DashboardView
              projects={projects}
              tasks={tasks}
              activities={activities}
              onNavigateToProjects={() => setActiveView('projects')}
              onNavigateToTasks={() => setActiveView('tasks')}
            />
          )}

          {activeView === 'projects' && (
            <ProjectsView
              projects={projects}
              searchQuery={searchQuery}
              onCreateProject={handleCreateProject}
              isCreateModalOpen={isCreateProjectModalOpen}
              onOpenCreateModal={() => setIsCreateProjectModalOpen(true)}
              onCloseCreateModal={() => setIsCreateProjectModalOpen(false)}
            />
          )}

          {activeView === 'tasks' && (
            <TasksView
              tasks={tasks}
              projects={projects}
              searchQuery={searchQuery}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              isAddModalOpen={isAddTaskModalOpen}
              onOpenAddModal={() => setIsAddTaskModalOpen(true)}
              onCloseAddModal={() => setIsAddTaskModalOpen(false)}
            />
          )}

          {activeView === 'ai' && (
            <AiAssistantView onAcceptAiDraft={handleAddTask} />
          )}

          {activeView === 'workspace' && (
            <ProfileView
              userEmail={userEmail}
              profile={profile}
              isLoading={isProfileLoading}
              onUpdateProfile={handleUpdateProfile}
              isSaving={isSavingProfile}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
