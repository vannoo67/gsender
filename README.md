# ![gSender logo](https://github.com/Sienci-Labs/sender/blob/master/src/app/images/icon-git.png?raw=true)gSender: connect to and control [Grbl](https://github.com/grbl/grbl)-based CNCs

gSender is a feature-packed CNC interface software designed to be clean and easy to learn while retaining a depth of capabilites for advanced users. Its development was begun out of a passion for hobby CNC machines: an interface rebuilt to suit the needs of the at-home CNC user.
* Accepts standard, GRBL-compliant g-code and has been verified to work with many of the common CAM programs
* Began development to bring new concepts to the existing landscape of GRBL senders in an effort to advance functionality and ease-of-use
* Javascript-based CNC interface software which leverages [Electron](https://www.electronjs.org/) for cross platform use
* Is a branch off of the popular [CNCjs CNC controller interface](https://github.com/cncjs/cncjs) 

Some things that we’re looking to accomplish with this sender:
* Reliability of operation
* Accommodates all ranges of computing systems (low-end PC to RasPi | ‘light mode’)
* Highly easy to use
* Makes available all normally expected functions
* Addresses common error throwing conditions automatically
* Built-in gadgets for surface probing, stock flattening, firmware editing, and g-code editing with syntax highlighting, command navigation, and more
* 3D cutting visualization

![gSender](https://sienci.com/wp-content/uploads/2021/05/gSender-Main-Screen-0.6.4.png)

## 💻 Download [![Github All Releases](https://img.shields.io/github/downloads/Sienci-Labs/gsender/total.svg)]()

gSender is available for the following systems and does not yet support headless Pi operation
| ![Windows](https://github.com/EgoistDeveloper/operating-system-logos/blob/master/src/48x48/windows.png)<br>Windows (x32) | ![Windows](https://github.com/EgoistDeveloper/operating-system-logos/blob/master/src/48x48/windows.png)<br>Windows (x64) | ![Mac](https://github.com/EgoistDeveloper/operating-system-logos/blob/master/src/48x48/mac.png)<br>Mac (Intel) | ![Linux](https://github.com/EgoistDeveloper/operating-system-logos/blob/master/src/48x48/linux.png)<br>Linux | ![RasPi](https://github.com/iiiypuk/rpi-icon/blob/master/48.png)<br>Ras Pi
|-|-|-|-|-
 ``` Available ```[EXE](https://github.com/Sienci-Labs/gsender/releases/download/v0.6.5/gSender-0.6.5-windows-x86.exe) | ``` Available ``` [EXE](https://github.com/Sienci-Labs/gsender/releases/download/v0.6.5/gSender-0.6.5-windows-x64.exe) | ``` Available ``` [DMG](https://github.com/Sienci-Labs/gsender/releases/download/v0.6.5/gSender-0.6.5.dmg) | ``` Available ``` [DEB](https://github.com/Sienci-Labs/gsender/releases/download/v0.6.5/gSender_0.6.5_amd64.deb) | ``` Available ``` [ApIm](https://github.com/Sienci-Labs/gsender/releases/download/v0.6.5/gSender-0.6.5-armv7l.AppImage)

[Check out the latest releases here.](https://github.com/Sienci-Labs/gsender/releases/)

## 📦 Current Features

* [GRBL](https://github.com/gnea/grbl/releases) controllers supported
* Smart machine connection
* 3-axis digital readout (DRO)
* All-directional jogging with XY diagonals, jog presets, and incremental/continuous single-button handling
* Zero-setting and gotos (independant and combined)
* Probing in any direction plus safe continuity detection ensures no broken cutting tools
* Full imperial/metric compatibility
* Responsive screen design and workspace customizations including visualizer light and dark theme
* 3D toolpath visualization (no machine connection required)
* File insight on load (feed range, spindle range, tools used, estimated cutting time, and overall, max, and min dimensions)
* Feed override and active job status indicators
* Keybindings available for most functions for external keyboard/keypad control
* Safe height movements
* Homing cycle and quick-movement locations available for machines with homing hardware
* Full spindle/laser support via manual control widgets and live overrides
* Custom macros buttons with optional macro variables
* Lightweight mode reduces processing intensity on less powerful hardware or when running larger files
* Easy workspace swapping for more advanced jigging or alignment work
* Optional automatic handling for common error throwing gcode
* Firmware tool for easier GRBL eeprom changes, loading defaults, and GRBL flashing
* Pre-build machine profiles, including:
    - Shapeoko
    - X-carve
    - LongMill
    - OpenBuilds CNCs
    - Onefinity
    - BobsCNC CNCs
    - CNC4Newbie CNCs
    - Mill Right CNCs
    - Ooznest WorkBee
    - Nomad
    - Carvey
    - Mill One


## 🎓 Documentation

All up-to-date documentation on gSender can be found here: [https://sienci.com/gsender-documentation/](https://sienci.com/gsender-documentation/)

If you encounter issues or would like to recommend improvements for gSender, there's a link for feedback submission on the documentation page. We also have a place for discussion on our forum: [https://forum.sienci.com/c/gsender/](https://forum.sienci.com/c/gsender/)


## 📃 Example Files

If you'd like to test gSender's capabilities, there are several gcode files in the [examples](https://github.com/Sienci-Labs/sender/tree/master/examples) directory that can be downloaded and run locally.


## 💼 License

gSender is free software, provided as-is and available under the [GNU GPLv3 license](https://github.com/Sienci-Labs/sender/blob/master/LICENSE).


## 👓 Further Use

gSender is also designed in a way that it can be run locally on your computer browser or otherwise compiled for use on other systems which aren't listed in the downloads. There will soon be documentation on how you can set this up yourself listed below once there's been a bit more testing completed.


## 🕣 Development History

### Open Beta 0.6.5 (May 28, 2021)
* New tool for surfacing
* Moved most controllerEvent listeners to redux store to improve performance
* Updates to Laser/Spindle widget to better track on/off state
* New 'About' information
* Fixed file units mismatch with preferred units

### Open Beta 0.6.4 (May 14, 2021)
* Improvements to job handling
* Tooltips created for data entry points
* Splashscreen tweaks
* Working PI build!?

### Closed Beta 0.6.0 (May 7, 2021)
* Altered how files are loaded to improve UI performance
* Added estimated time to run calculation on file load
* File attributes now persists on disconnect
* Fixed issues with macro editing and adding

### Closed Beta 0.5.8 (Apr 30, 2021)
* New experimental Winx32 and RasPi builds
* Firmware tool improvements and bug fixes
* More accurate parsing of tool and spindle speeds
* Various keybind bug fixes, addressing special characters
* Added recent files button and file unloading
* New Check mode state for testing files before starting job
* Verbose commands now in console
* New macro behaviours and import/export
* gSender now officially licensed under GPLv3
* Homing state and other small bugs and styling fixes
* New logo/branding throughout!

### Closed Beta 0.5.6 (Apr 1, 2021)
* Fixed jog stepping with keybindings, continuous jogging bugs, and other jogging unreliabilities
* Added new keybindings for improved, keyboard-based actions (unsure if issues with particular symbols such as '*' have persisted)
* Took another look through to ensure proper unit consistency and conversion
* Repairs to probing
* More work done on the Firmware tool for refined functions and display
* Indication of current jog preset selected
* New base modals created for use across tools and confirmations

### Closed Beta 0.5.5 (Mar 26, 2021)
* Added combo laser/spindle widget (toggleable in settings)
* Re-designed location widget
* Re-designed layout of job status information to include min and max extents for file dimensions
* Added safe-height retraction settings for goto XYZ0 (accessible in settings)
* Added splash screen on application load
* Migration to most recent Electron release plus implemented logging

### Closed Beta 0.5.4 (Mar 19, 2021)
* Set up in-app feedback sumbmission button
* Better formatting and sizing of various gSender elements
* New visualizer theme "light mode" available in settings
* Experimental "lightweight" options to reduce visualizer rendering computation (meant for less powerful hardware)
* Keybinding tweaks to prevent jogging runaway and other small bugs
* New bottom, left-hand toast notifications for feedback on certain actions
* Imperial / metric units should now extend to all aspects of the sender
* Buttons to goto X, Y, and Z individually
* Better handling of Alarm states with unlock
* New g-code validation on file load and job run
* New feature to automatically download updates for future gSender Windows versions
* Better handling of movement cancel button so that all positioning-related movements should be able to be cancelled
* Migration to most recent React
* New in-app updating management prompted via server releases

### Closed Beta 0.1 (Mar 5, 2021)
* gSender decided as official name :D
* Buttons added for homing quicktravel, jog cancel, diagonal jog, and an awesome isocube!
* New macros widget
* New customizable settings: jogging presets, baud rate, and more.
* Visual overhaul on settings, probing, file attributes, and visual consistency accross entire program
* Logo implemented and the loading of Louis
* Responsiveness overhaul on entire program
* Mac (intel) version released March 8
    
### Closed Alpha 3.0 (Feb 19, 2021)
* Continuous jogging!
* Unit switching in settings (metric/imperial)
* Keybinding functionality to jog and other key functions with keypresses (can change bindings in settings)
* Probe returning to original position
* New, separate settings files won't interfere with CNCjs
* Small colour and styling changes to hopefully increase clarity of items on the screen
* Some responsiveness addressed to help keep sender looking good across many screen sizes (though we still have a ways to go)
* Fixes to excessive decimal places in some areas
* New Firmware Tool in progress but will probably break your board right now

### Closed Alpha 2.0 (Feb 5, 2021)
* Resolved non-functional buttons, missing console, and some errors during sending
* New jogging widget and jog presets
* Improved probe function plus probe continuity checking
* New file attributes on load
* More visual improvements and a large buildout in new settings options

### Closed Alpha 1.0 (Jan 29, 2021)
* Still highly dependant on great infrastructure created by the CNCjs team
* Established Electron installer, git, and certificates 
* Large visual overhaul in how widgets and displayed and operational flow of sender
* New probing widget, machine profiles, settings, and visualizer

### Notable features still in progress:
* "Flatten", "Surface", and "Calibrate" tools
* Handling tool changing
* Event hooks
* Joystick control
* Settings saving
* G-code editing
* Pendant
* Full 3D Visualization
