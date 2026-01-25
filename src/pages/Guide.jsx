import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen, Download, ChevronRight, ChevronDown, Search, Users,
  Building2, FolderKanban, ClipboardList, ShieldCheck, CreditCard,
  User, ArrowUpRight, CheckCircle, AlertTriangle, Info, Star,
  Zap, HardHat, Crown, Briefcase, Eye, Upload, RefreshCw, Loader2,
} from 'lucide-react';
import api from '../services/api';

// ── Section data ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',        label: 'Introduction',           icon: BookOpen    },
  { id: 'roles',        label: 'Roles & Permissions',    icon: ShieldCheck },
  { id: 'onboarding',   label: 'Getting Started',        icon: Zap         },
  { id: 'organizations',label: 'Organisations',          icon: Building2   },
  { id: 'projects',     label: 'Project Management',     icon: FolderKanban},
  { id: 'tasks',        label: 'Tasks & Subtasks',       icon: ClipboardList},
  { id: 'reviews',      label: 'Update Review Flows',    icon: ShieldCheck },
  { id: 'members',      label: 'Team & Members',         icon: Users       },
  { id: 'subscription', label: 'Subscriptions & Billing',icon: CreditCard  },
  { id: 'profile',      label: 'Profile & Settings',     icon: User        },
  { id: 'faq',          label: 'FAQ',                    icon: Info        },
];

// ── Reusable components ───────────────────────────────────────────────────────
const Section = ({ id, title, icon: Icon, children }) => (
  <section id={id} className="scroll-mt-6">
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/30">
        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
    <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      {children}
    </div>
  </section>
);

const Sub = ({ title, children }) => (
  <div className="mt-5">
    <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-2">{title}</h3>
    {children}
  </div>
);

