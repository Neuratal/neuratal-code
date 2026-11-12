;(function () {
  var key = "neuratal-theme-id"
  var themeId = localStorage.getItem(key) || localStorage.getItem("neuratal-theme-id") || "neuratal"
  if (themeId === "oc-2" || themeId === "neuratal") themeId = "neuratal"

  var scheme = localStorage.getItem("neuratal-color-scheme") || localStorage.getItem("neuratal-color-scheme") || "system"
  var isDark = scheme === "dark" || (scheme === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
  var mode = isDark ? "dark" : "light"

  document.documentElement.dataset.theme = themeId
  document.documentElement.dataset.colorScheme = mode
  document.documentElement.style.backgroundColor = isDark ? "#05060A" : "#F7F7FC"

  // Update theme-color meta tag to match app color scheme
  var metas = document.querySelectorAll("meta[name='theme-color']")
  if (metas.length > 0) metas[0].setAttribute("content", isDark ? "#05060A" : "#F7F7FC")

  var css = localStorage.getItem("neuratal-theme-css-" + mode) || localStorage.getItem("neuratal-theme-css-" + mode)
  if (css) {
    var style = document.createElement("style")
    style.id = "oc-theme-preload"
    style.textContent =
      ":root{color-scheme:" +
      mode +
      ";--text-mix-blend-mode:" +
      (isDark ? "plus-lighter" : "multiply") +
      ";" +
      css +
      "}"
    document.head.appendChild(style)
  }
})()
