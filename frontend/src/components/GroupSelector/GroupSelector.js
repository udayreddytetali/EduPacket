import React from 'react';
import styles from './GroupSelector.module.css';

const GroupSelector = ({ groups, value, onChange }) => {
  return (
    <select
      className={styles.selector}
      value={value}
      onChange={onChange}
      aria-label="Select Group"
    >
      <option value="">-- Choose a Group --</option>
      {groups.map((group) => (
        <option key={group.value} value={group.value}>
          {group.label}
        </option>
      ))}
    </select>
  );
};

export default GroupSelector;
