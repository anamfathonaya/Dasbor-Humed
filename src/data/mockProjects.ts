// Data tiruan (stub) untuk Papan Proyek (projects & project_tasks di PRD)

export interface ProjectTask {
  id: number;
  projectId: number;
  title: string;
  stage: 'todo' | 'in_progress' | 'review' | 'done';
  assignee: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
}

export interface Project {
  id: number;
  name: string;
  owner: string;
  startDate: string;
  endDate: string;
  progress: number; // 0 - 100
  tasks: ProjectTask[];
}

export const stageLabels: Record<ProjectTask['stage'], string> = {
  todo: 'Belum Mulai',
  in_progress: 'Sedang Dikerjakan',
  review: 'Peninjauan',
  done: 'Selesai',
};

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Kampanye Respons Bencana Cianjur',
    owner: 'Dewi (Ketua Tim Lapangan)',
    startDate: '2026-10-01',
    endDate: '2026-10-25',
    progress: 65,
    tasks: [
      { id: 101, projectId: 1, title: 'Liputan dokumentasi distribusi logistik', stage: 'done', assignee: 'Dewi', dueDate: '2026-10-05', priority: 'Tinggi' },
      { id: 102, projectId: 1, title: 'Rilis siaran pers ke media nasional', stage: 'done', assignee: 'Budi', dueDate: '2026-10-08', priority: 'Sedang' },
      { id: 103, projectId: 1, title: 'Produksi video rangkuman pekan ke-2', stage: 'in_progress', assignee: 'Sari', dueDate: '2026-10-14', priority: 'Tinggi' },
      { id: 104, projectId: 1, title: 'Laporan dampak & infografis penerima manfaat', stage: 'todo', assignee: 'Rani', dueDate: '2026-10-22', priority: 'Sedang' },
    ]
  },
  {
    id: 2,
    name: 'Revitalisasi Portal Donasi Digital',
    owner: 'Budi (Admin IT & Humas)',
    startDate: '2026-10-05',
    endDate: '2026-11-10',
    progress: 35,
    tasks: [
      { id: 201, projectId: 2, title: 'Audit UX alur checkout donasi instan', stage: 'done', assignee: 'Budi', dueDate: '2026-10-09', priority: 'Sedang' },
      { id: 202, projectId: 2, title: 'Integrasi payment gateway QRIS', stage: 'in_progress', assignee: 'Budi', dueDate: '2026-10-18', priority: 'Tinggi' },
      { id: 203, projectId: 2, title: 'A/B testing landing page kampanye pendidikan', stage: 'review', assignee: 'Sari', dueDate: '2026-10-24', priority: 'Sedang' },
      { id: 204, projectId: 2, title: 'Penyusunan panduan donasi bagi publik', stage: 'todo', assignee: 'Rani', dueDate: '2026-11-05', priority: 'Rendah' },
    ]
  },
  {
    id: 3,
    name: 'Penyusunan Laporan Tahunan Kemanusiaan 2026',
    owner: 'Rani (Ketua Bidang Humas)',
    startDate: '2026-10-10',
    endDate: '2026-12-15',
    progress: 15,
    tasks: [
      { id: 301, projectId: 3, title: 'Pengumpulan data audit RAB & realisasi LRA', stage: 'in_progress', assignee: 'Rani', dueDate: '2026-10-25', priority: 'Tinggi' },
      { id: 302, projectId: 3, title: 'Wawancara studi kasus mitra lapangan', stage: 'todo', assignee: 'Dewi', dueDate: '2026-11-10', priority: 'Sedang' },
      { id: 303, projectId: 3, title: 'Desain layout & infografis booklet PDF', stage: 'todo', assignee: 'Sari', dueDate: '2026-11-30', priority: 'Sedang' },
    ]
  }
];
