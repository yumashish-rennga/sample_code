(function(window, jQuery) {

	(function($) {

		/* ----------------------------------------------------------
		 modal
		---------------------------------------------------------- */
		$(function() {

				/* 旅行日数HELP */
				$(document).on("click", ".js-dom-modal-help-night", function() {
					$('html').css('overflow', 'hidden');
					$('body').prepend('<div class="mfp-bg mfp-ready"></div><div class="mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-ready" tabindex="-1" style="overflow: hidden auto;"><div class="mfp-container mfp-s-ready mfp-inline-holder"><div class="mfp-content"></div></div></div>');
					$('.dom-modal-help-night').prependTo('.mfp-content');
					$('.dom-modal-help-night').removeClass('mfp-hide');
					$('.dom-modal-help-night').append('<button title="Close (Esc)" type="button" class="mfp-close">×</button>');
				});

				/* 旅行日数HELP */
				$(document).on("click", ".js-dom-modal-help-people", function() {
					$('html').css('overflow', 'hidden');
					$('body').prepend('<div class="mfp-bg mfp-ready"></div><div class="mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-ready" tabindex="-1" style="overflow: hidden auto;"><div class="mfp-container mfp-s-ready mfp-inline-holder"><div class="mfp-content"></div></div></div>');
					$('.dom-modal-help-people').prependTo('.mfp-content');
					$('.dom-modal-help-people').removeClass('mfp-hide');
					$('.dom-modal-help-people').append('<button title="Close (Esc)" type="button" class="mfp-close">×</button>');
				});

				//閉じるリンクの設定
				$(document).on('click', '.mfp-close, .mfp-close-btn-in', function () {
					$('.mfp-wrap').find('.mfp-close').remove();
					$('.dom-modal-small').addClass('mfp-hide');
					$('.mfp-content').find('.dom-modal-small').insertAfter('#tab-kokunai .form_search');
					$('html').css('overflow', '');
					$('.mfp-bg, .mfp-wrap').remove();
				});
		});
		
		
		/* ----------------------------------------------------------
		pulldown
		---------------------------------------------------------- */
		$('.js-dom-pulldown__input').on('click touchend', function() {
			var $this = $(this);
			var $thisinput = $(this).find('.js_area-select-input');
			if(!($thisinput).is(':disabled')){
				if (!$this.hasClass('is-active')) {
					closePulldown();
					$this.addClass('is-active');
					$this.parents('.js-dom-pulldown').find('.js-dom-pulldown__panel').fadeIn(100)
				}
				if ($this.hasClass('js-dom-pulldown__calendar-homeward') && $this.hasClass('is-active')) {
					$('.js-dom-pulldown__panel--calendar').addClass('is-active-homeward').fadeIn(100)
				}
			}
		});

		$(document).on('click touchend', function(e) {
			var $target = $(e.target);
			if ($target.closest('.js-dom-pulldown').length == 0) {
				closePulldown();
			}
		});

		function closePulldown() {
			$('.js-dom-pulldown').removeClass('is-active');
			$('.js-dom-pulldown__input').removeClass('is-active');
			$('.js-dom-pulldown__panel--calendar').removeClass('is-active-homeward');
			$('.js-dom-pulldown__input input').blur();
			$('.js-dom-pulldown__panel').fadeOut(100).removeAttr('style');
		}
		
		
		/* ----------------------------------------------------------
		検索パネル
		---------------------------------------------------------- */
		var $pulldown = $('.js-dom-pulldown__panel');
		var $areadown = $('.domtour-search__area-01');
		var $prefdown = $('.domtour-search__area-02');
		var $subareadown = $('.domtour-search__area-03');
		var $meshdown = $('.domtour-search__area-04');

		$(function() {

			/* ===============================
			 プルダウン→input引き渡し
			=============================== */
			$(document).find($pulldown).on('click','li',function() {
				var $parents = $(this).parents('.js-dom-pulldown');
				var $datadisname = $(this).data('name');
				var $dataval = $(this).data('code');
				var $datainputname = $(this).data('downlayer');

				//プルダウン select
				$(this).parent().find('li').removeClass('selected');
				$(this).addClass('selected');

				//プルダウン 選択 ;
				$('[data-layer=' + $datainputname + ']').attr('data-value',$dataval);
				$('[data-layer=' + $datainputname + ']').val($datadisname);

				//プルダウン 閉じる
				$pulldown.fadeOut();
				$('.js-dom-pulldown__input').removeClass('is-active');
			});
			
			/* ===============================
			 発地りかえ
			=============================== */
			$(document).ready(function () {
				$('#tab-kokunai .viewport').text($('#tab-kokunai [name=departure]')[0].textContent);
				$('#tab-kokunai [name=departure]').change(function () {
					$(this).prev('.viewport').text($("option:selected", this).text());
				}); 
			});

			/* ===============================
			 宿泊地
			=============================== */
			var jsondirectory = '/kokunai/_common/panel/json/';
			var $place = $('.dom-top-search__place');

			// 発地別エリアセレクト
			$('#tab-kokunai #area_tour01').change(function(){
				//リセット
				$('.domtour-search__area-02, .domtour-search__area-03, .domtour-search__area-04').each(function() {
					$(this).find('.js_area-select-list li').removeClass('selected');
					$(this).find('.js_area-select-list li:not(:first)').remove(); //プルダウン内削除
					$(this).find('.js_area-select-input').attr('disabled','disabled'); //inputグレーアウト
					$(this).find('.js-dom-pulldown__input input').val(''); //valを削除
				});

				$('#tab-kokunai .form_search').each(function() {
					var obj = $(this);
					var link = obj.attr("action").replace(/list\/.*?\//g, 'list/');
					obj.attr("action",link)
				});

				//発地切り替え変数
				var deptname = $(this).val();

				//エリア・都道府県・サブエリア・メッシュ
				$(document).on('click','.js_area-select-list li',function() {
					var $datadownlayer = $(this).data('downlayer');
					var $datacd = $(this).data('code');
					var $dataurl = $(this).data('url');
					var $prevParents = $(this).parents('.js-dom-pulldown').prev();
					var $nextParents = $(this).parents('.js-dom-pulldown').next();
					var $nextAllParents = $(this).parents('.js-dom-pulldown').nextAll();

					//リセット
					$nextAllParents.find('.js_pulldown input').val(''); //valを削除
					$nextAllParents.find('.js_area-select-input').attr('disabled','disabled'); //inputグレーアウト
					$nextAllParents.find('.js_area-select-list li:not(:first)').remove(); //プルダウン内削除

					if($(this).data('code') != false){
						$nextParents.find('.js_area-select-input').removeAttr('disabled');
					}

					if($datadownlayer != 'mesh'){
						//プルダウン表示
						var jsonfile = $nextParents.find('.js_area-select-input').data('layer');

						//プルダウン生成
						$.ajax({
							url: jsondirectory + jsonfile + '.json',
							type:"get",
							dataType:"json"
						}).done(function(data) {
							for(var i in data){
								if($datadownlayer == 'area' && $datacd == data[i].area){
									for(var j in data[i].pref){
										if(data[i].pref[j].prefcd === '01'|| data[i].pref[j].prefcd === '47'){
											$prefdown.find('.js_area-select-list').append('<li data-code="' + data[i].pref[j].prefcd + '" data-downlayer="pref" data-name="' + data[i].pref[j].prefname + '" data-url="' + data[i].pref[j].prefurl + '" class="selected">' + data[i].pref[j].prefname + '</li>');
										} else {
											$prefdown.find('.js_area-select-list').append('<li data-code="' + data[i].pref[j].prefcd + '" data-downlayer="pref" data-name="' + data[i].pref[j].prefname + '" data-url="' + data[i].pref[j].prefurl + '">' + data[i].pref[j].prefname + '</li>');
										}
									}
									if($prefdown.find('li.selected').data('code') == '01' || $prefdown.find('li.selected').data('code') == '47'){
										$prefdown.find('li.selected').click();
									}
								} else if($datadownlayer == 'pref' && $datacd == data[i].pref){
									for(var j in data[i].subarea){
										$subareadown.find('.js_area-select-list').append('<li data-code="' + data[i].subarea[j].subareacd + '" data-downlayer="subarea" data-name="' + data[i].subarea[j].subareaname + '">' + data[i].subarea[j].subareaname + '</li>');
									}
								} else if($datadownlayer == 'subarea' && $datacd == data[i].subarea){
									for(var j in data[i].mesh){
										$meshdown.find('.js_area-select-list').append('<li data-code="' + data[i].mesh[j].meshcd + '" data-downlayer="mesh" data-name="' + data[i].mesh[j].meshname + '">' + data[i].mesh[j].meshname + '</li>');
									}
								}
							}
						});
					}

					//action URLの変更
					var $prevDataurl = $prevParents.find('li.selected').data('url');
					var $prevDatacode = $prevParents.find('li.selected').data('code');
					var $submitclass = $(this).parents('.form_search').find(".js_search-button");
					
				
					//URLの変更
					var areaName = (function(){
						if($datadownlayer == 'area' && $datacd == false) return '';
						if($datadownlayer == 'pref' && $datacd == false || $datadownlayer == 'subarea' && $datacd == false) return $prevDataurl + '/';
						if($datadownlayer == 'mesh' && $datacd == false) return $prevDatacode + '/';
						if($datadownlayer == 'area' && $datacd != false || $datadownlayer == 'pref' && $datacd != false) return $dataurl + '/';
						if($datadownlayer == 'subarea' && $datacd != false || $datadownlayer == 'mesh' && $datacd != false) return $datacd + '/';
					})();

					$(this).parents(".form_search").each(function() {
						var obj = $(this);
						var link = obj.attr("action").replace(/list\/.*?\//g, 'list/');
						var link = link.replace('list/', 'list/' + areaName);
						obj.attr("action",link)
					});

				});
				
				/* ===============================
				 人数・室数初期設定
				=============================== */
				var peoplenumfirst = $('.js_selected-capacity').val();
				var roomnumfirst = $('.js_selected-room-count').val();
				$('.js_capacity-room-input').val(peoplenumfirst + '名・' + roomnumfirst + '室');
			}).trigger('change');


			/* ===============================
			 日数
			=============================== */
			var $dayval = $('.dom-top-search__night .js_area-select-input').val();
			var $daydsn = $('.dom-top-search__night input[name=traveldays]');
			if($dayval == false){
				$daydsn.val('');
			} else {
				$daydsn.val($dayval);
			}

			/* ===============================
			 人数・室数
			=============================== */
			var $spinbox = $('.dom-spinbox');
			var btplus = '.dom-spinbox__btn--plus';
			var btminus = '.dom-spinbox__btn--minus';

			// リセット
			$spinbox.each(function() {
				var minnum = $(this).find(btminus).data('min');
				var maxnum = $(this).find(btplus).data('max');

				if($(this).find('.dom-spinbox__input').val() == minnum){
					$(this).find(btminus).addClass('dom-spinbox__btn--disabled');
				} else if($(this).find('.dom-spinbox__input').val() == maxnum){
					$(this).find(btplus).addClass('dom-spinbox__btn--disabled');
				}
			});

			// プラス・マイナスボタン
			$('.js_capacity-change, .js_room-count-change').click(function(){
				var $peopleParents = $(this).parents('.dom-top-search__people');
				var $peopleParent = $(this).parent();

				if($peopleParent.find("input").hasClass('js_selected-capacity')){
					var currentVal = parseInt($peopleParents.find(".js_selected-capacity").val());
				} else if($peopleParent.find("input").hasClass('js_selected-room-count')){
					var currentVal = parseInt($peopleParents.find(".js_selected-room-count").val());
				}

				var peoplePlusMax = $peopleParent.children(btplus).data('max');
				var peopleMinusMin = $peopleParent.children(btminus).data('min');
				var peopleAdd = $(this).data('add');
				var currentVal = currentVal + peopleAdd;

				if(!currentVal || currentVal=="" || currentVal == "NaN") currentVal = 0;
				if(peopleMinusMin <= currentVal && currentVal <= peoplePlusMax){
					if($peopleParent.children('input').hasClass('js_selected-capacity')){
					   $peopleParents.find(".js_selected-capacity").val(currentVal);
					} else if($peopleParent.children('input').hasClass('js_selected-room-count')){
					   $peopleParents.find(".js_selected-room-count").val(currentVal);
					}
					var peoplenum = $(this).parents('.js-dom-pulldown__panel').find('.js_selected-capacity').val();
					var roomnum = $(this).parents('.js-dom-pulldown__panel').find('.js_selected-room-count').val();
					$('.js_selected-capacity').attr('data-value',peoplenum);
					$('.js_selected-capacity').val(peoplenum);
					$('.js_selected-room-count').attr('data-value',roomnum);
					$('.js_selected-room-count').val(roomnum);
					$('.js_capacity-room-input').val(peoplenum + '名・' + roomnum + '室');

					if(currentVal <= peopleMinusMin || peoplePlusMax <= currentVal){
						$(this).addClass('dom-spinbox__btn--disabled');
					}
					if(peopleMinusMin < currentVal){
						$peopleParent.children(btminus).removeClass('dom-spinbox__btn--disabled');
					}
					if(currentVal < peoplePlusMax){
						$peopleParent.children(btplus).removeClass('dom-spinbox__btn--disabled');
					}
				}
			});

			/* ===============================
			 交通条件・航空
			=============================== */
			function transportationAir(){
				$('#radio1-2').each(function() {
					if($(this).prop('checked')){
						$('.dom-form-checkbox__input[name=transportation]').removeAttr('disabled');
						$('.dom-form-checkbox__input[name=transportation]').parent().removeClass('disabled');
					} else {
						$('.dom-form-checkbox__input[name=transportation]').attr('disabled','disabled');
						$('.dom-form-checkbox__input[name=transportation]').prop('checked',false);
						$('.dom-form-checkbox__input[name=transportation]').parent().addClass('disabled');
					}
				});
			}transportationAir();
			$(document).on('click','.dom-form-radio__input[name=transportation]',function(){
				transportationAir();
			});

			/* ===============================
			 全泊で同じ施設
			=============================== */
			$('#check1').prop('checked','true');
			$('#check1').change(function(){
				if($(this).prop('checked')) {
					$(this).prev().val('1');
				} else {
					$(this).prev().val('0');
				}
			}).trigger('change');	

		});
		
		
	

	})(jQuery);
	
}(window, window.$1124))
