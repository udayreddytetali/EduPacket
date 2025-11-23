import React from 'react';
import SubjectSelection from './SubjectSelection';


// Map display labels to backend values
const yearSemConfig = [
  { year: '1', yearLabel: '1st-Year', semesters: [{ sem: '1', semLabel: '1st-Sem' }, { sem: '2', semLabel: '2nd-Sem' }] },
  { year: '2', yearLabel: '2nd-Year', semesters: [{ sem: '1', semLabel: '3rd-Sem' }, { sem: '2', semLabel: '4th-Sem' }] },
  { year: '3', yearLabel: '3rd-Year', semesters: [{ sem: '1', semLabel: '5th-Sem' }, { sem: '2', semLabel: '6th-Sem' }] },
];

const YearSemesterSection = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {yearSemConfig.map(({ year, yearLabel, semesters }) => (
        <div key={yearLabel} style={{ marginBottom: 40, background: '#f7f7f7', borderRadius: 12, boxShadow: '0 2px 8px rgba(32,87,97,0.06)', padding: 24 }}>
          <h2 style={{ color: '#205761', marginBottom: 16 }}>{yearLabel}</h2>
          <div style={{ display: 'flex', gap: 32 }}>
            {semesters.map(({ sem, semLabel }) => (
              <div key={semLabel} style={{ flex: 1, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(32,87,97,0.04)' }}>
                <h3 style={{ color: '#205761', marginBottom: 12 }}>{semLabel}</h3>
                {/* SubjectSelection handles group and datatype selectors, upload, and file list */}
                <SubjectSelection year={year} semester={sem} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default YearSemesterSection;
