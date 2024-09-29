import Component from "@glimmer/component";
import { action } from "@ember/object";
import { concat } from "@ember/helper";
import { tracked } from "@glimmer/tracking";
import loadScript from "discourse/lib/load-script";
import { service } from "@ember/service";
import { isTesting } from "discourse-common/config/environment";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import willDestroy from "@ember/render-modifiers/modifiers/will-destroy";

const PLUGIN_ID = "discourse-tc-ads-hack";
const LIVEWRAPPED_SCRIPT_SRC = "https://lwadm.com/lw/pbjs";
const GOOGLE_PUBLISHER_TAG_SCRIPT_SRC = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";

export default class LivewrappedAd extends Component {
        
  @action
  async triggerAd() {
    if (isTesting() || this.args.adIndex < 1 || this.args.adIndex === null || this.args.adIndex === undefined) {
      return; // Don't load external JS during tests
    };

    await loadScript(LIVEWRAPPED_SCRIPT_SRC + "?pid=" + settings.house_ads_livewrapped_source_script_pid, {
      scriptTag: true,
    });
    console.log('INFO: lwc triggered: ' + this.args.tagIdBaseString.replace("#", this.args.adIndex))

    window.lwhb.cmd.push(() => {
      window.lwhb.loadAd({
        tagId: this.args.tagIdBaseString.replace("#", this.args.adIndex)
      });
    });
  }

  @action
  triggerDestroy() {
    window.lwhb.cmd.push(() => {
      window.lwhb.removeAdUnit({
        tagId: this.args.tagIdBaseString.replace("#", this.args.adIndex)
      });
    })
  }

 <template>
   <div {{didInsert this.triggerAd}} {{willDestroy this.triggerDestroy}} id="{{@thisId}}" class="{{@adClass}}"></div>
 </template>
}