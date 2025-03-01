import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

function valueLabelFormat(value) {
    const units = ['KB', 'MB', 'GB', 'TB'];

    let unitIndex = 0;
    let scaledValue = value;

    while (scaledValue >= 1024 && unitIndex < units.length - 1) {
        unitIndex += 1;
        scaledValue /= 1024;
    }

    return `${scaledValue} ${units[unitIndex]}`;
}

function calculateValue(value) {
    return 2 ** value;
}

// eslint-disable-next-line react/prop-types
export default function NonLinearSlider({ onChange, valueLabelFormatter, calculateFunc, min, max, step, label }) {
    const [value, setValue] = React.useState((min + max) / 4);

    const handleChange = (event, newValue) => {
        if (typeof newValue === 'number') {
            setValue(newValue);
            onChange(newValue);
        }
    };

    const calculate = calculateFunc ? calculateFunc : calculateValue;

    return (
        <Box>
            <Typography id="non-linear-slider" gutterBottom>
                {
                    valueLabelFormatter && label ? `${label} ${valueLabelFormatter(calculate(value))}` :
                    `Storage: ${valueLabelFormat(calculate(value))}`
                }
            </Typography>
            <Slider
                value={value}
                min={min}
                step={step}
                max={max}
                scale={calculate}
                getAriaValueText={valueLabelFormatter ? valueLabelFormatter : valueLabelFormat}
                valueLabelFormat={valueLabelFormatter ? valueLabelFormatter : valueLabelFormat}
                onChange={handleChange}
                valueLabelDisplay="auto"
                aria-labelledby="non-linear-slider"
            />
        </Box>
    );
}