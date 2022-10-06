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
  name: "house-ads-hack-edits",
  initialize(container) {
    withPluginApi("0.8.40", (api) => {

      window.lwhb = window.lwhb || { cmd: [] }; 

      api.modifyClass("component:house-ad", {
        pluginId: PLUGIN_ID,

        _triggerAds() {
          if (isTesting()) {
            return; // Don't load external JS during tests
          };
      
          loadMainAdScript(settings.house_ads_hack_source_script, settings.house_ads_hack_source_script_pid).then(
            () => {
              window.lwhb.cmd.push(() => {
                window.lwhb.loadAd({
                  tagId: settings.house_ads_hack_source_tag_id_base_string.replace("#", this.adIndex)
                });
              });
            }
          );
        },

        @discourseComputed("postNumber")
        adIndex(postNumber) {
          return postNumber/this.site.get("house_creatives").settings.after_nth_post;
        },

        @discourseComputed("adIndex")
        thisId(adIndex) {
          return settings.house_ads_hack_source_tag_id_base_string.replace("#", adIndex)
        },

        

        didInsertElement() {
          this._super();
          scheduleOnce("afterRender", this, this._triggerAds);
        },
      
      })
    })
  }
}
