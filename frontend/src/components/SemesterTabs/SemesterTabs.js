import React, { useEffect, useState } from 'react';
import styles from './SemesterTabs.module.css';

const SemesterTabs = ({ semesters, selectedSemester, onSemesterClick }) => {
  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      // Set initial value
      setSidebarHidden(sidebar.classList.contains('hidden'));

      // Observe class attribute changes on sidebar
      const observer = new MutationObserver(() => {
        setSidebarHidden(sidebar.classList.contains('hidden'));
      });
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });

      // Cleanup on unmount
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className={`${styles.semesterTabs} ${sidebarHidden ? styles.paddingRight1rem : ''}`}>
      {semesters.map((sem) => (
        <button
          key={sem.value}
          className={`${styles.tab} ${sem.value === selectedSemester ? styles.active : ''}`}
          onClick={() => onSemesterClick(sem.value)}
        >
          {sem.label}
        </button>
      ))}
    </div>
  );
};

export default SemesterTabs;
