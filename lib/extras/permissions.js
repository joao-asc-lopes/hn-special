_.load(function () {
  var moduleName = null; // The module name
  var modulePermissions = null; // The optional permissions for this module
  var modulePermissionsDescription = null; // The description of the optional permissions
  var originalPermissionStatus = null;
  var isPermissionsEnabled = false; // Are the permissions for this module enabled?
  var theme = window.location.hash.match(/~(.*)/);

  if (theme && theme[1] === "dark") {
    _.injectStylesheet("lib/extras/hn_theme_dark.css");
  }

  // Lookup the state of the current permission
  var checkPermissionState = function () {
    _.sendMessage("permissions#contains", { permissions: modulePermissions }, function (isEnabled) {
      if (originalPermissionStatus === null) {
        originalPermissionStatus = isEnabled;
      }
      isPermissionsEnabled = isEnabled;

      if (originalPermissionStatus !== isPermissionsEnabled) {
        // Permission process went through and state changed
        _.$("#toggle-permissions")[0].remove();
        _.$(".permissions-description")[0].textContent =
          "Permissions " +
          (isEnabled ? "enabled" : "disabled") +
          ". Please click on 'Apply' to make the changes take effect.";
        window.parent.postMessage(
          {
            type: "shrink",
            module: moduleName,
          },
          "*"
        );
      } else {
        _.$(".permissions-state-inverse")[0].textContent = isEnabled ? "Disable" : "Enable";
        _.$(".permissions-description")[0].textContent = modulePermissionsDescription;
      }
    });
  };

  // Toggle the current permission
  var togglePermission = function () {
    if (isPermissionsEnabled) {
      _.sendMessage("permissions#remove", { permissions: modulePermissions }, function () {
        checkPermissionState();
      });
    } else {
      _.sendMessage("permissions#request", { permissions: modulePermissions }, function () {
        checkPermissionState();
      });
    }
  };

  // Bind the events to the toggle button
  document.querySelector("#toggle-permissions").addEventListener("click", togglePermission);

  // Get the optional permissions details for this module
  _.request("/lib/defaults.json", function (results) {
    var permissions = JSON.parse(results).permissions;

    // What module are we requesting optional permissions for?
    moduleName = window.location.hash.replace(/^#|~.*/g, "");

    if (permissions[moduleName] !== undefined) {
      modulePermissions = permissions[moduleName].permissions;
      modulePermissionsDescription = permissions[moduleName].description;

      checkPermissionState();
    } else {
      throw 'Could not find optional permissions for "' + moduleName + '" module';
    }
  });
});
