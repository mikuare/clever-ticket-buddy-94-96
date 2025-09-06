// This file is now deprecated - data is fetched from the database
// Keeping it for backwards compatibility but will be removed in future updates

// Classification options - now fetched from database
export const CLASSIFICATIONS = [
  'Customization',
  'Login Access',
  'General Inquiry',
  'System Suggestion',
  'Network & Connectivity',
  'Master Data Management',
  'System Issues',
  'Reports'
];

// Dynamic category mapping based on classification - now fetched from database
export const CATEGORY_MAPPING = {
  'Customization': ['High', 'Medium', 'Low'],
  'Login Access': ['Invalid Credentials', 'User Locked', 'Role or Access', 'Request Access for New Module'],
  'General Inquiry': ['Default'],
  'System Suggestion': ['Continuous Improvements'],
  'Network & Connectivity': ['No Internet Connectivity'],
  'Master Data Management': ['Add Items', 'Corrections'],
  'System Issues': ['Transaction Timeout'],
  'Reports': ['Default']
};

// Acumatica Modules - now fetched from database
export const ACUMATICA_MODULES = [
  'Projects',
  'Project Management',
  'Purchases',
  'Payables',
  'Inventory',
  'Receivables',
  'Banking',
  'Finance',
  'Sales Orders',
  'Taxes',
  'Approval List',
  'Data Views',
  'Cash Fund Management',
  'Philippine Taxation',
  'Compliance',
  'Fixed Assets',
  'Currency Management',
  'Configuration',
  'Integration',
  'User Security',
  'Row Level Security',
  'Customization',
  'System Management'
];
