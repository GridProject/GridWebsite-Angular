import { AfterViewInit, Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { LanguageService } from '../shared/language.service';
import { TranslateService } from '@ngx-translate/core';
import { NewsService } from '../shared/news.service';
import { FontFamliyService } from '../shared/font-famliy.service';
import { PapersService } from '../shared/papers.service';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { WindowService } from '../shared/window.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MainnetSourceService } from '../shared/mainnet-source.service';
import { ConfigHiddenService } from '../shared/config-hidden.service';
import { MainnetStageService } from '../shared/mainnet-stage.service'

import { Router } from '@angular/router';

declare let $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  public headerActiveCssClass = '';
  public config: PerfectScrollbarConfigInterface = {};

  public currentLanguage = '';
  public languagesDic: any;
  public languagesDic2: any;
  public languageList = ['', ''];
  public newsList = [];
  public VideoSrc: any;
  private resizeTime: any;

  public currentEconomicPaper = '';
  private economicPapers = {};
  public currentWhitePaper = '';
  private whitePapers = {};
  private getHotNewsRetryCount = 0;
  private timer = null;

  public mainnetSource = {
    height: 0,
    count: 0,
    accountNumber: 0,
    totalTxs: 0
  };

  public mainnetSourceType = [ 
    {
      key: "Main Chain AELF",
      urlBegin: "explorer"
    },{
      key: "Side Chain tDVV",
      urlBegin: "tdvv-explorer"
    }];
  public currentSourceChain = 0;
  public mainnetEcosystem = [];
  public hiddenElementList= {};
  public mainnetStageInfo = {
    stage: '',
    desc: '',
    linkContent: '',
    linkSite: '/',
    url: null
  };

  public currentLandscape = '';
  constructor(
    private _languageService: LanguageService,
    private _newsService: NewsService,
    private _papersService: PapersService,
    private _translateService: TranslateService,
    private _cookieService: CookieService,
    public _fontFamlily: FontFamliyService,
    private _windowRef: WindowService,
    private sanitizer: DomSanitizer,
    public router: Router,
    private _mainnetSourceService:  MainnetSourceService,
    private _configHiddenService: ConfigHiddenService,
    private _mainnetStageService: MainnetStageService
    ) {
  }

  ngOnInit() {
    const data = this._languageService
      .getLanguageConfig()

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
      this.setVideo();
      this.getHotNews();
      this.getAllMainnet();
      this.getMainnetEcosystem(this.currentLanguage);
      this.getPageHiddenElement(this.currentLanguage);
      this.getMainnetStage(this.currentLanguage);

      this.getEconomicPapers();
      this.getWhitepapers();
      this.setLandscape();

      this.router.events
        .subscribe((event) => {
          $(window).scrollTop(0);
        });

      this._translateService.onLangChange.subscribe(data => {
        this.OnChange(this.languagesDic2[data.lang] || 'English');
      }); 

  }

  ngAfterViewInit() {
    const perfectScrollbarContainer = $('.perfect-scrollbar-container');
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'border-radius': '6px' });
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css('cssText', 'width: 7px !important');
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'background-color': 'rgba(255, 255, 255, 0.1)' });
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'background-color': 'rgba(255, 255, 255, 0.1)' });
    perfectScrollbarContainer.find('.ps__scrollbar-y-rail').css({ 'opacity': 0.6 });
    // init section height
    this.initEarthCanvas();

    if(this._windowRef.nativeWindow.device.landscape() && $(window).width() <= 768){
      $('.section-1').height($(window).height() * 1.4);
      $('.section-2').height($(window).height() * 1.4);
    }else{
      $('.section-1').height($(window).height());
      $('.section-2').height($(window).height());
    }
  }

  ngOnDestroy(){
    clearTimeout(this.timer);
    // this.removeEventForDocument();
  }

  initEarthCanvas() {
    if (this._windowRef.nativeWindow.renderEarthCanvas) {
      this._windowRef.nativeWindow.renderEarthCanvas();
      this._windowRef.nativeWindow.loadingClose();
    } else {
      setTimeout(() => {
        this.initEarthCanvas();
      }, 1000);
    }
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

  setLandscape() {
    this.currentLandscape = this.currentLanguage === 'English'
      ? 'https://aelf.io/gridcn/aelf_product_landscape_m.pdf' : 'https://aelf.io/gridcn/aelf_product_landscape_zh_m.pdf';
  }

  getWhitepapers() {
    this._papersService.getPapers('whitepaper').subscribe(data => {
      data.forEach((paper: any) => {
        this.whitePapers[paper.lang] = paper;
      });
      // this.setEconomicPapers();
      this.setWhitepapers();
    });
  }
  setWhitepapers() {
    const currentWhitePaper = this.whitePapers[this.currentLanguage];
    const EnglishPaper = this.whitePapers['English'] || {url: ''};
    this.currentWhitePaper = currentWhitePaper ? currentWhitePaper.url : EnglishPaper.url;
  }

  toggleNotice(id) {
    const $notice = document.getElementById(id);
    const display = $notice.style.display;

    const $container = $('.aelf-notice-text');
    $container.css({ 'display': 'none' });

    const displayNew = display === 'block' ? 'none' : 'block';
    $notice.style.display = displayNew;
  }
  OnChange(languageSelection: string) {
    this._languageService.switchLanguage(this.languagesDic[languageSelection]);
    this.currentLanguage = languageSelection;
    this._fontFamlily.changeFontFamily(this.currentLanguage);
    this._cookieService.put('SelectedLanguage', this.languagesDic[languageSelection]);
    this.setVideo();
    this.getHotNews();
    this.setEconomicPapers();
    this.setWhitepapers();
    this.setLandscape();
    this.getMainnetEcosystem(this.currentLanguage);
    this.getPageHiddenElement(this.currentLanguage);
    this.getMainnetStage(this.currentLanguage);
  }

  public choseChain(index: number) {
    if (index !== this.currentSourceChain) {
      this.getAllMainnet(this.mainnetSourceType[index].urlBegin);
      this.currentSourceChain = index;
    }
  }
  getHotNews(languageType?: number) {
    console.log(this.currentLanguage);
    const languageMap = {
      '中文': 5,
      '英文': 4
    }
    this._newsService.getHotNews( languageType || languageMap[this.currentLanguage] || 4).subscribe(data => {
      if (data.length <= 0 && this.getHotNewsRetryCount === 0) {
        this.getHotNewsRetryCount++;
        this.getHotNews(4);
        return;
      }
      this.getHotNewsRetryCount = 0;
      this.newsList = data.map(item => {
        const newItem = {
          time: '',
          title: '',
          link: '',
          img: {
            url: ''
          }
        };

        newItem.link = item.link;
        newItem.time = item.modified_gmt.split('T')[0]; // 2020-2-12T12:20 => 2020-2-12
        newItem.title = item.title.rendered;
        //匹配图片
        const imgReg = /<img(?<prepend>[^>]+?)src=(['"])?(?<src>(?:(?!\2)[^>])+)\2?(?<append>[^>]*)>/;
        newItem.img.url = item.content.rendered.match(imgReg)['groups'].src

        return newItem;
      });
    });
  }


// numstr.replace(/\d{1,3}(?=(\d{3})+(.\d*)?$)/g, '$&,')
  async getAllMainnet(type?: string) {
    const currentType = type || this.mainnetSourceType[this.currentSourceChain].urlBegin;
    clearTimeout(this.timer);
    await Promise.all([
      this._mainnetSourceService.getMainnetSource(currentType).toPromise()
      .then((res)=>Object.assign(this.mainnetSource, res)),
      this._mainnetSourceService.getTPMSource(Date.now(), currentType).toPromise()
      .then((res)=> this.mainnetSource = {...this.mainnetSource,...res.all.slice(-1)[0]})
    ]).catch((err)=>{
      console.log(err)
    })
    this.timer = setTimeout(() => {
      this.getAllMainnet();
     }, 3000);
  }

  getPageHiddenElement(lang:string){
    this._configHiddenService.getConfigHidden(lang, 'home').
    subscribe(data=>{
      if (data.length < 1) {
        return
      }
      this.hiddenElementList = data.reduce((origin, value) => {
        origin[value.filed] = value.hidden;
       return origin;
      },{});
    })
  }

  getMainnetEcosystem(lang: string){
    this.mainnetEcosystem = [];
    this._mainnetSourceService.getMainnetEcosystem(lang)
      .subscribe(data => {
        const len = Array.isArray(data) ? data.length : 0;
        //this only fix slow network render repeat
        if (this.mainnetEcosystem.length) {
          this.mainnetEcosystem = [];
        }
        for (let i = 0; i < len;) {
          this.mainnetEcosystem.push(data.slice(i, i + 2));
          i+=2;
        }
      });
  }

  getMainnetStage(lang:string){
    this._mainnetStageService.getMainnetStage('home', lang)
    .subscribe((data)=>{
      if (data.length < 1) {
        return
      }
      const newData = data[0];
      Object.assign(this.mainnetStageInfo,{
        stage: newData.stage,
        desc: newData.desc,
        linkContent: newData.linkContent,
        linkSite: newData.linkSite || '/',
        url: newData.backgroundImg.length ? newData.backgroundImg[0].url : null
      })
    })
  }

  setVideo() {
    let videoSrcTemp = 'https://www.youtube.com/embed/qbIP1TEX33Q';
    if (this.currentLanguage === '中文') {
      videoSrcTemp = 'https://www.hoopox.com/aelf.mp4';
    }
    this.VideoSrc = this.sanitizer.bypassSecurityTrustResourceUrl(videoSrcTemp);
    setTimeout(() => {
      const videoWidth = parseInt($('#player').css('width'), 10);
      const videoHeight = (videoWidth / 16) * 9;
      $('#player').css('height', `${videoHeight}px`);
    }, 200);
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

  @HostListener('window:resize') onresize() {
    const videoWidth = parseInt($('#player').css('width'), 10);
    const videoHeight = (videoWidth / 16) * 9;
    clearTimeout(this.resizeTime);
    this.resizeTime = setTimeout(() => {
      $('#player').css('height', `${videoHeight}px`);
    }, 100);
  }
  
}
$('body').on('click', '.lang-menu span', function(e){
  e.stopPropagation();
  $('.lang-menu').addClass('active2');
});

$('body').on('click', '.tool-menu span', function(e){
  e.stopPropagation();
  $('.tool-menu').addClass('active2');
});

$('body').on('click', '.meenu span', function(e){
  e.stopPropagation();
  $('.meenu').addClass('active2');
});

window.onresize = function(){
  const videoWidth = parseInt($('#player').css('width'), 10);
  const videoHeight = (videoWidth / 16) * 9;
  $('#player').css('height', `${videoHeight}px`);
  // const vedioHeight = $('.vedio-size').find('.ptl22-box').css('height');
  // setTimeout(() => {
  //   $('#player').css('height', vedioHeight);
  // }, 200);
};



