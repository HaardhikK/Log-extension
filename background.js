let popupWindowId = null;
const WIDTH = 360;
const HEIGHT = 520;

chrome.action.onClicked.addListener(async () => {
  const popupUrl = chrome.runtime.getURL("popup.html");

  // Re-focus if already open
  if (popupWindowId !== null) {
    try {
      await chrome.windows.update(popupWindowId, { focused: true });
      return;
    } catch (e) {
      popupWindowId = null;
    }
  }

  // Get screen dimensions
  const screenInfo = await chrome.system.display.getInfo();
  const primaryDisplay = screenInfo.find(d => d.isPrimary) || screenInfo[0];
  const screenWidth = primaryDisplay.workArea.width;
  const screenHeight = primaryDisplay.workArea.height;

  const left = screenWidth - WIDTH - 24; // 24px margin from right edge
  const top = Math.floor((screenHeight - HEIGHT) / 2); // vertical center

  const win = await chrome.windows.create({
    url: popupUrl,
    type: "popup",
    width: WIDTH,
    height: HEIGHT,
    focused: true,
    top,
    left
  });

  popupWindowId = win.id;

  chrome.windows.onBoundsChanged.addListener((changedWin) => {
    if (changedWin.id === popupWindowId) {
      chrome.windows.update(popupWindowId, {
        width: WIDTH,
        height: HEIGHT
      });
    }
  });

  chrome.windows.onRemoved.addListener((closedWinId) => {
    if (closedWinId === popupWindowId) {
      popupWindowId = null;
    }
  });
});
