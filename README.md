# LiveSplit Web Layout

Custom layout for LiveSplit, intended as a livestream graphic, viewable on web.

![Demo GIF](./docs/demo.gif)

## Setup

> [!WARNING]
>
> **This layout relies on beta features in LiveSplit!** If you have the latest stable version (1.8.29), the layout will not be able to connect to LiveSplit.
>
> Download the [latest development build](https://raw.githubusercontent.com/LiveSplit/LiveSplit.github.io/artifacts/LiveSplitDevBuild.zip) to fix.

1. Download the [code](https://github.com/jeanwll/LiveSplitOne-OBS-Layout/archive/refs/heads/main.zip) and extract into a new folder.
2. In OBS Studio (or whatever other program you use), create a new Browser Source, enable Local File, and set it to the downloaded `index.html` file. Make sure the browser source is set to match the resolution of your screen (ex. 1920x1080).
3. Open LiveSplit, right-click, go to `Control`, and click on `Start WebSocket Server`. The layout on OBS should automatically update.
4. Begin running! The layout will automatically update with any split events that occur.
### Customization Settings

You can customize the layout by adding custom CSS to the OBS Browser Source. Copy the code below and edit as you wish.

```css
:root {
    /* Customization Options */
    --scale: 1;
    --bottom: 15px;
    --right: 15px;
    --splitHeight: 41px;
    --maxSplits: 6;
}
```

-   `scale`: Scale of the layout, for those that may find the default to be small. (Default value: `1`)
-   `bottom` and `right`: Position of the layout on-screen, relative to the bottom-right hand corner. (Default values: `15px`)
-   `splitHeight`: Used for spacing of the splits containers. (Default value: `41px`)
-   `maxSplits`: Maximum number of splits to display at once. (Default value: `6`)

## Background Blur

It's possible to blur the background of the layout in OBS, which you may prefer for a cleaner look (shown in the GIF above).

1. Download and install the [obs-composite-blur](https://github.com/FiniteSingularity/obs-composite-blur) plugin by FiniteSingularity.
2. In OBS, right-click on the game/window/desktop capture source, go to `Filters`, and add a `Composite Blur` filter.
3. In the filter settings, change the Effect Mask to `Source`, and set the Paramaters to point to the Browser Source with the custom LiveSplit layout, using the Alpha Channel as the mask. Tweak the Blur Radius, and other settings, to your liking.
