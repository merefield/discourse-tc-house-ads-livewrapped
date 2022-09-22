import discourseComputed from "discourse-common/utils/decorators";
import { withPluginApi } from "discourse/lib/plugin-api";

const PLUGIN_ID = "discourse-tc-ads-hack";

let _loaded = false,
  _promise = null,
  _c = 0;

  function loadMainAdScript(site_path_query, pid) {
    if (_loaded) {
      return RSVP.resolve();
    }
  
    if (_promise) {
      return _promise;
    }
  
    _promise = loadScript("https://" + site_path_query + pid, {
      scriptTag: true,
    }).then(function () {
      _loaded = true;
    });
  
    return _promise;
  }

export default {
  name: "house-ads-hack-edits",
  initialize(container) {
    withPluginApi("0.8.40", (api) => {
      api.modifyClass("component:house-ad", {
        pluginId: PLUGIN_ID,

        _triggerAds() {
          if (isTesting()) {
            return; // Don't load external JS during tests
          }
      
          loadMainAdScript(settings.house_ads_hack_source_script, settings.house_ads_hack_source_script_pid).then(
            function () {
              if (this.divs.length > 0) {
                let abkw = window.abkw || "";
                window.AdButler.ads.push({
                  handler: function (opt) {
                    window.AdButler.register(
                      opt.place.publisherId,
                      opt.place.zoneId,
                      opt.place.dimensions,
                      opt.place.divId,
                      opt
                    );
                  },
                  opt: {
                    place: this.divs.pop(),
                    keywords: abkw,
                    domain: adserverHostname,
                    click: "CLICK_MACRO_PLACEHOLDER",
                  },
                });
              }
            }.bind(this)
          );
        },

        @discourseComputed("postNumber")
        adIndex(postNumber) {
          return postNumber/this.site.get("house_creatives").settings.after_nth_post;
        },

        didInsertElement() {
          this._super();
          scheduleOnce("afterRender", this, this._triggerAds);
        },
      
      })
    })
  }
}
