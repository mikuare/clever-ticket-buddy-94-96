import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { AnimatedText } from '@/components/ui/animated-text';
import { BarChart3, TrendingUp, Ticket, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from './LoadingSpinner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/hooks/useAuth';
import AccessDenied from './AccessDenied';

interface TicketAnalysisData {
  classificationStats: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  categoryStats: Array<{
    name: string;
    count: number;
    percentage: number;
    classification: string;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  departmentStats: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  moduleStats: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  totalTickets: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const TicketAnalysisView = () => {
  const { isAdmin, isVerifyingAdmin } = useAdminAuth();
  const { signOut } = useAuth();
  const [analysisData, setAnalysisData] = useState<TicketAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin && !isVerifyingAdmin) {
      fetchTicketAnalysis();
    }
  }, [isAdmin, isVerifyingAdmin]);

  const fetchTicketAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tickets with attachments data that contains the metadata
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          status,
          department_code,
          title,
          description,
          attachments,
          created_at
        `);

      if (ticketsError) throw ticketsError;

      // Fetch classifications, categories, and modules
      const { data: classifications, error: classificationsError } = await supabase
        .from('ticket_classifications')
        .select('id, name')
        .eq('is_active', true);

      if (classificationsError) throw classificationsError;

      const { data: categories, error: categoriesError } = await supabase
        .from('ticket_categories')
        .select('id, name, classification_id')
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      const { data: modules, error: modulesError } = await supabase
        .from('acumatica_modules')
        .select('id, name')
        .eq('is_active', true);

      if (modulesError) throw modulesError;

      if (!tickets || tickets.length === 0) {
        setAnalysisData({
          classificationStats: [],
          categoryStats: [],
          statusDistribution: [],
          departmentStats: [],
          moduleStats: [],
          totalTickets: 0
        });
        return;
      }

      // Initialize counters
      const classificationCounts: Record<string, number> = {};
      const categoryCounts: Record<string, { count: number; classification: string }> = {};
      const statusCounts: Record<string, number> = {};
      const departmentCounts: Record<string, number> = {};
      const moduleCounts: Record<string, number> = {};

      // Initialize all possible values to 0
      classifications?.forEach(classification => {
        classificationCounts[classification.name] = 0;
      });

      categories?.forEach(category => {
        const classification = classifications?.find(c => c.id === category.classification_id);
        categoryCounts[category.name] = { 
          count: 0, 
          classification: classification?.name || 'Unknown' 
        };
      });

      modules?.forEach(module => {
        moduleCounts[module.name] = 0;
      });

      // Count tickets by extracting metadata from attachments
      tickets.forEach(ticket => {
        // Count status distribution
        statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;

        // Count department distribution
        departmentCounts[ticket.department_code] = (departmentCounts[ticket.department_code] || 0) + 1;

        // Extract metadata from attachments field
        try {
          const attachments = ticket.attachments as any;
          if (attachments && typeof attachments === 'object') {
            // Get classification
            const classification = attachments.classification;
            if (classification && classification !== 'N/A' && classificationCounts.hasOwnProperty(classification)) {
              classificationCounts[classification]++;
            }

            // Get category
            const categoryType = attachments.categoryType;
            if (categoryType && categoryType !== 'N/A' && categoryCounts.hasOwnProperty(categoryType)) {
              categoryCounts[categoryType].count++;
            }

            // Get module
            const acumaticaModule = attachments.acumaticaModule;
            if (acumaticaModule && acumaticaModule !== 'N/A' && moduleCounts.hasOwnProperty(acumaticaModule)) {
              moduleCounts[acumaticaModule]++;
            }
          }
        } catch (error) {
          console.log('Error parsing ticket metadata for ticket:', ticket.id, error);
        }
      });

      const totalTickets = tickets.length;

      // Prepare classification stats
      const classificationStats = Object.entries(classificationCounts)
        .filter(([_, count]) => count > 0)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalTickets) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      // Prepare category stats
      const categoryStats = Object.entries(categoryCounts)
        .filter(([_, data]) => data.count > 0)
        .map(([name, data]) => ({
          name,
          count: data.count,
          percentage: Math.round((data.count / totalTickets) * 100),
          classification: data.classification
        }))
        .sort((a, b) => b.count - a.count);

      // Prepare status distribution
      const statusDistribution = Object.entries(statusCounts)
        .map(([status, count]) => ({
          status,
          count,
          percentage: Math.round((count / totalTickets) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      // Prepare department stats
      const departmentStats = Object.entries(departmentCounts)
        .map(([department, count]) => ({
          department,
          count,
          percentage: Math.round((count / totalTickets) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      // Prepare module stats
      const moduleStats = Object.entries(moduleCounts)
        .filter(([_, count]) => count > 0)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalTickets) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      setAnalysisData({
        classificationStats,
        categoryStats,
        statusDistribution,
        departmentStats,
        moduleStats,
        totalTickets
      });

    } catch (error) {
      console.error('Error fetching ticket analysis:', error);
      setError('Failed to load ticket analysis data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!analysisData) return;

    const currentDate = new Date().toISOString().split('T')[0];
    
    // Prepare CSV data
    const csvData = [
      '=== TICKET ANALYSIS REPORT ===',
      `Generated on: ${currentDate}`,
      `Total Tickets: ${analysisData.totalTickets}`,
      '',
      '=== CLASSIFICATION DISTRIBUTION ===',
      'Classification,Count,Percentage',
      ...analysisData.classificationStats.map(item => 
        `"${item.name}",${item.count},${item.percentage}%`
      ),
      '',
      '=== CATEGORY DISTRIBUTION ===',
      'Category,Count,Percentage,Classification',
      ...analysisData.categoryStats.map(item => 
        `"${item.name}",${item.count},${item.percentage}%,"${item.classification}"`
      ),
      '',
      '=== STATUS DISTRIBUTION ===',
      'Status,Count,Percentage',
      ...analysisData.statusDistribution.map(item => 
        `"${item.status}",${item.count},${item.percentage}%`
      ),
      '',
      '=== DEPARTMENT DISTRIBUTION ===',
      'Department,Count,Percentage',
      ...analysisData.departmentStats.map(item => 
        `"${item.department}",${item.count},${item.percentage}%`
      ),
      '',
      '=== MODULE DISTRIBUTION ===',
      'Module,Count,Percentage',
      ...analysisData.moduleStats.map(item => 
        `"${item.name}",${item.count},${item.percentage}%`
      )
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ticket-analysis-report-${currentDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Security check - admin only
  if (isVerifyingAdmin) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <AccessDenied onSignOut={signOut} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchTicketAnalysis}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analysisData || analysisData.totalTickets === 0) {
    return (
      <div className="text-center py-8">
        <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No tickets found for analysis</p>
      </div>
    );
  }

  return (
    <AnimatedContainer variant="content" className="space-y-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <AnimatedText as="h1" variant="title" className="text-3xl font-bold text-foreground">
              Ticket Analysis Dashboard
            </AnimatedText>
            <AnimatedText variant="subtitle" className="text-muted-foreground">
              Comprehensive analysis of tickets by classification and category
            </AnimatedText>
          </div>
        </div>
        <Button 
          onClick={exportToCSV}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Extract Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{analysisData.totalTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Classifications</p>
                <p className="text-2xl font-bold">{analysisData.classificationStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{analysisData.categoryStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Modules</p>
                <p className="text-2xl font-bold">{analysisData.moduleStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Classification Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Classification Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysisData.classificationStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analysisData.classificationStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysisData.categoryStats.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Module Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Acumatica Module Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysisData.moduleStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analysisData.moduleStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysisData.statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysisData.departmentStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analysisData.departmentStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classification Details */}
        <Card>
          <CardHeader>
            <CardTitle>Classification Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {analysisData.classificationStats.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{item.count}</span>
                    <span className="text-muted-foreground ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Details */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {analysisData.categoryStats.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.classification}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{item.count}</span>
                    <span className="text-muted-foreground ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Details */}
        <Card>
          <CardHeader>
            <CardTitle>Acumatica Module Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {analysisData.moduleStats.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{item.count}</span>
                    <span className="text-muted-foreground ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedContainer>
  );
};

export default TicketAnalysisView;