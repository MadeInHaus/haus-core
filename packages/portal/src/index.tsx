import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export interface PortalProps {
    selector?: string;
    children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ selector = '#__portal__', children }) => {
    const [element, setElement] = useState<Element | null>(null);

    useEffect(() => {
        setElement(document.querySelector(selector!));
    }, [selector]);

    if (element) {
        return ReactDOM.createPortal(children, element);
    }

    return null;
};

export default Portal;
