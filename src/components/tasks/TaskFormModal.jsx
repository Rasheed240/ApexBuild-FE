import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    X, Calendar, Clock, User, AlertTriangle, AlignLeft,
    Type, Building2, CheckSquare, Search, CheckCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import api from '../../services/api';
import { departmentService } from '../../services/departmentService';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    priority: z.string(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.string().optional().refine(val => !val || !isNaN(Number(val)), 'Must be a number'),
    departmentId: z.string().min(1, 'Department is required'),
    parentTaskId: z.string().optional(),
});

// Initials avatar for a member
function MemberAvatar({ name, size = 'sm' }) {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';
    const cls = size === 'sm'
        ? 'w-7 h-7 text-xs'
        : 'w-8 h-8 text-sm';
    return (
        <span className={`${cls} rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center flex-shrink-0`}>
            {initials}
        </span>
    );
}

export function TaskFormModal({ isOpen, onClose, taskToEdit, parentTask, onSuccess, projectId: projectIdProp }) {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [members, setMembers] = useState([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [error, setError] = useState('');

    // Resolve projectId: from prop, from taskToEdit, or from parentTask
    const resolvedProjectId = projectIdProp
        || taskToEdit?.projectId
        || parentTask?.projectId
        || null;

    const [activeProjectId, setActiveProjectId] = useState(resolvedProjectId);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: { priority: '2', estimatedHours: '0' },
    });

    const watchedDeptId = watch('departmentId');

    // Load departments when projectId is known
    const fetchDepartments = useCallback(async (pid) => {
        if (!pid) { setDepartments([]); return; }
        try {
            const data = await departmentService.getByProject(pid);
            setDepartments(Array.isArray(data) ? data : data?.departments ?? []);
        } catch { setDepartments([]); }
    }, []);

    // Load members filtered by project + optional department
    const fetchMembers = useCallback(async (pid, deptId) => {
        if (!pid) { setMembers([]); return; }
        try {
            const params = { isActive: true, pageSize: 200 };
            if (deptId) params.departmentId = deptId;
            const res = await api.get(`/projects/${pid}/members`, { params });
            const data = res.data?.data ?? res.data;
            setMembers(data?.members ?? []);
        } catch { setMembers([]); }
    }, []);

    // When modal opens or taskToEdit/parentTask changes, initialise state
    useEffect(() => {
        if (!isOpen) return;

        const pid = projectIdProp || taskToEdit?.projectId || parentTask?.projectId || null;
        setActiveProjectId(pid);
        fetchDepartments(pid);

        if (taskToEdit) {
            setValue('title', taskToEdit.title || '');
            setValue('description', taskToEdit.description || '');
            setValue('priority', String(taskToEdit.priority || '2'));
            setValue('startDate', taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split('T')[0] : '');
            setValue('dueDate', taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
            setValue('estimatedHours', String(taskToEdit.estimatedHours || '0'));
            setValue('departmentId', taskToEdit.departmentId || '');
            const assigneeIds = (taskToEdit.assignees ?? []).map(a => a.userId);
            setSelectedAssignees(assigneeIds);
            if (pid && taskToEdit.departmentId) fetchMembers(pid, taskToEdit.departmentId);
            else if (pid) fetchMembers(pid, null);
        } else if (parentTask) {
            setValue('parentTaskId', parentTask.id);
            setValue('departmentId', parentTask.departmentId || '');
            setSelectedAssignees([]);
            if (pid && parentTask.departmentId) fetchMembers(pid, parentTask.departmentId);
            else if (pid) fetchMembers(pid, null);
        } else {
            reset({ priority: '2', estimatedHours: '0', departmentId: '' });
            setSelectedAssignees([]);
            if (pid) fetchMembers(pid, null);
        }

        setMemberSearch('');
        setError('');
    }, [isOpen, taskToEdit, parentTask, projectIdProp]);

    // Re-fetch members when department selection changes
    useEffect(() => {
        if (!isOpen || !activeProjectId) return;
        fetchMembers(activeProjectId, watchedDeptId || null);
        // Clear assignees that are no longer in the new member list (they'll be filtered out on submit anyway)
    }, [watchedDeptId, activeProjectId, isOpen]);

    const toggleAssignee = (userId) => {
        setSelectedAssignees(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const filteredMembers = members.filter(m =>
        !memberSearch || m.fullName?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email?.toLowerCase().includes(memberSearch.toLowerCase())
    );

    const allSelected = filteredMembers.length > 0 && filteredMembers.every(m => selectedAssignees.includes(m.userId));

    const toggleSelectAll = () => {
        if (allSelected) {
            const ids = new Set(filteredMembers.map(m => m.userId));
            setSelectedAssignees(prev => prev.filter(id => !ids.has(id)));
        } else {
            const ids = filteredMembers.map(m => m.userId);
            setSelectedAssignees(prev => [...new Set([...prev, ...ids])]);
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');
            const payload = {
                ...data,
                priority: parseInt(data.priority),
                estimatedHours: parseInt(data.estimatedHours || 0),
                departmentId: data.departmentId || null,
                assignedUserIds: selectedAssignees,
                startDate: data.startDate || null,
                dueDate: data.dueDate || null,
            };
            if (taskToEdit) {
                await api.put(`/tasks/${taskToEdit.id}`, payload);
            } else {
                await api.post('/tasks', payload);
            }
            reset();
            setSelectedAssignees([]);
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                            <CheckSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {taskToEdit ? 'Edit Task' : parentTask ? 'Add Subtask' : 'Create New Task'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {taskToEdit ? 'Update task details' : 'Fill in the details for the new task'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm font-medium">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Title */}
                        <Input
                            label="Task Title"
                            {...register('title')}
                            error={errors.title?.message}
                            placeholder="e.g. Install Column Grid Level 1-5"
                            required
                            leftIcon={Type}
                        />

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <textarea
                                    {...register('description')}
                                    rows={3}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                    placeholder="Detailed description of the task..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select
                                        {...register('departmentId')}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.departmentId && (
                                    <p className="mt-1.5 text-sm text-red-500">{errors.departmentId.message}</p>
                                )}
                                {!activeProjectId && (
                                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">No project context — departments unavailable</p>
                                )}
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                                <div className="relative">
                                    <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select
                                        {...register('priority')}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
                                    >
                                        <option value="1">Low</option>
                                        <option value="2">Medium</option>
                                        <option value="3">High</option>
                                        <option value="4">Critical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Dates */}
                            <Input label="Start Date" type="date" {...register('startDate')} leftIcon={Calendar} />
                            <Input label="Due Date" type="date" {...register('dueDate')} leftIcon={Calendar} />

                            {/* Hours */}
                            <Input label="Estimated Hours" type="number" {...register('estimatedHours')} leftIcon={Clock} placeholder="0" min="0" />
                        </div>

                        {/* ── Assign To ───────────────────────────────────────────────── */}
                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <User className="h-4 w-4" /> Assign To
                                    {watchedDeptId && <span className="text-xs text-gray-400 font-normal">(filtered by department)</span>}
                                </label>
                                {filteredMembers.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={toggleSelectAll}
                                        className="text-xs flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        <CheckCheck className="h-3.5 w-3.5" />
                                        {allSelected ? 'Deselect All' : 'Select All'}
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={memberSearch}
                                    onChange={e => setMemberSearch(e.target.value)}
                                    placeholder="Search members..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Member list */}
                            <div className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                                {!activeProjectId ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">No project context — cannot load members</p>
                                ) : filteredMembers.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">
                                        {watchedDeptId ? 'No members in this department' : 'No members found'}
                                    </p>
                                ) : (
                                    filteredMembers.map(member => (
                                        <label
                                            key={member.userId}
                                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedAssignees.includes(member.userId)}
                                                onChange={() => toggleAssignee(member.userId)}
                                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            />
                                            <MemberAvatar name={member.fullName} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.fullName}</p>
                                                {member.position && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.position}</p>
                                                )}
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>

                            {selectedAssignees.length > 0 && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {selectedAssignees.length} assignee{selectedAssignees.length !== 1 ? 's' : ''} selected
                                </p>
                            )}
                        </div>

                        {/* Hidden fields */}
                        <input type="hidden" {...register('parentTaskId')} />

                        {/* Footer */}
                        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="outline" type="button" onClick={onClose} className="flex-1">Cancel</Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                            >
                                {loading ? <Spinner size="sm" color="white" /> : taskToEdit ? 'Save Changes' : 'Create Task'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
