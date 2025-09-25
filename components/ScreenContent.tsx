import React, { useState, useEffect } from 'react';
import { TabType } from './PhoneShell';
import { UserRole, StaffMember, Task, Incident } from '../App';
import { PlusCircle, XIcon, WhatsAppIcon, UserPlusIcon } from './Icons';

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
                <p className="text-3xl font-bold text-green-500 mt-2">{staff.length}</p>
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


const CreateTaskModal: React.FC<{ workers: StaffMember[], onClose: () => void, onCreate: (task: Omit<Task, 'id' | 'status'>) => void }> = ({ workers, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState(workers[0]?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && assignee) {
      onCreate({ title, assignee });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-11/12 max-w-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Crear Nueva Tarea</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <XIcon className="w-6 h-6"/>
            </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título de la Tarea</label>
            <input type="text" id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
          <div className="mb-6">
            <label htmlFor="task-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignar a</label>
            <select id="task-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
              {workers.map(worker => <option key={worker.id} value={worker.name}>{worker.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Crear Tarea</button>
        </form>
      </div>
    </div>
  );
};


const TasksScreen: React.FC<{ tasks: Task[], openModal: () => void }> = ({ tasks, openModal }) => {
    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'Completada': return 'bg-green-100 text-green-800';
            case 'En Progreso': return 'bg-yellow-100 text-yellow-800';
            case 'Asignada': return 'bg-blue-100 text-blue-800';
        }
    };
    return (
        <div className="p-4 space-y-3 relative h-full">
            {tasks.map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{task.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{task.assignee}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                    </span>
                </div>
            ))}
            <button onClick={openModal} className="absolute bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110">
                <PlusCircle className="w-8 h-8"/>
            </button>
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
}> = ({ onClose, onCreate }) => {
    const [category, setCategory] = useState('Mantenimiento');
    const [description, setDescription] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone && password) {
      onCreate({ name, phone, password });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-11/12 max-w-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Agregar Personal</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <XIcon className="w-6 h-6"/>
            </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="staff-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
            <input type="text" id="staff-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
          <div className="mb-4">
            <label htmlFor="staff-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono (WhatsApp)</label>
            <input type="tel" id="staff-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
          <div className="mb-6">
            <label htmlFor="staff-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <input type="password" id="staff-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Agregar Miembro</button>
        </form>
      </div>
    </div>
  );
};

const EditStaffModal: React.FC<{ 
    staffMember: StaffMember;
    onClose: () => void; 
    onSave: (staffId: number, updatedDetails: Partial<Omit<StaffMember, 'id'>>) => void; 
}> = ({ staffMember, onClose, onSave }) => {
  const [phone, setPhone] = useState(staffMember.phone);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<Omit<StaffMember, 'id'>> = { phone };
    if (password.trim() !== '') {
      updates.password = password;
    }
    onSave(staffMember.id, updates);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-11/12 max-w-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editar Personal</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <XIcon className="w-6 h-6"/>
            </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="staff-name-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input type="text" id="staff-name-edit" value={staffMember.name} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400" disabled />
          </div>
          <div className="mb-4">
            <label htmlFor="staff-phone-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono (WhatsApp)</label>
            <input type="tel" id="staff-phone-edit" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
          <div className="mb-6">
            <label htmlFor="staff-password-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña</label>
            <input type="password" id="staff-password-edit" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar en blanco para no cambiar" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Guardar Cambios</button>
        </form>
      </div>
    </div>
  );
};


const StaffScreen: React.FC<{ staff: StaffMember[], openModal: () => void, onEdit: (member: StaffMember) => void }> = ({ staff, openModal, onEdit }) => (
    <div className="p-4 space-y-3 relative h-full pb-20">
        {staff.map(member => (
            <button 
                key={member.id} 
                onClick={() => onEdit(member)}
                className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center space-x-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">{member.name.charAt(0)}</div>
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800 dark:text-white">{member.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.phone}</p>
                </div>
            </button>
        ))}
        <button onClick={openModal} className="absolute bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110">
            <UserPlusIcon className="w-8 h-8"/>
        </button>
    </div>
);

