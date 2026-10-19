'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  type AgileTask,
  type AgileStatus,
  type AgilePriority,
  getStoredAgileTasks,
  saveAgileTasksToStorage,
  resetAgileTasksToDefault,
  syncFromGoogleSheets
} from '@/lib/agileTrackerData';
import { TEAM_MEMBERS, type TeamMember } from '@/components/layout/LayoutContext';

const STATUS_COLUMNS: Array<{ id: AgileStatus; title: string; color: string; icon: string }> = [
  { id: 'To Do', title: 'To Do', color: '#64748b', icon: 'lucide:circle' },
  { id: 'In Progress', title: 'In Progress', color: '#0284c7', icon: 'lucide:clock' },
  { id: 'In Review', title: 'In Review / QC', color: '#f59e0b', icon: 'lucide:eye' },
  { id: 'Blocked', title: 'Blocked', color: '#ef4444', icon: 'lucide:alert-octagon' },
  { id: 'Done', title: 'Done', color: '#10b981', icon: 'lucide:check-circle-2' }
];

export function UniversalKanbanBoard() {
  const [tasks, setTasks] = useState<AgileTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('ALL');
  const [selectedEpic, setSelectedEpic] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'raci'>('kanban');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Detail
  const [selectedTask, setSelectedTask] = useState<AgileTask | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Modal Tambah Task
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    taskId: '',
    title: '',
    epic: 'Brand Awareness',
    component: 'Riset & Naskah',
    description: '',
    assignee: 'Dimas',
    priority: 'P2 — Medium' as AgilePriority,
    storyPoints: 3,
    dueDate: '2026-10-30',
    reviewer: 'Anam (CD)',
    notes: ''
  });

  // Muat data awal
  useEffect(() => {
    setTasks(getStoredAgileTasks());
  }, []);

  // Update tasks & sinkronkan ke local storage
  const updateTasksState = (newTasks: AgileTask[]) => {
    setTasks(newTasks);
    saveAgileTasksToStorage(newTasks);
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchId = task.taskId.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        const matchLabels = task.labels.some((l) => l.toLowerCase().includes(q));
        if (!matchTitle && !matchId && !matchDesc && !matchLabels) return false;
      }
      // Assignee
      if (selectedAssignee !== 'ALL') {
        if (!task.assignee.toLowerCase().includes(selectedAssignee.toLowerCase())) {
          return false;
        }
      }
      // Epic
      if (selectedEpic !== 'ALL') {
        if (task.epic !== selectedEpic) return false;
      }
      // Priority
      if (selectedPriority !== 'ALL') {
        if (!task.priority.includes(selectedPriority)) return false;
      }
      return true;
    });
  }, [tasks, searchQuery, selectedAssignee, selectedEpic, selectedPriority]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'Done').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const inReview = tasks.filter((t) => t.status === 'In Review').length;
    const blocked = tasks.filter((t) => t.status === 'Blocked').length;
    const totalSp = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const doneSp = tasks.filter((t) => t.status === 'Done').reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const progressPercent = totalSp > 0 ? Math.round((doneSp / totalSp) * 100) : 0;

    return { total, done, inProgress, inReview, blocked, totalSp, doneSp, progressPercent };
  }, [tasks]);

  // Daftar Epic unik untuk dropdown
  const uniqueEpics = useMemo(() => {
    const set = new Set(tasks.map((t) => t.epic).filter(Boolean));
    return Array.from(set);
  }, [tasks]);

  // Sync dengan Google Sheets Live
  const handleSyncSheets = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    const res = await syncFromGoogleSheets();
    setIsSyncing(false);
    if (res.success && res.tasks) {
      setTasks(res.tasks);
      setSyncNotice({ type: 'success', text: res.message });
    } else {
      setSyncNotice({ type: 'error', text: res.message });
    }
    setTimeout(() => setSyncNotice(null), 6000);
  };

  // Reset Data ke default
  const handleResetDefault = () => {
    if (window.confirm('Kembalikan data Kanban ke 56 tugas default spreadsheet? Perubahan lokal akan diatur ulang.')) {
      const def = resetAgileTasksToDefault();
      setTasks(def);
      setSyncNotice({ type: 'success', text: 'Data berhasil direset ke default Google Sheets.' });
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  // Handler Pindah Status
  const handleMoveStatus = (taskId: string, targetStatus: AgileStatus) => {
    const updated = tasks.map((t) => {
      if (t.taskId === taskId) {
        let pct = t.percentDone;
        let compDate = t.completionDate;
        if (targetStatus === 'Done') {
          pct = 100;
          compDate = compDate || '2026-10-19';
        } else if (targetStatus === 'To Do') {
          pct = 0;
          compDate = '';
        } else if (targetStatus === 'In Progress' && pct === 100) {
          pct = 50;
        }
        return { ...t, status: targetStatus, percentDone: pct, completionDate: compDate };
      }
      return t;
    });
    updateTasksState(updated);
    if (selectedTask && selectedTask.taskId === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: targetStatus } : null));
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnId: AgileStatus) => {
    e.preventDefault();
    const id = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (id) {
      handleMoveStatus(id, columnId);
      setDraggedTaskId(null);
    }
  };

  // Tambah Task Baru
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newTaskForm.taskId.trim() || `KMN-${String(tasks.length + 1).padStart(3, '0')}`;
    const newTask: AgileTask = {
      taskId: id,
      title: newTaskForm.title,
      epic: newTaskForm.epic,
      component: newTaskForm.component,
      description: newTaskForm.description,
      assignee: newTaskForm.assignee,
      status: 'To Do',
      priority: newTaskForm.priority,
      storyPoints: Number(newTaskForm.storyPoints) || 3,
      startDate: '2026-10-19',
      dueDate: newTaskForm.dueDate,
      percentDone: 0,
      labels: [newTaskForm.epic.toLowerCase().replace(/\s+/g, '-')],
      reviewer: newTaskForm.reviewer,
      notes: newTaskForm.notes
    };
    updateTasksState([newTask, ...tasks]);
    setIsNewTaskModalOpen(false);
    setNewTaskForm({
      taskId: '',
      title: '',
      epic: 'Brand Awareness',
      component: 'Riset & Naskah',
      description: '',
      assignee: 'Dimas',
      priority: 'P2 — Medium',
      storyPoints: 3,
      dueDate: '2026-10-30',
      reviewer: 'Anam (CD)',
      notes: ''
    });
  };

  // Warna avatar assignee
  const getAssigneeInfo = (name: string): { bg: string; initial: string; role: string } => {
    const member = TEAM_MEMBERS.find((m) => name.toLowerCase().includes(m.nickname.toLowerCase()));
    if (member) {
      return { bg: member.avatarBg, initial: member.initials, role: member.roleTitle };
    }
    return { bg: '#64748b', initial: name.slice(0, 2).toUpperCase(), role: 'Personil Humed' };
  };

  return (
    <div className="universal-kanban-root" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner Notifikasi Sync */}
      {syncNotice && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: syncNotice.type === 'success' ? '#064e3b' : '#7f1d1d',
            color: '#ffffff',
            fontSize: '0.88rem',
            border: `1px solid ${syncNotice.type === 'success' ? '#059669' : '#dc2626'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* @ts-ignore iconify-icon */}
            <iconify-icon
              icon={syncNotice.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'}
              style={{ fontSize: '18px' }}
            />
            <span>{syncNotice.text}</span>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
          >
            {/* @ts-ignore iconify-icon */}
            <iconify-icon icon="lucide:x" />
          </button>
        </div>
      )}

      {/* Ringkasan Header & Velocity Stats */}
      <div
        className="dasbor__card"
        style={{
          padding: '20px',
          background: 'var(--color-bg-card, #1e293b)',
          border: '1px solid var(--color-border, #334155)',
          borderRadius: '12px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '16px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-text, #f8fafc)' }}>
              Universal Agile Kanban & RACI Tracker
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted, #94a3b8)' }}>
              Sinkronisasi alur kerja terpadu (Sosmed, Kelembagaan, Pers, Website, Merchandise, TFT) · Komnas Palestina
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSyncSheets}
              disabled={isSyncing}
              className="l-humas__action-btn l-humas__action-btn--primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: isSyncing ? 'wait' : 'pointer' }}
            >
              {/* @ts-ignore iconify-icon */}
              <iconify-icon
                icon={isSyncing ? 'lucide:loader-2' : 'lucide:refresh-cw'}
                className={isSyncing ? 'animate-spin' : ''}
              />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Google Sheets'}</span>
            </button>

            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="l-humas__action-btn l-humas__action-btn--outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {/* @ts-ignore iconify-icon */}
              <iconify-icon icon="lucide:plus" />
              <span>Tambah Tugas</span>
            </button>

            <button
              onClick={handleResetDefault}
              title="Atur ulang ke 56 tugas default spreadsheet"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border, #475569)',
                color: 'var(--color-muted, #94a3b8)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Reset Default
            </button>
          </div>
        </div>

        {/* Baris Metrik Progress */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--color-border, #334155)'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #94a3b8)', textTransform: 'uppercase' }}>
              Total Tugas
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text, #f8fafc)' }}>
              {stats.total}
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#10b981', textTransform: 'uppercase' }}>Selesai (Done)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{stats.done}</div>
          </div>

          <div style={{ background: 'rgba(2, 132, 199, 0.08)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#0284c7', textTransform: 'uppercase' }}>In Progress</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>{stats.inProgress}</div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase' }}>In Review</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{stats.inReview}</div>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#ef4444', textTransform: 'uppercase' }}>Terkendala</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>{stats.blocked}</div>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#818cf8', textTransform: 'uppercase' }}>Story Points (SP)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>
              {stats.doneSp} <span style={{ fontSize: '0.85rem', color: 'var(--color-muted, #94a3b8)' }}>/ {stats.totalSp}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #94a3b8)', textTransform: 'uppercase' }}>
              Velocity Tim
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>{stats.progressPercent}%</div>
          </div>
        </div>
      </div>

      {/* Filter Bar Universal & Mode Toggle */}
      <div
        className="dasbor__card"
        style={{
          padding: '16px 20px',
          background: 'var(--color-bg-card, #1e293b)',
          border: '1px solid var(--color-border, #334155)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            {/* @ts-ignore iconify-icon */}
            <iconify-icon
              icon="lucide:search"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-muted, #94a3b8)'
              }}
            />
            <input
              type="text"
              placeholder="Cari ID tugas (KMN-001), judul, deskripsi, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #334155)',
                background: 'var(--color-bg, #0f172a)',
                color: 'var(--color-text, #f8fafc)',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* Toggle View Mode */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--color-bg, #0f172a)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #334155)'
            }}
          >
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'kanban' ? '#059669' : 'transparent',
                color: viewMode === 'kanban' ? '#ffffff' : 'var(--color-muted, #94a3b8)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {/* @ts-ignore iconify-icon */}
              <iconify-icon icon="lucide:kanban" />
              <span>Papan Kanban</span>
            </button>

            <button
              onClick={() => setViewMode('raci')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'raci' ? '#059669' : 'transparent',
                color: viewMode === 'raci' ? '#ffffff' : 'var(--color-muted, #94a3b8)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {/* @ts-ignore iconify-icon */}
              <iconify-icon icon="lucide:table" />
              <span>Matriks RACI Workflow</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Assignee Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #94a3b8)' }}>Personil:</span>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #334155)',
                background: 'var(--color-bg, #0f172a)',
                color: 'var(--color-text, #f8fafc)',
                fontSize: '0.82rem'
              }}
            >
              <option value="ALL">Semua Personil (6 Orang)</option>
              {TEAM_MEMBERS.map((m) => (
                <option key={m.id} value={m.nickname}>
                  {m.nickname} — {m.roleTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Epic Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #94a3b8)' }}>Epic:</span>
            <select
              value={selectedEpic}
              onChange={(e) => setSelectedEpic(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #334155)',
                background: 'var(--color-bg, #0f172a)',
                color: 'var(--color-text, #f8fafc)',
                fontSize: '0.82rem'
              }}
            >
              <option value="ALL">Semua Epic ({uniqueEpics.length})</option>
              {uniqueEpics.map((ep) => (
                <option key={ep} value={ep}>
                  {ep}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #94a3b8)' }}>Prioritas:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #334155)',
                background: 'var(--color-bg, #0f172a)',
                color: 'var(--color-text, #f8fafc)',
                fontSize: '0.82rem'
              }}
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="P0">P0 — Critical</option>
              <option value="P1">P1 — High</option>
              <option value="P2">P2 — Medium</option>
              <option value="P3">P3 — Low</option>
            </select>
          </div>

          {/* Reset filter button if any active */}
          {(searchQuery || selectedAssignee !== 'ALL' || selectedEpic !== 'ALL' || selectedPriority !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedAssignee('ALL');
                setSelectedEpic('ALL');
                setSelectedPriority('ALL');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Reset Filter
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--color-muted, #94a3b8)' }}>
            Menampilkan <b>{filteredTasks.length}</b> dari {tasks.length} tugas
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: PAPAN KANBAN (5 KOLOM) */}
      {viewMode === 'kanban' && (
        <div
          className="kanban-columns-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            alignItems: 'start'
          }}
        >
          {STATUS_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const colSp = colTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                style={{
                  background: 'var(--color-bg-card, #1e293b)',
                  border: '1px solid var(--color-border, #334155)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '480px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Header Kolom */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-border, #334155)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: `3px solid ${col.color}`,
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* @ts-ignore iconify-icon */}
                    <iconify-icon icon={col.icon} style={{ color: col.color, fontSize: '16px' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text, #f8fafc)' }}>
                      {col.title}
                    </span>
                    <span
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-text, #f8fafc)'
                      }}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.74rem', color: 'var(--color-muted, #94a3b8)' }}>{colSp} SP</span>
                </div>

                {/* List Kartu Tugas */}
                <div
                  style={{
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    flex: 1,
                    overflowY: 'auto',
                    maxHeight: '75vh'
                  }}
                >
                  {colTasks.length === 0 ? (
                    <div
                      style={{
                        padding: '32px 16px',
                        textAlign: 'center',
                        color: 'var(--color-muted, #64748b)',
                        fontSize: '0.82rem',
                        fontStyle: 'italic',
                        border: '2px dashed rgba(255,255,255,0.06)',
                        borderRadius: '8px'
                      }}
                    >
                      Tarik kartu ke sini
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const assigneeInfo = getAssigneeInfo(task.assignee);
                      const isP0 = task.priority.includes('P0');
                      const isP1 = task.priority.includes('P1');

                      return (
                        <div
                          key={task.taskId}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.taskId)}
                          onClick={() => setSelectedTask(task)}
                          style={{
                            background: 'var(--color-bg, #0f172a)',
                            border: '1px solid var(--color-border, #334155)',
                            borderRadius: '10px',
                            padding: '14px',
                            cursor: 'grab',
                            transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#059669';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border, #334155)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Row 1: Task ID & Priority Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                color: '#38bdf8',
                                letterSpacing: '0.04em'
                              }}
                            >
                              {task.taskId}
                            </span>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  background: isP0
                                    ? 'rgba(239,68,68,0.2)'
                                    : isP1
                                    ? 'rgba(245,158,11,0.2)'
                                    : 'rgba(100,116,139,0.2)',
                                  color: isP0 ? '#f87171' : isP1 ? '#fbbf24' : '#94a3b8'
                                }}
                              >
                                {task.priority.split('—')[0].trim()}
                              </span>

                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: 'rgba(255,255,255,0.06)',
                                  color: 'var(--color-muted, #94a3b8)',
                                  fontWeight: 600
                                }}
                              >
                                {task.storyPoints} SP
                              </span>
                            </div>
                          </div>

                          {/* Epic & Komponen Tag */}
                          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                            {task.epic} {task.component ? `• ${task.component}` : ''}
                          </div>

                          {/* Judul Tugas */}
                          <h4
                            style={{
                              margin: 0,
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              lineHeight: 1.35,
                              color: 'var(--color-text, #f8fafc)'
                            }}
                          >
                            {task.title}
                          </h4>

                          {/* Deskripsi Singkat */}
                          {task.description && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.78rem',
                                color: 'var(--color-muted, #94a3b8)',
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {task.description}
                            </p>
                          )}

                          {/* Progress Bar */}
                          <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '5px' }}>
                            <div
                              style={{
                                width: `${task.percentDone}%`,
                                background: task.status === 'Done' ? '#10b981' : task.status === 'Blocked' ? '#ef4444' : '#0284c7',
                                height: '100%',
                                borderRadius: '4px'
                              }}
                            />
                          </div>

                          {/* Footer: Assignee Avatar + Due Date */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                              paddingTop: '6px',
                              borderTop: '1px solid rgba(255,255,255,0.06)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={`${task.assignee} (${assigneeInfo.role})`}>
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: assigneeInfo.bg,
                                  color: '#ffffff',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {assigneeInfo.initial}
                              </div>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text, #e2e8f0)' }}>
                                {task.assignee}
                              </span>
                            </div>

                            {task.dueDate && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  color: 'var(--color-muted, #94a3b8)'
                                }}
                              >
                                {/* @ts-ignore iconify-icon */}
                                <iconify-icon icon="lucide:calendar" style={{ fontSize: '12px' }} />
                                <span>{task.dueDate}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Move Buttons */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '4px',
                              paddingTop: '4px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {task.status !== 'To Do' && (
                              <button
                                onClick={() => handleMoveStatus(task.taskId, 'To Do')}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--color-muted, #64748b)',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  padding: '2px 4px'
                                }}
                                title="Pindah ke To Do"
                              >
                                ← To Do
                              </button>
                            )}

                            {task.status !== 'In Progress' && (
                              <button
                                onClick={() => handleMoveStatus(task.taskId, 'In Progress')}
                                style={{
                                  background: 'rgba(2, 132, 199, 0.1)',
                                  border: 'none',
                                  color: '#38bdf8',
                                  fontSize: '11px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  padding: '2px 6px',
                                  fontWeight: 600
                                }}
                                title="Kerjakan tugas ini"
                              >
                                Kerjakan ⚡
                              </button>
                            )}

                            {task.status !== 'In Review' && task.status !== 'Done' && (
                              <button
                                onClick={() => handleMoveStatus(task.taskId, 'In Review')}
                                style={{
                                  background: 'rgba(245, 158, 11, 0.1)',
                                  border: 'none',
                                  color: '#fbbf24',
                                  fontSize: '11px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  padding: '2px 6px'
                                }}
                                title="Ajukan Review / QC"
                              >
                                Review 🔍
                              </button>
                            )}

                            {task.status !== 'Done' && (
                              <button
                                onClick={() => handleMoveStatus(task.taskId, 'Done')}
                                style={{
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  border: 'none',
                                  color: '#34d399',
                                  fontSize: '11px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  padding: '2px 6px',
                                  fontWeight: 700
                                }}
                                title="Tandai Selesai"
                              >
                                Selesai ✓
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: TABEL MATRIKS RACI WORKFLOW */}
      {viewMode === 'raci' && (
        <div
          className="dasbor__card"
          style={{
            padding: 0,
            overflow: 'hidden',
            background: 'var(--color-bg-card, #1e293b)',
            border: '1px solid var(--color-border, #334155)',
            borderRadius: '12px'
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border, #334155)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text, #f8fafc)' }}>
              Matriks Penugasan RACI 2.0 (Responsible, Accountable, Consulted, Informed)
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)' }}>
              Alur wewenang: R (Pelaksana Konten), A (Creative Director / Ketua Bidang), C (Konsultan Nakama & Mitra Gaza), I (BPH & Publik).
            </p>
          </div>

          <div className="dasbor__table-wrap" style={{ overflowX: 'auto' }}>
            <table className="dasbor__table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                  <th scope="col" style={{ width: '90px' }}>Task ID</th>
                  <th scope="col">Nama Tugas & Deskripsi</th>
                  <th scope="col" style={{ width: '130px' }}>Epic / Bidang</th>
                  <th scope="col" style={{ width: '140px' }}>R (Pelaksana)</th>
                  <th scope="col" style={{ width: '140px' }}>A (Approval/QC)</th>
                  <th scope="col" style={{ width: '110px' }}>Tenggat</th>
                  <th scope="col" style={{ width: '70px', textAlign: 'center' }}>SP</th>
                  <th scope="col" style={{ width: '110px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const assigneeInfo = getAssigneeInfo(task.assignee);
                  return (
                    <tr
                      key={task.taskId}
                      onClick={() => setSelectedTask(task)}
                      style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                      <td>
                        <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.8rem' }}>
                          {task.taskId}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--color-text, #f8fafc)', display: 'block' }}>
                          {task.title}
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #94a3b8)' }}>
                          {task.description}
                        </span>
                      </td>
                      <td>
                        <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px' }}>
                          {task.epic}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: assigneeInfo.bg,
                              color: '#fff',
                              fontSize: '9px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {assigneeInfo.initial}
                          </span>
                          <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{task.assignee}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600 }}>
                          {task.reviewer || (task.epic === 'Kelembagaan' ? 'Iskandar (Ketua)' : 'Anam (CD)')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)' }}>
                        {task.dueDate || '-'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.84rem' }}>
                        {task.storyPoints}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`dasbor__badge ${
                            task.status === 'Done'
                              ? 'dasbor__badge--up'
                              : task.status === 'In Progress'
                              ? 'dasbor__badge--blue'
                              : task.status === 'In Review'
                              ? 'dasbor__badge--warning'
                              : task.status === 'Blocked'
                              ? 'dasbor__badge--down'
                              : ''
                          }`}
                          style={{ fontSize: '11px' }}
                        >
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETAIL TUGAS & UPDATE STATUS */}
      {selectedTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSelectedTask(null)}
        >
          <div
            style={{
              background: 'var(--color-bg-card, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {selectedTask.taskId}
                  </span>
                  <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px' }}>
                    {selectedTask.epic}
                  </span>
                  {selectedTask.component && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #94a3b8)' }}>
                      • {selectedTask.component}
                    </span>
                  )}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text, #f8fafc)' }}>
                  {selectedTask.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-muted, #94a3b8)',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '4px'
                }}
              >
                {/* @ts-ignore iconify-icon */}
                <iconify-icon icon="lucide:x" />
              </button>
            </div>

            {/* Deskripsi */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #94a3b8)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Deskripsi Pekerjaan
              </span>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--color-text, #e2e8f0)' }}>
                {selectedTask.description || 'Tidak ada deskripsi rinci.'}
              </p>
            </div>

            {/* Grid Detail Atribut */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted, #94a3b8)', display: 'block' }}>Pelaksana (Responsible):</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--color-text, #f8fafc)' }}>{selectedTask.assignee}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted, #94a3b8)', display: 'block' }}>Reviewer / Approval (Accountable):</span>
                <strong style={{ fontSize: '0.9rem', color: '#fbbf24' }}>{selectedTask.reviewer || 'Anam (CD)'}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted, #94a3b8)', display: 'block' }}>Prioritas:</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--color-text, #f8fafc)' }}>{selectedTask.priority}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted, #94a3b8)', display: 'block' }}>Estimasi Story Points:</span>
                <strong style={{ fontSize: '0.9rem', color: '#818cf8' }}>{selectedTask.storyPoints} SP</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted, #94a3b8)', display: 'block' }}>Tenggat Waktu (Due Date):</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--color-text, #f8fafc)' }}>{selectedTask.dueDate || 'Belum diatur'}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted, #94a3b8)', display: 'block' }}>Dependencies (Ketergantungan):</span>
                <strong style={{ fontSize: '0.9rem', color: '#38bdf8' }}>{selectedTask.dependencies || 'Tidak ada'}</strong>
              </div>
            </div>

            {/* Catatan Khusus */}
            {selectedTask.notes && (
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                  Catatan Reviewer / Lapangan:
                </span>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text, #f8fafc)' }}>{selectedTask.notes}</p>
              </div>
            )}

            {/* Form Ubah Status Cepat */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border, #334155)' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Pindahkan Kolom Status:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STATUS_COLUMNS.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleMoveStatus(selectedTask.taskId, st.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: selectedTask.status === st.id ? `2px solid ${st.color}` : '1px solid var(--color-border, #334155)',
                      background: selectedTask.status === st.id ? st.color : 'transparent',
                      color: selectedTask.status === st.id ? '#ffffff' : 'var(--color-muted, #94a3b8)',
                      fontWeight: selectedTask.status === st.id ? 700 : 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    {st.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH TUGAS BARU */}
      {isNewTaskModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setIsNewTaskModalOpen(false)}
        >
          <form
            onSubmit={handleCreateTask}
            style={{
              background: 'var(--color-bg-card, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text, #f8fafc)' }}>
                Tambah Tugas Baru ke Kanban Board
              </h3>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {/* @ts-ignore iconify-icon */}
                <iconify-icon icon="lucide:x" style={{ fontSize: '18px' }} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                Judul Tugas *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Produksi Video Reels Relawan Medis Rafah"
                value={newTaskForm.title}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #334155)',
                  background: 'var(--color-bg, #0f172a)',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  Epic *
                </label>
                <select
                  value={newTaskForm.epic}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, epic: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #334155)',
                    background: 'var(--color-bg, #0f172a)',
                    color: '#fff'
                  }}
                >
                  <option value="Brand Awareness">Brand Awareness</option>
                  <option value="Human Story">Human Story</option>
                  <option value="Kelembagaan">Kelembagaan</option>
                  <option value="Sistem & Dasbor">Sistem & Dasbor</option>
                  <option value="Distribusi Multi-Kanal">Distribusi Multi-Kanal</option>
                  <option value="Trust & Transparansi">Trust & Transparansi</option>
                  <option value="Campaign">Campaign</option>
                  <option value="Maintaining Website">Maintaining Website</option>
                  <option value="Strategi Humed">Strategi Humed</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  Penerima Tugas (Assignee) *
                </label>
                <select
                  value={newTaskForm.assignee}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #334155)',
                    background: 'var(--color-bg, #0f172a)',
                    color: '#fff'
                  }}
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m.id} value={m.nickname}>
                      {m.nickname} ({m.roleTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                Deskripsi Tugas
              </label>
              <textarea
                rows={3}
                placeholder="Rincian alur kerja, formula, atau hasil yang diharapkan..."
                value={newTaskForm.description}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #334155)',
                  background: 'var(--color-bg, #0f172a)',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  Prioritas
                </label>
                <select
                  value={newTaskForm.priority}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as AgilePriority })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #334155)',
                    background: 'var(--color-bg, #0f172a)',
                    color: '#fff'
                  }}
                >
                  <option value="P0 — Critical">P0 — Critical</option>
                  <option value="P1 — High">P1 — High</option>
                  <option value="P2 — Medium">P2 — Medium</option>
                  <option value="P3 — Low">P3 — Low</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  Story Points (SP)
                </label>
                <input
                  type="number"
                  min={1}
                  max={13}
                  value={newTaskForm.storyPoints}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, storyPoints: parseInt(e.target.value, 10) || 3 })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #334155)',
                    background: 'var(--color-bg, #0f172a)',
                    color: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)', display: 'block', marginBottom: '4px' }}>
                  Tenggat Waktu
                </label>
                <input
                  type="date"
                  value={newTaskForm.dueDate}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #334155)',
                    background: 'var(--color-bg, #0f172a)',
                    color: '#fff'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="l-humas__action-btn l-humas__action-btn--outline"
              >
                Batal
              </button>
              <button type="submit" className="l-humas__action-btn l-humas__action-btn--primary">
                Simpan Tugas
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
