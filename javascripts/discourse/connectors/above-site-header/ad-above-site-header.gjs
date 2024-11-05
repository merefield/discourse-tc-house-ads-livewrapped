import Component from "@glimmer/component";
import { service } from "@ember/service";
import LivewrappedAd from "../../components/livewrapped-ad";
import i18n from "discourse-common/helpers/i18n";

export default class AdAboveSiteHeader extends Component {
  @service site;

  get showAd() {
    return settings.house_ads_livewrapped_tag_id_above_site_header_mobile != "" && this.site.mobileView ||
           settings.house_ads_livewrapped_tag_id_above_site_header_desktop != "" && !this.site.mobileView;
  }

  get tagId() {
    return this.site.mobileView ? settings.house_ads_livewrapped_tag_id_above_site_header_mobile : settings.house_ads_livewrapped_tag_id_above_site_header_desktop;
  }

  get isMobile() {
    return this.site.mobileView;
  }

  get adIndex() {
    return "not_applicable";
  }

  <template>
    {{#if this.showAd}}
      <div class="livewrapped-ad-above-site-header">
        {{#if this.isMobile}}
          <LivewrappedAd @tagId={{this.tagId}} @adIndex={{this.adIndex}} @refresh=true @adClass={{i18n (themePrefix 'house_ads_livewrapped_mobile_classes')}}/>
        {{else}}
          <LivewrappedAd @tagId={{this.tagId}} @adIndex={{this.adIndex}} @refresh=true @adClass={{i18n (themePrefix 'house_ads_livewrapped_desktop_classes')}}/>
        {{/if}}
      </div>
    {{/if}}
  </template>
}
