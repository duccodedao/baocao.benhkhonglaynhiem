import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { ReportWithDetails } from '../types';

interface ReportsContextType {
  reports: ReportWithDetails[];
}

const ReportsContext = createContext<ReportsContextType>({ reports: [] });

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'officialNcdReports'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newReports: ReportWithDetails[] = [];
      snapshot.forEach((doc) => {
        newReports.push(doc.data() as ReportWithDetails);
      });
      setReports(newReports);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ReportsContext.Provider value={{ reports }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => useContext(ReportsContext);
