import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Link,
  Typography,
  makeStyles,
  useMediaQuery,
} from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { CustomButton, Modal, TagsInput } from '../../components';
import StepWizard from 'react-step-wizard';
import {
  ArrowBackIosRounded,
  ArrowForwardIosRounded,
  CloseOutlined,
  CloudDoneOutlined,
  DoneRounded,
  KeyboardBackspaceRounded,
} from '@material-ui/icons';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import { createActivityStyles } from './CreateActivity.styles';
import clsx from 'clsx';
import { colors } from '../../assets/js/colors';
import styles from '../../assets/js/styles';
import { useDomElementHeight } from '../../hooks/useDomElementHeight.hook';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as script from './script';
import CreateActivityStep1 from './create_activity_step1';
import Step1 from './step1/Step1';
import Step2 from './step2/Step2';

const DRAFT_STATUSES = { saved: 'SAVED', saving: 'SAVING', idle: 'IDLE' };
const steps = ['Activity Basics', 'Activity Details'];

export default function CreateActivity(props) {
  const [completedSteps, setcompletedSteps] = useState([]);
  const { height } = useDomElementHeight('navbar-root');
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const wizardRef = useRef(null);
  const classes = makeStyles(createActivityStyles)({ height });
  const commonClasses = makeStyles(styles)();
  const [draftStatus, setDraftStatus] = useState(DRAFT_STATUSES.idle);
  const [activeStep, setActiveStep] = useState(1);
  const [state, setState] = useState({ ...JSON.parse(JSON.stringify(script.vars.default_state)) });
  const [publishOrAddTags, setPublishOrAddTags] = useState(false);
  const [addTagsDialog, setAddTagsDialog] = useState(false);
  const [value, setValue] = useState('');
  const [remoteTags, setRemoteTags] = useState([]);
  const [popularTags, setPopularTags] = useState(script.testTags);
  const [mode, setMode] = useState('');
  const [preview, setPreview] = useState(false);

  const isActive = index => index + 1 === activeStep;
  const isCompleted = index => completedSteps.includes(index + 1);
  const togglePublishOrAddTags = () => {
    formik.values?.tags.length == 0 ? setPublishOrAddTags(!publishOrAddTags) : toggleAddTagsDialog();
  };
  const toggleAddTagsDialog = () => setAddTagsDialog(!addTagsDialog);
  const clearSuggestions = () => setRemoteTags([]);

  const handleSetState = obj => {
    if (obj) {
      Promise.resolve(obj).then(obj => {
        setState(state => ({ ...state, ...obj }));
      });
    }
  };

  const getToastMessage = () => {
    let message = '';
    if (activeStep === 1 && props.match.path === '/projects/create') {
      message = 'createProject.addedToDraft';
    }
    if ([1, 2].includes(activeStep) && props.match.params.id) {
      message = 'createProject.savedStep';
    }
    if (activeStep === 3 && props.match.params.id) {
      message = 'createProject.createToastSuccess';
    }
    return message;
  };

  //   const handleChangeTag = async value => {
  //     setValue(value);
  //     script.searchTags(value, (error, data) => {
  //       if (!error) setRemoteTags(data);
  //     });
  //   };

  //   const addTag = value => {
  //     const values = [...formik.values.tags, value];
  //     formik.setFieldValue('tags', values);
  //     clearSuggestions();
  //     setValue('');
  //   };

  //   const removeTag = tagIndex => {
  //     const tags = [...formik.values.tags].filter((_, index) => index !== tagIndex);
  //     formik.setFieldValue('tags', tags);
  //   };

  //   useEffect(() => {
  //     if (props.match.params.id) {
  //       Promise.all([script.getProject({ ...props, ...formik }, state), script.getCategories(props)]).then(result =>
  //         handleSetState({ ...result[0], ...result[1] }),
  //       );
  //     } else {
  //       handleSetState(script.getCategories(props));
  //     }
  //     const params = new URLSearchParams(window.location.search);
  //     const queryParams = Object.fromEntries(params.entries());
  //     if ('mode' in queryParams) setMode(queryParams.mode);
  //   }, []);

  const handleBlur = name => {
    formik.setTouched({ [name]: true }, true);
  };

  useEffect(() => {
    if (state.success) {
      if (props.location.pathname === '/projects/create') props.history.replace(`/projects/${state.id}/edit`);
      toast.success(props.t(getToastMessage()));
      if (activeStep === 3) {
        return props.history.push(`/projects/${props.match.params.id}?success=true`);
      }
      go('next');
    }
  }, [state.success]);

  const togglePreview = () => setPreview(!preview);

  useEffect(() => {
    if (state.default_state?.loading) {
      setDraftStatus(DRAFT_STATUSES.saving);
    } else {
      setDraftStatus(DRAFT_STATUSES.saved);
    }
  }, [state.default_state?.loading]);

  const draftContainerText = () => {
    if (draftStatus === DRAFT_STATUSES.idle) return 'Draft';
    if (draftStatus === DRAFT_STATUSES.saving) return !isSmallScreen ? 'Saving to draft' : 'Saving...';
    if (draftStatus === DRAFT_STATUSES.saved) return !isSmallScreen ? 'Saved to draft' : '';
  };

  const formik = useFormik(script.formikSchema);

  const previous = () => go('prev');
  const next = async () => {
    // let error = await checkErrors();
    // console.log(error);
    // if (Object.keys(error).length > 0) return;

    // if (activeStep === 3) {
    //   return togglePublishOrAddTags();
    // }
    go('next');

    // submitData();
  };

  const handleAddTags = () => {
    togglePublishOrAddTags();
    toggleAddTagsDialog();
  };

  const submitData = async () => {
    try {
      return (
        !script.vars.upload_in_progress &&
        script.initUpload(state, { ...props, ...formik, step: activeStep }, handleSetState)
      );
    } catch (error) {
      console.log(error);
    }
  };

  //   const checkErrors = () => {
  //     if (activeStep === 1) {
  //       return formik.setTouched({ title: true, materials_used: true, description: true }, true);
  //     }

  //     if (activeStep === 2) {
  //       return formik.setTouched({ video: true, project_images: true }, true);
  //     }

  //     if (activeStep === 3) {
  //       return formik.setTouched({ category: true, hashtags: true }, true);
  //     }
  //   };

  const go = direction => {
    if (direction === 'next') {
      if (activeStep !== 3) {
        wizardRef.current.nextStep();
        let completedStepsTemp = [...new Set([...completedSteps, activeStep])];
        setcompletedSteps(completedStepsTemp);
        setActiveStep(step => step + 1);
      }
    }
    if (direction === 'prev') {
      if (activeStep !== 1) {
        wizardRef.current.previousStep();
        setActiveStep(step => step - 1);
      }
    }
  };

  const renderSteps = steps.map((label, index) => (
    <Box
      key={index}
      className={clsx(classes.stepperLine, (isActive(index) || isCompleted(index)) && classes.activeStep)}
    >
      <Box className={clsx(classes.stepBall, (isActive(index) || isCompleted(index)) && classes.activeStep)}>
        {isCompleted(index) && !isActive(index) ? (
          <DoneRounded style={{ fontSize: 14 }} />
        ) : (
          <Typography style={{ fontWeight: '600' }}>{index + 1}</Typography>
        )}
      </Box>
      <Typography className={clsx(classes.stepLabel, (isActive(index) || isCompleted(index)) && classes.activeLabel)}>
        {label}
      </Typography>
    </Box>
  ));

  return (
    <div className={classes.container}>
      <Dialog open={preview} fullScreen>
        {/* <PreviewProject {...props} onClose={togglePreview} /> */}
      </Dialog>
      {/* Banner */}
      <Box className={classes.banner}>
        <KeyboardBackspaceRounded />
        <>
          <CustomButton onClick={togglePreview} className={classes.previewButton} variant="outlined">
            Preview
          </CustomButton>
          <Box className={clsx(classes.draft, draftStatus === DRAFT_STATUSES.saved && classes.savedToDraft)}>
            {draftStatus === DRAFT_STATUSES.saving ? <CircularProgress size={20} color="inherit" /> : null}
            {draftStatus === DRAFT_STATUSES.saved ? <CloudDoneOutlined size={20} color="inherit" /> : null}

            <Link className={classes.linkToDraft} href={`/creators/${props.auth?.username}/drafts`}>
              <Typography>{draftContainerText()}</Typography>
            </Link>
          </Box>
        </>
      </Box>

      {/* Form */}
      <Box className={classes.formContainer}>
        <Grid item md={12} lg={12}>
          <Box sx={{ textAlign: isSmallScreen ? 'left' : 'center' }}>
            <Typography className={clsx(commonClasses.title1)}>Create Activity</Typography>
            <Typography>Tell us about your informative activity !</Typography>
          </Box>

          {/* Step Navigation UI */}
          <Box className={classes.stepperContainer}>{renderSteps}</Box>

          <Box style={{ marginTop: 100 }}>
            <StepWizard initialStep={activeStep} ref={wizardRef}>
              <Step1 formik={formik} />
              <Step2 />
            </StepWizard>
          </Box>
        </Grid>

        {/* Previous and Next buttons */}
        <Box className={classes.buttonGroup}>
          {activeStep > 1 && (
            <CustomButton
              onClick={previous}
              primaryButtonOutlinedStyle
              startIcon={<ArrowBackIosRounded className={classes.nextButton} />}
            >
              Previous
            </CustomButton>
          )}

          <CustomButton
            onClick={next}
            loading={state.default_state?.loading}
            style={{ marginLeft: 'auto' }}
            primaryButtonStyle
            endIcon={<ArrowForwardIosRounded className={classes.nextButton} />}
          >
            {activeStep == 2 ? 'Publish' : 'Next'}
          </CustomButton>

          {/* <Modal.WithIcon
            icon={<AiOutlineExclamationCircle color={colors['tertiary-dark']} fontSize={25} />}
            open={publishOrAddTags}
            onClose={togglePublishOrAddTags}
          >
            <DialogTitle>
              <Typography className={clsx(commonClasses.title2, classes.dialogTitle1)}>
                Would you like to tag your project?
              </Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Add relevant hashtags to your project for more visibility on ZubHub. If your project is generic in
                nature, use General tag.
              </DialogContentText>
              <DialogActions className={commonClasses.justifySpaceBetween}>
                <CustomButton primaryButtonOutlinedStyle onClick={handleAddTags}>
                  Add tags
                </CustomButton>
                <CustomButton primaryButtonStyle onClick={submitData}>
                  Publish without tags
                </CustomButton>
              </DialogActions>
            </DialogContent>
          </Modal.WithIcon> */}

          {/* <Modal open={addTagsDialog} onClose={toggleAddTagsDialog}>
            <DialogActions className={commonClasses.justifySpaceBetween}>
              <CustomButton onClick={toggleAddTagsDialog} style={{ padding: 15 }} startIcon={<CloseOutlined />}>
                Close
              </CustomButton>
              <CustomButton onClick={submitData} style={{ margin: '0 15px' }} primaryButtonStyle>
                Publish
              </CustomButton>
            </DialogActions>

            <DialogTitle>
              <Typography align="center" className={commonClasses.title2}>
                What hashtag best describes your project?
              </Typography>
              <Typography align="center">
                For example, if you made flower from cardboard, you can write: cardboard, flowers, colours or leave it
                blank if you’re unsure.
              </Typography>
            </DialogTitle>

            <DialogContent style={{ paddingBottom: 30 }}>
              <TagsInput
                name="tags"
                selectedTags={formik.values.tags}
                popularTags={popularTags}
                onChange={handleChangeTag}
                addTag={addTag}
                value={value}
                remoteData={remoteTags}
                clearSuggestions={clearSuggestions}
                removeTag={removeTag}
                placeholder="Start typing to search"
              />
            </DialogContent>
          </Modal> */}
        </Box>
      </Box>
    </div>
  );
}