import React, { useState } from 'react';
import PhoneShell from '../components/PhoneShell'
import LoginScreen from '../components/LoginScreen'

// --- Centralized Types ---
export type UserRole = 'admin' | 'worker'
export interface StaffMember {
  id: number
  name: string
  phone: string
  password?: string
  email?: string
  role: 'Limpieza' | 'Mantenimiento' | 'Jardinería' | 'Electricista' | 'General'
  shift: 'Matutino' | 'Vespertino' | 'Nocturno'
  status: 'Activo' | 'De vacaciones' | 'Inactivo'
}

export interface Comment {
  id: number
  author: string
  text: string
  timestamp: string
}

export interface Task {
  id: number
  title: string
  description: string
  assignee: string
  status: 'Asignada' | 'En Progreso' | 'Completada'
  priority: 'Baja' | 'Media' | 'Alta'
  dueDate: string | null // ISO date-time string
  comments: Comment[]
  photo?: string; // Base64 encoded image from an incident
}

export interface Incident {
  id: number
  category: string
  description: string
  reportedBy: string
  status: 'Nuevo' | 'En Revisión' | 'Resuelto' | 'Asignado'
  photo?: string // Base64 encoded image
}

export interface SupplyRequest {
  id: number;
  itemName: string;
  requestedBy: string;
  status: 'Pendiente' | 'Aprobado' | 'Entregado';
  timestamp: string;
}


// --- Mock Data ---
const initialStaffMembers: StaffMember[] = [
  { id: 1, name: 'Ana Pérez', phone: '5211234567890', password: 'password123', email: 'ana.perez@example.com', role: 'Limpieza', shift: 'Matutino', status: 'Activo' },
  { id: 2, name: 'Luis García', phone: '5210987654321', password: 'password456', email: 'luis.garcia@example.com', role: 'Mantenimiento', shift: 'Vespertino', status: 'Activo' },
]

const initialTasks: Task[] = [
  { id: 1, title: 'Limpiar Salón A-101', description: 'Limpieza profunda del salón, incluyendo ventanas y pisos.', assignee: 'Ana Pérez', status: 'Completada', priority: 'Media', dueDate: '2024-07-15T16:00:00Z', comments: [] },
  { id: 2, title: 'Revisar luces del pasillo B', description: 'Algunas luces parpadean, revisar y cambiar si es necesario.', assignee: 'Luis García', status: 'En Progreso', priority: 'Alta', dueDate: new Date().toISOString(), comments: [{ id: 1, author: 'Supervisor', text: 'Esto es urgente, por favor revisar hoy.', timestamp: '2024-07-16T10:00:00Z' }] },
  { id: 3, title: 'Vaciar papeleras del patio', description: 'Vaciar todas las papeleras del patio central.', assignee: 'Ana Pérez', status: 'Asignada', priority: 'Baja', dueDate: '2024-08-01T14:00:00Z', comments: [] },
  { id: 4, title: 'Desinfectar baños del 2do piso', description: 'Usar desinfectante de alto espectro en todos los sanitarios.', assignee: 'Luis García', status: 'Asignada', priority: 'Alta', dueDate: '2024-07-25T10:30:00Z', comments: [] },
]

const initialIncidents: Incident[] = [
  { id: 1, category: 'Mantenimiento', description: 'Grifo goteando en baño de hombres', reportedBy: 'Ana Pérez', status: 'Nuevo' },
  { id: 2, category: 'Suministros', description: 'Falta papel higiénico en el 3er piso', reportedBy: 'Luis García', status: 'Resuelto' },
]

const initialSupplyRequests: SupplyRequest[] = [
  { id: 1, itemName: 'Detergente para pisos', requestedBy: 'Ana Pérez', status: 'Pendiente', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, itemName: 'Bolsas de basura grandes', requestedBy: 'Luis García', status: 'Aprobado', timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: 3, itemName: 'Jabón de manos (x5 litros)', requestedBy: 'Ana Pérez', status: 'Entregado', timestamp: new Date(Date.now() - 372800000).toISOString() },
];


