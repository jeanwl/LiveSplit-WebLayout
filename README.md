# LiveSplit Web Layout

Custom layout for LiveSplit, intended as a livestream graphic, viewable on web.

![Demo GIF](./docs/demo.gif)

## Setup

> :warning: **This layout relies on beta features in LiveSplit!** If you have the latest stable version (1.8.29), the layout will not be able to connect to LiveSplit. Download the [latest development build](https://raw.githubusercontent.com/LiveSplit/LiveSplit.github.io/artifacts/LiveSplitDevBuild.zip) to fix.

1. Download the [code](https://github.com/jeanwll/LiveSplitOne-OBS-Layout/archive/refs/heads/main.zip) and extract into a new folder.
2. In OBS Studio (or whatever other program you use), create a new Browser Source, enable Local File, and set it to the downloaded `index.html` file.
3. Open LiveSplit, right-click, go to `Control`, and click on `Start WebSocket Server`. The layout on OBS should automatically update.
4. Begin running! The layout will automatically update with any splits.

## Background Blur

It's possible to blur the background of the layout in OBS, which you may prefer for a cleaner look (shown in the GIF above).

1. Download and install the [obs-composite-blur](https://github.com/FiniteSingularity/obs-composite-blur) plugin by FiniteSingularity.
2. In OBS, right-click on the game capture source, go to `Filters`, and add a `Composite Blur` filter.
3. In the filter settings, change the Effect Mask to `Source`, and set the Paramaters to point to the Browser Source, using the Alpha Channel as the mask. Tweak the Blur Radius, and other settings, to your liking.
