import Component from "@glimmer/component";
import { action } from "@ember/object";
import { concat } from "@ember/helper";
import { tracked } from "@glimmer/tracking";
import loadScript from "discourse/lib/load-script";
import { service } from "@ember/service";
import { isTesting } from "discourse-common/config/environment";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import willDestroy from "@ember/render-modifiers/modifiers/will-destroy";

const LIVEWRAPPED_SCRIPT_SRC = "https://lwadm.com/lw/pbjs";

export default class LivewrappedAd extends Component {
        
  @action
  async triggerAd() {
    if (isTesting() || this.args.adIndex < 1 || this.args.adIndex === null || this.args.adIndex === undefined) {
      return; // Don't load external JS during tests
    };

    await loadScript(LIVEWRAPPED_SCRIPT_SRC + "?pid=" + settings.house_ads_livewrapped_source_script_pid, {
      scriptTag: true,
    });
    console.log('INFO: lwc triggered: ' + this.args.tagId);

    window.lwhb.cmd.push(() => {
      window.lwhb.loadAd({
        tagId: this.args.tagId
      });
    });
  }

  @action
  triggerDestroy() {
    window.lwhb.cmd.push(() => {
      window.lwhb.removeAdUnit({
        tagId: this.args.tagId
      });
    })
  }

 <template>
   <div {{didInsert this.triggerAd}} {{willDestroy this.triggerDestroy}} id="{{@tagId}}" class="{{@adClass}}"></div>
 </template>
}