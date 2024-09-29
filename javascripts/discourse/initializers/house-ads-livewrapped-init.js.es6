import discourseComputed from "discourse-common/utils/decorators";
import { withPluginApi } from "discourse/lib/plugin-api";
import { scheduleOnce } from "@ember/runloop";
import { isTesting } from "discourse-common/config/environment";
import { isBlank } from "@ember/utils";
import loadScript from "discourse/lib/load-script";
import RSVP from "rsvp";

const PLUGIN_ID = "discourse-tc-ads-hack";

export default {
  name: "house-ads-livewrapped",
  initialize(container) {
    withPluginApi("0.8.40", (api) => {

      window.lwhb = window.lwhb || { cmd: [] };
      window.googletag = window.googletag || { cmd: [] };

      api.modifyClass("component:ad-slot", {
        pluginId: PLUGIN_ID,

        @discourseComputed("placement", "postNumber", "indexNumber")
        availableAdTypes(placement, postNumber, indexNumber) {
          return ["house-ad"]
        },
      });

      api.modifyClass("component:house-ad", {
        pluginId: PLUGIN_ID,
        classNameBindings: ['isValidAdSpot'],

        @discourseComputed("adIndex")
        isValidAdSpot() {
          if (this.adIndex !== undefined && this.adIndex !== null && this.adIndex !== 0) {
            return 'active-ad-location';
          } else {
            return 'inactive-ad-location';
          }
        },

        @discourseComputed
        tagIdBaseStringDesktop() {
          return settings.house_ads_livewrapped_source_tag_id_base_string_desktop;
        },

        @discourseComputed
        tagIdBaseStringMobile() {
          return settings.house_ads_livewrapped_source_tag_id_base_string_mobile;
        },

        @discourseComputed("postNumber","highest_post_number")
        adIndex(postNumber) {
          if (postNumber === undefined || postNumber === null) {return 0}

          let topicLength = this.highest_post_number;
          let every = this.site.get("house_creatives").settings.after_nth_post;
          let baseIndex = 0;

          if (postNumber !== topicLength) {
            if (settings.house_ads_livewrapped_always_start_at_op) {
              baseIndex = (postNumber + every - 1)/ every
            } else {
              baseIndex = postNumber/every;
            }
          } else {
            baseIndex = (postNumber + every - 1)/every

            if (settings.house_ads_livewrapped_always_at_last_post) {
              baseIndex = Math.ceil(baseIndex)
            }
          }

          if (baseIndex != Math.floor(baseIndex)) {return 0}

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

        @discourseComputed("postNumber", "placement")
        showAfterPost(postNumber, placement) {
          if (!postNumber && placement !== "topic-list-between") {
            return true;
          }

          return true;
        },
      })
    })
  }
}
