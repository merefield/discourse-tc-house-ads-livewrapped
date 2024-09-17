import discourseComputed from "discourse-common/utils/decorators";
import { withPluginApi } from "discourse/lib/plugin-api";
import { scheduleOnce } from "@ember/runloop";
import { isTesting } from "discourse-common/config/environment";
import { isBlank } from "@ember/utils";
import loadScript from "discourse/lib/load-script";
import RSVP from "rsvp";

const PLUGIN_ID = "discourse-tc-ads-hack";
const LIVEWRAPPED_SCRIPT_SRC = "https://lwadm.com/lw/pbjs"
const GOOGLE_PUBLISHER_TAG_SCRIPT_SRC = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";

let _mainLoaded = false,
  _mainPromise = null,
  _GPTLoaded = false,
  _GPTPromise = null,
  _c = 0;

  function loadMainAdScript(pid) {
    if (_mainLoaded) {
      return RSVP.resolve();
    }

    if (_mainPromise) {
      return _mainPromise;
    }

    _mainPromise = loadScript(LIVEWRAPPED_SCRIPT_SRC + "?pid=" + pid, {
      scriptTag: true,
    }).then(function () {
      _mainLoaded = true;
    });

    return _mainPromise;
  }

  function loadGooglePublisherTagScript () {
    if (_GPTLoaded) {
      return RSVP.resolve();
    }

    if (_GPTPromise) {
      return _GPTPromise;
    }

    _GPTPromise = loadScript(GOOGLE_PUBLISHER_TAG_SCRIPT_SRC, {
      scriptTag: true,
    }).then(function () {
      _GPTLoaded = true;
    });

    return _GPTPromise;
  }

export default {
  name: "house-ads-livewrapped",
  initialize(container) {
    withPluginApi("0.8.40", (api) => {

      window.lwhb = window.lwhb || { cmd: [] };
      window.googletag = window.googletag || { cmd: [] };

      api.onPageChange(() => {
        // console.log('page flip');
        // window.lwhb.cmd.push(() => {
        //   window.lwhb.resetPage(true)
        // })
      });

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

        _triggerAds() {
          // console.log('ad number: ' + this.adIndex);
          if (isTesting() || this.adIndex < 1 || this.adIndex === null || this.adIndex === undefined) {
            return; // Don't load external JS during tests
          };

          loadMainAdScript(settings.house_ads_livewrapped_source_script_pid).then(
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

        didInsertElement() {
          this._super();
          scheduleOnce("afterRender", this, this._triggerAds);
        },

        willDestroyElement() {
          window.lwhb.cmd.push(() => {
            window.lwhb.removeAdUnit({
              tagId: settings.house_ads_livewrapped_source_tag_id_base_string_desktop.replace("#", this.adIndex)
            });
            window.lwhb.removeAdUnit({
              tagId: settings.house_ads_livewrapped_source_tag_id_base_string_mobile.replace("#", this.adIndex)
            });
          });
        }
      })
    })
  }
}
