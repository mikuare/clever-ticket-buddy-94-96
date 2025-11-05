
import { useState } from 'react';

export const useAdminDashboardViews = () => {
  const [showUserPresence, setShowUserPresence] = useState(false);
  const [showDepartmentUsers, setShowDepartmentUsers] = useState(false);
  const [showDepartmentImages, setShowDepartmentImages] = useState(false);
  const [showAdminAnalysis, setShowAdminAnalysis] = useState(false);
  const [showTicketAnalysis, setShowTicketAnalysis] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const handleViewUsers = () => {
    setShowUserPresence(!showUserPresence);
    setShowDepartmentUsers(false);
    setShowDepartmentImages(false);
    setShowAdminAnalysis(false);
    setShowTicketAnalysis(false);
    setShowBookmarks(false);
  };

  const handleViewDepartmentUsers = () => {
    setShowDepartmentUsers(!showDepartmentUsers);
    setShowUserPresence(false);
    setShowDepartmentImages(false);
    setShowAdminAnalysis(false);
    setShowTicketAnalysis(false);
    setShowBookmarks(false);
  };

  const handleViewDepartmentImages = () => {
    setShowDepartmentImages(!showDepartmentImages);
    setShowUserPresence(false);
    setShowDepartmentUsers(false);
    setShowAdminAnalysis(false);
    setShowTicketAnalysis(false);
    setShowBookmarks(false);
  };

  const handleViewAdminAnalysis = () => {
    setShowAdminAnalysis(!showAdminAnalysis);
    setShowUserPresence(false);
    setShowDepartmentUsers(false);
    setShowDepartmentImages(false);
    setShowTicketAnalysis(false);
    setShowBookmarks(false);
  };

  const handleViewTicketAnalysis = () => {
    setShowTicketAnalysis(!showTicketAnalysis);
    setShowUserPresence(false);
    setShowDepartmentUsers(false);
    setShowDepartmentImages(false);
    setShowAdminAnalysis(false);
    setShowBookmarks(false);
  };

  const handleViewBookmarks = () => {
    setShowBookmarks(!showBookmarks);
    setShowUserPresence(false);
    setShowDepartmentUsers(false);
    setShowDepartmentImages(false);
    setShowAdminAnalysis(false);
    setShowTicketAnalysis(false);
  };

  const closeAllViews = () => {
    setShowUserPresence(false);
    setShowDepartmentUsers(false);
    setShowDepartmentImages(false);
    setShowAdminAnalysis(false);
    setShowTicketAnalysis(false);
    setShowBookmarks(false);
  };

  return {
    showUserPresence,
    showDepartmentUsers,
    showDepartmentImages,
    showAdminAnalysis,
    showTicketAnalysis,
    showBookmarks,
    handleViewUsers,
    handleViewDepartmentUsers,
    handleViewDepartmentImages,
    handleViewAdminAnalysis,
    handleViewTicketAnalysis,
    handleViewBookmarks,
    closeAllViews
  };
};
