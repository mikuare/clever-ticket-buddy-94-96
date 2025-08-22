
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';

export interface TicketFilterState {
  assignmentFilter: 'all' | 'assigned-to-me' | 'assigned-to-others' | 'unassigned';
  statusFilter: 'all' | 'active' | 'closed';
  includeOpen: boolean;
  includeInProgress: boolean;
  includeResolved: boolean;
  searchTerm: string;
}

interface TicketFiltersProps {
  filters: TicketFilterState;
  onFiltersChange: (filters: TicketFilterState) => void;
  currentAdminId: string;
}

const TicketFilters = ({ filters, onFiltersChange, currentAdminId }: TicketFiltersProps) => {
  const handleAssignmentChange = (value: string) => {
    onFiltersChange({
      ...filters,
      assignmentFilter: value as TicketFilterState['assignmentFilter']
    });
  };

  const handleStatusFilterChange = (value: string) => {
    onFiltersChange({
      ...filters,
      statusFilter: value as TicketFilterState['statusFilter']
    });
  };

  const handleStatusToggle = (status: 'includeOpen' | 'includeInProgress' | 'includeResolved', checked: boolean) => {
    onFiltersChange({
      ...filters,
      [status]: checked
    });
  };

  return (
    <Card className="mb-6 shadow-sm border border-gray-200">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Filter className="w-5 h-5 text-blue-600" />
          Advanced Ticket Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Search Input */}
        <div className="mb-6">
          <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 block">
            Search Tickets
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by classification, category, or acumatica module..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Assignment Filter */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Assignment Status</Label>
            <RadioGroup 
              value={filters.assignmentFilter} 
              onValueChange={handleAssignmentChange}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="all" id="all-assignments" className="text-blue-600" />
                <Label htmlFor="all-assignments" className="text-sm cursor-pointer font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  All Tickets
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="assigned-to-me" id="assigned-to-me" className="text-green-600" />
                <Label htmlFor="assigned-to-me" className="text-sm cursor-pointer font-medium text-gray-700 hover:text-green-600 transition-colors">
                  Assigned to Me
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="assigned-to-others" id="assigned-to-others" className="text-orange-600" />
                <Label htmlFor="assigned-to-others" className="text-sm cursor-pointer font-medium text-gray-700 hover:text-orange-600 transition-colors">
                  Assigned to Other Admins
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="unassigned" id="unassigned" className="text-red-600" />
                <Label htmlFor="unassigned" className="text-sm cursor-pointer font-medium text-gray-700 hover:text-red-600 transition-colors">
                  Unassigned
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Status Filter */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Ticket State</Label>
            <RadioGroup 
              value={filters.statusFilter} 
              onValueChange={handleStatusFilterChange}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="all" id="all-status" className="text-blue-600" />
                <Label htmlFor="all-status" className="text-sm cursor-pointer font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  All States
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="active" id="active-status" className="text-green-600" />
                <Label htmlFor="active-status" className="text-sm cursor-pointer font-medium text-gray-700 hover:text-green-600 transition-colors">
                  Active (Open/In Progress/Resolved)
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="closed" id="closed-status" className="text-gray-600" />
                <Label htmlFor="closed-status" className="text-sm cursor-pointer font-medium text-gray-700 hover:text-gray-600 transition-colors">
                  Closed Only
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Fine-grained Status Controls (only show when "Active" is selected) */}
          {filters.statusFilter === 'active' && (
            <div className="space-y-4">
              <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Active Status Details</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="include-open"
                    checked={filters.includeOpen}
                    onCheckedChange={(checked) => handleStatusToggle('includeOpen', checked as boolean)}
                    className="text-red-600"
                  />
                  <Label htmlFor="include-open" className="text-sm cursor-pointer font-medium text-gray-700 hover:text-red-600 transition-colors">
                    Include Open Tickets
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="include-in-progress"
                    checked={filters.includeInProgress}
                    onCheckedChange={(checked) => handleStatusToggle('includeInProgress', checked as boolean)}
                    className="text-yellow-600"
                  />
                  <Label htmlFor="include-in-progress" className="text-sm cursor-pointer font-medium text-gray-700 hover:text-yellow-600 transition-colors">
                    Include In Progress
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="include-resolved"
                    checked={filters.includeResolved}
                    onCheckedChange={(checked) => handleStatusToggle('includeResolved', checked as boolean)}
                    className="text-green-600"
                  />
                  <Label htmlFor="include-resolved" className="text-sm cursor-pointer font-medium text-gray-700 hover:text-green-600 transition-colors">
                    Include Resolved
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketFilters;
