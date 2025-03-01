import { useState, useEffect } from 'react';
import { CircularProgress, TextField, Paper, List, ListItem, ListItemText } from '@mui/material';

// eslint-disable-next-line react/prop-types
const Autocomplete = ({ apiUrl, debounceTime = 300, onSelect, token, getLabel, label, errors }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchData = async (query) => {
            if (!query) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${apiUrl}?text=${encodeURIComponent(query)}`, {
                    headers: { "Authorization": `JWT ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch suggestions');

                const data = await response.json();
                setSuggestions(data.data.results || []);
            } catch (err) {
                setError(err.message);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchData(inputValue);
        }, debounceTime);

        return () => clearTimeout(debounceTimer);
    }, [inputValue, apiUrl, debounceTime]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setOpen(true);
    };

    const handleSelect = (value) => {
        onSelect(value);
        setInputValue(value);
        setSuggestions([]);
        setOpen(false);
    };

    return (
        <div style={{ position: 'relative', marginTop: '16px' }}>
            <TextField
                fullWidth
                value={inputValue}
                onChange={handleInputChange}
                label={label}
                variant="outlined"
                InputProps={{
                    endAdornment: isLoading && <CircularProgress size={20} />,
                }}
                error={!!errors || !!error}
                helperText={errors ? errors : error}
            />

            {(suggestions.length > 0 || (inputValue && !isLoading && !error)) && open && (
                <Paper
                    style={{
                        position: 'absolute',
                        width: '100%',
                        maxHeight: '200px',
                        overflow: 'auto',
                        zIndex: 1000,
                        marginTop: '4px'
                    }}
                >
                    <List>
                        {suggestions.length > 0 ? (
                            suggestions.map((suggestion, index) => (
                                <ListItem
                                    button
                                    key={index}
                                    onClick={() => handleSelect(getLabel(suggestion))}
                                >
                                    <ListItemText primary={getLabel(suggestion)} />
                                </ListItem>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText primary="No options found" />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            )}
        </div>
    );
};

export default Autocomplete;