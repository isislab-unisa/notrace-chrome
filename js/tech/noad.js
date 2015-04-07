function noad(details){
	log("START NOAD: " + details.url);
	
	var reg = "(Wadv|banner|promo)s?(.(?!wunder)w+.w{2,3}(.w{2,2})?/|Ww*d+xd+.)(?!banners)|((absolute|ad|aff(/|iliate.*)|assets/|iframe|live-?|net|partypoker.*|professor|sales|serve|user|video|view|werbe)_?banner)|"+
		"((adwork.net|(bannex|mbn).com).ua)|((amazon.w+.*|barnesandnoble.com/p.*)(&search=|amb%5F(gw|skin)|amzban|banner|cm?t|marketing(/2|.+html)|promo|stripe?s?W|tcg.*.[gj]))|"+
		"((be|context|impresiones)web.com)|((bf|flyc|unic)ast.com)|((bravenetmedia|openad)network.com)|((casaleme|rightme|travi|vibrantme)dia)|((cash|id)regie.com)|((dtm|reactiv|regiede)pub.com)|((jupiter|mercury).bravenet)|"+
		"(.(ad|ncs)reporting.com)|(/(adt|dclk).)|(/banners/w*.w{3}?)|(/ccas(.clearchannel|_media/))|([/&](affiliates?|revenue)((.*d+x)?d+|.pl|.swf|fuel|pilot|/(banner|script)s?/))|([/.]((etology|espotting).com|m3.net))|([/.]overture(/|.*?.*=|w*.js|.com))|([^w=+]promo(w*.js|banner|box)(?!(.js)??)(W|_|$))|"+
		"([^a-zd=+%@](?!d{5,})(w*d+xd)?d*(show)?(w{3,}%20|alligator|avs|barter|blog|box|central|context|crystal|d?html|exchange|external|forum|front|fuse|gen|get|house|hover|http|i?frame|inline|instant|live|main|mspace|net|partner|"+
		"php|popin|primary|provider|realtext|redirW.*W|rotated?|secure|side|smart|sponsor|story|text|view|web)?_?ads?(v?((ition|meta|tology3|versal).com|(marketplace|rom).net|action.se|bot|brite|broker|bureau|butler|cent(er|ric)|click|client|content|coun(cil|t(er)?)|creative|cycle|data(id)?|engage|entry|er(tisw+|t(pro)"+
		"?|ve?r?)|farm|feelgood|force|form|frame(generator)?|gen|gif|groupid|head|ima?ge?|index|info|js|juggler|layer|legend|link|log|man(ager)?|max|mentor(serve)?|mosaic|net|optimi[sz]er|parser|peeps|pic|po(ol|pup|sition)|proof|q.nextag|re(dire?c?t?|mote|volver)|"+
		"rotator|sale|script|search|sdk|sfac|size|so(lution|nar|urce)|stream|space|srv|stat.*.asp|sys|(tag)?track|trix|type|view|vt|x.nu|zone))?s?d*(status)?d*(?!.org)[W_](?!w+.(ac.|edu)|astra|aware|adurl=|block|login|nl/|sears/|.*(&sb|.(wmv|rm))))|([/^a-zd=+](get|web)?_?spons?"+
		"(or(ed|s))?_?(links?(auto)?)?(pots?)?(W|_|$)(?!.*sigalert))|([^a-zd=+]d*((cible|com|context|double|euro(s4)?|fast|fine|pay-by-|precision|smart|specific|value)_?clicks?|clicks?(2net|adhere|ban.php|bank.net|booth(lnk?).com|over|sor.com|tag|thrutraffic|trade|xchange))(W|$)(?!but))|"+
		"([^a-z]banners?[/._-]?(.*(d+xd+.swf|.f?pl|_hits.asp?|redir|siteid=)|.(cgi|js|php)|ad|affiliate|central|click|connect|count|current|exchange|file|grocery|id|man(age(ment|r)|ia)|newsletter|/_?promo|/rotat|/?script|serve|skyscraper|space.|swap|tausch|trust))|(.(adquest|site-id|geldrace).nl)|(.emediate.w{2,3})|(W(absolutebm|aff_manager|annon(s(er)?|coer)|anzeigenklick|bannerit|centrport|clickad|clk_thru|contextuallinks?|falkag|klipmart|mainos(include)?|mediaturf|nyadmcncserve|offerfusion|partnermanager|paypopup|redirect.*banner|tacoda|tns-gallup|weborama|werbung|(hit|spin|google/)box(?!.org))[W_])|(W(adcase|adi.meinberlin|(affiliate|popdown|view4)cash|allsponsor|belboon|deluxelink|gonamic|ivwbox|klicksponsor|ligatus|mediavantage|mirando|pay4klick|popexchange|ptadsrv|superclix|webmaster24|zanox-affiliate).de)|(Wad(id=(?!$)|v(W.*track|(/[^/]+|d+).[gjs])|/house|renaline(.cz|sk.sk)))|(Wimg(is|ehost).com)|(Woverlay.js)|(d+xd+.*scraper)|(affiliate(future|sensor).com)|(banman(.asp|pro))|(bsd{3,}.gmx)|(bwp..*.com/search)|(direct(ivepub|orym|track).com)|(imdb.com.*.swf)|(instant(attention|buzz).com)|(intelli(-direct.com|srv.(js|net)|txt))|(inter(click|polls).com)|(link(buddies|connector.com|exchange|share|synergy))|(market(ing(/images/d|/?promo)|banker.com))|(media((next|plazza).com|(onenetwork|precision).net))|(oasis(i.{0,3}.php|.zmh))|(partner(.eniro.|2profit.com))|(popu(larix.com|nderW|padW|pkp))|(qks(rv|z).net)|(search(cactus|feed).com)|(shopping.msn.com/.*ptnrId=)|(sonnerie.*get.top)|(traffic(mp|system).com)|(yimg.com(.*/adv/|/a/)(?!vision))|(0instant.com)|(1100i.com)|(125x125.com)|(265.com)|(2o7.net)|(action.ientry.net)|(adsence.sogou.com)|(adserveredirect)|(afcyhf.com)|(affistats.com)|(aftrack.asp)|(aj.600z.com)|(allyes.com)|(anrdoezrs.net)|(artbanners/task,clk)|(atdmt.com)|(atwola.com)|(audiencematch.net)|(avolutia.com)|(awaps.net)|(awltovhc.com)|(awrz.net)|(baventures.com)|(bbmedia.cz)|(bc.geocities.yahoo.co.jp)|(belnk.com)|(bidvertiser.com)|(biz2008.com)|(blogclick.jp)|(bluestreak.com)|(bncnt.com)|(bns1.net)|(bridgetrack.com)|(bs.yandex.ru)|(budsinc.com)|(cc-dt.com)|(checkm8.com)|(chitika.net)|(cjt1.net)|(cognigen.net)|(commission-junction.com)|(connextra.com)|(cpaffiliates.net)|(cpxinteractive.com)|(custom-click.com)|(cxtlive.com)|(dbbsrv.com)|(dgm2.com)|(dgmaustralia.com)|(did-it.com)|(dope.dk)|(ekmas.com)|(el-mundo.net/banners)|(entitycity.com)|(eshopoffer.aspx)|(excite.com/gca_iframe)|(eyewonder.com)|(factortg.com)|(filetarget.com)|(filitrac.com)|(findology.com)|(floppybank.com)|(forrestersurveys.com)|(ftjcfx.com)|(funpic.de/layer)|(geocities.com/js_source/)|(gestionpub.com)|(getban.php)|(getfound.com)|(gms1.net)|(hb.lycos.com)|(ifactz.com)|(impact.as)|(imrworldwide.com)|(indiads.com)|(industrybrains.com)|(inetinteractive.com)|(insightfirst.com)|(java.yahoo.com/a)|(jdoqocy.com)|(kanoodle.com)|(kelkoo.fr)|(keymedia.hu)|(keyrun.com)|(kontera.com)|(kqzyfj.com)|(lapi.ebay.)|(lduhtrp.net)|(leadhound.com)|(localxml.com)|(log.go.com)|(lycos.com/catman/)|(maxserving.com)|(mercuras.com)|(metaffiliation.com)|(midaddle.com)|(mms3.com)|(myreferer.com)|(mytemplatestorage.com)|(narrowad.com)|(netavenir.com)|(netshelter.net)|(northmay.com)|(nvidium.com)|(nytimes.com/marketing)|(oclus.com)|(omguk.com)|(oxyonline.cz)|(pro-market.net)|(promobenef.com)|(promotionad)|(publicidad.js)|(questionmarket.com)|(rad.msn.com)|(realmedia.com)|(redcolobus.com)|(redsheriff.com)|(reklamer.com.ua/ban/)|(revsci.net)|(rmxads.com)|(ru4.com)|(serving-sys.com)|(shareasale.com)|(showyoursite.com)|(si-net.se)|(smarttargetting.co)|(spotsystems.info)|(sublimemedia.net)|(subscriptionrocket.com)|(suitesmart.com)|(surehits.com)|(targetpoint.com)|(tipsurf.com)|(tkqlhce.com)|(toplaboom.com)|(tqlkg.com)|(tradedoubler.com)|(urltrak.com)|(utarget.co.uk)|(webex.ru)|(xban.walla.co.il)|(yceml.net)|(yieldx.com)|(zedo.com)|(zoomdirect.com.au)|"+
		"([^w]ads)|([^w]banner)|([^w]adv)|([^w]advertising)|/b/ss/|/beacon?|/bh_counter.js|/bluekai.js|/bm-analytics-trk.js|/cgi-bin/count.cgi|/cgi-bin/count.cgi|/cgi-bin/count.cgi|/cgi-bin/count.cgi|/chartbeat.js|/globalpagetracking.js|/google-analyticator/|/google-analytics-for-wordpress/|/google_analytics-bc.swf|/googleanalytics-prod.swf|/googleanalytics.swf|/googleanalytics/ga.php?|/googleanalyticsmanagement.swf|/googleanalyticsplugin.swf|/adtracker.|track.ash|/_/search/a-srv.ashx?AdsNum=|rd.meebo.com/b.gif?|(1px.gif)|(/ad-468-)|(/ad-amz.)|(/ad-banner-)|(/ad-box-)|(/ad-cdn.)|(/ad-emea.js)|(/ad-frame.)|(/ad-frame/)|(/ad-gallery.)|(/ad-header.)|(/ad-hug.)|(/ad-iframe-)|(/ad-iframe.)|(/ad-images/)|(/ad-inject/)|(/ad-leaderboard.)|(/ad-letter.)|(/ad-loader-)|(/ad-local.)|(/ad-logger/)|(/ad-managment/)|(/ad-methods.)|(/ad-modules/)|(/ad-openx.)|(/ad-pub.)|(/ad-right2.)|(/ad-server.)|(/ad-server/)|(/ad-specs.)|(/ad-sprite.)|(/ad-tandem.)|(/ad-template/)|(/ad-top-)|(/ad-topbanner-)|(/ad-vert.)|(/ad-vertical-)|(/ad/banner.)|(/ad/banner/)|(/ad/bannerdetails/)|(/ad/files/)|(/ad/google/)|(/ad/iframe.)|(/ad/iframe/)|(/ad/index.)|(/ad/index/)|(/ad/load_)|(/ad/script/)|(/ad/serve.)|(/ad/side_)|(/ad/sponsored-)|(/ad/takeover/)|(/ad000/)|(/ad125.)|(/ad125x125.)|(/ad160.)|(/ad160x600.)|(/ad1_120x90.)|(/ad1place.)|(/ad1x1home.)|(/ad2.)|(/ad2border.)|(/ad3.)|(/ad300.)|(/ad300x145.)|(/ad300x250.)|(/ad300x250_)|(/ad350.)|(/ad4.)|(/ad468x60.)|(/ad468x80.)|(/ad5.)|(/ad728.)|(/ad728x15.)|(/ad?count=)|(/ad?pos_)|(/ad_300.)|(/ad_300250.)|(/ad_agency/)|(/ad_area.)|(/ad_banner.)|(/ad_banner/)|(/ad_banner_)|(/ad_bottom.)|(/ad_box.)|(/ad_bsb.)|(/ad_cache/)|(/ad_campaigns/)|(/ad_code.)|(/ad_configuration.)|(/ad_configurations_)|(/ad_container_)|(/ad_content.)|(/ad_contents/)|(/ad_count.)|(/ad_counter_)|(/ad_creatives.)|(/ad_editorials_)|(/ad_entry_)|(/ad_feed.)|(/ad_files/)|(/ad_fill.)|(/ad_footer.)|(/ad_forum_)|(/ad_frame.)|(/ad_function.)|(/ad_gif/)|(/ad_google.)|(/ad_head0.)|(/ad_header_)|(/ad_holder/)|(/ad_homepage_)|(/ad_horizontal.)|(/ad_html/)|(/ad_icons/)|(/ad_iframe.)|(/ad_iframe_)|(/ad_img.)|(/ad_img/)|(/ad_include.)|(/ad_insert.)|(/ad_jnaught/)|(/ad_label_)|(/ad_leader.)|(/ad_leaderboard.)|(/ad_left.)|(/ad_legend_)|(/ad_link.)|(/ad_load.)|(/ad_log_)|(/ad_manager.)|(/ad_manager/)|(/ad_mpu.)|(/ad_navigbar_)|(/ad_notice.)|(/ad_oas/)|(/ad_page_)|(/ad_policy.)|(/ad_pop1.)|(/ad_print.)|(/ad_rectangle_)|(/ad_refresher.)|(/ad_reloader_)|(/ad_request.)|(/ad_right.)|(/ad_rotation.)|(/ad_rotator.)|(/ad_rotator_)|(/ad_script.)|(/ad_serv.)|(/ad_serve.)|(/ad_serve_)|(/ad_server.)|(/ad_server/)|(/ad_sizes=)|(/ad_skin_)|(/ad_sky.)|(/ad_skyscraper.)|(/ad_slideout.)|(/ad_space.)|(/ad_spot.)|(/ad_square.)|(/ad_square_)|(/ad_supertile/)|(/ad_sys/)|(/ad_syshome.)|(/ad_tag.)|(/ad_tag_)|(/ad_tags_)|(/ad_tile/)|(/ad_title_)|(/ad_top.)|(/ad_topgray2.)|(/ad_tpl.)|(/ad_upload/)|(/ad_utils/)|(/ad_ver/)|(/ad_vert.)|(/ad_vertical.)|(/ad_view_)|(/adaffiliate_)|(/adanim/)|(/adaptvadplayer.)|(/adbanner.)|(/adbanner/)|(/adbanner_)|(/adbanners/)|(/adbar.)|(/adbars.)|(/adbase.)|(/adbeacon.)|(/adbetween/)|(/adbg.jpg)|(/adblock.ash)|(/adbot_)|(/adbottom.)|(/adbox.)|(/adbox/)|(/adboxbk.)|(/adboxes/)|(/adbrite.)|(/adbureau.)|(/adbytes.)|(/adcampaigns/)|(/adcde.js)|(/adcdn.)|(/adcell/)|(/adcentral.)|(/adchain-)|(/adchannel_)|(/adchoices.)|(/adclick.)|(/adclick/)|(/adclient-)|(/adclient.)|(/adclient/)|(/adclutter.)|(/adcode.)|(/adcode/)|(/adcodes/)|(/adcollector.)|(/adcomponent/)|(/adconfig.js)|(/adconfig/)|(/adcontent/)|(/adcontrol.)|(/adcontroller.)|(/adcore.)|(/adcore_)|(/adcounter.)|(/adcreative.)|(/adcycle.)|(/adcycle/)|(/addeals/)|(/addelivery/)|(/addyn/3.0/)|(/adengage-)|(/adengage.)|(/adengage/)|(/adengage1.)|(/adengage2.)|(/adengage3.)|(/adengage4.)|(/adengage5.)|(/adengage6.)|(/adengage_)|(/adengine/)|(/adexclude/)|(/adexternal.)|(/adfactory.)|(/adfarm.)|(/adfeedtestview.)|(/adfever_)|(/adfile/)|(/adfillers/)|(/adfly/)|(/adfooter.)|(/adformats/)|(/adframe.)|(/adframe/)|(/adframe2.)|(/adframe_)|(/adframebottom.)|(/adframecommon.)|(/adframemiddle.)|(/adframetop.)|(/adfrequencycapping.)|(/adfunction.)|(/adfunctions.)|(/adgallery1.)|(/adgallery1)|"+
		"(/adgallery2.)|(/adgallery2)|(/adgallery3)|(/adgalleryheader.)|(/adgearsegmentation.)|(/adgeo/)|(/adgitize-)|(/adgooglefull2.)|(/adgraphics/)|(/adguru.)|(/adhalfbanner.)|(/adhandler.)|(/adheader.)|(/adheadertxt.)|(/adhints/)|(/adhomepage.)|(/adhtml/)|(/adhug_)|(/adicon_)|(/adiframe.)|(/adiframe/)|(/adiframeanchor.)|(/adiframem1.)|(/adiframem2.)|(/adiframetop.)|(/adify_)|(/adimage.)|(/adimages.)|(/adimg.)|(/adimg/)|(/adindex/)|(/adinjector.)|(/adinjector_)|(/adinsert.)|(/adinsertionplugin.)|(/adinterax.)|(/adiro.)|(/adition.)|(/adjs.)|(/adjs_)|(/adjsmp.)|(/adlabel.)|(/adlabel_)|(/adlayer.)|(/adlayer/)|(/adleader.)|(/adleaderboardtop.)|(/adleft/)|(/adleftsidebar.)|(/adlink-)|(/adlink.)|(/adlink/)|(/adlink_)|(/adlinks.)|(/adlist_)|(/adloader.)|(/adm/ad/)|(/admain)|(/adman.)|(/adman/)|(/admanagement/)|(/admanagementadvanced.)|(/admanager3.)|(/admanagers/)|(/admanagerstatus/)|(/admantx-)|(/admantx.)|(/admantx/)|(/admarker.)|(/admarker_)|(/admarket/)|(/admaster.)|(/admatch-)|(/admatcher.)|(/admaxads.)|(/admeasure.)|(/admedia.)|(/admedia/)|(/admega.)|(/admeld.)|(/admeld_)|(/admentor/)|(/admentorasp/)|(/admentorserve.)|(/admeta.)|(/admez.)|(/admez/)|(/admicro2.)|(/admicro_)|(/admin/banners/)|(/adminibanner2.)|(/admixer_)|(/adnet.)|(/adnetmedia.)|(/adnetwork.)|(/adnetwork300.)|(/adnetwork468.)|(/adnews.)|(/adnext.)|(/adng.html)|(/adnotice.)|(/adonline.)|(/adops/)|(/adotubeplugin.)|(/adoverlay/)|(/adp.htm)|(/adpage.)|(/adpage/)|(/adpan/)|(/adpartner.)|(/adpeeps.)|(/adpeeps/)|(/adpicture1)|(/adpicture2)|(/adpictures/)|(/adplacement.)|(/adplayer.)|(/adplayer/)|(/adplugin.)|(/adplugin_)|(/adpoint.)|(/adpool/)|(/adpop.)|(/adpopup.)|(/adproducts/)|(/adprovider.)|(/adproxy.)|(/adproxy/)|(/adreactor/)|(/adrefresh-)|(/adrelated.)|(/adremote.)|(/adrequest.)|(/adrevenue/)|(/adrevolver/)|(/adright/)|(/adrobot.)|(/adrolays.)|(/adRoll.)|(/adroller.)|(/adroot/)|(/adrot.)|(/adrot_)|(/adrotate.)|"+
		"(/adrotate/)|(/adrotator.)|(/adrotator/)|(/adrotv2.)|(/adruptive.)|(/ads-1.)|(/ads-banner)|(/ads-blogs-)|(/ads-common.)|(/ads-footer.)|(/ads-leader)|(/ads-pd.)|(/ads-rectangle.)|(/ads-rec)|(/ads-right.)|(/ads-sa.)|(/ads-scroller-)|(/ads-segmentjs.)|(/ads-service.)|(/ads-skyscraper.)|(/ads-sky)|(/ads.dll/)|(/ads.gif)|(/ads.htm)|(/ads.jsp)|(/ads.php)|(/ads/125l.)|(/ads/125r.)|(/ads/160.)|(/ads/2010/)|(/ads/300.)|(/ads/3002.)|(/ads/468a.)|(/ads/728.)|(/ads/728b.)|(/ads/ad_)|(/ads/ads_)|(/ads/advshow.)|(/ads/banner.)|(/ads/banner01.)|(/ads/banners/)|(/ads/center-)|(/ads/cnvideo/)|(/ads/common/)|(/ads/default_)|(/ads/dhtml/)|(/ads/footer_)|(/ads/freewheel/)|(/ads/generatedHTML/)|(/ads/google1.)|(/ads/google2.)|(/ads/header_)|(/ads/home/)|(/ads/homepage/)|(/ads/house/)|(/ads/iframe)|(/ads/images/)|(/ads/img/)|(/ads/indexsponsors/)|(/ads/interstitial.)|(/ads/interstitial/)|(/ads/js/)|(/ads/js_)|(/ads/jsbannertext.)|(/ads/labels/)|(/ads/layer.)|(/ads/leaderboard-)|(/ads/leaderboard.)|(/ads/leaderboard_)|(/ads/load.)|(/ads/main.)|(/ads/mpu/)|(/ads/panel.)|(/ads/pencil/)|(/ads/player-)|(/ads/plugs/)|(/ads/popshow.)|(/ads/post-)|(/ads/preloader/)|(/ads/preroll_)|(/ads/promo_)|(/ads/proxy-)|(/ads/rail-)|(/ads/rectangle_)|(/ads/ringtone_)|(/ads/show.)|(/ads/side-)|(/ads/skins/)|(/ads/sponsor)|(/ads/square-)|(/ads/square.)|(/ads/square2.)|(/ads/square3.)|(/ads/third-)|(/ads/tile-)|(/ads/top-)|(/ads/video_)|(/ads/view.)|(/ads/zone/)|(/ads0.)|(/ads09a/)|(/ads1.)|(/ads1/)|(/ads10/)|(/ads11/)|(/ads160.)|(/ads18.)|(/ads2.)|(/ads2/)|(/ads2012/)|(/ads2012b/)|(/ads2_)|(/ads3.)|(/ads3/)|(/ads4.)|(/ads4/)|(/ads468.)|(/ads5.)|(/ads5/)|(/ads6.)|(/ads6/)|(/ads7.)|(/ads7/)|(/ads728.)|(/ads8.)|(/ads8/)|(/ads88.)|(/ads9.)|(/ads9/)|(/ads?zone_id=)|(/ads_160_)|(/ads_banners/)|(/ads_code.)|(/ads_code_)|(/ads_config.)|(/ads_display.)|(/ads_files/)|(/ads_footer.)|(/ads_gallery/)|(/ads_global.)|(/ads_google.)|(/ads_ifr.)|(/ads_iframe.)|(/ads_load/)|(/ads_loader.)|(/ads_openx_)|(/ads_patron.)|(/ads_php/)|(/ads_reporting/)|(/ads_sidebar.)|(/ads_yahoo.)|(/adsa468.)|(/adsa728.)|(/adsadview.)|(/adsales/)|(/adsame.)|(/adsatt.)|(/adsbanner.)|(/adsbanner/)|(/adsbannerjs.)|(/adsbox.)|(/adsby.)|(/adscale.)|(/adscale1.)|(/adscale_)|(/adscalebigsize.)|(/adscalecontentad.)|(/adscaleskyscraper.)|(/adscluster.)|(/adscontent.)|(/adscontent2.)|(/adscript.)|(/adscript1.)|(/adscript_)|(/adscripts/)|(/adscripts1.)|(/adscripts2.)|(/adscripts3.)|(/adscroll.)|(/adsdaq_)|(/adsdaqbanner_)|(/adsdaqbox_)|(/adsdaqsky_)|(/adsdyn160x160.)|(/adsegmentation.)|(/adsenceSearch.)|(/adsenceSearchTop.)|(/adsense-)|(/adsense.)|(/adsense/)|(/adsense1.)|(/adsense2.)|(/adsense23.)|(/adsense24.)|(/adsense3.)|(/adsense4.)|(/adsense5.)|(/adsense_)|(/AdsenseBlockView.)|(/adsensegb.)|(/adsensegoogle.)|(/adsensets.)|(/adseo.)|(/adseo/)|(/adserv.)|(/adserv/)|(/adserv1.)|(/adserv2.)|(/adserv3.)|(/adserv_)|(/adserve.)|(/adserve/)|(/adserve_)|(/adserver.)|(/adserver/)|(/adserver1.)|(/adserver2.)|(/adserver2/)|(/adserver3.)|(/adserver7/)|(/adserver8strip.)|(/adserver_)|(/adservers-)|(/adserversolutions/)|(/adservices/)|(/adservice)|(/adserving.)|(/adserving/)|(/adserving_)|(/adsetup.)|(/adsfac.)|(/adsfetch.)|(/adsfile.)|(/adsfiles.)|(/adsfinal.)|(/adsfolder/)|(/adsframe.)|(/adshandler.)|(/adshare/)|(/adshare3.)|(/adsheader.)|(/adshow.)|(/adshow_)|(/adsidebarrect.)|(/adsiframe/)|(/adsimage/)|(/adsImg/)|(/adsinclude.)|(/adsinsert.)|(/adsky.)|(/adskyright.)|(/adskyscraper.)|(/adsline.)|(/adslots.)|(/adslug-)|(/adslug_)|(/adslugs/)|(/adsmanagement/)|(/adsmanager/)|(/adsmedia_)|(/adsmm.dll/)|(/adsnew.)|(/adsnip.)|(/adsniptrack.)|(/adsonar.)|(/adsopenx/)|(/adspace.)|(/adspace/)|(/adspeeler/)|(/adsponsor.)|(/adspot.)|(/adspots/)|(/adspro/)|(/adsquare.)|(/adsquareleft.)|(/adsrc.)|(/adsremote.)|(/adsreporting/)|(/adsrich.)|(/adsright.)|(/adsrot.)|(/adsrot2.)|(/adsrotate.)|(/adsrotate1left.)|(/adsrotate1right.)|(/adsrotate2left.)|(/adsrotateheader.)|(/adsrule.)|(/adsrv.)|(/adsrv/)|(/adsserv.)|(/adssrv.)|(/adstacodaeu.)|(/adstatic.)|(/adstemplate/)|(/adstop_)|(/adstorage.)|(/adstracking.)|(/adstream.)|(/adstream_)|(/adstrm/)|(/adstub.)|(/adstubs/)|(/adsup.)|(/adsvr.)|(/adswap.)|(/adswap/)|(/adswide.)|(/adswidejs.)|(/adsword.)|(/adswrapper.)|(/adswrapperintl.)|(/adsx728.)|(/adsx_728.)|(/adsync/)|(/adsyndication.)|(/adsyndication/)|(/adsys.)|(/adsys/)|(/adsystem/)|(/adtable_)|(/adtag.)|(/adtag/)|"+
		"(/adtaggingsubsec.)|(/adtago.)|(/adtags.)|(/adtags/)|(/adtagtc.)|(/adtagtranslator.)|(/adtech.)|(/adtech/)|(/adtech;)|(/adtech_)|(/adtechglobalsettings.js)|(/adtest.)|(/adtext.)|(/adtext4.)|(/adtext_)|(/adtextmpu2.)|(/adtitle.)|(/adtology.)|(/adtonomy.)|(/adtool/)|(/adtools/)|(/adtools2.)|(/adtop.)|(/adtopleft.)|(/adtopright.)|(/adtrack.)|(/adtrack/)|(/adtraff.)|"+
		"(/adttext-)|(/adttext.)|(/adtvideo.)|(/adtxt.)|(/adtype.)|(/adunit.)|(/adunit/)|(/adunits/)|(/adutil.)|(/adv-banner.)|(/adv-div-)|(/adv.asp)|(/adv.htm)|(/adv.jsp)|(/adv/ads/)|(/adv/managers/)|(/adv/preroll_)|(/adv02.)|(/adv03.)|(/adv1.)|(/adv2.)|(/adv3.)|(/adv4.)|(/adv5.)|(/adv_2.)|(/adv_background/)|(/adv_flash.)|(/adv_frame/)|(/adv_link.)|(/advaluewriter.)|(/advbanner/)|(/advcontents.)|(/adver.)|(/adver_hor.)|(/adverserve.)|(/advert-)|(/advert.)|(/advert/)|(/advert_)|(/advertbanner.)|(/advertbox.)|(/advertise-)|(/advertise.)|(/advertise/)|(/advertise125x125.)|(/advertise_)|(/advertisehere.)|(/advertisement-)|(/advertisement.)|(/advertisement/)|(/advertisement160.)|(/advertisement2.)|(/advertisement_)|(/advertisementheader.)|(/advertisementrotation.)|(/advertisements.)|(/advertisements/)|(/advertisementview/)|(/advertiser.)|(/advertiser/)|(/advertisers/)|(/advertising-)|(/advertising.)|(/advertising/)|(/advertising2.)|(/advertising_)|(/advertisingbanner.)|(/advertisingbanner/)|(/advertisingcontent/)|(/advertisingmanual.)|(/advertisingmodule.)|(/advertisings.)|(/advertisingwidgets/)|(/advertisment-)|(/advertisment.)|(/advertisment/)|(/advertisments/)|(/advertize_)|(/advertlayer.)|(/advertmedia/)|(/advertorial/)|(/advertorial_)|(/advertorials/)|(/advertphp/)|(/advertpro/)|(/advertright.)|(/adverts.)|(/adverts/)|(/adverts_)|(/advertsky.)|(/adview.)|(/adviewer.)|(/advision.)|(/advolatility.)|(/advpartnerinit.)|(/advrotator.)|(/advzones/)|(/adweb2.)|(/adwords/)|(/adwordstracking.js)|(/adworks.)|(/adworks/)|(/adworx.)|(/adworx_)|(/adwrapper/)|(/adwrapperiframe.)|(/adx.)|(/adx_flash.)|(/adxsite.)|(/adyard.)|(/adyard300.)|(/adzone.)|(/adzone4.)|(/adzone_)|(/AdZoneAdXp.)|(/adzonebottom.)|(/adzoneleft.)|(/adzoneplayerright.)|(/adzoneright.)|(/adzones/)|(/adzonetop.)|(\/search\/a-srv\.ashx\?AdsNum)";

	var regexp_noad = new RegExp(reg);
	var urlsplit = details.url.split("/");
	urlsplit.splice(0,2);
	var temp="/"+urlsplit.join("/");
	
	if (regexp_noad.test(temp) && !cssRegexp().test(details.url)){
		log("STOP NOAD TRUE: " + details.url);
		return true;
	}
	log("STOP NOAD FALSE: " + details.url);
	return false;
}