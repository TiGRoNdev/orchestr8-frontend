// components/Terminal.js
import  { useEffect } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const XTerminal = () => {
    useEffect(() => {
        const term = new Terminal({
            theme: { background: '#1A1D28', foreground: '#FFFFFF' },
        });
        term.open(document.getElementById('terminal'));
        term.write('Welcome to Orchestr8 Terminal\r\n$ ');

        return () => term.dispose();
    }, []);

    return <div id="terminal" style={{ height: '400px' }} />;
};

export default XTerminal;