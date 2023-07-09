import React from 'react';
import { dropdownStyle } from './dropdown.style';
import { Box, Checkbox, FormControl, TextField, Typography, makeStyles } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import styles from '../../../assets/js/styles';
import { CheckBox } from '@material-ui/icons';
import { colors } from '../../../assets/js/colors';

export default function Dropdown({
  label,
  data = [],
  value,
  multiple,
  placeholder,
  required,
  handleChange,
  error,
  description,
  maxSelection,
  withCheckbox,
}) {
  const classes = makeStyles(dropdownStyle)();
  const commonClasses = makeStyles(styles)();

  const labelView = (props, ...rest) => {
    const color = rest[0].selected ? colors.primary : colors.light;
    const checked = rest[0].selected;
    return (
      <Box component="li" sx={{ '& > *': { mr: 2 }, display: 'flex', gap: 5, alignItems: 'center' }} {...props}>
        {withCheckbox ? <Checkbox checked={checked} style={{ color }} /> : null}
        <Typography style={{ fontWeight: '500' }}>{props.name}</Typography>
      </Box>
    );
  };

  const inputView = params => (
    <TextField
      {...params}
      variant="outlined"
      error={error}
      helperText={error}
      placeholder={placeholder}
      inputProps={{
        ...params.inputProps,
        autoComplete: 'new-password', // disable autocomplete and autofill
      }}
    />
  );

  const getOptionSelected = option => {
    if (typeof maxSelection === 'number' && value?.length == maxSelection) {
      return value.findIndex(item => item.id === option.id) == -1;
    }
  };

  return (
    <FormControl fullWidth>
      <label htmlFor="" className={commonClasses.title2}>
        {label} {required && <span className={commonClasses.colorRed}>*</span>}
      </label>
      {description && <Typography style={{ marginBottom: 10 }}>{description}</Typography>}
      <Autocomplete
        sx={{ width: 300 }}
        options={data}
        autoHighlight
        multiple={multiple}
        value={value}
        onChange={(e, value) => handleChange(value)}
        getOptionLabel={option => option?.name}
        renderOption={labelView}
        renderInput={inputView}
        getOptionDisabled={getOptionSelected}
      />
    </FormControl>
  );
}
