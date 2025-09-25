
import React, { useState } from 'react';
import PhoneShell from './components/PhoneShell';
import LoginScreen from './components/LoginScreen';

// --- Centralized Types ---
export type UserRole = 'admin' | 'worker';
export interface StaffMember {
  id: number;
  name: string;
  phone: string;
  password?: string;
}

export interface Task {
  id: number;
  title: string;
  assignee: string;
  status: 'Asignada' | 'En Progreso' | 'Completada';
}

export interface Incident {
  id: number;
  category: string;
  description: string;
  reportedBy: string;
  status: 'Nuevo' | 'En Revisión' | 'Resuelto' | 'Asignado';
  photo?: string; // Base64 encoded image
}


// --- Mock Data ---
const initialStaffMembers: StaffMember[] = [
  { id: 1, name: 'Ana Pérez', phone: '5211234567890', password: 'password123' },
  { id: 2, name: 'Luis García', phone: '5210987654321', password: 'password456' },
];

const initialTasks: Task[] = [
  { id: 1, title: 'Limpiar Salón A-101', assignee: 'Ana Pérez', status: 'Completada' },
  { id: 2, title: 'Revisar luces del pasillo B', assignee: 'Luis García', status: 'En Progreso' },
  { id: 3, title: 'Vaciar papeleras del patio', assignee: 'Ana Pérez', status: 'Asignada' },
  { id: 4, title: 'Desinfectar baños del 2do piso', assignee: 'Luis García', status: 'Asignada' },
];

const initialIncidents: Incident[] = [
    { id: 1, category: 'Mantenimiento', description: 'Grifo goteando en baño de hombres', reportedBy: 'Ana Pérez', status: 'Nuevo' },
    { id: 2, category: 'Suministros', description: 'Falta papel higiénico en el 3er piso', reportedBy: 'Luis García', status: 'Resuelto' },
];


const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<StaffMember | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>(initialStaffMembers);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);

  const handleLogin = (role: UserRole, user?: StaffMember) => {
    setUserRole(role);
    if (role === 'worker' && user) {
      setLoggedInUser(user);
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInUser(null);
  };

  const handleAddStaff = (newStaffMember: Omit<StaffMember, 'id'>) => {
    const createdStaff: StaffMember = {
        id: staff.length > 0 ? Math.max(...staff.map(s => s.id)) + 1 : 1,
        ...newStaffMember,
    };
    setStaff(prevStaff => [createdStaff, ...prevStaff]);
  }

  const handleUpdateStaff = (staffId: number, updatedDetails: Partial<Omit<StaffMember, 'id'>>) => {
      setStaff(prevStaff =>
          prevStaff.map(member =>
              member.id === staffId ? { ...member, ...updatedDetails } : member
          )
      );
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'status'>) => {
      const createdTask: Task = {
          id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
          ...newTask,
          status: 'Asignada',
      };
      setTasks(prevTasks => [createdTask, ...prevTasks]);
  }

  const handleUpdateTaskStatus = (taskId: number, newStatus: Task['status']) => {
      setTasks(prevTasks => prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
      ));
  };
  
  const handleAssignIncident = (incident: Incident, assigneeName: string) => {
      // 1. Create a new task from the incident description
      handleAddTask({
          title: incident.description,
          assignee: assigneeName,
      });

      // 2. Update the incident's status to 'Assigned'
      setIncidents(prevIncidents => 
          prevIncidents.map(i => 
              i.id === incident.id ? { ...i, status: 'Asignado' } : i
          )
      );
  };

  const handleAddIncident = (newIncident: Omit<Incident, 'id' | 'status'>) => {
    const createdIncident: Incident = {
        id: incidents.length > 0 ? Math.max(...incidents.map(i => i.id)) + 1 : 1,
        ...newIncident,
        status: 'Nuevo',
    };
    setIncidents(prevIncidents => [createdIncident, ...prevIncidents]);
  };


  // By wrapping the content in a div with h-full, we ensure that the React app
  // has a root DOM element that correctly inherits the height from the #root element,
  // solving the issue where the content might otherwise render into a zero-height container.
  return (
    <div className="h-full w-full">
      {!userRole ? (
        <LoginScreen staff={staff} onLogin={handleLogin} />
      ) : (
        <PhoneShell 
          userRole={userRole} 
          onLogout={handleLogout}
          staff={staff}
          onAddStaff={handleAddStaff}
          onUpdateStaff={handleUpdateStaff}
          loggedInUser={loggedInUser}
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          incidents={incidents}
          onAssignIncident={handleAssignIncident}
          onAddIncident={handleAddIncident}
        />
      )}
    </div>
  );
};

export default App;
