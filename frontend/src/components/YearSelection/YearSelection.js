import React from 'react';
import styles from './YearSelection.module.css';


const YearSelection = ({ years, selectedYear, onYearClick }) => {
  return (
    <nav className={styles.yearSelection}>
      <ul>
        {years.map(year => (
          <li
            key={year.value}
            className={year.value === selectedYear ? styles.selected : ''}
            onClick={() => onYearClick(year.value)}
            style={{ cursor: 'pointer' }}
          >
            <i className={`${styles.handPointIcon} fas fa-hand-point-right`} />&nbsp;
            <i className="fas fa-graduation-cap" /> {year.label}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default YearSelection;
