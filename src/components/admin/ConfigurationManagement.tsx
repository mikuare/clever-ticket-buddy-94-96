
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, Wrench, Shield, Clock } from 'lucide-react';
import ClassificationManager from './config/ClassificationManager';
import CategoryManager from './config/CategoryManager';
import ModuleManager from './config/ModuleManager';
import DepartmentAuthKeyManager from './DepartmentAuthKeyManager';
import AutoCloseSettingsManager from './config/AutoCloseSettingsManager';

const ConfigurationManagement = () => {
  const [activeTab, setActiveTab] = useState('classifications');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          System Configuration Management
        </CardTitle>
        <CardDescription>
          Manage Classifications, Categories, and Acumatica Modules used in ticket creation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="classifications" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Classifications
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Acumatica Modules
            </TabsTrigger>
            <TabsTrigger value="auth-keys" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Auth Keys
            </TabsTrigger>
            <TabsTrigger value="auto-close" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Auto-Close
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="classifications" className="mt-6">
            <ClassificationManager />
          </TabsContent>
          
          <TabsContent value="categories" className="mt-6">
            <CategoryManager />
          </TabsContent>
          
          <TabsContent value="modules" className="mt-6">
            <ModuleManager />
          </TabsContent>
          
          <TabsContent value="auth-keys" className="mt-6">
            <DepartmentAuthKeyManager />
          </TabsContent>
          
          <TabsContent value="auto-close" className="mt-6">
            <AutoCloseSettingsManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConfigurationManagement;
