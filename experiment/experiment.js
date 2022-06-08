const n_test_trials = 10;
const trial_duration = 2000;
const min_x = 5;
const max_x = 95;
const min_y = 5;
const max_y = 95;

const jsPsych = initJsPsych();

// Instructions
const instructions = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Thanks for participating in our experiment!</p>
            <p>We are developing tools to help researchers measure eye movements during online experiments.</p>
            <p>Eye tracking is a commonly used method in psychological experiments, but is currently difficult to do online.</p>
            <p>Your participation in this experiment will help us test new tools for eye tracking so that future experiments can get better data.</p>`,
      choices: ["Continue"],
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>In order to complete this experiment, you will need to allow us to record from your device's camera.</p>
            <p>We will record without audio, and each recording will be only a few seconds long, recording where you are looking on the screen.</p>
            <p>The video files that we record will become part of a public dataset that researchers can use to test new tools for eye tracking.</p>
            <p>If you are not comfortable with the videos we record during this experiment being released to the public, you should exit the experiment.</p>
            <p>You will also have a chance at the end of the experiment to decide whether to exclude your data from the public dataset, in case you change your mind during the experiment.</p>`,
      choices: ["I understand that the videos will be public"],
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Let's begin by getting your camera ready.</p>`,
      choices: ["Continue"],
    },
  ],
};

// Camera Setup
const cameraSetup = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>When you click the button below you will be prompted to allow access to your camera.</p>
        <p>If you have more than one camera connected to your computer, you can select which one to use.</p>`,
      choices: ["Continue"],
    },
    {
      type: jsPsychInitializeCamera,
      width: 480
    },
    {
      type: jsPsychMirrorCamera,
      prompt: '<p>Please adjust the camera, your position, and the lighting to get a good view of your face.</p>',
    }
  ]
}
// face detection model expects 192 x 192 cropped images

// Fullscreen
const fullscreen = {
  timeline: [
    {
      type: jsPsychFullscreen,
      fullscreen_mode: true,
      message: `<p>Now that your camera is set up, we will switch to fullscreen mode for the experiment.</p>`,
      button_label: "Enter Fullscreen",
      delay_after: 200
    }
  ]
}

// Task Instructions
const taskInstructions = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>The rest of the experiment will involve looking at specific locations on your screen while we record video.</p>
        <p>We will show you this dot at different places on your screen.</p> 
        <div style="position: relative; width:100%; height: 2em;"><div class="fixation-point" style="top:50%; left:50%;"></div></div>
        <p>While the dot is on the screen, please keep your gaze locked onto the dot.</p>`,
      choices: ["Continue"],
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>While the dot is on the screen and your gaze is locked onto the dot, please move your head!</p>
        <p>Moving your head slightly left or right, tilting your head to the side, and moving slightly closer or further from the monitor will help us get better data about different poses that people may look at the location.</p>`,
      choices: ["Continue"],
    }
  ]
}

// Recording Trials
// - 13 calibration points (allows testing with 9 and 5 in training set)
// - 30 (60? 90?) randomly uniformly sampled fixation points in two blocks
const calibration_parameters = [
  { x: 10, y: 10, type: 'calibration' },
  { x: 50, y: 10, type: 'calibration' },
  { x: 90, y: 10, type: 'calibration' },
  { x: 10, y: 50, type: 'calibration' },
  { x: 50, y: 50, type: 'calibration' },
  { x: 90, y: 50, type: 'calibration' },
  { x: 10, y: 90, type: 'calibration' },
  { x: 50, y: 90, type: 'calibration' },
  { x: 90, y: 90, type: 'calibration' },
  { x: 30, y: 30, type: 'calibration' },
  { x: 70, y: 30, type: 'calibration' },
  { x: 30, y: 70, type: 'calibration' },
  { x: 70, y: 70, type: 'calibration' }
]

const test_parameters = [];

for(let i = 0; i < n_test_trials; i++) {
  test_parameters.push({
    x: jsPsych.randomization.randomInt(min_x, max_x),
    y: jsPsych.randomization.randomInt(min_y, max_y),
    type: 'test'
  });
}

const testTrial = {
  type: jsPsychHtmlVideoResponse,
  stimulus: ()=>{
    return `<div style="position: relative; width:100vw; height: 100vh;"><div class="fixation-point" style="top:${jsPsych.timelineVariable('y')}%; left:${jsPsych.timelineVariable('x')}%;"></div></div>`
  },
  recording_duration: 2000,
  show_done_button: false,
  data:{
    x: jsPsych.timelineVariable('x'),
    y: jsPsych.timelineVariable('y'),
    point_type: jsPsych.timelineVariable('type')
  },
  on_finish: (data) => {
    console.log(data.response);
    fetch('server/save_webm.php',{
      method: 'POST',
      body: JSON.stringify({
        x: data.x,
        y: data.y,
        point_type: data.point_type,
        response: data.response}),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

const calibration = {
  timeline: [testTrial],
  timeline_variables: calibration_parameters,
}

const test = {
  timeline: [testTrial],
  timeline_variables: test_parameters,
}

// Run Experiment
jsPsych.run([
  // instructions, 
  cameraSetup, 
  // fullscreen,
  // taskInstructions,
  // calibration,
  test
]);
