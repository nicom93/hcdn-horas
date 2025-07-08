import { useEffect, useState } from 'react';
import { CheckCircleIcon, PencilSquareIcon, ClockIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { firebaseService } from './services/firebaseService';
import { getCurrentWeekInfo, getWeekDays, calculateHoursWorked, REMOTE_HOLIDAY_HOURS, REQUIRED_WEEKLY_HOURS, MINIMUM_DAILY_HOURS, getTodayLocalDate } from './utils/dateUtils';
import type { WeekRecord, DayRecord } from './types';
import WeekHistory from './components/WeekHistory';
import AuthForm from './components/AuthForm';
import { useAuth } from './hooks/useAuth';
import './App.scss';

// Componente principal de la aplicación autenticada
const AuthenticatedApp = ({ user }: { user: { uid: string; email: string; displayName?: string } }) => {
  const { logout } = useAuth();
  const [currentWeek, setCurrentWeek] = useState<WeekRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDayRecord, setSelectedDayRecord] = useState<DayRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState<DayRecord | null>(null);
  const [editEntryTime, setEditEntryTime] = useState('');
  const [editExitTime, setEditExitTime] = useState('');
  // Estados para registrar días nuevos
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');

  // Cargar semana actual y día actual al iniciar
  useEffect(() => {
    const loadWeek = async () => {
      const weekInfo = getCurrentWeekInfo();
      const today = new Date();
      const todayStr = weekInfo.weekStart <= today && today <= weekInfo.weekEnd
        ? getTodayLocalDate()
        : weekInfo.startDate;
      let week = await firebaseService.getCurrentWeek(weekInfo.year, weekInfo.weekNumber, user.uid);
      if (!week) {
        // Crear semana vacía
        const newWeek: Omit<WeekRecord, 'id'> = {
          weekNumber: weekInfo.weekNumber,
          year: weekInfo.year,
          startDate: weekInfo.startDate,
          endDate: weekInfo.endDate,
          totalHours: 0,
          completedDays: 0,
          absentDays: 0,
          remainingHours: REQUIRED_WEEKLY_HOURS,
          days: [],
          userId: user.uid
        };
        const weekId = await firebaseService.createWeek(newWeek, user.uid);
        week = { ...newWeek, id: weekId };
      }
      setCurrentWeek(week);
      setSelectedDate(todayStr);
      // Cargar registro del día seleccionado
      const day = await firebaseService.getDayByDate(todayStr, user.uid);
      setSelectedDayRecord(day);
    };
    loadWeek();
  }, []);

  // Cambiar día seleccionado
  const handleSelectDay = async (date: string) => {
    setSelectedDate(date);
    const day = await firebaseService.getDayByDate(date, user.uid);
    setSelectedDayRecord(day);
    // Limpiar campos de entrada para días nuevos
    if (!day) {
      setEntryTime('');
      setExitTime('');
    }
  };

  // Abrir modal de edición
  const handleEditDay = () => {
    if (selectedDayRecord) {
      setEditingDay(selectedDayRecord);
      setEditEntryTime(selectedDayRecord.entryTime || '');
      setEditExitTime(selectedDayRecord.exitTime || '');
      setShowEditModal(true);
    }
  };

  // Cerrar modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDay(null);
    setEditEntryTime('');
    setEditExitTime('');
  };

  // Guardar cambios del día editado
  const handleSaveEdit = async () => {
    if (!editingDay || !currentWeek) return;

    try {
      const totalHours = calculateHoursWorked(editEntryTime, editExitTime);
      
      // Actualizar el día en Firebase
      await firebaseService.updateDay(editingDay.id, {
        entryTime: editEntryTime,
        exitTime: editExitTime,
        totalHours,
        isHoliday: false,
        isRemote: false,
        isComplete: totalHours >= MINIMUM_DAILY_HOURS
      });

      // Actualizar el estado local
      const updatedDay = {
        ...editingDay,
        entryTime: editEntryTime,
        exitTime: editExitTime,
        totalHours,
        isHoliday: false,
        isRemote: false,
        isComplete: totalHours >= MINIMUM_DAILY_HOURS
      };

      setSelectedDayRecord(updatedDay);
      await recalculateWeek();
      handleCloseEditModal();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  };

  // Marcar día como remoto
  const handleMarkAsRemote = async () => {
    if (!editingDay || !currentWeek) return;

    try {
      await firebaseService.updateDay(editingDay.id, {
        entryTime: '',
        exitTime: '',
        totalHours: REMOTE_HOLIDAY_HOURS,
        isHoliday: false,
        isRemote: true,
        isComplete: true
      });

      const updatedDay = {
        ...editingDay,
        entryTime: '',
        exitTime: '',
        totalHours: REMOTE_HOLIDAY_HOURS,
        isHoliday: false,
        isRemote: true,
        isComplete: true
      };

      setSelectedDayRecord(updatedDay);
      await recalculateWeek();
      handleCloseEditModal();
    } catch (error) {
      console.error('Error al marcar como remoto:', error);
    }
  };

  // Marcar día como feriado
  const handleMarkAsHoliday = async () => {
    if (!editingDay || !currentWeek) return;

    try {
      await firebaseService.updateDay(editingDay.id, {
        entryTime: '',
        exitTime: '',
        totalHours: REMOTE_HOLIDAY_HOURS,
        isHoliday: true,
        isRemote: false,
        isComplete: true
      });

      const updatedDay = {
        ...editingDay,
        entryTime: '',
        exitTime: '',
        totalHours: REMOTE_HOLIDAY_HOURS,
        isHoliday: true,
        isRemote: false,
        isComplete: true
      };

      setSelectedDayRecord(updatedDay);
      await recalculateWeek();
      handleCloseEditModal();
    } catch (error) {
      console.error('Error al marcar como feriado:', error);
    }
  };

  // Eliminar registro del día
  const handleDeleteDay = async () => {
    if (!editingDay || !currentWeek) return;

    try {
      await firebaseService.deleteDay(editingDay.id);
      setSelectedDayRecord(null);
      await recalculateWeek();
      handleCloseEditModal();
    } catch (error) {
      console.error('Error al eliminar día:', error);
    }
  };

  // Recalcular resumen semanal y actualizar semana en Firebase
  const recalculateWeek = async () => {
    if (!currentWeek) return;
    // Obtener todos los días de la semana
    const weekDays = getWeekDays(currentWeek.startDate).filter(d => !d.isWeekend);
    const days: DayRecord[] = [];
    for (const d of weekDays) {
      const day = await firebaseService.getDayByDate(d.date, user.uid);
      if (day) days.push(day);
    }
    // Calcular totales
    const totalHours = days.reduce((sum, d) => sum + d.totalHours, 0);
    const completedDays = days.filter(d => d.isComplete).length;
    const absentDays = days.length - completedDays;
    const remainingHours = Math.max(0, REQUIRED_WEEKLY_HOURS - totalHours);
    await firebaseService.updateWeek(currentWeek.id, {
      days,
      totalHours,
      completedDays,
      absentDays,
      remainingHours
    });
    // Refrescar semana
    const updated = await firebaseService.getWeek(currentWeek.id);
    setCurrentWeek(updated);
  };

  // Días de la semana actual (lunes a viernes)
  const weekDays = currentWeek ? getWeekDays(currentWeek.startDate).filter(d => !d.isWeekend) : [];

  // Función para verificar si un día está completo/validado
  const isDayComplete = (date: string): DayRecord | null => {
    if (!currentWeek) return null;
    return currentWeek.days.find(day => day.date === date && day.isComplete) || null;
  };

  // Formatear fecha del día seleccionado
  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const date = new Date(selectedDate);
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };



  // Formatear rango de fechas de la semana
  const formatWeekRange = () => {
    if (!currentWeek) return '';
    const start = new Date(currentWeek.startDate);
    const end = new Date(currentWeek.endDate);
    return `${start.getDate()} de ${start.toLocaleDateString('es-ES', { month: 'long' })} al ${end.getDate()} de ${end.toLocaleDateString('es-ES', { month: 'long' })}`;
  };

  // Calcular progreso
  const progressPercentage = currentWeek ? Math.round((currentWeek.totalHours / REQUIRED_WEEKLY_HOURS) * 100) : 0;
  const remainingDays = currentWeek ? Math.max(0, 5 - currentWeek.completedDays) : 5;
  
  // Calcular horas restantes considerando el mínimo de 5h por día
  const mathematicalRemainingHours = currentWeek ? Math.max(0, REQUIRED_WEEKLY_HOURS - currentWeek.totalHours) : REQUIRED_WEEKLY_HOURS;
  const minimumRequiredHours = remainingDays * MINIMUM_DAILY_HOURS;
  const remainingHours = remainingDays > 0 ? Math.max(mathematicalRemainingHours, minimumRequiredHours) : 0;
  
  // El promedio necesario debe ser mínimo 5 horas por día (para marcar presencia)
  const mathematicalAverage = remainingDays > 0 ? mathematicalRemainingHours / remainingDays : 0;
  const averageNeeded = remainingDays > 0 ? Math.max(MINIMUM_DAILY_HOURS, mathematicalAverage) : 0;

  // Registrar horario normal para día nuevo
  const handleRegisterTime = async () => {
    if (!currentWeek || !entryTime || !exitTime) return;

    try {
      const totalHours = calculateHoursWorked(entryTime, exitTime);
      
      // Crear nuevo registro de día
      const newDay: Omit<DayRecord, 'id'> = {
        date: selectedDate,
        entryTime,
        exitTime,
        totalHours,
        isHoliday: false,
        isRemote: false,
        isComplete: totalHours >= MINIMUM_DAILY_HOURS,
        userId: user.uid
      };

      const dayId = await firebaseService.createDay(newDay, user.uid);
      const createdDay = { ...newDay, id: dayId };
      
      setSelectedDayRecord(createdDay);
      setEntryTime('');
      setExitTime('');
      await recalculateWeek();
    } catch (error) {
      console.error('Error al registrar horario:', error);
    }
  };

  // Marcar día nuevo como remoto o feriado
  const handleRegisterSpecialDay = async (type: 'holiday' | 'remote') => {
    if (!currentWeek) return;

    try {
      const newDay: Omit<DayRecord, 'id'> = {
        date: selectedDate,
        entryTime: '',
        exitTime: '',
        totalHours: REMOTE_HOLIDAY_HOURS,
        isHoliday: type === 'holiday',
        isRemote: type === 'remote',
        isComplete: true,
        userId: user.uid
      };

      const dayId = await firebaseService.createDay(newDay, user.uid);
      const createdDay = { ...newDay, id: dayId };
      
      setSelectedDayRecord(createdDay);
      setEntryTime('');
      setExitTime('');
      await recalculateWeek();
    } catch (error) {
      console.error('Error al registrar día especial:', error);
    }
  };

  return (
    <div className="app-bg">
      <div className="main-container">
        {/* Header Principal */}
        {/* <div className="main-header">
          <h1 className="main-title">Tracker de Horas Semanales</h1>
          <p className="main-subtitle">Registra tus horas de trabajo y monitorea tu progreso semanal</p>
          <p className="current-date">{formatCurrentDate()}</p>
        </div> */}

        {/* Header con usuario y logout */}
        <div className="user-header">
          <div className="user-info">
            <span className="user-name">👋 Hola, {user.displayName || user.email}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>

        {/* Navegación de Semanas */}
        <div className="week-navigation">
          <button className="nav-btn" disabled>
            <ChevronLeftIcon className="icon" />
            Anterior
          </button>
          
          <div className="week-info">
            <div className="week-title">
              <CalendarDaysIcon className="calendar-icon" />
              Semana {currentWeek?.weekNumber || 0} - {currentWeek?.year || new Date().getFullYear()}
            </div>
            <div className="week-dates">{formatWeekRange()}</div>
            <div className="current-week-badge">
              <CheckCircleIcon className="check-icon" />
              Semana actual
            </div>
          </div>
          
          <button className="nav-btn" disabled>
            Siguiente
            <ChevronRightIcon className="icon" />
          </button>
        </div>

        {/* Cards Principales */}
        <div className="cards-container">
          {/* Card Registrar Horas */}
          <div className="card register-card">
            <div className="card-header">
              <ClockIcon className="card-icon" />
              <h2 className="card-title">Registrar Horas</h2>
            </div>
            <div className="card-subtitle">Seleccionar día de la semana</div>
            
            {/* Selector de días */}
            <div className="weekdays-grid">
              {weekDays.map((d) => {
                const dayRecord = isDayComplete(d.date);
                const isSelected = selectedDate === d.date;
                const isToday = d.date === getTodayLocalDate();
                
                return (
                  <button
                    key={d.date}
                    onClick={() => handleSelectDay(d.date)}
                    className={`weekday-button${isSelected ? ' selected' : ''}${dayRecord ? ' completed' : ''}`}
                  >
                    <span className="day-name">{d.dayName.slice(0, 3)}</span>
                    <span className="day-number">{d.dayNumber}</span>
                    
                    {/* Check para día seleccionado */}
                    {isSelected && <CheckCircleIcon className="check-icon selected-check" />}
                    
                    {/* Check para día completado/validado */}
                    {dayRecord && !isSelected && (
                      <CheckCircleIcon className="check-icon completed-check" />
                    )}
                    
                    {/* Badge "Hoy" */}
                    {isToday && <span className="today-badge">Hoy</span>}
                  </button>
                );
              })}
            </div>
            
            {/* Información del día seleccionado */}
            <div className="selected-day-info">
              <div className="day-date">{formatSelectedDate()}</div>
              <div className="day-status">
                {selectedDayRecord?.isComplete ? (
                  <>
                    <CheckCircleIcon className="status-icon" />
                    {selectedDayRecord.isHoliday ? 'Feriado' : selectedDayRecord.isRemote ? 'Remoto' : 'Completado'} ({selectedDayRecord.totalHours}h)
                  </>
                ) : (
                  'Sin registrar'
                )}
              </div>
              {selectedDayRecord && (
                <button className="edit-button" onClick={handleEditDay}>
                  <PencilSquareIcon className="edit-icon" />
                  Editar
                </button>
              )}
            </div>

            {/* Formulario para registrar nuevo día */}
            {!selectedDayRecord && selectedDate && (
              <div className="register-form">
                <div className="form-header">Registrar horario</div>
                
                {/* Campos de horario normal */}
                <div className="time-section">
                  <h4>⏰ Horario Normal</h4>
                  <div className="time-inputs">
                    <div className="input-group">
                      <label>Hora de Entrada</label>
                      <input
                        type="time"
                        value={entryTime}
                        onChange={(e) => setEntryTime(e.target.value)}
                        placeholder="09:00"
                      />
                    </div>
                    <div className="input-group">
                      <label>Hora de Salida</label>
                      <input
                        type="time"
                        value={exitTime}
                        onChange={(e) => setExitTime(e.target.value)}
                        placeholder="17:00"
                      />
                    </div>
                  </div>
                  {entryTime && exitTime && (
                    <div className="calculated-hours">
                      Total: {calculateHoursWorked(entryTime, exitTime)} horas
                    </div>
                  )}
                  <button 
                    className="register-btn"
                    onClick={handleRegisterTime}
                    disabled={!entryTime || !exitTime}
                  >
                    Registrar Horario
                  </button>
                </div>

                {/* Botones para días especiales */}
                <div className="special-days">
                  <h4>Días Especiales</h4>
                  <div className="special-buttons">
                    <button 
                      className="special-btn remote-btn"
                      onClick={() => handleRegisterSpecialDay('remote')}
                    >
                      🏠 Día Remoto (7h)
                    </button>
                    <button 
                      className="special-btn holiday-btn"
                      onClick={() => handleRegisterSpecialDay('holiday')}
                    >
                      ☀️ Día Feriado (7h)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de horas registradas */}
            {selectedDayRecord && (
              <div className="hours-table">
                <div className="table-header">Horas registradas</div>
                <div className="table-row">
                  <span className="row-label">Entrada:</span>
                  <span className="row-value">{selectedDayRecord.entryTime || 'N/A'}</span>
                </div>
                <div className="table-row">
                  <span className="row-label">Salida:</span>
                  <span className="row-value">{selectedDayRecord.exitTime || 'N/A'}</span>
                </div>
                <div className="table-row total-row">
                  <span className="row-label">Total:</span>
                  <span className="row-value">{selectedDayRecord.totalHours} horas</span>
                </div>
              </div>
            )}
          </div>

          {/* Card Resumen Semanal */}
          <div className="card summary-card">
            <div className="card-header">
              <CalendarDaysIcon className="card-icon" />
              <h2 className="card-title">Resumen Semanal</h2>
            </div>
            
            <div className="summary-header">
              <div className="summary-title">Semana {currentWeek?.weekNumber || 0} - {currentWeek?.year || new Date().getFullYear()}</div>
              <div className="summary-subtitle">Progreso Semanal</div>
            </div>

            {/* Barra de progreso */}
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Progreso Semanal</span>
                <span className="progress-value">{currentWeek?.totalHours || 0} / {REQUIRED_WEEKLY_HOURS} horas</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="progress-percentage">{progressPercentage}% completado</div>
            </div>

            {/* Cards de estadísticas */}
            <div className="stats-grid">
              <div className="stat-card blue">
                <ClockIcon className="stat-icon" />
                <div className="stat-value">{currentWeek?.totalHours || 0}</div>
                <div className="stat-label">Horas Trabajadas</div>
              </div>
              
              <div className="stat-card green">
                <CheckCircleIcon className="stat-icon" />
                <div className="stat-value">{remainingHours.toFixed(1)}</div>
                <div className="stat-label">Horas Restantes</div>
              </div>
              
              <div className="stat-card purple">
                <CheckCircleIcon className="stat-icon" />
                <div className="stat-value">{currentWeek?.completedDays || 0}</div>
                <div className="stat-label">Días Completados</div>
              </div>
              
              <div className="stat-card red">
                <ClockIcon className="stat-icon" />
                <div className="stat-value">{currentWeek?.absentDays || 0}</div>
                <div className="stat-label">Días Ausentes</div>
              </div>
            </div>

            {/* Promedio necesario */}
            <div className="average-needed">
              <div className="average-label">
                {remainingDays > 0 ? (
                  mathematicalAverage < MINIMUM_DAILY_HOURS ? 
                    `Mínimo por día restante (${remainingDays} día${remainingDays > 1 ? 's' : ''}):` :
                    `Promedio necesario por día restante (${remainingDays} día${remainingDays > 1 ? 's' : ''}):` 
                ) : 'Semana completada'}
              </div>
              <div className="average-value">
                {remainingDays > 0 ? `${averageNeeded.toFixed(1)} horas` : '¡Felicitaciones! 🎉'}
              </div>
              {remainingDays > 0 && mathematicalAverage < MINIMUM_DAILY_HOURS && (
                <div className="average-note">
                  * Mínimo 5h por día para marcar presencia
                </div>
              )}
            </div>

            {/* Detalle por día */}
            <div className="daily-detail">
              <div className="detail-header">Detalle por Día</div>
              {weekDays.map((d) => {
                const dayRecord = currentWeek?.days.find(day => day.date === d.date);
                return (
                  <div key={d.date} className="detail-item">
                    <span className="detail-date">{d.date.slice(8, 10)}/{d.date.slice(5, 7)}/{d.date.slice(0, 4)}</span>
                    <div className="detail-info">
                      <span className="detail-hours">{dayRecord?.totalHours || 0}h</span>
                      <span className="detail-status">{dayRecord?.isComplete ? 'Completo' : 'Pendiente'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Historial de Semanas */}
        <WeekHistory currentWeekId={currentWeek?.id} userId={user.uid} />

        {/* Modal de Edición */}
        {showEditModal && editingDay && (
          <div className="modal-overlay" onClick={handleCloseEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Editar Día</h3>
                <button className="modal-close" onClick={handleCloseEditModal}>
                  <XMarkIcon className="icon" />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="edit-date">
                  {new Date(editingDay.date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>

                {/* Estado actual */}
                <div className="current-status">
                  <h4>Estado actual:</h4>
                  <div className="status-info">
                    {editingDay.isHoliday ? (
                      <span className="status-badge holiday">☀️ Día Feriado</span>
                    ) : editingDay.isRemote ? (
                      <span className="status-badge remote">🏠 Día Remoto</span>
                    ) : (
                      <span className="status-badge normal">⏰ Horario Normal</span>
                    )}
                    <span className="hours-info">{editingDay.totalHours}h registradas</span>
                  </div>
                </div>

                {/* Opciones de edición */}
                <div className="edit-options">
                  <h4>Cambiar a:</h4>
                  
                  {/* Horario normal */}
                  <div className="option-section">
                    <h5>⏰ Horario Normal</h5>
                    <div className="time-inputs">
                      <div className="input-group">
                        <label>Hora de Entrada</label>
                        <input
                          type="time"
                          value={editEntryTime}
                          onChange={(e) => setEditEntryTime(e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Hora de Salida</label>
                        <input
                          type="time"
                          value={editExitTime}
                          onChange={(e) => setEditExitTime(e.target.value)}
                        />
                      </div>
                    </div>
                    {editEntryTime && editExitTime && (
                      <div className="calculated-hours">
                        Total: {calculateHoursWorked(editEntryTime, editExitTime)} horas
                      </div>
                    )}
                    <button 
                      className="save-btn"
                      onClick={handleSaveEdit}
                      disabled={!editEntryTime || !editExitTime}
                    >
                      Guardar Horario
                    </button>
                  </div>

                  {/* Día remoto */}
                  <div className="option-section">
                    <h5>🏠 Día Remoto</h5>
                    <p>Se registrarán automáticamente 7 horas</p>
                    <button className="special-btn remote-btn" onClick={handleMarkAsRemote}>
                      Marcar como Remoto
                    </button>
                  </div>

                  {/* Día feriado */}
                  <div className="option-section">
                    <h5>☀️ Día Feriado</h5>
                    <p>Se registrarán automáticamente 7 horas</p>
                    <button className="special-btn holiday-btn" onClick={handleMarkAsHoliday}>
                      Marcar como Feriado
                    </button>
                  </div>

                  {/* Eliminar registro */}
                  <div className="option-section danger">
                    <h5>🗑️ Eliminar Registro</h5>
                    <p>Se eliminará completamente el registro de este día</p>
                    <button className="delete-btn" onClick={handleDeleteDay}>
                      Eliminar Día
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal de la aplicación
function App() {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="app-bg">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar formulario de autenticación si no hay usuario
  if (!user) {
    return <AuthForm />;
  }

  // Mostrar aplicación autenticada
  return <AuthenticatedApp user={user} />;
}

export default App;
