'use client';

import React, { useState } from 'react';
import { Sidebar, type NavView } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardView } from '../components/DashboardView';
import { ProjectsView } from '../components/ProjectsView';
import { TasksView } from '../components/TasksView';
import { AiAssistantView } from '../components/AiAssistantView';
import { ProfileView } from '../components/ProfileView';
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

  // Modals state
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
      user: 'You',
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
      user: 'You',
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
      user: 'You',
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

          {activeView === 'workspace' && <ProfileView />}
        </main>
      </div>
    </div>
  );
}
