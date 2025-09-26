
import React, { useState } from 'react';
import Header from './StatusBar';
import ScreenContent from './ScreenContent';
import TabBar from './HomeBar';
import { UserRole, StaffMember, Task, Incident, SupplyRequest } from '../src/App';

export type AdminTabType = 'dashboard' | 'tasks' | 'incidents' | 'staff' | 'supplies';
export type WorkerTabType = 'my-tasks' | 'report' | 'supplies';
export type TabType = AdminTabType | WorkerTabType;

interface PhoneShellProps {
  userRole: UserRole;
  onLogout: () => void;
  staff: StaffMember[];
  onAddStaff: (staffMember: Omit<StaffMember, 'id'>) => void;
  onUpdateStaff: (staffId: number, updatedDetails: Partial<Omit<StaffMember, 'id'>>) => void;
  onDeleteStaff: (staffId: number) => void;
  loggedInUser: StaffMember | null;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'status' | 'comments'>) => void;
  onUpdateTask: (taskId: number, updates: Partial<Omit<Task, 'id'>>) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: Task['status']) => void;
  onAddCommentToTask: (taskId: number, commentText: string, author: string) => void;
  incidents: Incident[];
  onAssignIncident: (incident: Incident, assigneeName: string) => void;
  onAddIncident: (incident: Omit<Incident, 'id' | 'status'>) => void;
  supplyRequests: SupplyRequest[];
  onAddSupplyRequest: (itemName: string, requestedBy: string) => void;
  onUpdateSupplyRequestStatus: (requestId: number, newStatus: SupplyRequest['status']) => void;
}

const PhoneShell: React.FC<PhoneShellProps> = ({ 
  userRole, 
  onLogout, 
  staff, 
  onAddStaff, 
  onUpdateStaff,
  onDeleteStaff,
  loggedInUser,
  tasks,
  onAddTask,
  onUpdateTask,
  onUpdateTaskStatus,
  onAddCommentToTask,
  incidents,
  onAssignIncident,
  onAddIncident,
  supplyRequests,
  onAddSupplyRequest,
  onUpdateSupplyRequestStatus,
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
          onDeleteStaff={onDeleteStaff}
          loggedInUser={loggedInUser}
          tasks={tasks}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onUpdateTaskStatus={onUpdateTaskStatus}
          onAddCommentToTask={onAddCommentToTask}
          incidents={incidents}
          onAssignIncident={onAssignIncident}
          onAddIncident={onAddIncident}
          onTabChange={handleTabChange}
          supplyRequests={supplyRequests}
          onAddSupplyRequest={onAddSupplyRequest}
          onUpdateSupplyRequestStatus={onUpdateSupplyRequestStatus}
        />
      </main>
      <TabBar activeTab={activeTab} setActiveTab={handleTabChange} userRole={userRole} />
    </div>
  );
};

export default PhoneShell;