const AdminChatScreen: React.FC<{ staff: StaffMember[] }> = ({ staff }) => (
    <div className="p-4 space-y-3">
        {staff.map(member => (
             <a key={member.id} href={`https://wa.me/${member.phone}`} target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">{member.name.charAt(0)}</div>
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800 dark:text-white">{member.name}</p>
                </div>
                <WhatsAppIcon className="w-7 h-7 text-green-500" />
            </a>
        ))}
    </div>
);


// --- Worker Screens ---
const WorkerTasksScreen: React.FC<{ 
  loggedInUser: StaffMember | null,
  tasks: Task[],
  onUpdateTaskStatus: (taskId: number, newStatus: Task['status']) => void;
}> = ({ loggedInUser, tasks: allTasks, onUpdateTaskStatus }) => {
  if (!loggedInUser) return null;

  const myTasks = allTasks.filter(t => t.assignee === loggedInUser.name);

  const toggleTask = (task: Task) => {
    const newStatus = task.status === 'Completada' ? 'Asignada' : 'Completada';
    onUpdateTaskStatus(task.id, newStatus);
  };
  
  return (
    <div className="p-4">
        {myTasks.length === 0 ? (
             <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No tienes tareas asignadas.</p>
            </div>
        ) : (
            myTasks.map(task => (
                 <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-3 flex items-center">
                    <input 
                        type="checkbox" 
                        id={`task-${task.id}`}
                        checked={task.status === 'Completada'}
                        onChange={() => toggleTask(task)}
                        className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`task-${task.id}`} className={`ml-3 text-gray-700 dark:text-gray-200 ${task.status === 'Completada' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                        {task.title}
                    </label>
                </div>
            ))
        )}
    </div>
  );
};

const ReportIncidentScreen: React.FC<{
  onAddIncident: (incident: Omit<Incident, 'id' | 'status'>) => void;
  loggedInUser: StaffMember | null;
}> = ({ onAddIncident, loggedInUser }) => {
    const [category, setCategory] = useState('Mantenimiento');
    const [description, setDescription] = useState('');
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
        setDescription('');
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


const WorkerChatScreen: React.FC<{ supervisor: { name: string, phone: string } }> = ({ supervisor }) => (
    <div className="p-8 flex flex-col items-center justify-center h-full">
         <a href={`https://wa.me/${supervisor.phone}`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 text-white font-bold py-4 px-4 rounded-lg shadow-md hover:bg-green-600 transition-colors flex items-center justify-center space-x-3">
            <WhatsAppIcon className="w-7 h-7" />
            <span>Chatear con el Supervisor</span>
        </a>
    </div>
);

const ProfileScreen: React.FC<{ loggedInUser: StaffMember | null }> = ({ loggedInUser }) => {
    if (!loggedInUser) return null;

    return (
        <div className="p-4 text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-4xl mx-auto">{loggedInUser.name.charAt(0)}</div>
            <h2 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">{loggedInUser.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">Personal de Limpieza</p>
        </div>
    );
};


// --- Main Content Renderer ---
interface ScreenContentProps {
  activeTab: TabType;
  userRole: UserRole;
  staff: StaffMember[];
  onAddStaff: (staffMember: Omit<StaffMember, 'id'>) => void;
  onUpdateStaff: (staffId: number, updatedDetails: Partial<Omit<StaffMember, 'id'>>) => void;
  loggedInUser: StaffMember | null;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: Task['status']) => void;
  incidents: Incident[];
  onAssignIncident: (incident: Incident, assigneeName: string) => void;
  onAddIncident: (incident: Omit<Incident, 'id' | 'status'>) => void;
  onTabChange: (tab: TabType, title: string) => void;
}

const ScreenContent: React.FC<ScreenContentProps> = ({ 
    activeTab, 
    userRole, 
    staff, 
    onAddStaff, 
    onUpdateStaff,
    loggedInUser,
    tasks,
    onAddTask,
    onUpdateTaskStatus,
    incidents,
    onAssignIncident,
    onAddIncident,
    onTabChange,
}) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [assigningIncident, setAssigningIncident] = useState<Incident | null>(null);
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending'>('all');
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'new'>('all');

  useEffect(() => {
    if (activeTab !== 'tasks') {
        setTaskFilter('all');
    }
    if (activeTab !== 'incidents') {
        setIncidentFilter('all');
    }
  }, [activeTab]);

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


  const handleCreateTask = (newTask: Omit<Task, 'id' | 'status'>) => {
      onAddTask(newTask);
      setIsTaskModalOpen(false);
  }

  const handleAddStaff = (newStaffMember: Omit<StaffMember, 'id'>) => {
      onAddStaff(newStaffMember);
      setIsStaffModalOpen(false);
  }
  
  const handleCreateIncident = (newIncidentData: Omit<Incident, 'id' | 'status' | 'reportedBy'>) => {
      onAddIncident({
          ...newIncidentData,
          reportedBy: 'Supervisor',
      });
      setIsIncidentModalOpen(false);
  };

  const handleAssignIncidentSubmit = (assigneeName: string) => {
    if (assigningIncident) {
        onAssignIncident(assigningIncident, assigneeName);
        setAssigningIncident(null);
    }
  };

  const renderContent = () => {
    if (userRole === 'admin') {
      const pendingTasksCount = tasks.filter(t => t.status !== 'Completada').length;
      const newIncidentsCount = incidents.filter(i => i.status === 'Nuevo').length;

      const filteredTasks = taskFilter === 'pending'
        ? tasks.filter(t => t.status !== 'Completada')
        : tasks;
      
      const filteredIncidents = incidentFilter === 'new'
        ? incidents.filter(i => i.status === 'Nuevo')
        : incidents;
      
      switch (activeTab) {
        case 'dashboard': return <DashboardScreen staff={staff} pendingTasksCount={pendingTasksCount} newIncidentsCount={newIncidentsCount} onMetricClick={handleMetricClick} tasks={tasks} incidents={incidents} />;
        case 'tasks': return (
            <>
                <TasksScreen tasks={filteredTasks} openModal={() => setIsTaskModalOpen(true)} />
                {isTaskModalOpen && <CreateTaskModal workers={staff} onClose={() => setIsTaskModalOpen(false)} onCreate={handleCreateTask}/>}
            </>
        );
        case 'incidents': return (
            <>
                <IncidentsScreen incidents={filteredIncidents} onOpenAssignModal={setAssigningIncident} openModal={() => setIsIncidentModalOpen(true)} />
                {assigningIncident && (
                    <AssignTaskFromIncidentModal 
                        incident={assigningIncident}
                        workers={staff}
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
                  />
              )}
            </>
        );
        case 'chat': return <AdminChatScreen staff={staff} />;
        default: return <div>Admin Screen Not Found</div>;
      }
    } else { // worker
      switch (activeTab) {
        case 'my-tasks': return <WorkerTasksScreen loggedInUser={loggedInUser} tasks={tasks} onUpdateTaskStatus={onUpdateTaskStatus} />;
        case 'report': return <ReportIncidentScreen onAddIncident={onAddIncident} loggedInUser={loggedInUser} />;
        case 'chat': return <WorkerChatScreen supervisor={supervisor} />;
        case 'profile': return <ProfileScreen loggedInUser={loggedInUser} />;
        default: return <div>Worker Screen Not Found</div>;
      }
    }
  };

  return <div className="h-full bg-gray-100 dark:bg-gray-900">{renderContent()}</div>;
};

export default ScreenContent;