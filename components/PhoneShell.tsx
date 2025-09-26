
import React, { useState } from 'react';
import Header from './StatusBar';
import ScreenContent from './ScreenContent';
import TabBar from './HomeBar';
import { UserRole, StaffMember, Task, Incident } from '../src/App';

export type AdminTabType = 'dashboard' | 'tasks' | 'incidents' | 'staff' | 'chat';
export type WorkerTabType = 'my-tasks' | 'report' | 'chat' | 'profile';
export type TabType = AdminTabType | WorkerTabType;

interface PhoneShellProps {
  userRole: UserRole;
  onLogout: () => void;
  staff: StaffMember[];
  onAddStaff: (staffMember: Omit<StaffMember, 'id'>) => void;
  onUpdateStaff: (staffId: number, updatedDetails: Partial<Omit<StaffMember, 'id'>>) => void;
  loggedInUser: StaffMember | null;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'status' | 'comments'>) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: Task['status']) => void;
  onAddCommentToTask: (taskId: number, commentText: string, author: string) => void;
  incidents: Incident[];
  onAssignIncident: (incident: Incident, assigneeName: string) => void;
  onAddIncident: (incident: Omit<Incident, 'id' | 'status'>) => void;
}

const PhoneShell: React.FC<PhoneShellProps> = ({ 
  userRole, 
  onLogout, 
  staff, 
  onAddStaff, 
  onUpdateStaff,
  loggedInUser,
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onAddCommentToTask,
  incidents,
  onAssignIncident,
  onAddIncident,
}) => {
  const initialTab: TabType = userRole === 'admin' ? 'dashboard' : 'my-tasks';
  const initialTitle = userRole === 'admin' ? 'Dashboard' : 'Mis Tareas';
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [headerTitle, setHeaderTitle] = useState<string>(initialTitle);


  const handleTabChange = (tab: TabType, title: string) => {
      setActiveTab(tab);
      setHeaderTitle(title);
  }

  return (
    <div className="h-screen w-screen max-w-md mx-auto flex flex-col bg-gray-50 dark:bg-gray-900 font-sans shadow-2xl">
      <Header title={headerTitle} onLogout={onLogout} />
      <main className="flex-grow overflow-y-auto">
        <ScreenContent 
          activeTab={activeTab} 
          userRole={userRole} 
          staff={staff}
          onAddStaff={onAddStaff}
          onUpdateStaff={onUpdateStaff}
          loggedInUser={loggedInUser}
          tasks={tasks}
          onAddTask={onAddTask}
          onUpdateTaskStatus={onUpdateTaskStatus}
          onAddCommentToTask={onAddCommentToTask}
          incidents={incidents}
          onAssignIncident={onAssignIncident}
          onAddIncident={onAddIncident}
          onTabChange={handleTabChange}
        />
      </main>
      <TabBar activeTab={activeTab} setActiveTab={handleTabChange} userRole={userRole} />
    </div>
  );
};

export default PhoneShell;
