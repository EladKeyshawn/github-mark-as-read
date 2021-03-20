window.onload = () => {
  const checkSVG = chrome.runtime.getURL("assets/v2/check.svg");
  const checkHollowSVG = chrome.runtime.getURL("assets/v2/check-hollow.svg");
  const heartSVG = chrome.runtime.getURL("assets/v2/heart.svg");
  const heartHollowSVG = chrome.runtime.getURL("assets/v2/heart-hollow.svg");
  const bookmarkSVG = chrome.runtime.getURL("assets/v2/bookmark.svg");
  const bookmarkHollowSVG = chrome.runtime.getURL(
    "assets/v2/bookmark-hollow.svg"
  );

  function getDomain() {
    const url = window.location.href;
    const arr = url.split("?");
    return arr[0];
  }


  async function toggleUrlStateKey(url, stateKey){
    return new Promise((resolve) => {
      chrome.storage.sync.get(url, (data) => {
        const urlState = data[url] || {
          checked: false,
          favorite: false,
          bookmark: false,
        };

        urlState[stateKey] = !urlState[stateKey];
        chrome.storage.sync.set({
          [url]: urlState,
        });

        resolve(urlState);
      });
    })
  }

  function init() {
    document.addEventListener("click", onClick);
    initGithubMarkerAddon();
  }

  function getIcon({ action, isActive }) {
    if (action === "favorite") return isActive ? heartSVG : heartHollowSVG;
    else if (action === "checked") return isActive ? checkSVG : checkHollowSVG;
    else if (action === "bookmark")
      return isActive ? bookmarkSVG : bookmarkHollowSVG;
  }

  function createActionNode({ title, action, iconClassName, linkUrl, link }, isActive) {
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




  function initGithubMarkerAddon() {
    const listElements = document.querySelectorAll(".Box-body li");

    listElements.forEach((listElement) => {
      const link = listElement.querySelector("a");
      if (link) {
        const linkUrl = link.href;
        chrome.storage.sync.get(linkUrl, (data) => {
            const urlState = data[linkUrl] || {};

            const checkboxContainer = createActionNode({
                title: "Link read",
                action: "checked",
                iconClassName: "gm-checkbox-icon",
                linkUrl,
                link,
              },
              urlState.checked);

              const favoriteContainer = createActionNode({
                title: "Favorite Link",
                action: "favorite",
                iconClassName: "gm-heart-icon",
                linkUrl,
                link,
              }, urlState.favorite);

              const bookmarkContainer = createActionNode({
                title: "Bookmark Link",
                action: "bookmark",
                iconClassName: "gm-bookmark-icon",
                linkUrl,
                link,
              }, urlState.bookmark);

              const appContainer = document.createElement("span");
              appContainer.setAttribute("class", "gm-app-container");

              const container = document.createElement("span");
              container.setAttribute("class", "gm-container");

              container.appendChild(checkboxContainer);
              container.appendChild(favoriteContainer);
              container.appendChild(bookmarkContainer);

              appContainer.appendChild(container);

              listElement.insertBefore(appContainer, listElement.childNodes[0]);
        })


      }
    });
  }
  function saveAllLinks(){
    const listElements = document.querySelectorAll(".Box-body li");
    var i = 0;
    listElements.forEach((listElement) => {
        setTimeout(() => {
            const link = listElement.querySelector("a");
            updateUrlState(link, 'checked');
        },100 * i++)
    });
  }

  async function onClick(event) {
    const url = event.target.getAttribute("data-url");

    if (!url) return;

    const parentLINode = event.target.closest("li");
    const linkNode = parentLINode.querySelector("a");

    const { className } = event.target;
    let key;

    if (className === "gm-checkbox-icon") {
      key = "checked";
      linkNode.classList.toggle("gm-checked");
    } else if (className === "gm-heart-icon") {
      key = "favorite";
      linkNode.classList.toggle("gm-favorite");
    } else if (className === "gm-bookmark-icon") {
      key = "bookmark";
      linkNode.classList.toggle("gm-bookmark");
    }

    const newStatus = await toggleUrlStateKey(url, key);
    event.target.src = getIcon({ action: key, isActive: newStatus });
  }

  init();

};
