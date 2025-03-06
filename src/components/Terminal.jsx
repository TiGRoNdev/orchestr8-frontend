// components/Terminal.js
import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import ls from "localstorage-slim";


// eslint-disable-next-line react/prop-types
const TerminalComponent = ({ podId }) => {
    const terminalRef = useRef(null);
    const terminal = useRef();
    const fitAddon = useRef();
    const socket = useRef();

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize terminal
        terminal.current = new Terminal({
            cursorBlink: true,
            fontFamily: 'monospace',
        });
        fitAddon.current = new FitAddon();
        terminal.current.loadAddon(fitAddon.current);
        terminal.current.open(terminalRef.current);
        fitAddon.current.fit();

        // Initialize WebSocket
        socket.current = new WebSocket(`wss://tigron-server.lan/api/ws/pod/${podId}/terminal`);

        socket.current.onopen = () => {
            const token = ls.get('sessionKey', { decrypt: true });
            socket.send(token);
        };

        // Handle incoming messages
        socket.current.onmessage = (event) => {
            terminal.current?.write(event.data);
        };

        // Send user input
        terminal.current.onData((data) => {
            socket.current?.send(data);
        });

        // Handle resize
        const resizeObserver = new ResizeObserver(() => fitAddon.current?.fit());
        resizeObserver.observe(terminalRef.current);

        return () => {
            socket.current?.close();
            terminal.current?.dispose();
            resizeObserver.disconnect();
        };
    }, []);

    return <div ref={terminalRef} style={{ width: '100%', height: '100vh' }} />;
};

export default TerminalComponent;