const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loggedInUser, setLoggedInUser] = useState<StaffMember | null>(null)
  const [staff, setStaff] = useState<StaffMember[]>(initialStaffMembers)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents)
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>(initialSupplyRequests);


  const handleLogin = (role: UserRole, user?: StaffMember) => {
    setUserRole(role)
    if (role === 'worker' && user) {
      setLoggedInUser(user)
    }
  }

  const handleLogout = () => {
    setUserRole(null)
    setLoggedInUser(null)
  }

  const handleAddStaff = (newStaffMember: Omit<StaffMember, 'id'>) => {
    const createdStaff: StaffMember = {
      id: staff.length > 0 ? Math.max(...staff.map(s => s.id)) + 1 : 1,
      ...newStaffMember,
    }
    setStaff(prevStaff => [createdStaff, ...prevStaff])
  }

  const handleUpdateStaff = (staffId: number, updatedDetails: Partial<Omit<StaffMember, 'id'>>) => {
    setStaff(prevStaff =>
      prevStaff.map(member =>
        member.id === staffId ? { ...member, ...updatedDetails } : member
      )
    )
  }
  
  const handleDeleteStaff = (staffId: number) => {
    setStaff(prevStaff => prevStaff.filter(member => member.id !== staffId));
  }


  const handleAddTask = (newTask: Omit<Task, 'id' | 'status' | 'comments'>) => {
    const createdTask: Task = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      ...newTask,
      status: 'Asignada',
      comments: [],
    }
    setTasks(prevTasks => [createdTask, ...prevTasks])
  }

  const handleUpdateTask = (taskId: number, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    // If we're in a task detail view, we might need to update that view's state as well.
    // This is handled by React's state propagation.
  };
  
  const handleUpdateTaskStatus = (taskId: number, newStatus: Task['status']) => {
    handleUpdateTask(taskId, { status: newStatus });
  }

  const handleAssignIncident = (incident: Incident, assigneeName: string) => {
    // 1. Create a new task from the incident description
    handleAddTask({
      title: `Incidente: ${incident.description.substring(0, 30)}...`,
      description: incident.description,
      assignee: assigneeName,
      priority: 'Media', // Default priority for incidents
      dueDate: null,
      photo: incident.photo, // Pass photo from incident to task
    })

    // 2. Update the incident's status to 'Assigned'
    setIncidents(prevIncidents =>
      prevIncidents.map(i =>
        i.id === incident.id ? { ...i, status: 'Asignado' } : i
      )
    )
  }

  const handleAddIncident = (newIncident: Omit<Incident, 'id' | 'status'>) => {
    const createdIncident: Incident = {
      id: incidents.length > 0 ? Math.max(...incidents.map(i => i.id)) + 1 : 1,
      ...newIncident,
      status: 'Nuevo',
    }
    setIncidents(prevIncidents => [createdIncident, ...prevIncidents])
  }

  const handleAddCommentToTask = (taskId: number, commentText: string, author: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newComment: Comment = {
            id: task.comments.length > 0 ? Math.max(...task.comments.map(c => c.id)) + 1 : 1,
            author,
            text: commentText,
            timestamp: new Date().toISOString(),
          }
          return { ...task, comments: [...task.comments, newComment] }
        }
        return task
      })
    )
  }

  const handleAddSupplyRequest = (itemName: string, requestedBy: string) => {
    const newRequest: SupplyRequest = {
        id: supplyRequests.length > 0 ? Math.max(...supplyRequests.map(r => r.id)) + 1 : 1,
        itemName,
        requestedBy,
        status: 'Pendiente',
        timestamp: new Date().toISOString(),
    };
    setSupplyRequests(prev => [newRequest, ...prev]);
  };

  const handleUpdateSupplyRequestStatus = (requestId: number, newStatus: SupplyRequest['status']) => {
      setSupplyRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
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
          onDeleteStaff={handleDeleteStaff}
          loggedInUser={loggedInUser}
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onAddCommentToTask={handleAddCommentToTask}
          incidents={incidents}
          onAssignIncident={handleAssignIncident}
          onAddIncident={handleAddIncident}
          supplyRequests={supplyRequests}
          onAddSupplyRequest={handleAddSupplyRequest}
          onUpdateSupplyRequestStatus={handleUpdateSupplyRequestStatus}
        />
      )}
    </div>
  )
}

export default App