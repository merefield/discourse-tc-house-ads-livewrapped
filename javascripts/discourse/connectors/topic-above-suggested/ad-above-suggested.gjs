import Component from "@glimmer/component";
import { service } from "@ember/service";
import LivewrappedAd from "../../components/livewrapped-ad";
import i18n from "discourse-common/helpers/i18n";

export default class AdAboveSuggested extends Component {
  @service site;

  get showAd() {
    return true;
    // return settings.house_ads_livewrapped_tag_id_above_suggested_mobile != "" && this.site.mobileView ||
    //        settings.house_ads_livewrapped_tag_id_above_suggested_desktop != "" && !this.site.mobileView;
  }

  get tagIdDesktop() {
    return settings.house_ads_livewrapped_tag_id_above_suggested_desktop;
  }
  
  get tagIdMobile() {
    return settings.house_ads_livewrapped_tag_id_above_suggested_mobile;
  }

  get adIndex() {
    return "not_applicable";
  }

  <template>
    {{#if this.showAd}}
    <LivewrappedAd @tagId={{this.tagIdDesktop}} @adIndex={{this.adIndex}} @adClass={{i18n (themePrefix 'house_ads_livewrapped_desktop_classes')}}/>
    <LivewrappedAd @tagId={{this.tagIdMobile}}  @adIndex={{this.adIndex}} @adClass={{i18n (themePrefix 'house_ads_livewrapped_mobile_classes')}}/>
    {{/if}}
  </template>
}