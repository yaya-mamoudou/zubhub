import React, { useEffect, useState } from 'react';
import { CustomButton, Editor, ImageInput, LabeledLine } from '../../../components';
import { Box, Button, Divider, IconButton, Menu, MenuItem, Typography, makeStyles } from '@material-ui/core';
import { step2Styles } from './Step2.styles';
import styles from '../../../assets/js/styles';
import { Add, MoreHoriz } from '@material-ui/icons';
import clsx from 'clsx';
import { uniqueId } from 'lodash';

const idPrefix = 'activitystep';
const DEFAULT_STEP = { description: '', attachments: [], title: '', id: uniqueId(idPrefix) };

export default function Step2() {
  const classes = makeStyles(step2Styles)();
  const commonClasses = makeStyles(styles)();
  const handleIntroductionChange = value => {};
  const [steps, setSteps] = useState([{ ...DEFAULT_STEP }]);

  const addStep = () => {
    const uuid = uniqueId(idPrefix);
    setSteps([...steps, { ...DEFAULT_STEP, id: uuid }]);
  };

  const onStepChange = (data, type, stepIndex) => {
    let stepsTemp = [...steps];
    let step = stepsTemp[stepIndex];
    step[type] = data;
    stepsTemp[stepIndex] = step;
    setSteps(stepsTemp);
  };

  const deleteStep = id => {
    setSteps([...steps.filter(step => step.id !== id)]);
  };

  const moveUp = index => {
    if (index !== 0 && index < steps.length) {
      const array = [...steps];
      const temp = array[index];
      array[index] = array[index - 1];
      array[index - 1] = temp;
      setSteps(array);
    }
  };

  const moveDown = index => {
    if (index + 1 < steps.length) {
      const stepsTemp = [...steps];
      [stepsTemp[index], stepsTemp[index + 1]] = [stepsTemp[index + 1], stepsTemp[index]];
      setSteps(stepsTemp);
    }
  };

  return (
    <div className={classes.container}>
      <Box className={classes.formItem}>
        <Editor
          enableToolbar={true}
          onChange={handleIntroductionChange}
          label="Introduction"
          required
          placeholder="Start writting"
        />
        <LabeledLine label="ATTACH" />

        <ImageInput message={imageInputMessage} />
      </Box>

      <Box className={classes.formItem}>
        <Editor
          enableToolbar={true}
          onChange={handleIntroductionChange}
          label="Materials Used"
          value={defaultQuillValue}
          required
          placeholder="1. "
        />
        <LabeledLine label="ATTACH" />

        <ImageInput message={imageInputMessage} />
      </Box>

      {steps.map((step, index) => (
        <div key={step.id}>
          <div className={clsx(commonClasses.justifySpaceBetween, commonClasses.alignCenter)}>
            <div className={clsx(commonClasses.alignCenter, commonClasses.displayFlex)}>
              <Typography className={commonClasses.title2}>Step {index + 1}: </Typography>
              <input
                style={{ border: 'none', outline: 'none', paddingLeft: 10 }}
                className={commonClasses.title2}
                placeholder="Enter step title"
                onChange={d => onStepChange(d.target.value, 'title', index)}
              />
            </div>
            {steps.length > 1 && (
              <>
                <AnchorElemt
                  deleteStep={() => deleteStep(step.id)}
                  moveDown={() => moveDown(index)}
                  moveUp={() => moveUp(index)}
                />
              </>
            )}
          </div>
          <Box className={classes.formItem}>
            <Editor
              enableToolbar={true}
              onChange={data => onStepChange(data, 'description', index)}
              value={step.description}
              placeholder="Type Description..."
            />
            <LabeledLine label="ATTACH" />

            <ImageInput message={imageInputMessage} />
          </Box>
        </div>
      ))}

      <CustomButton onClick={addStep} style={{ alignSelf: 'center' }} primaryButtonOutlinedStyle endIcon={<Add />}>
        Add New Step
      </CustomButton>
    </div>
  );
}

const imageInputMessage =
  'Upload photos and other files (Supported files: jpg, png, gif, bmp, pdf, txt, stl. Max 25MB)';
const defaultQuillValue = `
<ol>
  <li></li>
</ol>
`;

const AnchorElemt = ({ moveDown, moveUp, deleteStep }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMoveUp = () => {
    moveUp();
    handleClose();
  };

  const handleMoveDown = () => {
    moveDown();
    handleClose();
  };

  return (
    <>
      <IconButton
        id={`basic-button`}
        aria-controls={open ? `menu` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreHoriz />
      </IconButton>
      <Menu
        id={`menu`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': `basic-button`,
        }}
      >
        <MenuItem onClick={handleMoveUp}>Move up one step</MenuItem>
        <MenuItem onClick={handleMoveDown}>Move down one step</MenuItem>
        <Divider />
        <MenuItem onClick={deleteStep}>Delete step</MenuItem>
      </Menu>
    </>
  );
};
