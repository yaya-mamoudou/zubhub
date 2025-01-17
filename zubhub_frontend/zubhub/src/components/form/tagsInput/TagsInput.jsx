import { Box, ClickAwayListener, FormControl, FormHelperText, Typography, makeStyles } from '@material-ui/core';
import { Add, ClearRounded } from '@material-ui/icons';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import styles from '../../../assets/js/styles';
import CustomButton from '../../button/Button';
import { tagsInputStyles } from './tagsInput.styles';
import _ from 'lodash';

export default function TagsInput({
  label,
  required,
  name,
  onChange,
  value,
  description,
  error,
  popularTags,
  selectedTags = [],
  placeholder,
  addTag,
  remoteData,
  clearSuggestions,
  removeTag,
  handleBlur,
  prefix,
}) {
  const commonClasses = makeStyles(styles)();
  const classes = makeStyles(tagsInputStyles)();
  const [isSearching, setIsSearching] = useState(false);
  selectedTags = [...(selectedTags ?? [])];
  const ref = useRef(null);

  const handleChange = e => {
    setIsSearching(true);
    onChange(e.target.value);
  };

  const handleClickAway = () => setIsSearching(false);
  const handleFocus = () => {
    clearSuggestions();
  };

  const handleTagAddition = value => {
    addTag(value);
    setIsSearching(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      addTag(e.target.value);
      setIsSearching(false);
    }
  };

  const onSelectedTagClick = index => removeTag(index);

  popularTags = popularTags?.map((tag, index) => (
    <CustomButton
      onClick={() => handleTagAddition(tag)}
      disabled={selectedTags.includes(tag)}
      className={clsx(classes.button, selectedTags.includes(tag) && classes.disabledButton)}
      style={{ fontWeight: tag == 'General' && '800' }}
      primaryButtonOutlinedStyle
      key={index}
      startIcon={<Add />}
    >
      {prefix && `${prefix} `}
      {tag}
    </CustomButton>
  ));

  selectedTags = selectedTags?.map((tag, index) => (
    <CustomButton
      onClick={() => onSelectedTagClick(index)}
      className={classes.button}
      primaryButtonStyle
      key={index}
      endIcon={<ClearRounded />}
    >
      {prefix && `${prefix}`}
      {tag}
    </CustomButton>
  ));

  remoteData = remoteData?.map((tag, index) => (
    <Box key={index} onClick={() => handleTagAddition(tag.name)} className={classes.suggestion}>
      <Typography>{tag.name}</Typography>
    </Box>
  ));

  return (
    <FormControl fullWidth>
      <label className={commonClasses.title2}>
        {label} {required && <span className={commonClasses.colorRed}>*</span>}
      </label>
      <Typography style={{ marginBottom: 10 }}>{description}</Typography>
      <Box className={clsx(classes.tagsContainer, error && commonClasses.borderRed)}>
        {selectedTags}
        <input
          ref={ref}
          onFocus={handleFocus}
          className={clsx(classes.input, commonClasses.inputText)}
          id={name}
          defaultValue={value}
          onBlur={() => handleBlur({ target: { name, value: selectedTags } })}
          name={name}
          placeholder={placeholder}
          onChange={_.debounce(handleChange, 500)}
          onKeyDown={handleKeyDown}
        />
      </Box>

      {isSearching ? (
        <Box style={{ position: 'relative' }}>
          <Box className={classes.suggestionBox}>
            <ClickAwayListener onClickAway={handleClickAway}>
              <Box>{remoteData.length > 0 ? remoteData : <p>Item not found: Hit Enter to Save your Input</p>}</Box>
            </ClickAwayListener>
          </Box>
        </Box>
      ) : null}

      {error && <FormHelperText className={commonClasses.colorRed}>{error}</FormHelperText>}
      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>{popularTags}</Box>
    </FormControl>
  );
}