const Note = ({ type = 'info', children }) => {
  const map = {
    info:    { bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',   icon: Info,           text: 'text-blue-700 dark:text-blue-300'   },
    warn:    { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: AlertTriangle,  text: 'text-amber-700 dark:text-amber-300' },
    success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: CheckCircle,    text: 'text-green-700 dark:text-green-300' },
    tip:     { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', icon: Star,        text: 'text-purple-700 dark:text-purple-300'},
  };
  const { bg, border, icon: Icon, text } = map[type];
  return (
    <div className={`flex gap-3 p-3.5 rounded-xl border ${bg} ${border} ${text} my-3`}>
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  );
};

const RoleBadge = ({ role, desc, icon: Icon, color, bg }) => (
  <div className={`flex items-start gap-3 p-4 rounded-xl border ${bg} mb-3`}>
    <div className={`p-2 rounded-lg bg-white/60 dark:bg-gray-900/40 flex-shrink-0`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <div>
      <p className={`font-semibold text-sm ${color}`}>{role}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{desc}</p>
    </div>
  </div>
);

const Step = ({ n, title, children }) => (
  <div className="flex gap-4 mb-4">
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{n}</div>
    <div className="flex-1">
      <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
      {children && <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{children}</div>}
    </div>
  </div>
);

const Table = ({ headers, rows }) => (
  <div className="overflow-x-auto my-4 rounded-xl border border-gray-200 dark:border-gray-700">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 dark:bg-gray-800/80">
        <tr>
          {headers.map(h => (
            <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-gray-700 dark:text-gray-300">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const Guide = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('intro');
  const [search, setSearch] = useState('');
  const [manual, setManual] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef(null);

  const isAdmin = (user?.roles || []).some(r => {
    const n = typeof r === 'object' ? r.roleName || r.name : r;
    return ['SuperAdmin', 'PlatformAdmin'].includes(n);
  });

  useEffect(() => {
    api.get('/manuals/latest').then(res => {
      const d = res.data?.data ?? res.data;
      if (d?.fileUrl) setManual(d);
    }).catch(() => {});
  }, []);

  // Observe scroll to highlight active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveSection(e.target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleDownload = async () => {
    if (!manual?.fileUrl) return;
    setDownloading(true);
    try {
      window.open(manual.fileUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/manuals/upload?title=ApexBuild User Manual&version=1.0', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const d = res.data?.data ?? res.data;
      setManual(d);
      setUploadMsg('Manual uploaded successfully.');
    } catch (err) {
      setUploadMsg(err?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const filteredSections = search
    ? SECTIONS.filter(s => s.label.toLowerCase().includes(search.toLowerCase()))
    : SECTIONS;

  const fmtBytes = (b) => b < 1024 * 1024
    ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-[#0f1629] to-slate-950 p-6 mb-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-primary-400" />
              <span className="text-primary-400 text-sm font-medium">User Manual</span>
            </div>
            <h1 className="text-2xl font-bold text-white">ApexBuild Platform Guide</h1>
            <p className="text-slate-400 text-sm mt-1">
              Complete reference for all roles — from onboarding to advanced workflows.
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            {manual ? (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
              >
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download PDF ({fmtBytes(manual.fileSizeBytes)})
              </button>
            ) : (
              <p className="text-slate-500 text-xs">No PDF uploaded yet.</p>
            )}
            {isAdmin && (
              <>
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors cursor-pointer">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? 'Uploading…' : 'Upload PDF Manual'}
                  <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
                </label>
                {uploadMsg && (
                  <p className={`text-xs ${uploadMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{uploadMsg}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar TOC ──────────────────────────────────────────────────── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-4 space-y-1">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sections…"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            {filteredSections.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  {s.label}
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
                </a>
              );
            })}
          </div>
        </aside>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-12">

          {/* ── 1. Introduction ─────────────────────────────────────────────── */}
          <Section id="intro" title="Introduction to ApexBuild" icon={BookOpen}>
            <p>
              ApexBuild is a comprehensive construction and project management platform designed for organisations that manage multiple projects, departments, contractors, and field teams. It brings together task assignment, progress tracking, multi-stage review workflows, and subscription billing in one place.
            </p>
            <p className="mt-3">
              This guide covers every feature of the platform and is organised by topic. Use the sidebar to jump to any section, or read straight through for a complete understanding.
            </p>
            <Note type="tip">
              <strong>New user?</strong> Start with <a href="#onboarding" className="underline">Getting Started</a>, then read <a href="#roles" className="underline">Roles & Permissions</a> to understand what you can see and do.
            </Note>

            <Sub title="Core concepts">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Organisation</strong> — the top-level entity, owned by a company or individual.</li>
                <li><strong>Project</strong> — a work scope within an organisation (e.g. a building site).</li>
                <li><strong>Department</strong> — a sub-division of a project (e.g. Electrical, Plumbing).</li>
                <li><strong>Contractor</strong> — an external company hired to work on one or more departments.</li>
                <li><strong>Task / Subtask</strong> — units of work assigned to users within a department.</li>
                <li><strong>Task Update</strong> — a progress submission (with media proof) that travels through a review chain before being fully approved.</li>
              </ul>
            </Sub>
          </Section>

          {/* ── 2. Roles ────────────────────────────────────────────────────── */}
          <Section id="roles" title="Roles & Permissions" icon={ShieldCheck}>
            <p>
              Every user in ApexBuild is assigned a role. Roles are project-scoped — you can hold different roles in different projects. The hierarchy from lowest to highest is:
            </p>

            <Table
              headers={['Role', 'Scope', 'Key Permissions']}
              rows={[
                ['FieldWorker',           'Project',      'View assigned tasks, submit progress updates, view own update history'],
                ['ContractorAdmin',        'Project',      'FieldWorker + review & approve/reject updates for their contractor'],
                ['DepartmentSupervisor',   'Project',      'ContractorAdmin + manage departments, review supervisor-stage updates'],
                ['ProjectAdministrator',   'Project',      'Full project control — create tasks, manage members, final update approval'],
                ['ProjectOwner',           'Project',      'ProjectAdministrator + billing and project deletion'],
                ['PlatformAdmin',          'Organisation', 'Manage all projects & users within an organisation'],
                ['SuperAdmin',             'Platform',     'Full platform access — all organisations, subscriptions, user manuals'],
              ]}
            />

            <RoleBadge role="FieldWorker" icon={HardHat}     color="text-gray-600"   bg="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"     desc="The most common role. Receives task assignments and submits photo/video proof of work. Does not review other people's updates." />
            <RoleBadge role="ContractorAdmin" icon={Briefcase} color="text-blue-600"  bg="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"       desc="Manages a contracted team. Reviews updates from their field workers before passing them up to the Supervisor." />
            <RoleBadge role="DepartmentSupervisor" icon={Eye} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" desc="Oversees one or more departments. Reviews updates after the ContractorAdmin (for contracted tasks) or directly from FieldWorkers (non-contracted tasks)." />
            <RoleBadge role="ProjectAdministrator / Owner" icon={Crown} color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" desc="Manages the entire project. Gives final sign-off on all task updates, creates milestones, and manages members." />
            <RoleBadge role="PlatformAdmin / SuperAdmin" icon={Star} color="text-red-600" bg="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" desc="Manages the platform or a whole organisation. Has access to subscriptions, billing, all projects, and system-level settings." />

            <Note type="info">
              A user can belong to multiple projects simultaneously, each with a different role. For example, someone may be a <strong>ProjectAdministrator</strong> on Project A and a <strong>FieldWorker</strong> on Project B.
            </Note>
          </Section>

          {/* ── 3. Onboarding ────────────────────────────────────────────────── */}
          <Section id="onboarding" title="Getting Started" icon={Zap}>
            <Sub title="New users — registration">
              <Step n="1" title="Create an account">Visit the ApexBuild landing page and click <strong>Get Started</strong>. Fill in your name, email, and a secure password (min 8 chars, one number, one symbol).</Step>
              <Step n="2" title="Verify your email">Check your inbox for a confirmation email. Click the link to activate your account.</Step>
              <Step n="3" title="Create or join an organisation">
                After login, you'll be prompted to either create a new organisation or accept an invitation from an existing one. If you received an email invitation, check the <em>Invitations</em> section of your profile.
              </Step>
              <Step n="4" title="Set up 2FA (recommended)">Go to <strong>Settings → Security</strong> and enable Two-Factor Authentication via an authenticator app (Google Authenticator, Authy, etc.).</Step>
            </Sub>

            <Sub title="Existing users — switching between sessions">
              <p>When you log in, the app remembers your session via a secure refresh token (7-day validity). If you are inactive, you will be automatically logged out.</p>
              <Note type="warn">Never share your login credentials. Each user must have a unique account — accounts are tracked per seat for billing purposes.</Note>
            </Sub>

            <Sub title="First steps by role">
              <Table
                headers={['Role', 'First things to do']}
                rows={[
                  ['FieldWorker',         'Check My Tasks → start work on assigned tasks → submit your first progress update with photo proof'],
                  ['ContractorAdmin',     'Check Reviews → review pending updates from your team → explore the project you are assigned to'],
                  ['DepartmentSupervisor','Check Reviews → view your departments → review supervisor-stage updates'],
                  ['ProjectAdministrator','Create departments → create milestones → invite team members → assign tasks'],
                  ['SuperAdmin',          'Set up your first organisation → invite admins → configure subscription'],
                ]}
              />
            </Sub>
          </Section>

          {/* ── 4. Organisations ─────────────────────────────────────────────── */}
          <Section id="organizations" title="Organisations" icon={Building2}>
            <p>
              An <strong>organisation</strong> is the root entity. Everything — projects, members, billing — belongs to an organisation. A user can be a member of <em>multiple</em> organisations simultaneously.
            </p>

            <Sub title="Creating an organisation">
              <Step n="1" title="Go to Organisations in the sidebar" />
              <Step n="2" title="Click 'New Organisation'">Enter a name, description, and optionally upload a logo.</Step>
              <Step n="3" title="You become the owner">The creating user is automatically assigned the <strong>PlatformAdmin</strong> role for that organisation.</Step>
            </Sub>

            <Sub title="Switching between organisations">
              <p>Use the <strong>organisation switcher</strong> in the top-left corner of the sidebar. Click the currently selected organisation name, then choose another from the dropdown. All dashboard data — projects, tasks, stats — will reload for the selected organisation.</p>
              <Note type="info">The organisation switcher filters data <em>globally</em> across the app. Reviews, tasks, and project progress all respect the selected organisation.</Note>
            </Sub>

            <Sub title="Managing organisation members">
              <p>Go to <strong>Members</strong> in the sidebar. Here you can:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>View all members and their roles</li>
                <li>Invite new members via email</li>
                <li>Remove members</li>
              </ul>
              <p className="mt-2">Members invited at the organisation level still need to be assigned to specific projects to gain project-level roles.</p>
            </Sub>
          </Section>

          {/* ── 5. Projects ──────────────────────────────────────────────────── */}
          <Section id="projects" title="Project Management" icon={FolderKanban}>
            <p>Projects are the main work containers. Each project has departments, contractors, milestones, and tasks.</p>

            <Sub title="Creating a project">
              <Step n="1" title="Go to Projects → New Project" />
              <Step n="2" title="Fill in details">Name, description, start and end dates, status (Planning / Active / On Hold / Completed), priority, and budget.</Step>
              <Step n="3" title="Add departments">From the project detail page, go to the <strong>Departments</strong> tab. Departments organise work by trade or discipline (e.g. Electrical, Civil Works).</Step>
              <Step n="4" title="Add contractors (optional)">If a department is contracted out, go to <strong>Contractors</strong> tab. Link the contractor to a department and assign a ContractorAdmin user.</Step>
              <Step n="5" title="Create milestones">Use the <strong>Milestones</strong> tab to define project phases with due dates. Milestones track overall project progress.</Step>
              <Step n="6" title="Assign project members">Go to the <strong>Members</strong> tab on the project page and assign users with their project roles.</Step>
            </Sub>

            <Sub title="Project tabs overview">
              <Table
                headers={['Tab', 'What it shows']}
                rows={[
                  ['Overview',    'Summary cards, milestone progress, task pipeline stats'],
                  ['Tasks',       'All tasks in this project with filters by status, priority, assignee'],
                  ['Milestones',  'Ordered project phases with progress tracking'],
                  ['Contractors', 'External companies assigned to departments in this project'],
                  ['Departments', 'Organisational divisions of the project with member counts'],
                ]}
              />
            </Sub>

            <Sub title="Departments vs Contractors">
              <p>A <strong>Department</strong> is an internal division (e.g. "Plumbing Team"). A <strong>Contractor</strong> is an external company that manages workers within a department.</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>A department can exist without a contractor (work done in-house).</li>
                <li>When a contractor is assigned, their ContractorAdmin user is responsible for reviewing field worker updates first.</li>
              </ul>
            </Sub>

            <Sub title="Milestones">
              <p>Milestones are ordered phases of a project. Each milestone has:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Order</strong> — determines the sequence</li>
                <li><strong>Due date</strong> — deadline for the milestone</li>
                <li><strong>Progress</strong> (0–100%) — manually or automatically tracked</li>
                <li><strong>Status</strong> — NotStarted, InProgress, Completed, OnHold</li>
              </ul>
              <Note type="tip">Link tasks to milestones when creating them so that milestone progress auto-reflects task completion.</Note>
            </Sub>
          </Section>

          {/* ── 6. Tasks ─────────────────────────────────────────────────────── */}
          <Section id="tasks" title="Tasks & Subtasks" icon={ClipboardList}>
            <p>Tasks are the smallest unit of work. They are created by supervisors or admins and assigned to field workers.</p>

            <Sub title="Creating a task">
              <Step n="1" title="Go to Projects → [Project] → Tasks tab, or My Tasks" />
              <Step n="2" title="Click 'New Task'">Fill in: title, description, department, assignee(s), priority (Low/Medium/High/Critical), due date, milestone (optional), and contractor (optional).</Step>
              <Step n="3" title="Add media (optional)">Attach reference images, blueprints, or documents to the task for workers to reference.</Step>
              <Step n="4" title="Create subtasks (optional)">Inside a task, use the <strong>Subtasks</strong> section to break large tasks into smaller check-off items.</Step>
            </Sub>

            <Sub title="Task statuses">
              <Table
                headers={['Status', 'Meaning']}
                rows={[
                  ['Not Started',  'Task created but work has not begun'],
                  ['In Progress',  'Work is underway'],
                  ['Under Review', 'A progress update has been submitted and is awaiting approval'],
                  ['Completed',    'All required updates have been approved through the full review chain'],
                  ['Cancelled',    'Task has been cancelled and will not be completed'],
                  ['On Hold',      'Work temporarily paused'],
                ]}
              />
            </Sub>

            <Sub title="Submitting a progress update (FieldWorker)">
              <Step n="1" title="Open the task from My Tasks or the project tasks list" />
              <Step n="2" title="Go to the Updates tab">The submit form is automatically visible for field workers.</Step>
              <Step n="3" title="Fill in the update">Describe what was done, set a progress percentage (0–100%), and upload proof media (photos, video, audio notes).</Step>
              <Step n="4" title="Submit">The update enters the review chain. You'll see its status change under the Updates tab.</Step>
              <Note type="info">You can track the status of your submitted update in real time — from "Submitted" through each review stage to "Fully Approved" or a rejected state with feedback.</Note>
            </Sub>

            <Sub title="Subtasks">
              <p>Subtasks are simple checkbox items within a task. They help track granular completion. They are not subject to the update/review flow — they are toggled directly by the assigned user or the task owner.</p>
            </Sub>
          </Section>

          {/* ── 7. Review Flows ──────────────────────────────────────────────── */}
          <Section id="reviews" title="Update Review Flows" icon={ShieldCheck}>
            <p>When a FieldWorker submits a task update, it must pass through a structured review chain before being counted as approved. The chain depends on whether the task is <em>contracted</em> or <em>non-contracted</em>.</p>

            <Sub title="Review chains">
              <Table
                headers={['Task type', 'Review flow']}
                rows={[
                  ['Non-contracted', 'FieldWorker → DepartmentSupervisor → ProjectAdministrator'],
                  ['Contracted',     'FieldWorker → ContractorAdmin → DepartmentSupervisor → ProjectAdministrator'],
                ]}
              />
            </Sub>

            <Sub title="Update status lifecycle">
              <Table
                headers={['Status', 'Meaning', 'Who acts next']}
                rows={[
                  ['Submitted',                  'Update just submitted by worker',            'ContractorAdmin (if contracted) OR Supervisor'],
                  ['Under Contractor Admin Review','ContractorAdmin is reviewing',              'ContractorAdmin (approve or reject)'],
                  ['Contractor Admin Approved',   'Passed contractor review',                   'DepartmentSupervisor'],
                  ['Contractor Admin Rejected',   'Rejected with feedback, resubmission needed','FieldWorker (re-submit)'],
                  ['Under Supervisor Review',     'Supervisor is reviewing',                    'DepartmentSupervisor (approve or reject)'],
                  ['Supervisor Approved',         'Passed supervisor review',                   'ProjectAdministrator'],
                  ['Supervisor Rejected',         'Rejected with feedback',                     'FieldWorker (re-submit)'],
                  ['Under Admin Review',          'Admin is reviewing for final sign-off',      'ProjectAdministrator (approve or reject)'],
                  ['Admin Approved (Fully)',       'Fully approved — task progress updated',     '—'],
                  ['Admin Rejected',              'Final rejection with feedback',              'FieldWorker (re-submit)'],
                ]}
              />
            </Sub>

            <Sub title="How to review an update">
              <Step n="1" title="Go to Reviews in the sidebar">The page shows only updates that require YOUR action at this stage (based on your role).</Step>
              <Step n="2" title="Click an update to view details">See the submitted description, progress percentage, and all attached media (photos, video).</Step>
              <Step n="3" title="Approve or reject">
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li><strong>Approve</strong> — passes the update to the next reviewer.</li>
                  <li><strong>Reject</strong> — requires a feedback note. The worker will see this and must resubmit.</li>
                </ul>
              </Step>
              <Note type="warn">Reviews page only shows updates at YOUR review stage. A FieldWorker sees only their own submitted updates (not other people's). A ContractorAdmin sees only updates awaiting their review. And so on up the chain.</Note>
            </Sub>

            <Sub title="Resubmitting after rejection">
              <p>If your update was rejected, return to the task's Updates tab. You'll see the rejection reason in the feedback trail. Submit a new update addressing the feedback — this begins the review cycle again from the start.</p>
            </Sub>
          </Section>

          {/* ── 8. Members ──────────────────────────────────────────────────── */}
          <Section id="members" title="Team & Members" icon={Users}>
            <p>Members are users assigned to an organisation or project. Access is controlled by role.</p>

            <Sub title="Inviting users">
              <Step n="1" title="Go to Members → Invite">Enter the user's email address.</Step>
              <Step n="2" title="Invitation sent">The user receives an email with a secure invite link (valid for 7 days).</Step>
              <Step n="3" title="User accepts">They create an account (or log in) and are added to the organisation.</Step>
              <Step n="4" title="Assign to a project">From the project's Members tab, assign the user a project role.</Step>
            </Sub>

            <Sub title="One role per project per user">
              <p>Each user can only hold <em>one</em> role within a given project. If you need to change their role, remove them and re-add with the new role.</p>
              <Note type="info">Users can hold different roles in different projects. For example, <strong>Alice</strong> might be a <strong>ProjectAdministrator</strong> on the Lagos Housing project and a <strong>FieldWorker</strong> on the Abuja Office project.</Note>
            </Sub>

            <Sub title="Removing a member">
              <p>Go to the project Members tab or the organisation Members page, find the user, and click Remove. This does not delete their account — it only removes them from that project or organisation.</p>
            </Sub>
          </Section>

          {/* ── 9. Subscription ──────────────────────────────────────────────── */}
          <Section id="subscription" title="Subscriptions & Billing" icon={CreditCard}>
            <p>ApexBuild uses a per-active-user, per-month billing model.</p>

            <Sub title="Pricing model">
              <Table
                headers={['Plan', 'Rate', 'Notes']}
                rows={[
                  ['Standard',    '$20 / active user / month', 'All features included. Active = logged in within the billing period.'],
                  ['Free (SuperAdmin org)', '$0',             'The SuperAdmin\'s own organisation is permanently free.'],
                ]}
              />
              <Note type="info">
                <strong>Active users</strong> are counted per organisation per billing period. A user who has not logged in during the cycle is not charged.
              </Note>
            </Sub>

            <Sub title="Managing subscriptions (SuperAdmin / PlatformAdmin)">
              <p>Go to <strong>Subscriptions</strong> in the sidebar. Here you can:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>View current active user count and monthly estimate</li>
                <li>See billing history and payment transactions</li>
                <li>Update payment method (via Stripe)</li>
                <li>View seat usage: <em>GET /licenses/organization/{'{id}'}/seats</em></li>
              </ul>
            </Sub>

            <Sub title="Payment flow">
              <p>Payments are processed via Stripe. ApexBuild does not store card details directly — all card information is managed securely by Stripe.</p>
              <Note type="warn">Subscription payments are automatically charged at the start of each billing cycle. If a payment fails, you will receive a notification and have a 3-day grace period before access is restricted.</Note>
            </Sub>
          </Section>

          {/* ── 10. Profile & Settings ────────────────────────────────────────── */}
          <Section id="profile" title="Profile & Settings" icon={User}>
            <Sub title="Profile page">
              <p>Access your profile via the <strong>Profile</strong> link in the sidebar. Here you can:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Update your name, phone number, bio, and profile picture</li>
                <li>View your organisation memberships and project roles</li>
              </ul>
            </Sub>

            <Sub title="Settings page">
              <p>The <strong>Settings</strong> page (sidebar → Settings) contains:</p>
              <Table
                headers={['Section', 'Purpose']}
                rows={[
                  ['Change Password',  'Update your login password (requires current password)'],
                  ['Security / 2FA',   'Enable or disable TOTP two-factor authentication'],
                ]}
              />
            </Sub>

            <Sub title="Two-Factor Authentication (2FA)">
              <Step n="1" title="Go to Settings → Security" />
              <Step n="2" title="Click Enable 2FA">A QR code is displayed.</Step>
              <Step n="3" title="Scan with your authenticator app">(Google Authenticator, Authy, or similar)</Step>
              <Step n="4" title="Enter the 6-digit code to confirm setup" />
              <Note type="success">Once enabled, every login will require your password AND the 6-digit time-based code from your app. This significantly improves account security.</Note>
            </Sub>

            <Sub title="Notifications">
              <p>Go to <strong>Notifications</strong> in the sidebar to see all platform notifications — task assignments, review decisions, and system alerts. Unread notifications appear as a badge on the bell icon in the top bar. Click <em>Mark all read</em> to clear them.</p>
            </Sub>
          </Section>

          {/* ── 11. FAQ ────────────────────────────────────────────────────────── */}
          <Section id="faq" title="FAQ" icon={Info}>
            {[
              {
                q: 'I submitted an update but the task is still "In Progress". Why?',
                a: 'Task status changes to "Completed" only after the final admin approval (last stage in the review chain). Until then it remains "Under Review" or the previous status.',
              },
              {
                q: 'I can\'t see the Approve/Reject buttons. Why?',
                a: 'Buttons are only shown for updates that are at YOUR review stage. FieldWorkers never see review buttons. If you are a ContractorAdmin, you only see updates awaiting Contractor Admin review, not updates at the Supervisor or Admin stage.',
              },
              {
                q: 'How do I switch to a different organisation?',
                a: 'Click the organisation name in the top-left sidebar dropdown. All page data (tasks, reviews, stats) will reload for the selected org.',
              },
              {
                q: 'Why does my review list show updates from another organisation?',
                a: 'Make sure you have the correct organisation selected in the switcher. All review queries are scoped to the selected organisation.',
              },
              {
                q: 'Can I belong to multiple organisations?',
                a: 'Yes. You can be a member of any number of organisations and projects, each with different roles. Use the org switcher to move between them.',
              },
              {
                q: 'What happens when an update is rejected?',
                a: 'The worker is notified. The update status shows the rejection reason (visible in the update detail under the Updates tab of the task). The worker must submit a new update to restart the review flow.',
              },
              {
                q: 'How is the subscription calculated?',
                a: 'You are billed $20 per active user per month, per organisation. An active user is one who has logged in or performed actions within the billing cycle. The SuperAdmin\'s own organisation is always free.',
              },
              {
                q: 'Who can upload the PDF user manual?',
                a: 'Only users with the SuperAdmin or PlatformAdmin role can upload a new PDF manual via the Guide page. All other users can read it online and download the uploaded PDF.',
              },
              {
                q: 'Can a task have multiple updates?',
                a: 'Yes. A task can have multiple submitted updates over its lifetime. Each update goes through the full review chain independently. The task\'s progress percentage reflects the most recently approved update.',
              },
              {
                q: 'What media types can be attached to an update?',
                a: 'Field workers can attach images (JPG, PNG), videos (MP4), audio files (MP3 — verbal notes), and documents (PDF) when submitting a progress update.',
              },
            ].map(({ q, a }, i) => (
              <FaqItem key={i} question={q} answer={a} />
            ))}
          </Section>

        </div>
      </div>
    </div>
  );
};

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
      >
        <span className="font-medium text-sm text-gray-900 dark:text-white pr-4">{question}</span>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
          {answer}
        </div>
      )}
    </div>
  );
}
