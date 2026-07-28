// Components/ActiveExerciseContext.jsx
//
// Lets any page (StudentPractice, ChallengePage, HTMLPage, ExamPage, etc.)
// tell the globally-mounted AIRobotButton what exercise the student is
// currently looking at, without prop-drilling it through Layout.
//
// Usage in a page that shows an exercise:
//
//   import { useActiveExercise } from '../../Components/ActiveExerciseContext';
//   const { setActiveExercise, clearActiveExercise } = useActiveExercise();
//
//   useEffect(() => {
//     if (exercise) {
//       setActiveExercise({
//         language: exercise.language,
//         level: exercise.level,
//         question_text: exercise.question_text,
//         hint: exercise.hint,
//       });
//     }
//     return () => clearActiveExercise();
//   }, [exercise]);

import { createContext, useContext, useState, useCallback } from 'react';

const ActiveExerciseContext = createContext(null);

export function ActiveExerciseProvider({ children }) {
  const [activeExercise, setActiveExerciseState] = useState(null);

  const setActiveExercise = useCallback((exercise) => {
    setActiveExerciseState(exercise);
  }, []);

  const clearActiveExercise = useCallback(() => {
    setActiveExerciseState(null);
  }, []);

  return (
    <ActiveExerciseContext.Provider value={{ activeExercise, setActiveExercise, clearActiveExercise }}>
      {children}
    </ActiveExerciseContext.Provider>
  );
}

export function useActiveExercise() {
  const ctx = useContext(ActiveExerciseContext);
  if (!ctx) {
    throw new Error('useActiveExercise must be used within an ActiveExerciseProvider');
  }
  return ctx;
}