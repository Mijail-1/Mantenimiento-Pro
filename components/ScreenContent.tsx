import React, { useState, useEffect } from 'react';
import { TabType } from './PhoneShell';
import { UserRole, StaffMember, Task, Incident, SupplyRequest } from '../src/App';
import { PlusCircle, XIcon, WhatsAppIcon, UserPlusIcon, ArrowLeftIcon, SendIcon, ClockIcon, TrashIcon, CameraIcon, PlayIcon, AlertTriangle, BoxIcon } from './Icons';

const supervisor = { name: 'Supervisor', phone: '5215555555555' };


// --- Admin Screens ---

const TaskProgressChart: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 40; // 2 * pi * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="40"
          cx="50"
          cy="50"
        />
        {/* Progress circle */}
        <circle
          className="text-blue-500"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="40"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">{`${percentage}%`}</span>
      </div>
    </div>
  );
};


const IncidentBreakdownChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  const colors: Record<string, string> = {
    Mantenimiento: 'bg-blue-500',
    Suministros: 'bg-yellow-500',
    Daño: 'bg-red-500',
    Otro: 'bg-gray-500',
  };
  // FIX: Cast Object.values(data) to number[] to ensure correct type inference for 'sum' and 'count' in reduce.
  const totalIncidents = (Object.values(data) as number[]).reduce((sum, count) => sum + count, 0);

  if (totalIncidents === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 mt-4">No hay incidentes que mostrar.</p>;
  }

  return (
    <div className="space-y-3 mt-4">
      {/* FIX: Cast Object.entries(data) to [string, number][] to ensure correct type inference for 'count'. */}
      {(Object.entries(data) as [string, number][]).map(([category, count]) => {
        const percentage = totalIncidents > 0 ? (count / totalIncidents) * 100 : 0;
        return (
          <div key={category}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{category}</span>
              <span className="text-sm font-bold text-gray-800 dark:text-white">{count}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`${colors[category] || colors['Otro']} h-2.5 rounded-full`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TeamStatus: React.FC<{ staff: StaffMember[], tasks: Task[] }> = ({ staff, tasks }) => {
    const staffWithTasks = staff.map(member => {
        const assignedTasks = tasks.filter(
            task => task.assignee === member.name && task.status !== 'Completada'
        );
        const hasTaskInProgress = assignedTasks.some(
            task => task.status === 'En Progreso'
        );
        return {
            ...member,
            taskCount: assignedTasks.length,
            inProgress: hasTaskInProgress,
        };
    });

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Estado del Equipo</h3>
            <div className="space-y-3">
                {staffWithTasks.map(member => (
                    <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-sm">
                                {member.name.charAt(0)}
                            </div>
                            <p className="font-medium text-gray-800 dark:text-white">{member.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                {member.taskCount} {member.taskCount === 1 ? 'tarea' : 'tareas'}
                            </p>
                            {member.inProgress ? (
                                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">En Progreso</span>
                            ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">Disponible</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DashboardScreen: React.FC<{ 
    staff: StaffMember[];
    pendingTasksCount: number; 
    newIncidentsCount: number; 
    onMetricClick: (metric: 'pendingTasks' | 'newIncidents' | 'staff') => void;
    tasks: Task[];
    incidents: Incident[];
}> = ({ staff, pendingTasksCount, newIncidentsCount, onMetricClick, tasks, incidents }) => {
    
    const completedTasksCount = tasks.filter(t => t.status === 'Completada').length;
    const totalTasksCount = tasks.length;

    const incidentBreakdown = incidents.reduce((acc, incident) => {
        acc[incident.category] = (acc[incident.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="p-4 space-y-6">
            {/* Actionable Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => onMetricClick('pendingTasks')} 
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-left transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    aria-label={`Ver ${pendingTasksCount} tareas pendientes`}
                >
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Tareas Pendientes</h3>
                    <p className="text-3xl font-bold text-blue-500 mt-2">{pendingTasksCount}</p>
                </button>
                <button 
                    onClick={() => onMetricClick('newIncidents')} 
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-left transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    aria-label={`Ver ${newIncidentsCount} incidentes nuevos`}
                >
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Incidentes Nuevos</h3>
                    <p className="text-3xl font-bold text-red-500 mt-2">{newIncidentsCount}</p>
                </button>
            </div>
            <button 
                onClick={() => onMetricClick('staff')} 
                className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-left transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                aria-label={`Ver ${staff.length} miembros del personal`}
            >
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Personal Activo</h3>
                <p className="text-3xl font-bold text-green-500 mt-2">{staff.filter(s => s.status === 'Activo').length}</p>
            </button>

            {/* Task Progress Visualization */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Progreso de Tareas</h3>
                <div className="flex items-center justify-around">
                    <TaskProgressChart completed={completedTasksCount} total={totalTasksCount} />
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Completadas</p>
                        <p className="text-2xl font-bold text-green-500">{completedTasksCount}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
                        <p className="text-2xl font-bold text-blue-500">{pendingTasksCount}</p>
                    </div>
                </div>
            </div>

            {/* Incident Breakdown Visualization */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Resumen de Incidentes</h3>
                <IncidentBreakdownChart data={incidentBreakdown} />
            </div>

            {/* Team Status */}
            <TeamStatus staff={staff} tasks={tasks} />
        </div>
    );
};


const CreateTaskModal: React.FC<{ workers: StaffMember[], onClose: () => void, onCreate: (task: Omit<Task, 'id' | 'status' | 'comments' | 'photo'>) => void }> = ({ workers, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState(workers[0]?.name || '');
  const [priority, setPriority] = useState<Task['priority']>('Media');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && assignee) {
      onCreate({ title, description, assignee, priority, dueDate: dueDate ? new Date(dueDate).toISOString() : null });
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Crear Nueva Tarea</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <XIcon className="w-6 h-6"/>
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input type="text" id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
           <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label htmlFor="task-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignar a</label>
            <select id="task-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
              {workers.map(worker => <option key={worker.id} value={worker.name}>{worker.name}</option>)}
            </select>
          </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
                <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                </select>
              </div>
              <div>
                  <label htmlFor="task-duedate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vencimiento</label>
                  <input type="datetime-local" id="task-duedate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
           </div>
          <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors mt-2">Crear Tarea</button>
        </form>
      </div>
    </div>
  );
};


const TasksScreen: React.FC<{ tasks: Task[], openModal: () => void, onViewTask: (task: Task) => void }> = ({ tasks, openModal, onViewTask }) => {
    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'Completada': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'En Progreso': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Asignada': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        }
    };
    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'Alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'Media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Baja': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
    };

    const isOverdue = (dateString: string | null, status: Task['status']) => {
        if (!dateString || status === 'Completada') return false;
        return new Date(dateString) < new Date();
    };

    return (
        <div className="p-4 space-y-3 relative h-full pb-20">
            {tasks.map(task => (
                <button key={task.id} onClick={() => onViewTask(task)} className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <div className="flex-1 pr-2 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white truncate">{task.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{task.assignee}</p>
                        <div className={`flex items-center text-xs mt-2 ${isOverdue(task.dueDate, task.status) ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                           <ClockIcon className="w-3 h-3 mr-1"/>
                           <span>Vence: {formatDate(task.dueDate)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                         <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                        </span>
                    </div>
                </button>
            ))}
            <button onClick={openModal} className="absolute bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110">
                <PlusCircle className="w-8 h-8"/>
            </button>
        </div>
    );
};

const TaskDetailScreen: React.FC<{
  task: Task;
  onBack: () => void;
  onAddComment: (taskId: number, commentText: string, author: string) => void;
  userRole: UserRole;
  staff: StaffMember[];
  onUpdateTask: (taskId: number, updates: Partial<Omit<Task, 'id'>>) => void;
  loggedInUser: StaffMember | null;
}> = ({ task, onBack, onAddComment, userRole, staff, onUpdateTask, loggedInUser }) => {
    const [newComment, setNewComment] = useState('');
    
    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && loggedInUser) {
            onAddComment(task.id, newComment.trim(), loggedInUser.name);
            setNewComment('');
        }
    };
    
    const DetailItem: React.FC<{label: string; value: string}> = ({label, value}) => (
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-semibold text-gray-800 dark:text-white">{value}</p>
        </div>
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    };
    
    const formatDueDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
    };


    return (
        <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
            {/* Header */}
            <header className="w-full h-14 px-2 flex items-center text-black dark:text-white bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 z-10 sticky top-0">
                <button onClick={onBack} aria-label="Volver" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-lg font-bold ml-2 truncate">{task.title}</h1>
            </header>
            
            {/* Content */}
            <main className="flex-grow overflow-y-auto p-4 pb-32">
                <div className="space-y-6">
                    {/* Details Card */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700">Detalles</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Asignado a" value={task.assignee} />
                            <DetailItem label="Estado" value={task.status} />
                            <DetailItem label="Prioridad" value={task.priority} />
                            <DetailItem label="Vencimiento" value={formatDueDate(task.dueDate)} />
                        </div>
                        {userRole === 'admin' && (
                            <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                <label htmlFor="reassign-task" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reasignar Tarea</label>
                                <select
                                    id="reassign-task"
                                    value={task.assignee}
                                    onChange={(e) => onUpdateTask(task.id, { assignee: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {staff.map(member => (
                                        <option key={member.id} value={member.name}>{member.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    {/* Description Card */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                         <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Descripción</h3>
                         <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{task.description || 'No hay descripción.'}</p>
                    </div>

                    {/* Evidence Photo */}
                     {task.photo && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Evidencia</h3>
                            <img src={task.photo} alt="Evidencia de tarea o incidente" className="w-full h-auto rounded-md object-cover" />
                        </div>
                    )}

                    {/* Comments Card */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Comentarios</h3>
                        <div className="space-y-4">
                            {task.comments.length > 0 ? (
                                task.comments.map(comment => (
                                    <div key={comment.id}>
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-sm text-gray-800 dark:text-white">{comment.author}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(comment.timestamp)}</p>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{comment.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No hay comentarios aún.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Comment Input Footer */}
            {userRole === 'admin' && (
                <footer className="w-full max-w-md mx-auto p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-16 left-1/2 -translate-x-1/2">
                    <form onSubmit={handleSubmitComment} className="flex items-center space-x-2">
                        <input 
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Añadir un comentario..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button type="submit" className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600" aria-label="Enviar comentario">
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </footer>
            )}
        </div>
    );
};



const AssignTaskFromIncidentModal: React.FC<{
  incident: Incident;
  workers: StaffMember[];
  onClose: () => void;
  onAssign: (assigneeName: string) => void;
}> = ({ incident, workers, onClose, onAssign }) => {
  const [assignee, setAssignee] = useState(workers[0]?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignee) {
      onAssign(assignee);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-11/12 max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Asignar Incidente</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Crear una nueva tarea para: <span className="font-semibold">{incident.description}</span></p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="task-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignar a</label>
            <select id="task-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
              {workers.map(worker => <option key={worker.id} value={worker.name}>{worker.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Confirmar Asignación</button>
        </form>
      </div>
    </div>
  );
};

const IncidentsScreen: React.FC<{ 
    incidents: Incident[], 
    onOpenAssignModal: (incident: Incident) => void,
    openModal: () => void,
}> = ({ incidents, onOpenAssignModal, openModal }) => {
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    const getStatusStyle = (status: Incident['status']) => {
        switch (status) {
            case 'Nuevo': return 'text-red-500';
            case 'Asignado': return 'text-blue-500';
            case 'En Revisión': return 'text-yellow-500';
            case 'Resuelto': return 'text-green-500';
        }
    };
    return (
        <div className="p-4 space-y-3 relative h-full pb-20">
            {incidents.map(incident => (
                <div key={incident.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-4">
                            <p className="font-bold text-gray-800 dark:text-white">{incident.category}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{incident.description}</p>
                             {incident.photo && (
                                <button onClick={() => setViewingImage(incident.photo!)} className="mt-2">
                                    <img src={incident.photo} alt="Incidente" className="h-16 w-16 object-cover rounded-md" />
                                </button>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Reportado por: {incident.reportedBy}</p>
                        </div>
                        <span className={`text-sm font-semibold ${getStatusStyle(incident.status)}`}>{incident.status}</span>
                    </div>
                    {incident.status === 'Nuevo' && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                             <button 
                                onClick={() => onOpenAssignModal(incident)}
                                className="w-full text-sm bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                            >
                                Asignar Tarea
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <button onClick={openModal} className="absolute bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110">
                <PlusCircle className="w-8 h-8"/>
            </button>
            {viewingImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setViewingImage(null)}>
                    <img src={viewingImage} alt="Incidente en tamaño completo" className="max-w-full max-h-full" />
                    <button className="absolute top-4 right-4 text-white text-2xl">
                        <XIcon className="w-8 h-8"/>
                    </button>
                </div>
            )}
        </div>
    );
};

const CreateIncidentModal: React.FC<{
  onClose: () => void;
  onCreate: (incident: Omit<Incident, 'id' | 'status' | 'reportedBy'>) => void;
  taskContext?: Task;
}> = ({ onClose, onCreate, taskContext }) => {
    const [category, setCategory] = useState('Mantenimiento');
    const [description, setDescription] = useState(
      taskContext ? `Problema con la tarea: "${taskContext.title}".\n\n` : ''
    );
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoPreview(URL.createObjectURL(file));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removePhoto = () => {
        setPhoto(undefined);
        setPhotoPreview(null);
        const fileInput = document.getElementById('admin-photo-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = "";
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        onCreate({
            category,
            description,
            photo,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-11/12 max-w-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Reportar Incidente</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                    <XIcon className="w-6 h-6"/>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="admin-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
                    <select id="admin-category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option>Mantenimiento</option>
                        <option>Suministros</option>
                        <option>Daño</option>
                        <option>Otro</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="admin-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                    <textarea id="admin-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto (Opcional)</label>
                    <div className="mt-1">
                        <input type="file" accept="image/*" id="admin-photo-upload" className="hidden" onChange={handlePhotoChange} />
                        <label htmlFor="admin-photo-upload" className="cursor-pointer flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                            {photoPreview ? (
                                <div className="relative">
                                    <img src={photoPreview} alt="Vista previa" className="h-24 w-auto rounded-md object-cover" />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); removePhoto(); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                        aria-label="Eliminar foto"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Toca para subir una foto</p>
                                </div>
                            )}
                        </label>
                    </div>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Crear Reporte</button>
            </form>
          </div>
        </div>
    );
};


const CreateStaffModal: React.FC<{ onClose: () => void, onCreate: (staffMember: Omit<StaffMember, 'id'>) => void }> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffMember['role']>('Limpieza');
  const [shift, setShift] = useState<StaffMember['shift']>('Matutino');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone && password) {
      onCreate({ name, phone, password, email, role, shift, status: 'Activo' });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Agregar Personal</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <XIcon className="w-6 h-6"/>
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="staff-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
            <input type="text" id="staff-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
          <div>
            <label htmlFor="staff-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono (WhatsApp)</label>
            <input type="tel" id="staff-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
          <div>
            <label htmlFor="staff-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Opcional)</label>
            <input type="email" id="staff-email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="staff-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
              <select id="staff-role" value={role} onChange={(e) => setRole(e.target.value as StaffMember['role'])} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option>Limpieza</option>
                  <option>Mantenimiento</option>
                  <option>Jardinería</option>
                  <option>Electricista</option>
                  <option>General</option>
              </select>
            </div>
            <div>
              <label htmlFor="staff-shift" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Turno</label>
              <select id="staff-shift" value={shift} onChange={(e) => setShift(e.target.value as StaffMember['shift'])} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option>Matutino</option>
                  <option>Vespertino</option>
                  <option>Nocturno</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="staff-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <input type="password" id="staff-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors mt-2">Agregar Miembro</button>
        </form>
      </div>
    </div>
  );
};

const EditStaffModal: React.FC<{ 
    staffMember: StaffMember;
    onClose: () => void; 
    onSave: (staffId: number, updatedDetails: Partial<Omit<StaffMember, 'id'>>) => void; 
    onDelete: () => void;
}> = ({ staffMember, onClose, onSave, onDelete }) => {
  const [phone, setPhone] = useState(staffMember.phone);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(staffMember.email || '');
  const [role, setRole] = useState<StaffMember['role']>(staffMember.role);
  const [shift, setShift] = useState<StaffMember['shift']>(staffMember.shift);
  const [status, setStatus] = useState<StaffMember['status']>(staffMember.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<Omit<StaffMember, 'id'>> = { phone, email, role, shift, status };
    if (password.trim() !== '') {
      updates.password = password;
    }
    onSave(staffMember.id, updates);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editar Personal</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <XIcon className="w-6 h-6"/>
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="staff-name-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input type="text" id="staff-name-edit" value={staffMember.name} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400" disabled />
          </div>
          <div>
            <label htmlFor="staff-phone-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono (WhatsApp)</label>
            <input type="tel" id="staff-phone-edit" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
          <div>
            <label htmlFor="staff-email-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Opcional)</label>
            <input type="email" id="staff-email-edit" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label htmlFor="staff-role-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
              <select id="staff-role-edit" value={role} onChange={(e) => setRole(e.target.value as StaffMember['role'])} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option>Limpieza</option>
                  <option>Mantenimiento</option>
                  <option>Jardinería</option>
                  <option>Electricista</option>
                  <option>General</option>
              </select>
            </div>
            <div>
              <label htmlFor="staff-shift-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Turno</label>
              <select id="staff-shift-edit" value={shift} onChange={(e) => setShift(e.target.value as StaffMember['shift'])} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option>Matutino</option>
                  <option>Vespertino</option>
                  <option>Nocturno</option>
              </select>
            </div>
          </div>
           <div>
              <label htmlFor="staff-status-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <select id="staff-status-edit" value={status} onChange={(e) => setStatus(e.target.value as StaffMember['status'])} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option>Activo</option>
                  <option>De vacaciones</option>
                  <option>Inactivo</option>
              </select>
          </div>
          <div>
            <label htmlFor="staff-password-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña</label>
            <input type="password" id="staff-password-edit" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar en blanco para no cambiar" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="space-y-2 mt-4">
            <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Guardar Cambios</button>
            <button 
                type="button" 
                onClick={onDelete}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
                <TrashIcon className="w-4 h-4" />
                <span>Eliminar Personal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const StaffScreen: React.FC<{ staff: StaffMember[], openModal: () => void, onEdit: (member: StaffMember) => void }> = ({ staff, openModal, onEdit }) => {
    const getStatusIndicatorColor = (status: StaffMember['status']) => {
        switch (status) {
            case 'Activo': return 'bg-green-500 ring-white dark:ring-gray-800';
            case 'De vacaciones': return 'bg-yellow-500 ring-white dark:ring-gray-800';
            case 'Inactivo': return 'bg-gray-500 ring-white dark:ring-gray-800';
            default: return 'bg-gray-500 ring-white dark:ring-gray-800';
        }
    };

    return (
        <div className="p-4 space-y-3 relative h-full pb-20">
            {staff.map(member => (
                <button 
                    key={member.id} 
                    onClick={() => onEdit(member)}
                    className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center space-x-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">{member.name.charAt(0)}</div>
                        <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ${getStatusIndicatorColor(member.status)}`} title={`Estado: ${member.status}`} />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold text-gray-800 dark:text-white">{member.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.role} &middot; {member.shift}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{member.phone}</p>
                    </div>
                </button>
            ))}
            <button onClick={openModal} className="absolute bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110">
                <UserPlusIcon className="w-8 h-8"/>
            </button>
        </div>
    );
};

const AdminSuppliesScreen: React.FC<{
  supplyRequests: SupplyRequest[],
  onUpdateStatus: (requestId: number, newStatus: SupplyRequest['status']) => void,
}> = ({ supplyRequests, onUpdateStatus }) => {
    const statusOrder: Record<SupplyRequest['status'], number> = {
        'Pendiente': 1,
        'Aprobado': 2,
        'Entregado': 3,
    };
    const sortedRequests = supplyRequests.slice().sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    const getStatusColor = (status: SupplyRequest['status']) => {
        switch (status) {
            case 'Pendiente': return 'text-yellow-600 dark:text-yellow-400';
            case 'Aprobado': return 'text-blue-600 dark:text-blue-400';
            case 'Entregado': return 'text-green-600 dark:text-green-400';
        }
    };
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    };

    return (
        <div className="p-4 space-y-3">
            {sortedRequests.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No hay solicitudes de suministros.</p>
                </div>
            ) : (
                sortedRequests.map(req => (
                    <div key={req.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                                <p className="font-bold text-gray-800 dark:text-white">{req.itemName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Solicitado por: <span className="font-medium">{req.requestedBy}</span>
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(req.timestamp)}</p>
                            </div>
                            <span className={`text-sm font-semibold ${getStatusColor(req.status)}`}>{req.status}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
                            {req.status === 'Pendiente' && (
                                <button
                                    onClick={() => onUpdateStatus(req.id, 'Aprobado')}
                                    className="flex-1 text-sm bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                                >
                                    Aprobar
                                </button>
                            )}
                            {req.status === 'Aprobado' && (
                                <button
                                    onClick={() => onUpdateStatus(req.id, 'Entregado')}
                                    className="flex-1 text-sm bg-green-100 text-green-800 font-semibold py-2 px-4 rounded-lg hover:bg-green-200 transition-colors dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                                >
                                    Marcar como Entregado
                                </button>
                            )}
                             {req.status === 'Entregado' && (
                                <p className="flex-1 text-sm text-center text-green-600 dark:text-green-400 font-medium py-2">
                                    Solicitud Completada
                                </p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};


// --- Worker Screens ---
const CompleteTaskModal: React.FC<{
  task: Task;
  onClose: () => void;
  onComplete: (taskId: number, photo?: string, comment?: string) => void;
  loggedInUser: StaffMember;
}> = ({ task, onClose, onComplete, loggedInUser }) => {
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onComplete(task.id, photo, comment.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Completar Tarea</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Añadir foto de evidencia (Opcional)</label>
            <input type="file" accept="image/*" id="evidence-photo-upload" className="hidden" onChange={handlePhotoChange} />
            <label htmlFor="evidence-photo-upload" className="cursor-pointer w-full h-32 flex items-center justify-center border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
              {photoPreview ? (
                <img src={photoPreview} alt="Vista previa" className="h-full w-full object-cover rounded-md" />
              ) : (
                <div className="text-center text-gray-400">
                  <CameraIcon className="w-10 h-10 mx-auto" />
                  <p className="text-sm mt-1">Tocar para subir</p>
                </div>
              )}
            </label>
          </div>
          <div>
            <label htmlFor="final-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentario final (Opcional)</label>
            <textarea
              id="final-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ej: Se utilizó el último producto..."
            />
          </div>
          <button onClick={handleSubmit} className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
            Confirmar Finalización
          </button>
        </div>
      </div>
    </div>
  );
};


const WorkerTaskDetailScreen: React.FC<{
  task: Task;
  onBack: () => void;
  onUpdateTask: (taskId: number, updates: Partial<Omit<Task, 'id'>>) => void;
  onAddComment: (taskId: number, commentText: string, author: string) => void;
  onReportProblem: (taskContext: Task) => void;
  loggedInUser: StaffMember;
}> = ({ task, onBack, onUpdateTask, onAddComment, onReportProblem, loggedInUser }) => {
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [newComment, setNewComment] = useState('');

    const handleStartTask = () => {
        onUpdateTask(task.id, { status: 'En Progreso' });
    };

    const handleCompleteTask = (taskId: number, photo?: string, comment?: string) => {
        const updates: Partial<Omit<Task, 'id'>> = { status: 'Completada' };
        if (photo) {
            updates.photo = photo;
        }
        onUpdateTask(taskId, updates);
        if (comment) {
            onAddComment(taskId, comment, loggedInUser.name);
        }
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && loggedInUser) {
            onAddComment(task.id, newComment.trim(), loggedInUser.name);
            setNewComment('');
        }
    };

    return (
        <>
            <TaskDetailScreen
                task={task}
                onBack={onBack}
                onAddComment={onAddComment}
                userRole="worker"
                staff={[]} // Not used in worker view
                onUpdateTask={onUpdateTask}
                loggedInUser={loggedInUser}
            />
            {/* Action Footer */}
             {task.status !== 'Completada' && (
                <footer className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-16 left-1/2 -translate-x-1/2">
                    <div className="p-2 flex items-center space-x-2">
                        {task.status === 'Asignada' && (
                            <button onClick={handleStartTask} className="flex-1 flex items-center justify-center space-x-2 bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                                <PlayIcon className="w-5 h-5" />
                                <span>Empezar Tarea</span>
                            </button>
                        )}
                        {task.status === 'En Progreso' && (
                            <button onClick={() => setIsCompleteModalOpen(true)} className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors">
                                Completar Tarea
                            </button>
                        )}
                        <button onClick={() => onReportProblem(task)} className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800" aria-label="Reportar Problema">
                            <AlertTriangle className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmitComment} className="flex items-center space-x-2 p-2 border-t border-gray-200 dark:border-gray-700">
                        <input 
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Añadir un comentario..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button type="submit" className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600" aria-label="Enviar comentario">
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </footer>
            )}
            {task.status === 'Completada' && (
                 <footer className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-16 left-1/2 -translate-x-1/2 p-2">
                     <div className="text-center text-green-600 dark:text-green-400 font-bold py-3 px-4 rounded-lg bg-green-100 dark:bg-green-900">
                        ¡Tarea Completada!
                    </div>
                 </footer>
            )}

            {isCompleteModalOpen && (
                <CompleteTaskModal
                    task={task}
                    onClose={() => setIsCompleteModalOpen(false)}
                    onComplete={handleCompleteTask}
                    loggedInUser={loggedInUser}
                />
            )}
        </>
    );
};


const WorkerTasksScreen: React.FC<{ 
  loggedInUser: StaffMember,
  tasks: Task[],
  onViewTask: (task: Task) => void
}> = ({ loggedInUser, tasks: allTasks, onViewTask }) => {
  if (!loggedInUser) return null;

  const myTasks = allTasks.filter(t => t.assignee === loggedInUser.name);

  const statusOrder: Record<Task['status'], number> = {
    'En Progreso': 1,
    'Asignada': 2,
    'Completada': 3,
  };

  const sortedTasks = myTasks.slice().sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  
    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'Completada': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'En Progreso': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Asignada': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        }
    };
    
    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'Alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'Media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Baja': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-MX', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
    };

    const isOverdue = (dateString: string | null, status: Task['status']) => {
        if (!dateString || status === 'Completada') return false;
        return new Date(dateString) < new Date();
    };


  return (
    <div className="p-4 space-y-3">
        {sortedTasks.length === 0 ? (
             <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No tienes tareas asignadas.</p>
            </div>
        ) : (
            sortedTasks.map(task => (
                 <button 
                    key={task.id} 
                    onClick={() => onViewTask(task)}
                    className={`w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-left transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${task.status === 'Completada' ? 'opacity-60' : ''}`}
                 >
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2 min-w-0">
                           <p className={`font-semibold text-gray-800 dark:text-white truncate ${task.status === 'Completada' ? 'line-through' : ''}`}>{task.title}</p>
                           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{task.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                             <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                {task.status}
                            </span>
                        </div>
                    </div>
                     <div className={`flex items-center text-xs mt-2 ${isOverdue(task.dueDate, task.status) ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                       <ClockIcon className="w-3 h-3 mr-1"/>
                       <span>Vence: {formatDate(task.dueDate)}</span>
                    </div>
                </button>
            ))
        )}
    </div>
  );
};

const ReportIncidentScreen: React.FC<{
  onAddIncident: (incident: Omit<Incident, 'id' | 'status'>) => void;
  loggedInUser: StaffMember | null;
  taskContext?: Task;
}> = ({ onAddIncident, loggedInUser, taskContext }) => {
    const [category, setCategory] = useState('Mantenimiento');
    const [description, setDescription] = useState(
      taskContext ? `Problema con la tarea: "${taskContext.title}".\n\n` : ''
    );
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [submitMessage, setSubmitMessage] = useState('');


    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoPreview(URL.createObjectURL(file));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setCategory('Mantenimiento');
        setDescription(taskContext ? `Problema con la tarea: "${taskContext.title}".\n\n` : '');
        setPhoto(undefined);
        setPhotoPreview(null);
        // Clear file input
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !loggedInUser) {
            setSubmitMessage('Por favor, añade una descripción.');
            setTimeout(() => setSubmitMessage(''), 3000);
            return;
        }

        onAddIncident({
            category,
            description,
            reportedBy: loggedInUser.name,
            photo,
        });

        setSubmitMessage('¡Reporte enviado con éxito!');
        resetForm();
        setTimeout(() => setSubmitMessage(''), 3000);
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Reportar un Incidente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option>Mantenimiento</option>
                        <option>Suministros</option>
                        <option>Daño</option>
                        <option>Otro</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto (Opcional)</label>
                    <div className="mt-1">
                        <input type="file" accept="image/*" id="photo-upload" className="hidden" onChange={handlePhotoChange} />
                        <label htmlFor="photo-upload" className="cursor-pointer flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                            {photoPreview ? (
                                <div className="relative">
                                    <img src={photoPreview} alt="Vista previa" className="h-32 w-auto rounded-md object-cover" />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); resetForm(); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                        aria-label="Eliminar foto"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Toca para subir una foto</p>
                                </div>
                            )}
                        </label>
                    </div>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Enviar Reporte</button>
                {submitMessage && <p className="text-center text-green-500 mt-2">{submitMessage}</p>}
            </form>
        </div>
    );
};


const RequestSuppliesScreen: React.FC<{
  loggedInUser: StaffMember;
  supplyRequests: SupplyRequest[];
  onAddRequest: (itemName: string, requestedBy: string) => void;
}> = ({ loggedInUser, supplyRequests, onAddRequest }) => {
    const [newItem, setNewItem] = useState('');
    const [message, setMessage] = useState('');
    
    const myRequests = supplyRequests.filter(req => req.requestedBy === loggedInUser.name);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        onAddRequest(newItem, loggedInUser.name);
        setNewItem('');
        setMessage('¡Solicitud enviada!');
        setTimeout(() => setMessage(''), 3000);
    };
    
    const getStatusColor = (status: SupplyRequest['status']) => {
        switch (status) {
            case 'Pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Aprobado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Entregado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        }
    };
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-MX', { month: 'short', day: 'numeric' }).format(date);
    };

    return (
        <div className="p-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Solicitar un Suministro</h2>
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Ej: Detergente para pisos"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        Pedir
                    </button>
                </form>
                {message && <p className="text-center text-green-500 mt-2 text-sm">{message}</p>}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Mis Solicitudes</h3>
                <div className="space-y-2">
                    {myRequests.length > 0 ? (
                        myRequests.map(req => (
                            <div key={req.id} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">{req.itemName}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(req.timestamp)}</p>
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                    {req.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 pt-4">No has solicitado suministros.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


const WorkerChatScreen: React.FC<{ supervisor: { name: string, phone: string } }> = ({ supervisor }) => (
    <div className="p-8 flex flex-col items-center justify-center h-full">
         <a href={`https://wa.me/${supervisor.phone}`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 text-white font-bold py-4 px-4 rounded-lg shadow-md hover:bg-green-600 transition-colors flex items-center justify-center space-x-3">
            <WhatsAppIcon className="w-7 h-7" />
            <span>Chatear con el Supervisor</span>
        </a>
    </div>
);

const ConfirmDeleteModal: React.FC<{
    staffMember: StaffMember;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ staffMember, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Confirmar Eliminación</h2>
            <p className="text-gray-600 dark:text-gray-300 my-4">
                ¿Estás seguro de que quieres eliminar a <span className="font-semibold">{staffMember.name}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center space-x-4">
                <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                    Cancelar
                </button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                    Eliminar
                </button>
            </div>
        </div>
    </div>
);


// --- Main Content Renderer ---
interface ScreenContentProps {
  activeTab: TabType;
  userRole: UserRole;
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
  onTabChange: (tab: TabType, title: string) => void;
  supplyRequests: SupplyRequest[];
  onAddSupplyRequest: (itemName: string, requestedBy: string) => void;
  onUpdateSupplyRequestStatus: (requestId: number, newStatus: SupplyRequest['status']) => void;
}

const ScreenContent: React.FC<ScreenContentProps> = ({ 
    activeTab, 
    userRole, 
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
    onTabChange,
    supplyRequests,
    onAddSupplyRequest,
    onUpdateSupplyRequestStatus,
}) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [assigningIncident, setAssigningIncident] = useState<Incident | null>(null);
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);
  const [deletingStaffMember, setDeletingStaffMember] = useState<StaffMember | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending'>('all');
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'new'>('all');
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [reportingTaskProblem, setReportingTaskProblem] = useState<Task | null>(null);

  useEffect(() => {
    // Reset detail views when changing tabs
    setViewingTask(null);
    if (activeTab !== 'tasks') {
        setTaskFilter('all');
    }
    if (activeTab !== 'incidents') {
        setIncidentFilter('all');
    }
  }, [activeTab]);

   // Update the viewingTask state if the underlying task data changes
  useEffect(() => {
    if (viewingTask) {
        const updatedTask = tasks.find(t => t.id === viewingTask.id);
        if (updatedTask) {
            setViewingTask(updatedTask);
        } else {
            // The task was deleted or is no longer available, so go back to the list
            setViewingTask(null);
        }
    }
  }, [tasks, viewingTask]);

  const handleMetricClick = (metric: 'pendingTasks' | 'newIncidents' | 'staff') => {
    if (metric === 'pendingTasks') {
        setTaskFilter('pending');
        onTabChange('tasks', 'Tareas Pendientes');
    } else if (metric === 'newIncidents') {
        setIncidentFilter('new');
        onTabChange('incidents', 'Incidentes Nuevos');
    } else if (metric === 'staff') {
        onTabChange('staff', 'Gestión de Personal');
    }
  };


  const handleCreateTask = (newTask: Omit<Task, 'id' | 'status' | 'comments' | 'photo'>) => {
      onAddTask(newTask);
      setIsTaskModalOpen(false);
  }

  const handleAddStaff = (newStaffMember: Omit<StaffMember, 'id'>) => {
      onAddStaff(newStaffMember);
      setIsStaffModalOpen(false);
  }
  
  const handleCreateIncident = (newIncidentData: Omit<Incident, 'id' | 'status' | 'reportedBy'>) => {
      const author = userRole === 'admin' ? 'Supervisor' : loggedInUser?.name || 'Desconocido';
      onAddIncident({
          ...newIncidentData,
          reportedBy: author,
      });
      setIsIncidentModalOpen(false);
      setReportingTaskProblem(null);
  };
  
   const handleAddComment = (taskId: number, commentText: string, author: string) => {
    onAddCommentToTask(taskId, commentText, author);
  }

  const handleAssignIncidentSubmit = (assigneeName: string) => {
    if (assigningIncident) {
        onAssignIncident(assigningIncident, assigneeName);
        setAssigningIncident(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingStaffMember) {
      onDeleteStaff(deletingStaffMember.id);
      setDeletingStaffMember(null);
      setEditingStaffMember(null); // Also close the edit modal
    }
  };

  const renderContent = () => {
    if (userRole === 'admin') {
      const pendingTasksCount = tasks.filter(t => t.status !== 'Completada').length;
      const newIncidentsCount = incidents.filter(i => i.status === 'Nuevo').length;
      
      const activeStaff = staff.filter(s => s.status === 'Activo');

      const filteredTasks = taskFilter === 'pending'
        ? tasks.filter(t => t.status !== 'Completada')
        : tasks;
      
      const filteredIncidents = incidentFilter === 'new'
        ? incidents.filter(i => i.status === 'Nuevo')
        : incidents;
      
      switch (activeTab) {
        case 'dashboard': return <DashboardScreen staff={staff} pendingTasksCount={pendingTasksCount} newIncidentsCount={newIncidentsCount} onMetricClick={handleMetricClick} tasks={tasks} incidents={incidents} />;
        case 'tasks': 
            if (viewingTask) {
                return (
                    <TaskDetailScreen 
                        task={viewingTask}
                        onBack={() => setViewingTask(null)}
                        onAddComment={onAddCommentToTask}
                        userRole={userRole}
                        staff={activeStaff}
                        onUpdateTask={onUpdateTask}
                        loggedInUser={loggedInUser}
                    />
                );
            }
            return (
                <>
                    <TasksScreen tasks={filteredTasks} openModal={() => setIsTaskModalOpen(true)} onViewTask={setViewingTask} />
                    {isTaskModalOpen && <CreateTaskModal workers={activeStaff} onClose={() => setIsTaskModalOpen(false)} onCreate={handleCreateTask}/>}
                </>
            );
        case 'incidents': return (
            <>
                <IncidentsScreen incidents={filteredIncidents} onOpenAssignModal={setAssigningIncident} openModal={() => setIsIncidentModalOpen(true)} />
                {assigningIncident && (
                    <AssignTaskFromIncidentModal 
                        incident={assigningIncident}
                        workers={activeStaff}
                        onClose={() => setAssigningIncident(null)}
                        onAssign={handleAssignIncidentSubmit}
                    />
                )}
                {isIncidentModalOpen && (
                    <CreateIncidentModal 
                        onClose={() => setIsIncidentModalOpen(false)}
                        onCreate={handleCreateIncident}
                    />
                )}
            </>
        );
        case 'staff': return (
            <>
              <StaffScreen staff={staff} openModal={() => setIsStaffModalOpen(true)} onEdit={setEditingStaffMember} />
              {isStaffModalOpen && <CreateStaffModal onClose={() => setIsStaffModalOpen(false)} onCreate={handleAddStaff}/>}
              {editingStaffMember && (
                  <EditStaffModal 
                      staffMember={editingStaffMember}
                      onClose={() => setEditingStaffMember(null)}
                      onSave={(staffId, updatedDetails) => {
                          onUpdateStaff(staffId, updatedDetails);
                          setEditingStaffMember(null);
                      }}
                      onDelete={() => setDeletingStaffMember(editingStaffMember)}
                  />
              )}
              {deletingStaffMember && (
                <ConfirmDeleteModal 
                    staffMember={deletingStaffMember}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeletingStaffMember(null)}
                />
              )}
            </>
        );
        case 'supplies': return <AdminSuppliesScreen supplyRequests={supplyRequests} onUpdateStatus={onUpdateSupplyRequestStatus} />;
        default: return <div>Admin Screen Not Found</div>;
      }
    } else { // worker
        if (!loggedInUser) return <div>Cargando...</div>;

        switch (activeTab) {
            case 'my-tasks': 
                return (
                    <>
                        {viewingTask ? (
                            <WorkerTaskDetailScreen
                                task={viewingTask}
                                onBack={() => setViewingTask(null)}
                                onUpdateTask={onUpdateTask}
                                onAddComment={onAddCommentToTask}
                                onReportProblem={setReportingTaskProblem}
                                loggedInUser={loggedInUser}
                            />
                        ) : (
                            <WorkerTasksScreen 
                                loggedInUser={loggedInUser} 
                                tasks={tasks} 
                                onViewTask={setViewingTask} 
                            />
                        )}
                        {reportingTaskProblem && (
                          <CreateIncidentModal 
                            onClose={() => setReportingTaskProblem(null)}
                            onCreate={handleCreateIncident}
                            taskContext={reportingTaskProblem}
                          />
                        )}
                    </>
                );
            case 'report': return <ReportIncidentScreen onAddIncident={onAddIncident} loggedInUser={loggedInUser} />;
            case 'supplies': return <RequestSuppliesScreen loggedInUser={loggedInUser} supplyRequests={supplyRequests} onAddRequest={onAddSupplyRequest} />;
            default: return <div>Worker Screen Not Found</div>;
        }
    }
  };

  return <div className="h-full bg-gray-100 dark:bg-gray-900">{renderContent()}</div>;
};

export default ScreenContent;