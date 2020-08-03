import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { LanguageService } from '../shared/language.service';
import { FontFamliyService } from '../shared/font-famliy.service';
import { TranslateService } from '@ngx-translate/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { WindowService } from '../shared/window.service';
import { PapersService } from '../shared/papers.service';
import { DomSanitizer } from '@angular/platform-browser';

import { Router } from '@angular/router';

declare let $: any;

@Component({
  selector: 'app-economic',
  templateUrl: './economic.component.html',
  styleUrls: ['./economic.component.css']
})
export class EconomicComponent implements OnInit, AfterViewInit {
  public headerActiveCssClass = '';
  public config: PerfectScrollbarConfigInterface = {};
  public currentLanguage = '';
  public languagesDic: any;
  public languagesDic2: any;
  public languageList = ['', ''];
  public VideoSrc: any;
  public currentEconomicPaper = '';
  private economicPapers = {};
  constructor(private _languageService: LanguageService,
              private _cookieService: CookieService,
              public _fontFamlily: FontFamliyService,
              private _translateService: TranslateService,
              private _windowRef: WindowService,
              private _papersService: PapersService,
              private sanitizer: DomSanitizer,
              public router: Router) {
  }

  ngOnInit() {
    this._languageService
      .getLanguageConfig()
      .subscribe(data => {
        this.languagesDic = data["languagesDic1"];
        this.languagesDic2 = data["languagesDic2"];
        this.languageList = data["languageOptions"];
        this.currentLanguage =
          data["languagesDic2"][
            this._languageService.getWebPageCurrentLanguage()
            ];
        this._fontFamlily.changeFontFamily(
          this.currentLanguage
        );
        this.getEconomicPapers();
        this.router.events
          .subscribe((event) => {
            $(window).scrollTop(0);
          });
      });

    this._translateService.onLangChange.subscribe(data => {
      this.OnChange(this.languagesDic2[data.lang] || 'English');
    });

    const $title1 = $(".title1");
    $title1.show();
    if ($title1.show().arctext) {
      $title1.show().arctext({
        radius: 90, dir: -1
      });
    }
  }
  ngAfterViewInit() {
    const perfectScrollbarContainer = $('.perfect-scrollbar-container');
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'border-radius': '6px' });
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css('cssText', 'width: 7px !important');
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'background-color': 'rgba(255, 255, 255, 0.1)' });
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'background-color': 'rgba(255, 255, 255, 0.1)' });
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'opacity': 0.6 });

  }
  toggleNotice(id) {
    const $notice = document.getElementById(id);
    const display = $notice.style.display;

    const $container = $('.aelf-notice-text');
    $container.css({ 'display': 'none' });

    const displayNew = display === 'block' ? 'none' : 'block';
    $notice.style.display = displayNew;
  }

  getEconomicPapers() {
    this._papersService.getPapers('economic').subscribe(data => {
      data.forEach((paper: any) => {
        this.economicPapers[paper.lang] = paper;
      });
      this.setEconomicPapers();
    });
  }

  setEconomicPapers() {
    const currentLanguagePaper = this.economicPapers[this.currentLanguage];
    const EnglishPaper = this.economicPapers['English'] || { url: '' };
    this.currentEconomicPaper = currentLanguagePaper ? currentLanguagePaper.url : EnglishPaper.url;
  }

  OnChange(languageSelection: string) {
    this._languageService.switchLanguage(this.languagesDic[languageSelection]);
    this.currentLanguage = languageSelection;
    this._fontFamlily.changeFontFamily(this.currentLanguage);
    this._cookieService.put('SelectedLanguage', this.languagesDic[languageSelection]);
    this.setEconomicPapers();
  }

  // nav bar change color when the scroll event happens.
  @HostListener('window:scroll', ['$event'])
  scrollTop(event) {
    // console.log('Scroll Event', window.pageYOffset );
    // console.log('class name: ', $('#dropdown-pagination-menu').attr('class') );
    if (this._windowRef.nativeWindow.pageYOffset !== 0 && !($('#dropdown-pagination-menu').hasClass('active'))) {
      this.headerActiveCssClass = 'active-header';
    } else {
      this.headerActiveCssClass = '';
    }
    // console.log('headerActiveCssClass: ', this.headerActiveCssClass);
  }
  // add or delete active class for html header element when click menu button.
  menuClick() {
    if (this.headerActiveCssClass !== '' && !($('#dropdown-pagination-menu').hasClass('active'))) {
      this.headerActiveCssClass = '';
    } else if (this.headerActiveCssClass === '' && $('#dropdown-pagination-menu').hasClass('active') && (this._windowRef.nativeWindow.pageYOffset !== 0)) {
      this.headerActiveCssClass = 'active-header';
    }
  }

  // @HostListener('window:resize') onresize() {
  //   const vedioHeight = $('.vedio-size').find('.ptl22-box').css('height');
  //   setTimeout(() => {
  //     $('#player').css('height', vedioHeight);
  //   }, 200);
  // }

}

$('body').on('click', '.lang-menu span', function(e){
  e.stopPropagation();
  $('.lang-menu').addClass('active2');
});

$('body').on('click', '.tool-menu span', function(e){
  e.stopPropagation();
  $('.tool-menu').addClass('active2');
});

