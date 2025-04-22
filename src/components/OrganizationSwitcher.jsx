import { useState, useRef, useEffect } from 'react';
import { useOrganizations } from '../contexts/OrganizationContext';
import { Building2, Check, ChevronDown, Loader2 } from 'lucide-react';

export const OrganizationSwitcher = () => {
    const { organizations, selectedOrganization, selectOrganization, loading } = useOrganizations();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700">
                <Loader2 className="h-4 w-4 text-primary-400 animate-spin" />
                <span className="text-sm text-gray-400">Loading...</span>
            </div>
        );
    }

    if (!selectedOrganization || organizations.length === 0) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 min-w-[180px]"
                title={selectedOrganization.name}
            >
                <Building2 className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm font-medium text-white truncate flex-1 text-left">
                    {selectedOrganization.name}
                </span>
                {organizations.length > 1 && (
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {isOpen && organizations.length > 1 && (
                <div className="absolute top-full mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 right-0">
                    <div className="p-2">
                        <p className="text-xs text-gray-400 px-3 py-2 font-medium uppercase tracking-wide">
                            Switch Organization
                        </p>
                        <div className="max-h-64 overflow-y-auto">
                            {organizations.map((org) => (
                                <button
                                    key={org.id}
                                    onClick={() => {
                                        selectOrganization(org);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors group ${selectedOrganization.id === org.id
                                            ? 'bg-primary-500/20 text-primary-300'
                                            : 'hover:bg-gray-700 text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className={`p-1.5 rounded-md ${selectedOrganization.id === org.id
                                                ? 'bg-primary-500/30'
                                                : 'bg-gray-700 group-hover:bg-gray-600'
                                            }`}>
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">{org.name}</p>
                                            {org.code && (
                                                <p className="text-xs text-gray-400 truncate">{org.code}</p>
                                            )}
                                        </div>
                                    </div>
                                    {selectedOrganization.id === org.id && (
                                        <Check className="h-4 w-4 text-primary-400 flex-shrink-0 ml-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
