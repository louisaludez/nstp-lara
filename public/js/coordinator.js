/* ================================================================
   COORDINATOR STATE & CONSTANTS (Page Renderers Removed)
================================================================ */

const COORD_STATS = [
  { key: 'total_students', label: 'Total Students', value: '0', delta: '0%', up: true, ico: 'users', color: 'from-indigo-500 to-blue-500' },
  { key: 'active_sections', label: 'Active Sections', value: '0', delta: '0', up: true, ico: 'book', color: 'from-emerald-500 to-teal-500' },
  { key: 'pass_rate', label: 'Pass Rate', value: '0.0%', delta: '0%', up: true, ico: 'trend', color: 'from-violet-500 to-fuchsia-500' },
  { key: 'reports_pending', label: 'Reports Pending', value: '0', delta: '0', up: false, ico: 'filecheck', color: 'from-amber-500 to-orange-500' },
];

function getCoordStats() {
  if (window.DASHBOARD_METRICS?.stats?.length) {
    return window.DASHBOARD_METRICS.stats;
  }
  return COORD_STATS;
}

const SECTIONS = [];
const SECTION_STUDENTS = {};
const APPROVALS = [];
