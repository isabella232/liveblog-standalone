var $ = require("./lib/qsa");
window.googletag = window.googletag || {cmd: []};
var gptLoaded = false;
var gptSetup = false;

var slug = window.location.pathname.replace(/[^\/]+\.html$/, "").split("/").pop();
var storyId = "liveblog-" + (slug || "localhost");
var isStagingServer = window.location.hostname == "stage-apps.npr.org";
var adSizeArray = ["fluid", [1300, 250]];
var adUnitString = "/6735/n6735.npr/news_politics_elections";
// Medium and small breakpoints
if (window.innerWidth < 1024) {
  adUnitString = "/6735/n6735.nprmobile/news_politics_elections";
  adSizeArray.push([300, 250]);
}
var advelvetTargeting = [String(Math.floor(Math.random() * 20) + 1)];

var observer = new IntersectionObserver(function([event]) {
  if (event.isIntersecting) {
    observer.disconnect();
    var gpt = document.createElement("script");
    gpt.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    gpt.async = true;
    gpt.defer = true;
    document.body.appendChild(gpt);
    console.log("Lazy-loading ad code...");
    gptLoaded = true;
  }
});

var guid = 0;

class GoogleAd extends HTMLElement {
  constructor() {
    super();
    if (!gptLoaded) observer.observe(this);
  }

  connectedCallback() {
    var id = this.getAttribute("id");
    if (id) return;
    id = "google-ad-" + guid++;
    this.setAttribute("id", id);

    googletag.cmd.push(() => {
      var adService = googletag.pubads();

      if (!gptSetup) {
        adService.enableSingleRequest();
        adService.collapseEmptyDivs();
        adService.setTargeting("advelvet", advelvetTargeting);
        adService.setTargeting("storyid", [storyId]);
        adService.setTargeting("testserver", [isStagingServer.toString()]);
        googletag.enableServices();
        gptSetup = true;
      }

      googletag.defineSlot(adUnitString, adSizeArray, id).addService(adService);
      adService.addEventListener("slotRenderEnded", event => {
        if (event.slot.getSlotElementId() != id) return;
        this.classList.remove("pending");
        if (!event.isEmpty) {
          this.classList.add("has-ad");
        } else {
          console.log(`No ad returned for ${id}`);
        }
      });
      googletag.display(id);
    });
  }
}

try {
  window.customElements.define("google-ad", GoogleAd);
} catch (err) {
  console.log(`Unable to define google-ad tag: your browser may not support custom elements`);
}