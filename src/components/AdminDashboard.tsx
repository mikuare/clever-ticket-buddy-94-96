
import AutoCloseService from '@/components/AutoCloseService';
import AdminDashboardContent from '@/components/admin/AdminDashboardContent';
import { AnimatedContainer } from '@/components/ui/animated-container';

const AdminDashboard = () => {
  return (
    <AnimatedContainer variant="page" className="min-h-screen bg-background">
      <AutoCloseService />
      <AdminDashboardContent />
    </AnimatedContainer>
  );
};

export default AdminDashboard;
