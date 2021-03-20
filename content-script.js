class ACTIONS {
  static BOOKMARK = "bookmark";
  static FAVORITE = "favorite";
  static CHECKED = "checked";
}
function getDomain() {
  const url = window.location.href;
  const arr = url.split("?");
  return arr[0];
}

window.onload = () => {
  const checkSVG = chrome.runtime.getURL("assets/v2/check.svg");
  const checkHollowSVG = chrome.runtime.getURL("assets/v2/check-hollow.svg");
  const heartSVG = chrome.runtime.getURL("assets/v2/heart.svg");
  const heartHollowSVG = chrome.runtime.getURL("assets/v2/heart-hollow.svg");
  const bookmarkSVG = chrome.runtime.getURL("assets/v2/bookmark.svg");
  const bookmarkHollowSVG = chrome.runtime.getURL(
    "assets/v2/bookmark-hollow.svg"
  );

  init();

  async function toggleUrlStateKey(url, stateKey) {
    const urlState = await getUrlState(url);

    return new Promise((resolve) => {
      urlState[stateKey] = !urlState[stateKey];

      chrome.storage.sync.set({
        [url]: urlState,
      });

      resolve(urlState);
    });
  }

  async function getUrlState(url) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(url, (data) => {
        const urlState = data[url] || {
          checked: false,
          favorite: false,
          bookmark: false,
        };

        resolve(urlState);
      });
    });
  }

  function init() {
    document.addEventListener("click", onClick);
    initGithubMarkerAddon();
  }

  function getIcon({ action, isActive }) {
    switch (action) {
      case ACTIONS.CHECKED: return isActive ? checkSVG : checkHollowSVG;
      case ACTIONS.FAVORITE: return isActive ? heartSVG : heartHollowSVG;
      case ACTIONS.BOOKMARK: return isActive ? bookmarkSVG : bookmarkHollowSVG;
    }
  }

  function createActionNode(
    { title, action, iconClassName, linkUrl, link },
    isActive
  ) {
    const containerNode = document.createElement("span");
    containerNode.setAttribute("class", "gm-wrapper");
    containerNode.setAttribute("title", title);

    if (isActive) link.setAttribute("class", `gm-${action}`);

    const iconNode = document.createElement("img");
    iconNode.setAttribute("src", getIcon({ action, isActive }));
    iconNode.setAttribute("class", iconClassName);
    iconNode.setAttribute("data-url", linkUrl);

    containerNode.appendChild(iconNode);

    return containerNode;
  }

  async function initGithubMarkerAddon() {
    const listElements = document.querySelectorAll(".Box-body li");

    for (const listElement of listElements) {
      const link = listElement.querySelector("a");
      if (!link) {
        continue;
      }

      const linkUrl = link.href;
      const urlState = await getUrlState(linkUrl);

      const checkboxContainer = createActionNode(
        {
          title: "Link read",
          action: "checked",
          iconClassName: "gm-checkbox-icon",
          linkUrl,
          link,
        },
        urlState.checked
      );

      const favoriteContainer = createActionNode(
        {
          title: "Favorite Link",
          action: "favorite",
          iconClassName: "gm-heart-icon",
          linkUrl,
          link,
        },
        urlState.favorite
      );
      const bookmarkContainer = createActionNode(
        {
          title: "Bookmark Link",
          action: "bookmark",
          iconClassName: "gm-bookmark-icon",
          linkUrl,
          link,
        },
        urlState.bookmark
      );

      const appContainer = document.createElement("span");
      appContainer.setAttribute("class", "gm-app-container");
      const container = document.createElement("span");
      container.setAttribute("class", "gm-container");
      container.appendChild(checkboxContainer);
      container.appendChild(favoriteContainer);
      container.appendChild(bookmarkContainer);
      appContainer.appendChild(container);
      listElement.insertBefore(appContainer, listElement.childNodes[0]);
    }
  }

  const iconCssClassToAction = {
    "gm-checkbox-icon": ACTIONS.CHECKED,
    "gm-heart-icon": ACTIONS.FAVORITE,
    "gm-bookmark-icon": ACTIONS.BOOKMARK,
  };

  const actionToLinkCssClass = {
    [ACTIONS.CHECKED]: "gm-checked",
    [ACTIONS.FAVORITE]: "gm-favorite",
    [ACTIONS.BOOKMARK]: "gm-bookmark",
  };

  async function onClick(event) {
    const url = event.target.getAttribute("data-url");
    if (!url) return;

    const parentLINode = event.target.closest("li");
    const linkNode = parentLINode.querySelector("a");

    const { className } = event.target;
    const action = iconCssClassToAction[className];

    try {
      const urlState = await toggleUrlStateKey(url, action);
      event.target.src = getIcon({ action, isActive: urlState[action] });
      linkNode.classList.toggle(actionToLinkCssClass[action]);
    } catch (err) {
      alert(err);
    }
  }
};
