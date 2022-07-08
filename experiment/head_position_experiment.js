const jsPsych = initJsPsych();

const subject_id = jsPsych.randomization.randomID(8);

// Instructions
const instructions = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Let's begin by getting your camera ready.</p>`,
      choices: ["Continue"],
      css_classes: ["instructions"],
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
      css_classes: ["instructions"],
    },
    {
      type: jsPsychInitializeCamera,
      width: 480,
    },
    {
      type: jsPsychMirrorCamera,
      prompt:
        "<p>Please adjust the camera, your position, and the lighting to get a good view of your face.</p>",
    },
  ],
};
// face detection model expects 192 x 192 cropped images

// Fullscreen
const fullscreen = {
  timeline: [
    {
      type: jsPsychFullscreen,
      fullscreen_mode: true,
      message: `<p>Now that your camera is set up, we will switch to fullscreen mode for the experiment.</p>`,
      button_label: "Enter Fullscreen",
      delay_after: 200,
    },
  ],
};

// Task Instructions
const taskInstructions = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Move your head around, but make sure to continue looking at the screen.</p>`,
      choices: ["Got it."],
      css_classes: ["instructions"],
    },
  ],
};

const testTrial = {
  type: jsPsychHtmlVideoResponse,
  stimulus: `<video autoplay playsinline id="jspsych-mirror-camera-video" width="480" height="auto"></video>`,
  recording_duration: 30000,
  show_done_button: false,
  data: {
    x: jsPsych.timelineVariable("x"),
    y: jsPsych.timelineVariable("y"),
    point_type: jsPsych.timelineVariable("type"),
  },
  on_load: () => {
    setTimeout(()=>{
      const stream = jsPsych.pluginAPI.getCameraStream();
      jsPsych.getDisplayElement().querySelector("#jspsych-mirror-camera-video").srcObject = stream;
    }, 200);
  },
  on_finish: (data) => {
    fetch("server/save_webm_pose.php", {
      method: "POST",
      body: JSON.stringify({
        id: subject_id,
        response: data.response,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    data.response = `${subject_id}_pose.webm`;
  },
};


const save_all = {
  type: jsPsychCallFunction,
  func: () => {
    fetch("server/save_json_pose.php", {
      method: "POST",
      body: JSON.stringify({
        id: subject_id,
        data: jsPsych.data.get().json(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  post_trial_gap: 2000,
};

const exit_full_screen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false,
}

const final_instructions = {
  timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `<p>Thank you for your participation. The study is now complete.</p>`,
      choices: ["Done"],
    },
  ],
};

// Run Experiment
jsPsych.run([
  instructions,
  cameraSetup,
  fullscreen,
  taskInstructions,
  testTrial,
  save_all,
  exit_full_screen,
  final_instructions,
]);
