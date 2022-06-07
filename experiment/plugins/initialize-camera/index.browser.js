var jsPsychInitializeCamera = (function (jspsych) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    const info = {
        name: "initialize-camera",
        parameters: {
            /** Function to call */
            device_select_message: {
                type: jspsych.ParameterType.HTML_STRING,
                default: `<p>Please select the camera you would like to use.</p>`,
            },
            /** Is the function call asynchronous? */
            button_label: {
                type: jspsych.ParameterType.STRING,
                default: "Use this camera",
            },
            width: {
                type: jspsych.ParameterType.INT,
                default: null,
            },
            height: {
                type: jspsych.ParameterType.INT,
                default: null,
            },
        },
    };
    /**
     * **initialize-camera**
     *
     * jsPsych plugin for getting permission to initialize a camera
     *
     * @author Josh de Leeuw
     * @see {@link https://www.jspsych.org/plugins/jspsych-initialize-camera/ initialize-camera plugin documentation on jspsych.org}
     */
    class InitializeCameraPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }
        trial(display_element, trial) {
            this.run_trial(display_element, trial).then((id) => {
                display_element.innerHTML = "";
                this.jsPsych.finishTrial({
                    device_id: id,
                });
            });
        }
        run_trial(display_element, trial) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.askForPermission();
                this.showCameraSelection(display_element, trial);
                this.updateDeviceList(display_element);
                navigator.mediaDevices.ondevicechange = (e) => {
                    this.updateDeviceList(display_element);
                };
                const camera_id = yield this.waitForSelection(display_element);
                const constraints = { video: { deviceId: camera_id } };
                if (trial.width) {
                    constraints.video.width = trial.width;
                }
                if (trial.height) {
                    constraints.video.height = trial.height;
                }
                const stream = yield navigator.mediaDevices.getUserMedia(constraints);
                this.jsPsych.pluginAPI.initializeCameraRecorder(stream);
                return camera_id;
            });
        }
        askForPermission() {
            return __awaiter(this, void 0, void 0, function* () {
                const stream = yield navigator.mediaDevices.getUserMedia({ audio: false, video: true });
                return stream;
            });
        }
        showCameraSelection(display_element, trial) {
            let html = `
      ${trial.device_select_message}
      <select name="camera" id="which-camera" style="font-size:14px; font-family: 'Open Sans', 'Arial', sans-serif; padding: 4px;">
      </select>
      <p><button class="jspsych-btn" id="btn-select-camera">${trial.button_label}</button></p>`;
            display_element.innerHTML = html;
        }
        waitForSelection(display_element) {
            return new Promise((resolve) => {
                display_element.querySelector("#btn-select-camera").addEventListener("click", () => {
                    const camera = display_element.querySelector("#which-camera").value;
                    resolve(camera);
                });
            });
        }
        updateDeviceList(display_element) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                const mics = devices.filter((d) => d.kind === "videoinput" && d.deviceId !== "default" && d.deviceId !== "communications");
                // remove entries with duplicate groupID
                const unique_cameras = mics.filter((mic, index, arr) => arr.findIndex((v) => v.groupId == mic.groupId) == index);
                // reset the list by clearing all current options
                display_element.querySelector("#which-camera").innerHTML = "";
                unique_cameras.forEach((d) => {
                    let el = document.createElement("option");
                    el.value = d.deviceId;
                    el.innerHTML = d.label;
                    display_element.querySelector("#which-camera").appendChild(el);
                });
            });
        }
    }
    InitializeCameraPlugin.info = info;

    return InitializeCameraPlugin;

})(jsPsychModule);
//# sourceMappingURL=index.browser.js.map
