// useToggle.ts
import { useState } from 'react';

const useToggle = (initial: boolean = false) => {
    const [state, setState] = useState(initial);
    const toggle = () => setState(prev => !prev);
    return [state, toggle] as const;
};

export default useToggle;
