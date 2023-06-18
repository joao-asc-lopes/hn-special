(function () {
  var _ = {};

  _.toArray = function (collection) {
    return [].slice.call(collection);
  };

  _.$ = function (selector, context) {
    return _.toArray((context ? context : document).querySelectorAll(selector));
  };

  _.load = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback.call(document);
    }
  };

  _.replaceTag = function (container, tag) {
    var parent = container.parentElement;
    var newContainer = _.createElement(tag);
    _.toArray(container.classList).forEach(function (name) {
      newContainer.classList.add(name);
    });
    while (container.firstChild) {
      newContainer.appendChild(container.firstChild);
    }
    parent.replaceChild(newContainer, container);

    return newContainer;
  };

  _.request = function (url, callback) {
    var controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((response) => response.text().then((text) => callback(text)))
      .catch((e) => {
        if (e.name !== "AbortError") {
          throw e;
        }
      });

    return controller;
  };

  _.createElement = function (type, options) {
    var elem = document.createElement(type);
    if (options) {
      if (options.content) elem.textContent = options.content;
      if (options.classes) {
        options.classes.forEach(function (name) {
          elem.classList.add(name);
        });
      }
      if (options.attributes) {
        for (var attr in options.attributes) {
          elem.setAttribute(attr, options.attributes[attr]);
        }
      }
    }

    return elem;
  };

  _.dispatch = function (event, target) {
    event = new Event(event);
    target.dispatchEvent(event);
  };

  _.naturalWords = function (key) {
    return key.replace(/_/g, " ").replace(/^\S/, function (char) {
      return char.toUpperCase();
    });
  };

  _.lowerFirst = function (string) {
    return string.charAt(0).toLowerCase() + string.substr(1, string.length);
  };

  _.clone = function (object) {
    return JSON.parse(JSON.stringify(object));
  };

  _.isTitleLink = function (link) {
    return (
      link.parentElement.classList.contains("titleline") &&
      !link.getAttribute("href").match(/^(news|newest|newcomments|threads|show|ask|jobs)\?\S+/)
    );
  };

  _.isCommentLink = function (link) {
    if (!link.getAttribute("href").match(/^reply\?id/)) {
      var parent = link.parentElement;
      while (parent && parent.tagName.toLowerCase() !== "td") {
        if (parent.tagName.toLowerCase() === "span" && parent.classList.contains("comment"))
          return true;
        parent = parent.parentElement;
      }
    }
    return false;
  };

  _.isCommentPage = function () {
    var title = document.getElementsByClassName("title")[0];
    var link = title && title.children[1];
    return (
      title &&
      link &&
      link.nodeName.toLowerCase() === "a" &&
      !link.getAttribute("href").match(/^\/x\?.+/)
    );
  };

  _.isListingPage = function () {
    var title = document.getElementsByClassName("title")[0];
    return title && title.parentElement.childElementCount === 3;
  };

  _.sendMessage = function (target, params, callback) {
    var parts = target.split("#");
    chrome.runtime.sendMessage({ module: parts[0], action: parts[1], params: params }, callback);
  };

  _.injectStylesheet = function (path) {
    var theme = document.createElement("link");
    theme.rel = "stylesheet";
    theme.type = "text/css";
    theme.href = chrome.runtime.getURL(path);
    theme.onload = function () {
      document.documentElement.style.display = "";
      document.documentElement.style.backgroundColor = "";
    };
    document.getElementsByTagName("head")[0].appendChild(theme);
  };

  this._ = _;
}.call(this));
