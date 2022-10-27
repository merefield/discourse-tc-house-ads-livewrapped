import discourseComputed from "discourse-common/utils/decorators";
import { withPluginApi } from "discourse/lib/plugin-api";
import { scheduleOnce } from "@ember/runloop";
import { isTesting } from "discourse-common/config/environment";
import loadScript from "discourse/lib/load-script";
import RSVP from "rsvp";

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
  name: "house-ads-livewrapped",
  initialize(container) {
    withPluginApi("0.8.40", (api) => {

      window.lwhb = window.lwhb || { cmd: [] }; 

      api.modifyClass("component:house-ad", {
        pluginId: PLUGIN_ID,

        _triggerAds() {
          if (isTesting() || this.adIndex < 1 || this.adIndex === null || this.adIndex === undefined) {
            return; // Don't load external JS during tests
          };
      
          loadMainAdScript(settings.house_ads_livewrapped_source_script, settings.house_ads_livewrapped_source_script_pid).then(
            () => {
              window.lwhb.cmd.push(() => {
                window.lwhb.loadAd({
                  tagId: settings.house_ads_livewrapped_source_tag_id_base_string_desktop.replace("#", this.adIndex)
                });
                window.lwhb.loadAd({
                  tagId: settings.house_ads_livewrapped_source_tag_id_base_string_mobile.replace("#", this.adIndex)
                });
              });
            }
          );
        },

        @discourseComputed("postNumber")
        adIndex(postNumber) {
          if (postNumber === undefined || postNumber === null) {return 0}

          let baseIndex = postNumber/this.site.get("house_creatives").settings.after_nth_post;

          if (baseIndex < 3) {
            return baseIndex
          } else {
            return `2_${baseIndex - 2}`
          }
        },

        @discourseComputed("adIndex")
        thisDesktopId(adIndex) {
          return settings.house_ads_livewrapped_source_tag_id_base_string_desktop.replace("#", adIndex)
        },

        @discourseComputed("adIndex")
        thisMobileId(adIndex) {
          return settings.house_ads_livewrapped_source_tag_id_base_string_mobile.replace("#", adIndex)
        },

        didInsertElement() {
          this._super();
          scheduleOnce("afterRender", this, this._triggerAds);
        },
      
      })
    })
  }
}
