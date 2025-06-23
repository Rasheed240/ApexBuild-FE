import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    X,
    Calendar,
    Clock,
    User,
    AlertTriangle,
    AlignLeft,
    Type,
    Building2,
    CheckSquare
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import api from '../../services/api';
import { useOrganizations } from '../../contexts/OrganizationContext';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    priority: z.string(), // "1", "2", "3", "4" -> need to parse to int
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.string().optional().refine(val => !val || !isNaN(Number(val)), "Must be a number"),
    departmentId: z.string().min(1, 'Department is required'),
    parentTaskId: z.string().optional(),
});

export function TaskFormModal({ isOpen, onClose, taskToEdit, parentTask, onSuccess }) {
    const { selectedOrganization } = useOrganizations();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            priority: '2', // Medium
            estimatedHours: '0',
        },
    });

    useEffect(() => {
        if (isOpen && selectedOrganization) {
            fetchDepartments();
            fetchMembers();
        }
    }, [isOpen, selectedOrganization]);

    useEffect(() => {
        if (taskToEdit) {
            // Pre-fill form
            setValue('title', taskToEdit.title);
            setValue('description', taskToEdit.description || '');
            setValue('priority', String(taskToEdit.priority || '2'));
            setValue('startDate', taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split('T')[0] : '');
            setValue('dueDate', taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
            setValue('estimatedHours', String(taskToEdit.estimatedHours || '0'));
            setValue('departmentId', taskToEdit.departmentId || '');
            // Set selected assignees from the assignees array
            if (taskToEdit.assignees && Array.isArray(taskToEdit.assignees)) {
                setSelectedAssignees(taskToEdit.assignees.map(a => a.userId));
            }
        } else if (parentTask) {
            setValue('parentTaskId', parentTask.id);
            // Inherit some fields if needed
            setValue('departmentId', parentTask.departmentId || '');
            setSelectedAssignees([]);
        } else {
            reset({
                priority: '2',
                estimatedHours: '0',
                departmentId: ''
            });
            setSelectedAssignees([]);
        }
    }, [taskToEdit, parentTask, setValue, reset, isOpen]);

    const fetchDepartments = async () => {
        try {
            const res = await api.get(`/organizations/${selectedOrganization.id}/departments`);
            setDepartments(res.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch departments', err);
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await api.get(`/organizations/${selectedOrganization.id}/members?isActive=true`);
            setMembers(res.data?.data?.members || []);
        } catch (err) {
            console.error('Failed to fetch members', err);
        }
    };

    const toggleAssignee = (userId) => {
        setSelectedAssignees(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
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
            console.error('Error saving task:', err);
            setError(err.response?.data?.message || 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in border border-gray-200 dark:border-gray-700">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                            <CheckSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {taskToEdit ? 'Edit Task' : (parentTask ? 'Add Subtask' : 'Create New Task')}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {taskToEdit ? 'Update task details' : 'Fill in the details for the new task'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Title */}
                        <div>
                            <Input
                                label="Task Title"
                                {...register('title')}
                                error={errors.title?.message}
                                placeholder="e.g. Update Landing Page Design"
                                required
                                leftIcon={Type}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                    placeholder="Detailed description of the task..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select
                                        {...register('departmentId')}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
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
                            </div>

                            {/* Assigned To - Multi-select */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <User className="inline h-4 w-4 mr-1.5" />
                                    Assign To (Select multiple)
                                </label>
                                <div className="border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-800 max-h-48 overflow-y-auto">
                                    {members.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No members available</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {members.map(member => (
                                                <label
                                                    key={member.userId}
                                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAssignees.includes(member.userId)}
                                                        onChange={() => toggleAssignee(member.userId)}
                                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-white">{member.userName}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedAssignees.length > 0 && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        {selectedAssignees.length} assignee{selectedAssignees.length !== 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Priority
                                </label>
                                <div className="relative">
                                    <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select
                                        {...register('priority')}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
                                    >
                                        <option value="1">Low</option>
                                        <option value="2">Medium</option>
                                        <option value="3">High</option>
                                        <option value="4">Critical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Estimated Hours */}
                            <div>
                                <Input
                                    label="Estimated Hours"
                                    type="number"
                                    {...register('estimatedHours')}
                                    leftIcon={Clock}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            {/* Start Date */}
                            <div>
                                <Input
                                    label="Start Date"
                                    type="date"
                                    {...register('startDate')}
                                    leftIcon={Calendar}
                                />
                            </div>

                            {/* Due Date */}
                            <div>
                                <Input
                                    label="Due Date"
                                    type="date"
                                    {...register('dueDate')}
                                    leftIcon={Calendar}
                                />
                            </div>
                        </div>

                        {/* Parent Task Hidden Field */}
                        <input type="hidden" {...register('parentTaskId')} />

                        {/* Footer Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="outline" type="button" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {loading ? <Spinner size="sm" color="white" /> : (taskToEdit ? 'Save Changes' : 'Create Task')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
