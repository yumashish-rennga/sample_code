(function (win, $) {
	'use strict';
	var VERSION = '20190731';
	var ID = 'koknai_sp';

	if (typeof $ !== 'function') {
		return;
	}

	/**
	 * hooks について
	 * onCountChange(_form) : 人数内訳が変更されたときに動く、data-count-min, data-count-max の制御を行う
	 * getFormData(_object, _form) : 内側に持っているフォーム設定値情報の編集を行う
	 * onSubmit(_form) : 検索ボタン押下時の処理、ga や国内 DP のように action が選択内容によって変わる場合に使用する
	 */

	// デバッグモード
	var ID_DEBUG = 'debug';
	var dbg = (location.hash === '#' + ID_DEBUG);
	dbg && !$("#" + ID_DEBUG)[0] && (function showDebug() {
		var $elm = $("<table>").attr({
			id: ID_DEBUG,
			border: 1
		}).css({
			backgroundColor: 'silver',
			opacity: .7,
			position: 'fixed',
			pointerEvents: 'none',
			maxWidth: '100vw',
			transition: 'opacity .2s ease-in-out',
			right: 0,
			top: 0,
			zIndex: 999
		}).on('click', function () {
			this.style.opacity = {'0.7': 1, '1': .7}[this.style.opacity];
		}).append("<thead><tr><th>名前</th><th>設定値</th><th>ラベル</th>").appendTo("BODY");
		var $cap = $("<caption>").css({
			wordBreak: 'keep-all',
			color: 'whitesmoke',
			backgroundColor: 'black',
			textAlign: 'center'
		}).appendTo($elm);
		var $bdy = $("<tbody>").appendTo($elm);
		setInterval(function () {
			var $frm;
			var cap;
			$("form:visible").each(function (_index) {
				var $this = $(this);
				if ($this.attr('data-title')) {
					cap = ID + VERSION + $this.attr('data-title');
					$frm = $this;
					return false;
				}
			});
			if ($frm && $frm[0].getFormData) {
				var obj = $frm[0].getFormData();
				var dat = JSON.stringify(obj);
				var org = $bdy.attr('data-form');
				if (dat !== org) {
					$cap.text(cap);
					$bdy.attr('data-form', dat);

					$bdy.empty();
					for (var id in obj) {
						var val = obj[id][0];
						var lbl = obj[id][1];
						$("<tr>").append("<th>" + id).append("<td>" + val).append("<td>" + lbl).appendTo($bdy);
					}
				}
			}
		}, 1000);
	})();

	// 引数取得
	var args = (function () {
		var ret = {};
		var scr = document.currentScript || (function (_elements) {
			var ret;
			var elms = _elements;
			for (var idx = elms.length; idx; idx--) {
				var elm = elms[idx - 1];
				if (elm.src) {
					return elm;
				}
			}
		})(document.getElementsByTagName('script'));
		var prms = scr && scr.src && scr.src.split('?', 2);
		if (prms = prms && prms[1] && prms[1].split('&')) {
			for (var idx = 0, max = prms.length; idx < max; idx++) {
				var prm = prms[idx].split('=', 2);
				ret[decodeURIComponent(prm[0])] = decodeURIComponent(prm[1]);
			}
		}
		return ret;
	})();

	// バージョンチェック
	if (args.version !== VERSION) {
		console.warn('Version unmatched ' + args.version + ' and ' + VERSION);
	} else {
		console.log('panel_kokunai.js version ' + VERSION);
	}
	// フォーム取得
	var frms = (function (_forms) {
		var ret = [];
		var arr = _forms.split(',');
		for (var idx = 0, max = arr.length; idx < max; idx++) {
			var frm = document.getElementById(arr[idx]);
			if (frm && frm.submit) {
				ret.push(frm);
			} else {
				console.warn('Form ' + arr[idx] + ' is not found.');
			}
		}
		return ret;
	})(args.form);
	if (!frms.length) {
		return;
	}
	var $frms = $('#' + args.form.split(',').join(',#'));

	/**
	 * 検索パネルタブ
	 */
	$.fn.searchPanelTab = function (option) {
		// 選択しているタブ情報の保持
		var COOKIE = 'searchPanelTab';
		var tab = (function getCookie() {
			var mch = (new RegExp('\\b' + COOKIE + '=(.*?)(;|$)')).exec(document.cookie);
			return mch && mch[1] && mch[1] || location.hash;
		})();
		var saveCookie = function (_id) {
			tab = _id;
			document.cookie = COOKIE + '=' + tab;
		};

		return this.each(function () {
			var $root = $(this);
			var $tabList = $root.children('.js_tab_list');
			var $tabListAnc = $tabList.find('a');
			var $tabPanel = $root.children('.js_tab_penel');
			var $tabPanelItem = $tabPanel.children('.panel_item');
			var $optionTglBtn = $root.find('.js_option_toggle');
			$tabPanelItem.addClass('-is_close');
			// cookie から取得したタブを初期表示(無い場合は先頭)
			var $sel = $tabPanel.find(tab);
			$sel = $sel.length ? $sel : $tabPanelItem.eq(0);
			tab = '#' + $sel.attr('id');
			$sel.addClass('-is_open');
			$tabListAnc.each(function () {
				var $this = $(this);
				if ($this.attr('href') === tab) {
					$this.removeClass('-is_close').addClass('is_active');
					$sel.hasClass('-is_expand') && setTimeout(function () {
						$sel.removeClass('-is_close').addClass('-is_open');
					}, 0);
				}
			});

			$tabList.on('click', 'a', function (e) {
				e.preventDefault();

				var $this = $(this);
				var href = $this.attr('href');
				$tabListAnc.removeClass('is_active');
				$tabPanelItem.removeClass('-is_open');
				$this.addClass('is_active');
				$tabPanel.find(href).addClass('-is_open');
				var $sel = $tabPanel.find(href).show();
				if ($sel.hasClass('-is_expand')) {
					$sel.removeClass('-is_close').addClass('-is_open');
				}
				if ($sel.length) {
					// 選択タブがある場合は cookie 保存
					saveCookie(href);
				}
			});

			// 条件ボタン
			$optionTglBtn.on('click', function () {
				var $this = $(this);
				var $items = $this.prev('.items');
				var offset = $tabPanel.offset().top;
				var winOffset = win.pageYOffset;
				$this.toggleClass('-is_active');
				$items.toggleClass('-is_open');
				if ($this.hasClass('-is_active')) {
					$this.text('条件を閉じる');
				} else {
					$this.text('条件を追加する');
					if (winOffset > offset) {
						win.scrollTo(0, offset);
					}
				}
			});
		});
	};

	/**
	 * 通常タブ
	 */
	$.fn.tab = function (_option) {
		var opt = _option || {};
		return this.each(function () {
			var $root = $(this);
			var $tabList = $root.children('.js_tab_list');
			var $tabListAnc = $tabList.find('a');
			var $tabPanel = $root.children('.js_tab_item');
			var $tabPanelItem = $tabPanel.children('.tab_item');

			var chg = this.change = function (_index) {
				var idx = _index || 0;
				if (idx > -1) {
					$tabPanelItem.removeClass('-is_show');
					$tabListAnc.removeClass('-is_active');
					$tabPanelItem.eq(idx).addClass('-is_show');
					$tabListAnc.eq(idx).addClass('-is_active');
				}
			};

			var cur = opt.default || 0;
			chg(cur);

			$tabListAnc.on('click', function (e) {
				e.preventDefault();
				var idx = $tabListAnc.index($(this));
				if (idx !== cur) {
					chg(idx);
					cur = idx;
				}
			});
		});
	};

	/**
	 * agreementToggle
	 */
	$.fn.agreementToggle = function (option) {
		if (this.length <= 0) {
			return undefined;
		}

		return this.each(function () {
			var $root = $(this);
			var $btn = $root.find('input[type="checkbox"]');
			var $toggleArea = $root.next('.js_agreement_area');

			$btn.on('change', function (e) {
				var prop = $(this).prop('checked');
				if (prop) {
					$toggleArea.addClass('-is_show');
				} else {
					$toggleArea.removeClass('-is_show');
				}
			}).trigger('change');
		});
	};

	/**
	 * toggle
	 */
	$.fn.toggle = function (option) {
		if (this.length <= 0) {
			return undefined;
		}

		var text = ['開く', '閉じる'];

		return this.each(function () {
			var $root = $(this);
			var $toggleBtn = $root.find('.js_toggle_btn');
			$toggleBtn.append('<span>開く</span>');
			$root.on('click', '.js_toggle_btn', function (e) {
				e.preventDefault();
				var $this = $(this);
				$this.toggleClass('-is_active')
					.next('.js_toggle_item').toggleClass('-is_show');
				$this.find('span').text($this.hasClass('-is_active') ? text[1] : text[0]);
			});
		});
	};

	/**
	 * フォーム値反映
	 * data-form : 反映先のコントロール ID(空白区切りで複数指定可)
	 * data-value : 設定値(空白区切りで反映先ごとに複数指定可)
	 */
	$.fn.applyForm = function () {
		return $(this).on('click change', function () {
			var $this = $(this);

			var inp = $this.attr('data-applyform');
			var val = $this.attr('data-value');
			val = val !== undefined ? val : $this.val();
			var lbl = $this.find("option:selected").text();

			if (inp) {
				// XXX:キーワードラベル反映モジュール化
				var vl2 = $this.attr('data-value-keyword');
				var lb2 = $this.attr('data-label-keyword');

				$(inp.replace(/(^| )/g, '$1#').replace(/ /g, ',')).each(function (_index) {
					var $this = $(this);
					if ($this.val() != val) {
						if (this.selectedIndex !== undefined) {
							// XXX:SELECT 要素の場合はラベルと値を設定する
							$this.attr('data-value', val).val(val);
							$this.selectmenu && $this.selectmenu('instance') && $this.selectmenu('refresh');
						} else {
							$this.val(lbl || val).attr('data-value', val);
						}

						vl2 && lb2 && $this.attr('data-value-keyword', vl2).attr('data-label-keyword', lb2);

						$this.trigger('change');
					}
				});
			}
		});
	};

	/**
	 * 要素が空なら反映先を無効化する
	 * 反映元属性
	 * data-disabler-for : 反映先のID
	 */
	$.fn.disabler = function () {
		return $(this).on('change', function () {
			var $this = $(this);
			var dis = !$this.val();
			var ids = ($this.attr('data-disabler-for') || '').replace(/(^| )/g, '$1#').replace(/ /g, ',');
			$(ids).each(function () {
				var $this = $(this);
				$this.prop('disabled', dis);
				$this.selectmenu && $this.selectmenu('instance') && $this.selectmenu('option', 'disabled', dis);
			});
		});
	};

	/**
	 * 複数のプルダウンを設定値によって制御する
	 * data-group : 連携グループ
	 * data-name : テンプレートに反映する設定名
	 * data-source : データ
	 * data-value : 設定値
	 */
	var dataControls = {};
	$.fn.dataControl = function () {
		var $elms = $(this);
		var getGroupData = function (_group) {
			return dataControls[_group] || (dataControls[_group] = {});
		};
		var extractValue = function (_group, _text) {
			var ret = _text;
			var dat = getGroupData(_group);
			for (var id in dat) {
				var val = dat[id];
				var reg = new RegExp('{' + id.replace(/\W/g, '\\\$&') + '}', 'g');
				if (reg.test(ret) && val) {
					ret = ret.replace(reg, val);
				}
			}
			if (/{.+?}/.test(ret)) {
				//console.warn('[dataControl]data-source left replacements: ' + ret);
				ret = undefined;
			}
			return ret;
		};
		return $elms.on('change', function () {
			var $this = $(this);

			var grp = $this.attr('data-group');
			var dat = grp && getGroupData(grp);
			if (dat) {
				if (this.selectedIndex !== undefined) {
					// プルダウンの場合は値強制反映
					$this.attr('data-value', this.value);
				}
				dat[$this.attr('data-name') || this.name] = $this.attr('data-value') || this.value;
				$elms.filter("[data-group=" + grp + "]").each(function (_index) {
					var $this = $(this);
					var tpl = $this.attr('data-control-source');
					var src = extractValue(grp, tpl);
					var org = $this.attr('data-source');
					if (org !== src) {
						$this.attr('data-source', src);
						if (this.selectedIndex !== undefined) {
							// プルダウンの場合「指定なし」以降をクリア
							var nam = $this.attr('data-name') || this.name;
							if (dat[nam]) {
								dat[nam] = '';
							}
							$this.val('').removeAttr('data-value');
							var $opts = $this.find("option[value!='']");
							if ($opts.length) {
								$opts.remove();
								$this.selectmenu('instance') && $this.selectmenu('refresh');
							}
						}
						if (src) {
							$.ajax({
								url: src,
								dataType: 'json',
								cache: true,
								success: function (_data) {
									var dat = _data;
									if (dat) {
										var $def;
										var val = $this.attr('data-value');
										var lbl = $this.attr('data-label');
										if ($this[0].selectedIndex !== undefined) {
											if (dat.push) {
												// 配列の場合
												var $grp = $this;
												var grp;
												for (var idx = 0, max = dat.length; idx < max; idx++) {
													var itm = dat[idx];
													if (itm.split) {
														var vl = itm.split(':', 3);
														var val = vl[0].split('|', 3);
														var $opt = $("<option value='" + val[0] + "'>").text(val[1]).appendTo($grp);
														vl[1] && vl[2] && $opt.attr('data-label-keyword', vl[1]).attr('data-value-keyword', vl[2]);
													} else {
														if (itm.group !== grp) {
															grp = itm.group;
															$grp = $("<optgroup label='" + grp + "'>").appendTo($this);
														}
														var $opt = $("<option value='" + itm.name + "'>").text(itm.label).appendTo($grp);
														itm.valueKeyword && itm.labelKeyword && $opt.attr('data-value-keyword', itm.valueKeyword).attr('data-label-keyword', itm.labelKeyword);
													}
													if (itm.name === val && (!$def || dat[id] === lbl)) {
														$def = $opt;
													}
												}
												if ($def) {
													$def.prop('selected', true);
													$this.attr('data-value', val).attr('data-label', lbl);
												}
												if ($this.selectmenu && $this.selectmenu('instance')) {
													$this.selectmenu('refresh');
												} else if ($this[0].selectedIndex === undefined) {
													lbl && $this.val(lbl);
												}
											} else if (dat) {
												// オブジェクトの場合
												var arr = Object.keys(dat).sort();
												for (var idx = 0, max = arr.length; idx < max; idx++) {
													var id = arr[idx];
													var itm = dat[id];
													var vl = itm.split(':', 3);
													var $opt = $("<option value='" + id + "'>").text(vl[0]).appendTo($this);
													vl[1] && vl[2] && $opt.attr('data-label-keyword', vl[1]).attr('data-value-keyword', vl[2]);
													if (id === val && (!$def || vl[0] === lbl)) {
														$def = $opt;
													}
												}
												if ($def) {
													$def.prop('selected', true);
													$this.attr('data-value', val).attr('data-label', lbl);
												}
												if ($this.selectmenu && $this.selectmenu('instance')) {
													$this.selectmenu('refresh');
												} else if ($this[0].selectedIndex === undefined) {
													lbl && $this.val(lbl);
												}
											}
										} else if ($this.is(".js_suggest,.toggle_search")) {
											// ボタンパネルの有効無効制御
											var $drp = $this.parent().find(".js_drop_item");
											$drp.find(".js_suggest_btn.-link").each(function () {
												var $this = $(this);
												var itm = dat[$this.attr('data-value')];
												if (itm) {
													var vl = itm.split(':', 3);
													$this.removeAttr('disabled').removeClass('disabled').text(vl[0]);
													vl[1] && vl[2] && $this.attr('data-label-keyword', vl[1]).attr('data-value-keyword', vl[2]);
												} else {
													$this.attr('disabled', true).addClass('disabled');
												}
											});
											// ボタンがすべて無効されていたらタブも無効化
											$drp.find(".tab_search .tab_list a,.js_toggle_list a.js_toggle_btn").each(function () {
												var $this = $(this);
												var $pnl = $($this.attr('href'));
												var dis = !$pnl.find("button:not(:disabled)")[0];
												if (dis) {
													$this.addClass('disabled');
												}
											});
										}
										$this.trigger('change');
									}
								}
							});
						}
					}
				});
			}
		}).trigger('change');
	};

	/**
	 * カウントアップボタン
	 */
	$.fn.countSet = function (_option) {
		return $(this).each(function () {
			var $root = $(this);
			var template = $root.attr('data-count-set');
			var countItems = template.match(/(\$\{(.+?)\})/g);
			var count = {};
			var ttl = 0;
			var $btnWrap = $root.parent('.js_drop_select').siblings('.js_drop_item');
			var $body = $("body");

			$root.prop('readonly', true);

			var ref = $root[0].refresh = function () {
				// カウントの再計算
				for (var i = countItems.length - 1; i >= 0; i--) {
					count[countItems[i]] = 0;
					var $target = $btnWrap.find('[data-count-get="' + countItems[i] + '"]');
					$target.find('[data-count][value]').each(function () {
						count[countItems[i]] += this.value * 1;
						//$(this).prop('readonly', true).siblings('[data-count-type="decrement"]').prop('disabled', true);
					});
				}
				$root.trigger('countChange');
			};

			window.setTimeout(function () {
				$root[0].refresh();
			}, 0);
			$btnWrap.find("[data-count][value]").each(function () {
				this.refresh = ref;
			});

			for (var i = countItems.length - 1; i >= 0; i--) {
				var id = countItems[i];
				var $target = $btnWrap.find('[data-count-get="' + id + '"]');
				$target.find("[data-count-type]").filter(function () {
					// 入れ子チェック
					var $par = $(this).closest("[data-count-get]");
					return ($par.attr('data-count-get') === id);
				}).on('click', function () {
					// 増減ボタンの状態制御
					var $this = $(this);
					var $inp = $this.siblings('[data-count]');
					var mx = $inp.attr('data-count-max') * 1;
					var mn = $inp.attr('data-count-min') * 1 || 0;
					var key = $inp.attr('data-count');
					var val = $inp.val() * 1;
					switch ($this.attr('data-count-type')) {
						case 'increment':
							if (mx > val) {
								$inp.val(++val).attr('data-value', val);
								count[key]++;
							}
							break;
						case 'decrement':
							if (val >= mn) {
								$inp.val(--val).attr('data-value', val);
								count[key]--;
							}
							break;
					}
					$root.trigger('countChange');
				});
			}

			$btnWrap.on('click', '.js_count_set_btn', function () {
				$root.focus();
				$body.trigger('click.closeDropSelect');
				$root.blur();
			});

			$root.on('countChange', function () {
				// 合計人数取得
				ttl = 0;
				var tpl = template;
				var arr = Object.keys(count);
				for (var idx = 0, max = arr.length; idx < max; idx++) {
					var key = arr[idx];
					ttl += count[key];
					tpl = tpl.replace(key, count[key]);
				}
				var reg = /#{([0-9()+*/-]+)}/g;
				var mch = reg.exec(tpl);
				if (mch && mch[1]) {
					tpl = tpl.replace(reg, eval(mch[1]));
				}
				tpl = tpl.replace(/#{.*}/g, '');
				if (ttl === 0) {
					$root.val('');
				} else {
					$root.val(tpl);
				}
				// HOOK
				var frm = $root.closest('form')[0];
				if (frm && frm.hooks) {
					var hok = frm.hooks.onCountChange;
					hok && hok(frm);
				}
				// 人数増減ボタン入力制御
				$btnWrap.find("[data-count-get]").each(function affectSpinButton() {
					var $this = $(this);
					var id = $this.closest("[data-count-get]").attr('data-count-get');
					var ttl = 0;
					$this.find('[data-count="' + id + '"]').each(function sumPersonCount() {
						ttl += $(this).val() * 1;
					});
					var max = $this.attr('data-count-max');
					$this.find("[data-count-type]").filter(function () {
						var $par = $(this).closest("[data-count-get]");
						return $par.attr('data-count-get') === id;
					}).each(function () {
						var $this = $(this);
						var $inp = $this.siblings('[data-count]');
						// 合計人数最大値と項目ごとの最大値の小さいほう
						var mx = max ? Math.min(max - (ttl - $inp.val()), $inp.attr('data-count-max')) : $inp.attr('data-count-max');
						var mn = $inp.attr('data-count-min') * 1 || 0;
						switch ($this.attr('data-count-type')) {
							case 'increment':
								$this.prop('disabled', $inp.val() * 1 >= mx);
								break;
							case 'decrement':
								$this.prop('disabled', $inp.val() * 1 <= mn);
								break;
						}
					});
				});
			}).trigger('countChange');
		});
	};

	/**
	 * suggest
	 */
	$.fn.suggest = function (_option) {
		return this.each(function () {
			var $root = $(this);
			var $dropItem = $root.siblings(".js_drop_item");
			var $dropCloseBtn = $dropItem.find(".js_drop_close_btn");
			var $body = $("body");
			var val = $root.val();
			var $clickTarget = null;

			$root.on('focus', function (e) {
				val = $root.val();
				$body.off('click.closeSuggest');
				$root.find(".js_drop_item").not($dropItem).removeClass('-is_open');
				$dropItem.addClass('-is_open');
				$body.on('click.closeSuggest', function (e) {
					//!$root.is(e.target) && $root.trigger('closeSuggest');
					var $target = $(e.target);
					if (!$root.is($target) && !$dropItem.find($target)[0] && !$target.closest(".ui-widget")[0]) {
						$root.trigger('closeSuggest');
					}
				});
			});

			// 非表示処理
			$root.on('closeSuggest', function () {
				$dropItem.removeClass('-is_open');
				$body.off('click.closeSuggest');
			});

			// キー入力時
			$root.on('keyup', function () {
				val = $root.val();
				if (!val.length) {
					$root.trigger('focus');
				} else {
					$root.trigger('closeSuggest');
				}
			});

			$dropItem.on('touchstart', function (e) {
				$clickTarget = $(e.target);
			});

			$root.on('blur', function () {
				if (
					$dropItem.find($clickTarget).length === 0 &&
					!$dropItem.is($clickTarget)
				) {
					$root.trigger('closeSuggest');
				}
				$clickTarget = null;
			});

			$dropCloseBtn.on('click', function () {
				$root.trigger('closeSuggest');
			});

			// 値の反映
			$dropItem.on('click', '.js_suggest_btn', function () {
				// 値が入っていたら項目を反映する
				var $this = $(this);
				var val = $this.attr('data-value') || this.value;
				var lbl = $this.attr('data-label') || $this.text();
				val && $root
					// 値設定
					.attr('data-value', val)
					// 表示名項目を反映する
					.val(lbl)
					// ラベル保存
					.attr('data-label', lbl)
					// 反映先テキストに反映
					.attr('data-label-keyword', $this.attr('data-label-keyword'))
					.attr('data-value-keyword', $this.attr('data-value-keyword'))
					// 確定状態にする
					.addClass('-is_selected')
					// イベントを動かす
					.trigger('change');
				$root.trigger('closeSuggest')//.focus().blur();
			});

			$dropItem.on('click', function (e) {
				e.stopPropagation();
			});
		});
	};

	/**
	 * 選択補助表示
	 */
	$.fn.dropSelect = function (option) {
		if (this.length <= 0) {
			return undefined;
		}

		return this.each(function () {
			var $root = $(this);
			var $dropItem = $root.siblings('.js_drop_item');
			var $input = $root.find('input');
			var $body = $("body");
			var $clickTarget = null;

			$input.on('focus', function (e) {
				$body.off('click.closeDropSelect');
				$dropItem.addClass('-is_open');
				$body.on('click.closeDropSelect', function (e) {
					if (!$input.is(e.target)) {
						$root.trigger('closeDropSelect');
					} else {
						$(".js_drop_item").not($dropItem).removeClass('-is_open');
					}
				});
			});

			$dropItem.on('touchstart', function (e) {
				$clickTarget = $(e.target);
			});

			$dropItem.on('click', function (e) {
				e.stopPropagation();
			});
			// 非表示処理
			$root.on('closeDropSelect', function () {
				$dropItem.removeClass('-is_open');
				$body.off('click.closeDropSelect');
			});

			$input.on('blur', function (e) {
				if (
					$dropItem.find($clickTarget).length === 0 &&
					!$dropItem.is($clickTarget)
				) {
					$root.trigger('closeDropSelect');
				}
				$clickTarget = null;
			});
		});
	};

	$(function () {
		if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
			$("html").addClass('ios');
		}

		$frms.closest(".js_search_tab:not(.search_tab_inited)").addClass('search_tab_inited').searchPanelTab();
		$frms.find(".js_tab").tab();
		$frms.find(".js_count_set").countSet();
		$frms.find(".js_drop_select").dropSelect();
		$frms.find(".js_disabler").disabler();
		$frms.find(".js_suggest").suggest();
		$frms.find(".js_datacontrol").dataControl();
		/*$frms.find(".js_select").each(function () {
			var $this = $(this);
			$this.selectmenu({
				select: function (_event, _ui) {
					var opt = this[this.selectedIndex];
					this.setAttribute('data-value', opt && opt.value || '');
					this.setAttribute('data-label', opt && (opt.textContent || opt.innerText) || '');
					var frm = this.form;
					var hoks = frm && frm.hooks;
					if (hoks && hoks.onChange) {
						hoks.onChange($(frm));
					}
					$(this).trigger('change');
				}
			});
		});*/
		$frms.find(".js_agreement_btn").agreementToggle();
		$frms.find(".js_toggle").toggle();
		$frms.on('keydown', 'input[type="text"]', function (e) {
			var key = e.key || e.keyCode;
			if (key === 'Enter' || key === 13) {
				$(this).blur();
				e.preventDefault();
			}
		});
		$frms.find(".js_applyform").applyForm();

		(function calendar() {
			// 祝日データ
			var holidays = window.JTB_HOLIDAYS || {};

			/**
			 * 祝日設定
			 * @param {[type]} _date [description]
			 */
			function setHoliday(_date) {
				var ymd = _date.getFullYear() * 10000 + _date.getMonth() * 100 + 100 + _date.getDate();
				return holidays[ymd] !== undefined ? 'ui-datepicker-holiday ' : '';
			}

			var $clickTarget = null;
			var $datepicker = null;

			var defaults = {
				minDate: 0,
				maxDate: '+1y',
				beforeShow: function (input, inst) {
					var $calendar = inst.dpDiv;
					var $input = $(input);
					var rect = $input.offset().top;
					var height = $input.height();
					setTimeout(function () {
						$calendar.css({ top: rect + height });
					}, 1);
				},
				beforeShowDay: function (date) {
					var holiday = setHoliday(date);
					return [true, holiday];
				}
			};

			$frms.find(".js_datepicker").each(function () {
				var $this = $(this);
				var sync = $this.attr('data-datepicker-sync-from');
				var $syncTo;
				var pos = '';
				var settingSyncFrom = {
					beforeShow: function (input, inst) {
						var $calendar = inst.dpDiv;
						var $input = $(input);
						var rect = $input.offset().top;
						var height = $input.height();
						pos = $input.data('datepicker-pos');
						$calendar.addClass(pos);

						setTimeout(function () {
							$calendar.css({ top: rect + height });
						}, 1);
					},
					beforeShowDay: function (date) {
						var fmt = $.datepicker.regional.ja.dateFormat;
						var date1 = $.datepicker.parseDate(fmt, $this.val());
						var date2 = $.datepicker.parseDate(fmt, $syncTo.val());
						var startDay = date.getTime() === (date1 ? date1.getTime() : 0) ? 'ui-datepicker-date-checkin ' : '';
						var endDay = date.getTime() === (date2 ? date2.getTime() : 0) ? 'ui-datepicker-date-checkout ' : '';
						var holiday = setHoliday(date);
						var range = date1 && date2 && ((date.getTime() == date1.getTime()) || (date2 && date >= date1 && date <= date2)) ? 'ui-datepicker-date-period' : '';
						return [true, startDay + endDay + holiday + range];
					},
					onClose: function (selectedDate, inst) {
						var $calendar = $(inst.dpDiv);
						$calendar.removeClass(pos);
						// 初期値の最小最大を保存
						var sync = $syncTo[0];
						sync.defaultMinDate = sync.defaultMinDate || sync.getAttribute('data-min');
						sync.defaultMaxDate = sync.defaultMaxDate || sync.getAttribute('data-max');

						var now = new Date(); now.setHours(0, 0, 0, 0);
						var cur = new Date(selectedDate);
						var min = sync.defaultMinDate, max = sync.defaultMaxDate;
						if (cur && cur.getTime()) {
							// 最小値補正
							var def = new Date(now.getTime() + sync.defaultMinDate * 1000 * 60 * 60 * 24);
							var ofs = $this.attr('data-sync-min-offset') * 1 || 0;
							var dat = new Date(cur.getTime() + ofs * 1000 * 60 * 60 * 24);
							min = new Date(Math.max(dat, def));
							// 最大値補正
							var def = new Date(now.getTime() + sync.defaultMaxDate * 1000 * 60 * 60 * 24);
							var ofs = $this.attr('data-sync-max-offset') * 1 || 365;
							var dat = new Date(cur.getTime() + ofs * 1000 * 60 * 60 * 24);
							max = new Date(Math.min(dat, def));
							// 初期値補正
							var ofs = this.getAttribute('data-sync-offset');
							if (ofs && !$syncTo.val()) {
								var dat = new Date(cur.getTime() + ofs * 1000 * 60 * 60 * 24);
								$syncTo.datepicker('setDate', dat);
							}
						}
						$syncTo.datepicker('option', {
							minDate: min,
							maxDate: max
						});
						setTimeout(function () {
							// 範囲外になった連動先の日付の設定値補正
							$syncTo.attr('data-value', $syncTo.val().split('/').join(''));
						}, 0);
					},
					onSelect: function (_text, _instance) {
						$.datepicker.onSelectSuper.call(this, _text, _instance);
						$this.focus().blur();
					}
				};
				// 到着日
				var settingSyncTo = {
					beforeShow: function (input, inst) {
						var $calendar = inst.dpDiv;
						var $input = $(input);
						var rect = $input.offset().top;
						var height = $input.height();
						pos = $input.data('datepicker-pos');
						$calendar.addClass(pos);
						setTimeout(function () {
							$calendar.css({ top: rect + height });
						}, 1);
					},
					beforeShowDay: function (date) {
						var fmt = $.datepicker.regional.ja.dateFormat;
						var date1 = $.datepicker.parseDate(fmt, $this.val());
						var date2 = $.datepicker.parseDate(fmt, $syncTo.val());
						var startDay = date.getTime() === (date1 ? date1.getTime() : 0) ? 'ui-datepicker-date-checkin ' : '';
						var endDay = date.getTime() === (date2 ? date2.getTime() : 0) ? 'ui-datepicker-date-checkout ' : '';
						var holiday = setHoliday(date);
						var range = date1 && date2 && ((date.getTime() == date1.getTime()) || (date2 && date >= date1 && date <= date2)) ? ' ui-datepicker-date-period' : '';
						return [true, startDay + endDay + holiday + range];
					},
					onSelect: function (_text, _instance) {
						$.datepicker.onSelectSuper.call(this, _text, _instance);
						$syncTo.blur();
					},
					onClose: function (_date, _inst) {
						var $calendar = $(_inst.dpDiv);
						$calendar.removeClass(pos);

						//$this.datepicker('option', 'maxDate', _date ? _date : '+1y');
					}
				};

				$this.prop('readonly', true);
				if (!sync) {
					$this.datepicker($.extend(true, {}, defaults, {
						minDate: $this.attr('data-min') || defaults.minDate,
						maxDate: $this.attr('data-max') || defaults.maxDate
					}));
					$this.on('blur', function () {
						if ($datepicker.find($clickTarget).length === 0 && !$datepicker.is($clickTarget)) {
							$this.datepicker('hide');
						}
						$clickTarget = null;
					});
				} else {
					$syncTo = $frms.find("[data-datepicker-sync-to='" + sync + "']");
					$this.datepicker($.extend(true, {}, defaults, {
						minDate: $this.attr('data-min') || defaults.minDate,
						maxDate: $this.attr('data-max') || defaults.maxDate
					}, settingSyncFrom));
					$syncTo.prop('readonly', true).datepicker($.extend(true, {}, defaults, {
						minDate: $syncTo.attr('data-min') || defaults.minDate,
						maxDate: $syncTo.attr('data-max') || defaults.maxDate
					}, settingSyncTo));

					$this.on('blur', function (e) {
						if ($datepicker.find($clickTarget).length === 0 && !$datepicker.is($clickTarget)) {
							$this.datepicker('hide');
						}
						$clickTarget = null;
					});

					$syncTo.on('blur', function (e) {
						if ($datepicker.find($clickTarget).length === 0 && !$datepicker.is($clickTarget)) {
							$syncTo.datepicker('hide');
						}
						$clickTarget = null;
					});
				}
			});
			$datepicker = $("#ui-datepicker-div");

			$datepicker.on('touchstart', function (e) {
				$clickTarget = $(e.target);
			});
		})();

		(function autocomplete() {
			$frms.find(".js_autocomplete").each(function () {
				var $this = $(this);

				var hasSuggest = $this.hasClass('js_suggest');
				// autocompleteの参照値
				var data = {};

				if ($this.attr('data-ajax-autocomplete')) {
					$this.autocomplete({
						source: function (_request, _response) {
							var key = _request.term;
							console.log(key);
							if (key) {

								$.ajax({
									url: this.element.attr('data-ajax-autocomplete') + '?' + encodeURIComponent(key),
									dataType: 'json',
									type: 'GET',
									success: function (_data) {
										var ret = [];
										var arr = _data.result;
										if (arr) {
											for (var idx = 0, max = arr.length; idx < max; idx++) {
												var itm = arr[idx];
												ret.push({
													hotel: itm.value,
													area: itm.area,
													location: itm.location,
													type: {
														area: 'map',
														subarea: 'map',
														station: 'train',
														airport: 'plane',
														hotel: 'hotel',
														hotspring: 'hot_spring'
													}[itm.type] || 'pin',
													label: itm.caption
												});
											}
											// autoFocus が有効で入力候補がある場合
											if ($this.autocomplete('option', 'autoFocus') && ret[0]) {
												var val = ret[0].value2;
												var lbl = ret[0].label;
												console.log(['source', val, lbl]);
												$this.attr('data-label', lbl).attr('data-value', val).addClass('-is_selected');
											} else {
												console.log([$this.autocomplete('option', 'autoFocus'), ret[0]]);
											}
										}
										_response(ret);
									},
									error: function (_xhr, _status, _error) {
										console.error([this.url, _status, _error]);
										_response([]);
									}
								});
							} else {
								_response([]);
							}
						},
						select: function (_event, _ui) {
							var lbl = _ui.item.label;
							var htl = _ui.item.hotel;
							var ara = _ui.item.area;
							var loc = _ui.item.location;
							$this.attr({
								'data-label': lbl,
								'data-value': htl || ara || loc,
								'data-landmark': loc
							}).addClass('-is_selected');
							setTimeout(function () {
								$this.blur();
							}, 0);
						},
						position: {
							my: 'right top-1', at: 'right bottom'
						},
						minLength: 1,
						autoFocus: false,
						html: true
					}).on('keydown keyup', function (_$event) {
						dbg && console.log([$this.val(), $this.attr('data-label')]);
						if ($this.val() !== $this.attr('data-label')) {
							// 何か文字を入力した場合は確定内容を破棄
							$this.removeAttr('data-label data-value').removeClass('-is_selected');
						}
					}).on('focus', function (_$event) {
						$(this).select();
					}).on('blur', function () {
						var $this = $(this);
					}).autocomplete('instance')._renderItem = function (_$ui, _item) {
						var itm = _item
						return $("<li class='ui-menu-item'><a tabindex=-1 class='ui-menu-item-wrapper'><span class='icon -" + (itm.type || 'pin') + "'><span class='txt_strong'>" + itm.label + "</span>").appendTo(_$ui);
					};
				} else if ($this.attr('data-autocomplete')) {
					$this.autocomplete({
						create: function () {
							// ajax用
							var urls = $this.attr('data-autocomplete').split(' ');
							for (var idx = 0, max = urls.length; idx < max; idx++) {
								var url = urls[idx];
								url && $.ajax({
									url: url,
									dataType: 'json',
									type: 'GET',
									cache: true,
									//data: { param1: request.term },
									success: function (_data) {
										data[this.url] = _data;
									},
									error: function (_xhr, _status, _error) {
										console.error([url, _status, _error]);
									}
								});
							}
							// ブラウザバック時の値を消去
							$this.removeAttr('data-value data-label');
						},
						source: function (_request, _response) {
							var ret = [];
							if (data) {
								var txt = _request.term.replace(/[\u3041-\u3096]/g, function (_match) {
									// ひらがな→カタカナ変換
									var chr = _match.charCodeAt(0) + 0x60;
									return String.fromCharCode(chr);
								}).replace(/[ァィゥェォヵヶッャュョヮ]/g, function (_match) {
									// 拗音変換
									return {
										'ァ': 'ア',
										'ィ': 'イ',
										'ゥ': 'ウ',
										'ェ': 'エ',
										'ォ': 'オ',
										'ヵ': 'カ',
										'ヶ': 'ケ',
										'ッ': 'ツ',
										'ャ': 'ヤ',
										'ュ': 'ユ',
										'ョ': 'ヨ',
										'ヮ': 'ワ'
									}[_match];
								});
								var max = this.element.attr('data-autocomplete-max') * 1 || 20;
								var reg = new RegExp(txt.replace(/\W/g, '\\\$&'), 'i');
								for (var id in data) {
									var dat = data[id];
									if (dat.filter) {
										var cnt = 0;
										ret = dat.filter(function (_value, _index, _array) {
											return (cnt < max) && reg.test(_value) && (++cnt);
										}).map(function (_value, _index, _array) {
											var arr = _value.split('|', 3);
											return ({
												value2: arr[0],
												type: arr[0].length === 7 ? 'hotel' : 'pin',
												label: arr[1]
											});
										});
									} else if (dat.join) {
										// filter などをサポートしていない配列
										for (var idx = 0, mx = dat.length; idx < mx; idx++) {
											var itm = dat[idx];
											if (reg.test(itm)) {
												var arr = itm.split('|', 3);
												ret.push({
													value2: arr[0],
													type: arr[0].length === 7 ? 'hotel' : 'pin',
													label: arr[1]
												});
											}
											if (ret.length === max) {
												break;
											}
										}
									} else {
										for (var i in dat) {
											var itm = dat[i];
											reg.test(itm.find) && ret.push({
												value2: i,
												type: itm.type,
												label: itm.caption
											});
											if (ret.length === max) {
												break;
											}
										}
										if (ret.length) break;
									}
								}
							}
							_response(ret);
						},
						select: function (_event, _ui) {
							var lbl = _ui.item.label;
							var val = _ui.item.value2.replace(/ +/, '');
							$this.attr('data-label', lbl).attr('data-value', val).addClass('-is_selected');

							var $frm = $this.closest("form");
							var hoks = $frm.prop('hooks');
							var hok = hoks && hoks.onSelectAutocomplete;
							hok && hok($frm);

							setTimeout(function () {
								$this.blur();
							}, 0);
						},
						position: {
							my: 'right top-1', at: 'right bottom'
						},
						minLength: 1,
						html: true
					}).on('keydown keyup', function (_$event) {
						dbg && console.log([$this.val(), $this.attr('data-label')]);
						if ($this.val() !== $this.attr('data-label')) {
							// 何か文字を入力した場合は確定内容を破棄
							$this.removeAttr('data-label').removeAttr('data-value').removeClass('-is_selected');
						}
					}).on('focus', function (_$event) {
						$(this).select();
					}).on('blur', function () {
						var $this = $(this);
						// 確定項目が無い場合は値を空にする
						if (!$this.attr('data-value')) {
							$this.val('').trigger('change');
						}
					}).autocomplete('instance')._renderItem = function (_$ui, _item) {
						var itm = _item
						return $("<li class='ui-menu-item'><a tabindex=-1 class='ui-menu-item-wrapper'><span class='icon -" + (itm.type || 'pin') + "'><span class='txt_strong'>" + itm.label + "</span>").appendTo(_$ui);
					};
				}
				var attn = 'data-pushing-down';
				$this.on('mousedown', function () {
					$this.attr(attn, true);
				}).autocomplete('widget').on('mousedown', function () {
					$this.attr(attn, true);
				});
				$(document).on('mousedown', function () {
					if ($this.attr(attn)) {
						$this.removeAttr(attn);
					} else if (!$this.attr('data-value')) {
						// 確定項目が無い場合は値を空にする
						$this.val('').removeClass('-is_selected');
					} else if ($this.attr('data-label')) {
						$this.val($this.attr('data-label')).addClass('-is_selected');
					}
				});
				$this.autocomplete('widget').off('menufocus');
				dbg && $this.autocomplete('widget').on('autocompleteselect menuselect click dblClick keydown keypress keyup mousedown mousemove mouseup mouseover mouseout load unload focus blur submit reset change resize move dragdrop abort error select touchstart touchmove touchend touchcancel gesturestart gestureend gesturechange orientationchange', function (_$event) {
					console.log(_$event);
				});
				/*$this.autocomplete('widget').off('menufocus hover mouseover mouseenter', "*").on('touchend', "a", function (_$event) {
					// iOS で2回タップしないと項目確定しない件の対応
					_$event.target.click();
				}).on('click dblClick keydown keypress keyup mousedown mousemove mouseup mouseover mouseout load unload focus blur submit reset change resize move dragdrop abort error select touchstart touchmove touchend touchcancel gesturestart gestureend gesturechange orientationchange', function (_$event) {
					console.log([_$event.type, _$event.target]);
				});*/

				/*$this.on('focus.suggestCheck', function () {
					if (hasSuggest && $(this).val() === '') {
						$this.autocomplete('close');
					} else {
						$this.autocomplete('search');
					}
				});*/
			});
		})();
		(function applyKeyword() {
			$frms.find(".js_applykeyword").each(function () {
				var $this = $(this);
				var tgt = $this.attr('data-keyword-to');
				var $tgt = $("#" + tgt);
				if ($tgt[0]) {
					this.applyKeyword = function (_value, _label) {
						var val = _value;
						var lbl = _label;
						lbl && val && !$tgt.val() && $tgt.val(lbl).attr('data-value', val).addClass('-is_selected');
					};
					$this.change(function () {
						var val = $this.attr('data-value-keyword');
						var lbl = $this.attr('data-label-keyword');
						//console.log([this, val, lbl]);
						this.applyKeyword(val, lbl);
					});
				}
			});
		})();
		(function formControl() {
			var submit = function (_element, _function) {
				var elm = _element;
				var fnc = _function;
				if (elm.attachEvent) {
					elm.attachEvent('onsubmit', fnc);
				} else if (elm.addEventListener) {
					elm.addEventListener('submit', fnc, false);
				} else {
					elm.onSubmit = fnc;
				}
			};
			var loadCookie = function (_form) {
				var ret = {};
				var cok = _form.getAttribute('data-cookie');
				if (cok) {
					var reg = new RegExp('(^|; ?)' + cok.replace(/\W/g, '\\\$&') + '=(.+?)(; ?|$)');
					var mch = reg.exec(document.cookie);
					if (mch && mch[2]) {
						var arr = decodeURIComponent(mch[2]).split('&');
						for (var idx = 0, max = arr.length; idx < max; idx++) {
							var itm = arr[idx].split('=', 3),
								nam = decodeURIComponent(itm[0]),
								vals = decodeURIComponent(itm[1]).split('=', 2),
								val, cap;
							if (itm.length === 3) {
								val = itm[1] && decodeURIComponent(itm[1]);
								cap = itm[2] && decodeURIComponent(itm[2]) || val;
							} else {
								val = vals[0] && decodeURIComponent(vals[0]);
								cap = vals[1] && decodeURIComponent(vals[1]) || val;
							}
							ret[nam] = [val || '', cap || ''];
						}
					}
				}
				return ret;
			};
			var saveCookie = function (_form, _object) {
				var frm = _form;
				var cok = frm.getAttribute('data-cookie');
				var obj = _object;
				if (cok && obj) {
					var vals = [];
					for (var id in obj) {
						var itm = obj[id];
						var nam = encodeURIComponent(id);
						var val = encodeURIComponent(itm.join('='));
						vals.push([nam, val].join('='));
					}
					var arr = [encodeURIComponent(cok) + '=' + encodeURIComponent(vals.join('&'))];
					var dom = frm.getAttribute('data-cookie-domain');
					dom && arr.push('domain=' + dom);
					var pth = frm.getAttribute('data-cookie-path');
					pth && arr.push('path=' + pth);
					var exp = frm.getAttribute('data-cookie-expires');
					if (exp) {
						var dt = new Date();
						dt.setFullYear(dt.getFullYear() + parseInt(exp));
						arr.push('expires=' + dt.toUTCString());
					}
					document.cookie = arr.join(';');
				}
			};
			var getValue = function (_name) {
				var frm = this;
				// フォーム設定値等取得
				var ret = [];
				var elms = frm[_name];
				if (elms) {
					// フォーム内に同じ名前がある場合はコレクションなのでそのまま
					// ひとつしかない場合はエレメントなので配列化する
					if (!elms[0] || !elms[0].type) {
						elms = [elms];
					}
					for (var idx = 0, max = elms.length; idx < max; idx++) {
						var elm = elms[idx];
						var att = elm.getAttribute('data-value');
						var vals = null;
						switch (elm.type) {
							case 'select-one':
								var opt = elm.options[elm.selectedIndex];
								if (opt) {
									vals = [opt.value, opt.innerText || opt.textContent];
								}
								break;
								case 'select-multiple':
								var opts = elm.options;
								var vls = [], lbs = [];
								for (var ix2 = 0, mx2 = opts.length; ix2 < mx2; ix2++) {
									var opt = opts[ix2];
									if (opt.selected) {
										vls.push(opt.value);
										lbs.push(opt.textContent || opt.innerText);
									}
								}
								vals = [vls.join(','), lbs.join('|')];
								break;
							case 'checkbox':
							case 'radio':
								if (elm.checked) {
									vals = [elm.value || 'on', elm.innerText || elm.textContent];
								}
								break;
							default:
								vals = [att || '', elm.value || ''];
								break;
						}
						vals && ret.push(vals);
					}
				}
				return ret;
			}
			var setValue = function (_name, _value, _text) {
				var _form = this;
				// フォーム値設定
				var elms = _form[_name];
				var vals = _value.split(',');
				var txts = _text.split('|');
				if (elms) {
					if (elms.type) {
						elms = [elms];
					}
					for (var idx = 0, max = elms.length; idx < max; idx++) {
						var elm = elms[idx];
						if (vals) {
							var val = vals.shift();
							var lbl = txts.shift();
							var cnd;
							switch (elm.type) {
								case 'select-multiple':
									// 複数選択の場合は null を設定しておく
									cnd = null;
									// break;
								case 'select-one':
									for (var ix2 = 0, mx2 = elm.options.length; ix2 < mx2; ix2++) {
										var opt = elm.options[ix2];
										if (opt.value === val) {
											if (cnd === null) {
												opt.selected = true;
											} else {
												// 選択肢候補設定(最初に値が一致したもの)
												cnd = cnd || opt;
												if ((opt.innerText || opt.textContent) === lbl) {
													// 設定値が複数あった場合、テキストが同じほうを採用する
													cnd = opt;
												}
											}
										}
										if (cnd) {
											cnd.selected = true;
										}
									}
									elm.setAttribute('data-value', val);
									elm.setAttribute('data-label', lbl);
									// jQuery-selectmenu の情報更新
									var $elm = $(elm);
									$elm.selectmenu && $elm.selectmenu('instance') && $elm.selectmenu('refresh');
									break;
								case 'checkbox':
								case 'radio':
									elm.checked = (elm.value === val);
									break;
								default:
									elm.value = lbl;
									elm.setAttribute('data-value', val);
									break;
							}
							$(elm).trigger('change');
						}
					}
					// 人数設定の反映
					$(frm).find(".js_count_set").trigger('CountChange');
					var hoks = frm.hooks;
					if (hoks && hoks.onChange) {
						hoks.onChange($(frm));
					}
				}
			};
			// フォーム設定値一覧取得 _forCookie は cookie 用で、外部処理を呼ばない
			var getFormData = function (_forCookie) {
				var frm = this;
				// 要素取得
				var elms = frm.querySelectorAll && frm.querySelectorAll("input,select,textarea") || (function (_form) {
					var elms = _form.getElementsByTagName('*');
					var ret = [];
					for (var idx = 0, max = elms.length; idx < max; idx++) {
						var elm = elms[idx];
						elm.form && ret.push(elm);
					}
					return ret;
				});
				// 設定値取得
				var obj = {};
				for (var idx = 0, max = elms.length; idx < max; idx++) {
					var nam = elms[idx].name;
					if (nam && !obj[nam]) {
						obj[nam] = frm.getValue(nam);
					}
				}
				// 送信時は 項目[[値,ラベル]] から 項目[値[],ラベル[]] 形式にする
				var ret = {};
				for (var id in obj) {
					var arr = obj[id];
					var vals = [];
					var lbls = [];
					for (var idx = 0, max = arr.length; idx < max; idx++) {
						vals.push(arr[idx][0]);
						lbls.push(arr[idx][1]);
					}
					// 設定値はハイフン区切り、ラベルは縦棒区切り
					ret[id] = [vals.join(','), lbls.join('|')];
				}
				var hoks = !_forCookie && frm.hooks;
				if (hoks && hoks.getFormData) {
					ret = hoks.getFormData(ret, frm);
				}
				return ret;
			};
			var validate = function () {
				var ret = true;
				$(this).find(".-is_required,.-is_validate").find("input[name],select[name],textarea[name],[data-name]").filter(function () {
					// プルダウンの中は対象外
					return !$(this).closest(".js_drop_item")[0];
				}).each(function () {
					var $this = $(this);
					var $itm = $this.closest(".-is_required,.-is_validate");
					var val1 = $this.attr('data-value') || this.value;
					// 代替要素の値チェック
					var ins = $this.attr('data-require-instead');
					var val2 = ins && $("#" + ins).attr('data-value');
					// hook は undefined(評価対象外) と false(必須NG) で判定する
					var hok = this.form.hooks && this.form.hooks.onCheckRequired;
					if ((($this.closest(".-is_required")[0] && !val1 && !val2) || $this.closest(".-is_validate")[0]) && (!hok || !hok($this))) {
						ret = false;
						dbg && console.warn('Check require:' + (this.getAttribute('data-name') || this.name) + ' is required.');
						$itm.addClass('-is_error');
						// 値が入ったらエラー解除する
						var chg = function (_$event) {
							if (this.getAttribute('data-value') || this.value) {
								$this.off('change', chg)
									.closest(".-is_required,.is_validate").removeClass('-is_error');
							}
						};
						$this.off('change', chg).on('change', chg);
					} else {
						$itm.removeClass('-is_error');
					}
				});
				return ret;
			};

			var reg = /\bform_search\b/;
					for (var idx = 0, max = frms.length; idx < max; idx++) {
						var frm = frms[idx];
						if (reg.test(frm.className) && frm.action) {
							submit(frm, function (_event) {
								var frm = _event.target || _event.srcElement;
								var evt = _event || {};
								var frm = evt.srcElement || evt.target || this;
								if (evt.returnValue !== undefined) {
									evt.returnValue = false;
								} else if (evt.preventDefault) {
									evt.preventDefault();
								}
						// 必須チェック
						var ok = frm.validate();
						if (ok) {
							var obj = frm.getFormData();
							var snd = document.createElement('form');
							snd.action = frm.action || 'GET';
							snd.method = frm.method;
							snd.acceptCharset = frm.acceptCharset;
							for (var id in obj) {
								var hid = document.createElement('input');
								hid.type = 'hidden';
								hid.name = id;
								hid.value = obj[id][0];
								snd.appendChild(hid);
							}
							var hoks = frm.hooks;
							var ga;
							if (hoks && hoks.onSubmit) {
								ga = hoks.onSubmit(snd);
							}
							if (ga) {
								window._gaq && window._gaq.push(['_trackEvent', ga[0], ga[1], ga[2]]);
								window.dataLayer && window.dataLayer.push({
									'event': 'EvTracking',
									'EvCategory': ga[0],
									'EvAction': ga[1],
									'EvLabel': ga[2]
								});
							}
							saveCookie(frm, frm.getFormData(true));
							document.body.appendChild(snd);
							setTimeout(function () {
								snd.submit();
							}, 0);
						}
						return false;
					});
					frm.getFormData = getFormData;
					frm.getValue = getValue;
					frm.setValue = setValue;
					frm.validate = validate;
					frm.hooks = (function getHooks(_name) {
						var ret;
						if (_name) {
							ret = window[_name];
						}
						return ret;
					})(frm.getAttribute('data-hooks'));
					frm.refresh = function () {
						$(frm).find(".js_count_set").trigger('CountChange');
					};
					// フォーム初期化
					var hoks = frm && frm.hooks;
					if (hoks && hoks.onInit) {
						hoks.onInit($(frm));
					}
					// フォーム値の復旧
					var obj = loadCookie(frm);
					if (Object.keys(obj).length) {
						for (var id in obj) {
							var itm = obj[id];
							frm.setValue(id, itm[0], itm[1]);
							var elm = frm[id];
							if (elm) {
								elm.refresh && elm.refresh();
								elm[0] && elm[0].refresh && elm[0].refresh();
							}
						}
					} else {
						// フォーム値のクリア
						$(frm).find("select,[type=text]").each(function () {
							if (this.selectedIndex !== undefined) {
								this.selectedIndex = 0;
							} else {
								this.value = this.defaultValue;
							}
							this.refresh && this.refresh();
							this[0] && this[0].refresh && this[0].refresh();
						});
					}
				}
			}
		})();
	});
}(
	window,
	(function (window, jQuery) {

		/**
		 * /_common/js/common.jsにて
		 * jQuery.noconfilctを使用しているため一旦格納する
		 */
		var jquery = jQuery;

		/* eslint-disable */

		/*! jQuery UI - v1.12.1 - 2018-03-15
		* http://jqueryui.com
		* Includes: widget.js, position.js, data.js, disable-selection.js, focusable.js, form-reset-mixin.js, keycode.js, labels.js, scroll-parent.js, tabbable.js, unique-id.js, widgets/autocomplete.js, widgets/checkboxradio.js, widgets/datepicker.js, widgets/menu.js, widgets/selectmenu.js
		* Copyright jQuery Foundation and other contributors; Licensed MIT */

		(function (t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)})(function (t){function e(t){for(var e=t.css("visibility");"inherit"===e;)t=t.parent(),e=t.css("visibility");return"hidden"!==e}function i(t){for(var e,i;t.length&&t[0]!==document;){if(e=t.css("position"),("absolute"===e||"relative"===e||"fixed"===e)&&(i=parseInt(t.css("zIndex"),10),!isNaN(i)&&0!==i))return i;t=t.parent()}return 0}function s(){this._curInst=null,this._keyEvent=!1,this._disabledInputs=[],this._datepickerShowing=!1,this._inDialog=!1,this._mainDivId="ui-datepicker-div",this._inlineClass="ui-datepicker-inline",this._appendClass="ui-datepicker-append",this._triggerClass="ui-datepicker-trigger",this._dialogClass="ui-datepicker-dialog",this._disableClass="ui-datepicker-disabled",this._unselectableClass="ui-datepicker-unselectable",this._currentClass="ui-datepicker-current-day",this._dayOverClass="ui-datepicker-days-cell-over",this.regional=[],this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:!1,showMonthAfterYear:!1,yearSuffix:""},this._defaults={showOn:"focus",showAnim:"fadeIn",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:!1,hideIfNoPrevNext:!1,navigationAsDateFormat:!1,gotoCurrent:!1,changeMonth:!1,changeYear:!1,yearRange:"c-10:c+10",showOtherMonths:!1,selectOtherMonths:!1,showWeek:!1,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",minDate:null,maxDate:null,duration:"fast",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:!0,showButtonPanel:!1,autoSize:!1,disabled:!1},t.extend(this._defaults,this.regional[""]),this.regional.en=t.extend(!0,{},this.regional[""]),this.regional["en-US"]=t.extend(!0,{},this.regional.en),this.dpDiv=n(t("<div id='"+this._mainDivId+"' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"))}function n(e){var i="button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";return e.on("mouseout",i,function (){t(this).removeClass("ui-state-hover"),-1!==this.className.indexOf("ui-datepicker-prev")&&t(this).removeClass("ui-datepicker-prev-hover"),-1!==this.className.indexOf("ui-datepicker-next")&&t(this).removeClass("ui-datepicker-next-hover")}).on("mouseover",i,o)}function o(){t.datepicker._isDisabledDatepicker(h.inline?h.dpDiv.parent()[0]:h.input[0])||(t(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover"),t(this).addClass("ui-state-hover"),-1!==this.className.indexOf("ui-datepicker-prev")&&t(this).addClass("ui-datepicker-prev-hover"),-1!==this.className.indexOf("ui-datepicker-next")&&t(this).addClass("ui-datepicker-next-hover"))}function a(e,i){t.extend(e,i);for(var s in i)null==i[s]&&(e[s]=i[s]);return e}t.ui=t.ui||{},t.ui.version="1.12.1";var r=0,l=Array.prototype.slice;t.cleanData=function (e){return function (i){var s,n,o;for(o=0;null!=(n=i[o]);o++)try{s=t._data(n,"events"),s&&s.remove&&t(n).triggerHandler("remove")}catch(a){}e(i)}}(t.cleanData),t.widget=function (e,i,s){var n,o,a,r={},l=e.split(".")[0];e=e.split(".")[1];var h=l+"-"+e;return s||(s=i,i=t.Widget),t.isArray(s)&&(s=t.extend.apply(null,[{}].concat(s))),t.expr[":"][h.toLowerCase()]=function (e){return!!t.data(e,h)},t[l]=t[l]||{},n=t[l][e],o=t[l][e]=function (t,e){return this._createWidget?(arguments.length&&this._createWidget(t,e),void 0):new o(t,e)},t.extend(o,n,{version:s.version,_proto:t.extend({},s),_childConstructors:[]}),a=new i,a.options=t.widget.extend({},a.options),t.each(s,function (e,s){return t.isFunction(s)?(r[e]=function (){function t(){return i.prototype[e].apply(this,arguments)}function n(t){return i.prototype[e].apply(this,t)}return function (){var e,i=this._super,o=this._superApply;return this._super=t,this._superApply=n,e=s.apply(this,arguments),this._super=i,this._superApply=o,e}}(),void 0):(r[e]=s,void 0)}),o.prototype=t.widget.extend(a,{widgetEventPrefix:n?a.widgetEventPrefix||e:e},r,{constructor:o,namespace:l,widgetName:e,widgetFullName:h}),n?(t.each(n._childConstructors,function (e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete n._childConstructors):i._childConstructors.push(o),t.widget.bridge(e,o),o},t.widget.extend=function (e){for(var i,s,n=l.call(arguments,1),o=0,a=n.length;a>o;o++)for(i in n[o])s=n[o][i],n[o].hasOwnProperty(i)&&void 0!==s&&(e[i]=t.isPlainObject(s)?t.isPlainObject(e[i])?t.widget.extend({},e[i],s):t.widget.extend({},s):s);return e},t.widget.bridge=function (e,i){var s=i.prototype.widgetFullName||e;t.fn[e]=function (n){var o="string"==typeof n,a=l.call(arguments,1),r=this;return o?this.length||"instance"!==n?this.each(function (){var i,o=t.data(this,s);return"instance"===n?(r=o,!1):o?t.isFunction(o[n])&&"_"!==n.charAt(0)?(i=o[n].apply(o,a),i!==o&&void 0!==i?(r=i&&i.jquery?r.pushStack(i.get()):i,!1):void 0):t.error("no such method '"+n+"' for "+e+" widget instance"):t.error("cannot call methods on "+e+" prior to initialization; "+"attempted to call method '"+n+"'")}):r=void 0:(a.length&&(n=t.widget.extend.apply(null,[n].concat(a))),this.each(function (){var e=t.data(this,s);e?(e.option(n||{}),e._init&&e._init()):t.data(this,s,new i(n,this))})),r}},t.Widget=function (){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{classes:{},disabled:!1,create:null},_createWidget:function (e,i){i=t(i||this.defaultElement||this)[0],this.element=t(i),this.uuid=r++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=t(),this.hoverable=t(),this.focusable=t(),this.classesElementLookup={},i!==this&&(t.data(i,this.widgetFullName,this),this._on(!0,this.element,{remove:function (t){t.target===i&&this.destroy()}}),this.document=t(i.style?i.ownerDocument:i.document||i),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this._create(),this.options.disabled&&this._setOptionDisabled(this.options.disabled),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:function (){return{}},_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function (){var e=this;this._destroy(),t.each(this.classesElementLookup,function (t,i){e._removeClass(i,t)}),this.element.off(this.eventNamespace).removeData(this.widgetFullName),this.widget().off(this.eventNamespace).removeAttr("aria-disabled"),this.bindings.off(this.eventNamespace)},_destroy:t.noop,widget:function (){return this.element},option:function (e,i){var s,n,o,a=e;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof e)if(a={},s=e.split("."),e=s.shift(),s.length){for(n=a[e]=t.widget.extend({},this.options[e]),o=0;s.length-1>o;o++)n[s[o]]=n[s[o]]||{},n=n[s[o]];if(e=s.pop(),1===arguments.length)return void 0===n[e]?null:n[e];n[e]=i}else{if(1===arguments.length)return void 0===this.options[e]?null:this.options[e];a[e]=i}return this._setOptions(a),this},_setOptions:function (t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function (t,e){return"classes"===t&&this._setOptionClasses(e),this.options[t]=e,"disabled"===t&&this._setOptionDisabled(e),this},_setOptionClasses:function (e){var i,s,n;for(i in e)n=this.classesElementLookup[i],e[i]!==this.options.classes[i]&&n&&n.length&&(s=t(n.get()),this._removeClass(n,i),s.addClass(this._classes({element:s,keys:i,classes:e,add:!0})))},_setOptionDisabled:function (t){this._toggleClass(this.widget(),this.widgetFullName+"-disabled",null,!!t),t&&(this._removeClass(this.hoverable,null,"ui-state-hover"),this._removeClass(this.focusable,null,"ui-state-focus"))},enable:function (){return this._setOptions({disabled:!1})},disable:function (){return this._setOptions({disabled:!0})},_classes:function (e){function i(i,o){var a,r;for(r=0;i.length>r;r++)a=n.classesElementLookup[i[r]]||t(),a=e.add?t(t.unique(a.get().concat(e.element.get()))):t(a.not(e.element).get()),n.classesElementLookup[i[r]]=a,s.push(i[r]),o&&e.classes[i[r]]&&s.push(e.classes[i[r]])}var s=[],n=this;return e=t.extend({element:this.element,classes:this.options.classes||{}},e),this._on(e.element,{remove:"_untrackClassesElement"}),e.keys&&i(e.keys.match(/\S+/g)||[],!0),e.extra&&i(e.extra.match(/\S+/g)||[]),s.join(" ")},_untrackClassesElement:function (e){var i=this;t.each(i.classesElementLookup,function (s,n){-1!==t.inArray(e.target,n)&&(i.classesElementLookup[s]=t(n.not(e.target).get()))})},_removeClass:function (t,e,i){return this._toggleClass(t,e,i,!1)},_addClass:function (t,e,i){return this._toggleClass(t,e,i,!0)},_toggleClass:function (t,e,i,s){s="boolean"==typeof s?s:i;var n="string"==typeof t||null===t,o={extra:n?e:i,keys:n?t:e,element:n?this.element:t,add:s};return o.element.toggleClass(this._classes(o),s),this},_on:function (e,i,s){var n,o=this;"boolean"!=typeof e&&(s=i,i=e,e=!1),s?(i=n=t(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,n=this.widget()),t.each(s,function (s,a){function r(){return e||o.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof a?o[a]:a).apply(o,arguments):void 0}"string"!=typeof a&&(r.guid=a.guid=a.guid||r.guid||t.guid++);var l=s.match(/^([\w:-]*)\s*(.*)$/),h=l[1]+o.eventNamespace,c=l[2];c?n.on(h,c,r):i.on(h,r)})},_off:function (e,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.off(i).off(i),this.bindings=t(this.bindings.not(e).get()),this.focusable=t(this.focusable.not(e).get()),this.hoverable=t(this.hoverable.not(e).get())},_delay:function (t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function (e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function (e){this._addClass(t(e.currentTarget),null,"ui-state-hover")},mouseleave:function (e){this._removeClass(t(e.currentTarget),null,"ui-state-hover")}})},_focusable:function (e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function (e){this._addClass(t(e.currentTarget),null,"ui-state-focus")},focusout:function (e){this._removeClass(t(e.currentTarget),null,"ui-state-focus")}})},_trigger:function (e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function (e,i){t.Widget.prototype["_"+e]=function (s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function (i){t(this)[e](),o&&o.call(s[0]),i()})}}),t.widget,function (){function e(t,e,i){return[parseFloat(t[0])*(u.test(t[0])?e/100:1),parseFloat(t[1])*(u.test(t[1])?i/100:1)]}function i(e,i){return parseInt(t.css(e,i),10)||0}function s(e){var i=e[0];return 9===i.nodeType?{width:e.width(),height:e.height(),offset:{top:0,left:0}}:t.isWindow(i)?{width:e.width(),height:e.height(),offset:{top:e.scrollTop(),left:e.scrollLeft()}}:i.preventDefault?{width:0,height:0,offset:{top:i.pageY,left:i.pageX}}:{width:e.outerWidth(),height:e.outerHeight(),offset:e.offset()}}var n,o=Math.max,a=Math.abs,r=/left|center|right/,l=/top|center|bottom/,h=/[\+\-]\d+(\.[\d]+)?%?/,c=/^\w+/,u=/%$/,d=t.fn.position;t.position={scrollbarWidth:function (){if(void 0!==n)return n;var e,i,s=t("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),o=s.children()[0];return t("body").append(s),e=o.offsetWidth,s.css("overflow","scroll"),i=o.offsetWidth,e===i&&(i=s[0].clientWidth),s.remove(),n=e-i},getScrollInfo:function (e){var i=e.isWindow||e.isDocument?"":e.element.css("overflow-x"),s=e.isWindow||e.isDocument?"":e.element.css("overflow-y"),n="scroll"===i||"auto"===i&&e.width<e.element[0].scrollWidth,o="scroll"===s||"auto"===s&&e.height<e.element[0].scrollHeight;return{width:o?t.position.scrollbarWidth():0,height:n?t.position.scrollbarWidth():0}},getWithinInfo:function (e){var i=t(e||window),s=t.isWindow(i[0]),n=!!i[0]&&9===i[0].nodeType,o=!s&&!n;return{element:i,isWindow:s,isDocument:n,offset:o?t(e).offset():{left:0,top:0},scrollLeft:i.scrollLeft(),scrollTop:i.scrollTop(),width:i.outerWidth(),height:i.outerHeight()}}},t.fn.position=function (n){if(!n||!n.of)return d.apply(this,arguments);n=t.extend({},n);var u,p,f,g,m,_,v=t(n.of),b=t.position.getWithinInfo(n.within),y=t.position.getScrollInfo(b),w=(n.collision||"flip").split(" "),k={};return _=s(v),v[0].preventDefault&&(n.at="left top"),p=_.width,f=_.height,g=_.offset,m=t.extend({},g),t.each(["my","at"],function (){var t,e,i=(n[this]||"").split(" ");1===i.length&&(i=r.test(i[0])?i.concat(["center"]):l.test(i[0])?["center"].concat(i):["center","center"]),i[0]=r.test(i[0])?i[0]:"center",i[1]=l.test(i[1])?i[1]:"center",t=h.exec(i[0]),e=h.exec(i[1]),k[this]=[t?t[0]:0,e?e[0]:0],n[this]=[c.exec(i[0])[0],c.exec(i[1])[0]]}),1===w.length&&(w[1]=w[0]),"right"===n.at[0]?m.left+=p:"center"===n.at[0]&&(m.left+=p/2),"bottom"===n.at[1]?m.top+=f:"center"===n.at[1]&&(m.top+=f/2),u=e(k.at,p,f),m.left+=u[0],m.top+=u[1],this.each(function (){var s,r,l=t(this),h=l.outerWidth(),c=l.outerHeight(),d=i(this,"marginLeft"),_=i(this,"marginTop"),x=h+d+i(this,"marginRight")+y.width,C=c+_+i(this,"marginBottom")+y.height,D=t.extend({},m),T=e(k.my,l.outerWidth(),l.outerHeight());"right"===n.my[0]?D.left-=h:"center"===n.my[0]&&(D.left-=h/2),"bottom"===n.my[1]?D.top-=c:"center"===n.my[1]&&(D.top-=c/2),D.left+=T[0],D.top+=T[1],s={marginLeft:d,marginTop:_},t.each(["left","top"],function (e,i){t.ui.position[w[e]]&&t.ui.position[w[e]][i](D,{targetWidth:p,targetHeight:f,elemWidth:h,elemHeight:c,collisionPosition:s,collisionWidth:x,collisionHeight:C,offset:[u[0]+T[0],u[1]+T[1]],my:n.my,at:n.at,within:b,elem:l})}),n.using&&(r=function (t){var e=g.left-D.left,i=e+p-h,s=g.top-D.top,r=s+f-c,u={target:{element:v,left:g.left,top:g.top,width:p,height:f},element:{element:l,left:D.left,top:D.top,width:h,height:c},horizontal:0>i?"left":e>0?"right":"center",vertical:0>r?"top":s>0?"bottom":"middle"};h>p&&p>a(e+i)&&(u.horizontal="center"),c>f&&f>a(s+r)&&(u.vertical="middle"),u.important=o(a(e),a(i))>o(a(s),a(r))?"horizontal":"vertical",n.using.call(this,t,u)}),l.offset(t.extend(D,{using:r}))})},t.ui.position={fit:{left:function (t,e){var i,s=e.within,n=s.isWindow?s.scrollLeft:s.offset.left,a=s.width,r=t.left-e.collisionPosition.marginLeft,l=n-r,h=r+e.collisionWidth-a-n;e.collisionWidth>a?l>0&&0>=h?(i=t.left+l+e.collisionWidth-a-n,t.left+=l-i):t.left=h>0&&0>=l?n:l>h?n+a-e.collisionWidth:n:l>0?t.left+=l:h>0?t.left-=h:t.left=o(t.left-r,t.left)},top:function (t,e){var i,s=e.within,n=s.isWindow?s.scrollTop:s.offset.top,a=e.within.height,r=t.top-e.collisionPosition.marginTop,l=n-r,h=r+e.collisionHeight-a-n;e.collisionHeight>a?l>0&&0>=h?(i=t.top+l+e.collisionHeight-a-n,t.top+=l-i):t.top=h>0&&0>=l?n:l>h?n+a-e.collisionHeight:n:l>0?t.top+=l:h>0?t.top-=h:t.top=o(t.top-r,t.top)}},flip:{left:function (t,e){var i,s,n=e.within,o=n.offset.left+n.scrollLeft,r=n.width,l=n.isWindow?n.scrollLeft:n.offset.left,h=t.left-e.collisionPosition.marginLeft,c=h-l,u=h+e.collisionWidth-r-l,d="left"===e.my[0]?-e.elemWidth:"right"===e.my[0]?e.elemWidth:0,p="left"===e.at[0]?e.targetWidth:"right"===e.at[0]?-e.targetWidth:0,f=-2*e.offset[0];0>c?(i=t.left+d+p+f+e.collisionWidth-r-o,(0>i||a(c)>i)&&(t.left+=d+p+f)):u>0&&(s=t.left-e.collisionPosition.marginLeft+d+p+f-l,(s>0||u>a(s))&&(t.left+=d+p+f))},top:function (t,e){var i,s,n=e.within,o=n.offset.top+n.scrollTop,r=n.height,l=n.isWindow?n.scrollTop:n.offset.top,h=t.top-e.collisionPosition.marginTop,c=h-l,u=h+e.collisionHeight-r-l,d="top"===e.my[1],p=d?-e.elemHeight:"bottom"===e.my[1]?e.elemHeight:0,f="top"===e.at[1]?e.targetHeight:"bottom"===e.at[1]?-e.targetHeight:0,g=-2*e.offset[1];0>c?(s=t.top+p+f+g+e.collisionHeight-r-o,(0>s||a(c)>s)&&(t.top+=p+f+g)):u>0&&(i=t.top-e.collisionPosition.marginTop+p+f+g-l,(i>0||u>a(i))&&(t.top+=p+f+g))}},flipfit:{left:function (){t.ui.position.flip.left.apply(this,arguments),t.ui.position.fit.left.apply(this,arguments)},top:function (){t.ui.position.flip.top.apply(this,arguments),t.ui.position.fit.top.apply(this,arguments)}}}}(),t.ui.position,t.extend(t.expr[":"],{data:t.expr.createPseudo?t.expr.createPseudo(function (e){return function (i){return!!t.data(i,e)}}):function (e,i,s){return!!t.data(e,s[3])}}),t.fn.extend({disableSelection:function (){var t="onselectstart"in document.createElement("div")?"selectstart":"mousedown";return function (){return this.on(t+".ui-disableSelection",function (t){t.preventDefault()})}}(),enableSelection:function (){return this.off(".ui-disableSelection")}}),t.ui.focusable=function (i,s){var n,o,a,r,l,h=i.nodeName.toLowerCase();return"area"===h?(n=i.parentNode,o=n.name,i.href&&o&&"map"===n.nodeName.toLowerCase()?(a=t("img[usemap='#"+o+"']"),a.length>0&&a.is(":visible")):!1):(/^(input|select|textarea|button|object)$/.test(h)?(r=!i.disabled,r&&(l=t(i).closest("fieldset")[0],l&&(r=!l.disabled))):r="a"===h?i.href||s:s,r&&t(i).is(":visible")&&e(t(i)))},t.extend(t.expr[":"],{focusable:function (e){return t.ui.focusable(e,null!=t.attr(e,"tabindex"))}}),t.ui.focusable,t.fn.form=function (){return"string"==typeof this[0].form?this.closest("form"):t(this[0].form)},t.ui.formResetMixin={_formResetHandler:function (){var e=t(this);setTimeout(function (){var i=e.data("ui-form-reset-instances");t.each(i,function (){this.refresh()})})},_bindFormResetHandler:function (){if(this.form=this.element.form(),this.form.length){var t=this.form.data("ui-form-reset-instances")||[];t.length||this.form.on("reset.ui-form-reset",this._formResetHandler),t.push(this),this.form.data("ui-form-reset-instances",t)}},_unbindFormResetHandler:function (){if(this.form.length){var e=this.form.data("ui-form-reset-instances");e.splice(t.inArray(this,e),1),e.length?this.form.data("ui-form-reset-instances",e):this.form.removeData("ui-form-reset-instances").off("reset.ui-form-reset")}}},t.ui.keyCode={BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38},t.ui.escapeSelector=function (){var t=/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;return function (e){return e.replace(t,"\\$1")}}(),t.fn.labels=function (){var e,i,s,n,o;return this[0].labels&&this[0].labels.length?this.pushStack(this[0].labels):(n=this.eq(0).parents("label"),s=this.attr("id"),s&&(e=this.eq(0).parents().last(),o=e.add(e.length?e.siblings():this.siblings()),i="label[for='"+t.ui.escapeSelector(s)+"']",n=n.add(o.find(i).addBack(i))),this.pushStack(n))},t.fn.scrollParent=function (e){var i=this.css("position"),s="absolute"===i,n=e?/(auto|scroll|hidden)/:/(auto|scroll)/,o=this.parents().filter(function (){var e=t(this);return s&&"static"===e.css("position")?!1:n.test(e.css("overflow")+e.css("overflow-y")+e.css("overflow-x"))}).eq(0);return"fixed"!==i&&o.length?o:t(this[0].ownerDocument||document)},t.extend(t.expr[":"],{tabbable:function (e){var i=t.attr(e,"tabindex"),s=null!=i;return(!s||i>=0)&&t.ui.focusable(e,s)}}),t.fn.extend({uniqueId:function (){var t=0;return function (){return this.each(function (){this.id||(this.id="ui-id-"+ ++t)})}}(),removeUniqueId:function (){return this.each(function (){/^ui-id-\d+$/.test(this.id)&&t(this).removeAttr("id")})}}),t.ui.safeActiveElement=function (t){var e;try{e=t.activeElement}catch(i){e=t.body}return e||(e=t.body),e.nodeName||(e=t.body),e},t.widget("ui.menu",{version:"1.12.1",defaultElement:"<ul>",delay:300,options:{icons:{submenu:"ui-icon-caret-1-e"},items:"> *",menus:"ul",position:{my:"left top",at:"right top"},role:"menu",blur:null,focus:null,select:null},_create:function (){this.activeMenu=this.element,this.mouseHandled=!1,this.element.uniqueId().attr({role:this.options.role,tabIndex:0}),this._addClass("ui-menu","ui-widget ui-widget-content"),this._on({"mousedown .ui-menu-item":function (t){t.preventDefault()},"click .ui-menu-item":function (e){var i=t(e.target),s=t(t.ui.safeActiveElement(this.document[0]));!this.mouseHandled&&i.not(".ui-state-disabled").length&&(this.select(e),e.isPropagationStopped()||(this.mouseHandled=!0),i.has(".ui-menu").length?this.expand(e):!this.element.is(":focus")&&s.closest(".ui-menu").length&&(this.element.trigger("focus",[!0]),this.active&&1===this.active.parents(".ui-menu").length&&clearTimeout(this.timer)))},"mouseenter .ui-menu-item":function (e){if(!this.previousFilter){var i=t(e.target).closest(".ui-menu-item"),s=t(e.currentTarget);i[0]===s[0]&&(this._removeClass(s.siblings().children(".ui-state-active"),null,"ui-state-active"),this.focus(e,s))}},mouseleave:"collapseAll","mouseleave .ui-menu":"collapseAll",focus:function (t,e){var i=this.active||this.element.find(this.options.items).eq(0);e||this.focus(t,i)},blur:function (e){this._delay(function (){var i=!t.contains(this.element[0],t.ui.safeActiveElement(this.document[0]));i&&this.collapseAll(e)})},keydown:"_keydown"}),this.refresh(),this._on(this.document,{click:function (t){this._closeOnDocumentClick(t)&&this.collapseAll(t),this.mouseHandled=!1}})},_destroy:function (){var e=this.element.find(".ui-menu-item").removeAttr("role aria-disabled"),i=e.children(".ui-menu-item-wrapper").removeUniqueId().removeAttr("tabIndex role aria-haspopup");this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeAttr("role aria-labelledby aria-expanded aria-hidden aria-disabled tabIndex").removeUniqueId().show(),i.children().each(function (){var e=t(this);e.data("ui-menu-submenu-caret")&&e.remove()})},_keydown:function (e){var i,s,n,o,a=!0;switch(e.keyCode){case t.ui.keyCode.PAGE_UP:this.previousPage(e);break;case t.ui.keyCode.PAGE_DOWN:this.nextPage(e);break;case t.ui.keyCode.HOME:this._move("first","first",e);break;case t.ui.keyCode.END:this._move("last","last",e);break;case t.ui.keyCode.UP:this.previous(e);break;case t.ui.keyCode.DOWN:this.next(e);break;case t.ui.keyCode.LEFT:this.collapse(e);break;case t.ui.keyCode.RIGHT:this.active&&!this.active.is(".ui-state-disabled")&&this.expand(e);break;case t.ui.keyCode.ENTER:case t.ui.keyCode.SPACE:this._activate(e);break;case t.ui.keyCode.ESCAPE:this.collapse(e);break;default:a=!1,s=this.previousFilter||"",o=!1,n=e.keyCode>=96&&105>=e.keyCode?""+(e.keyCode-96):String.fromCharCode(e.keyCode),clearTimeout(this.filterTimer),n===s?o=!0:n=s+n,i=this._filterMenuItems(n),i=o&&-1!==i.index(this.active.next())?this.active.nextAll(".ui-menu-item"):i,i.length||(n=String.fromCharCode(e.keyCode),i=this._filterMenuItems(n)),i.length?(this.focus(e,i),this.previousFilter=n,this.filterTimer=this._delay(function (){delete this.previousFilter},1e3)):delete this.previousFilter}a&&e.preventDefault()},_activate:function (t){this.active&&!this.active.is(".ui-state-disabled")&&(this.active.children("[aria-haspopup='true']").length?this.expand(t):this.select(t))},refresh:function (){var e,i,s,n,o,a=this,r=this.options.icons.submenu,l=this.element.find(this.options.menus);this._toggleClass("ui-menu-icons",null,!!this.element.find(".ui-icon").length),s=l.filter(":not(.ui-menu)").hide().attr({role:this.options.role,"aria-hidden":"true","aria-expanded":"false"}).each(function (){var e=t(this),i=e.prev(),s=t("<span>").data("ui-menu-submenu-caret",!0);a._addClass(s,"ui-menu-icon","ui-icon "+r),i.attr("aria-haspopup","true").prepend(s),e.attr("aria-labelledby",i.attr("id"))}),this._addClass(s,"ui-menu","ui-widget ui-widget-content ui-front"),e=l.add(this.element),i=e.find(this.options.items),i.not(".ui-menu-item").each(function (){var e=t(this);a._isDivider(e)&&a._addClass(e,"ui-menu-divider","ui-widget-content")}),n=i.not(".ui-menu-item, .ui-menu-divider"),o=n.children().not(".ui-menu").uniqueId().attr({tabIndex:-1,role:this._itemRole()}),this._addClass(n,"ui-menu-item")._addClass(o,"ui-menu-item-wrapper"),i.filter(".ui-state-disabled").attr("aria-disabled","true"),this.active&&!t.contains(this.element[0],this.active[0])&&this.blur()},_itemRole:function (){return{menu:"menuitem",listbox:"option"}[this.options.role]},_setOption:function (t,e){if("icons"===t){var i=this.element.find(".ui-menu-icon");this._removeClass(i,null,this.options.icons.submenu)._addClass(i,null,e.submenu)}this._super(t,e)},_setOptionDisabled:function (t){this._super(t),this.element.attr("aria-disabled",t+""),this._toggleClass(null,"ui-state-disabled",!!t)},focus:function (t,e){var i,s,n;this.blur(t,t&&"focus"===t.type),this._scrollIntoView(e),this.active=e.first(),s=this.active.children(".ui-menu-item-wrapper"),this._addClass(s,null,"ui-state-active"),this.options.role&&this.element.attr("aria-activedescendant",s.attr("id")),n=this.active.parent().closest(".ui-menu-item").children(".ui-menu-item-wrapper"),this._addClass(n,null,"ui-state-active"),t&&"keydown"===t.type?this._close():this.timer=this._delay(function (){this._close()},this.delay),i=e.children(".ui-menu"),i.length&&t&&/^mouse/.test(t.type)&&this._startOpening(i),this.activeMenu=e.parent(),this._trigger("focus",t,{item:e})},_scrollIntoView:function (e){var i,s,n,o,a,r;this._hasScroll()&&(i=parseFloat(t.css(this.activeMenu[0],"borderTopWidth"))||0,s=parseFloat(t.css(this.activeMenu[0],"paddingTop"))||0,n=e.offset().top-this.activeMenu.offset().top-i-s,o=this.activeMenu.scrollTop(),a=this.activeMenu.height(),r=e.outerHeight(),0>n?this.activeMenu.scrollTop(o+n):n+r>a&&this.activeMenu.scrollTop(o+n-a+r))},blur:function (t,e){e||clearTimeout(this.timer),this.active&&(this._removeClass(this.active.children(".ui-menu-item-wrapper"),null,"ui-state-active"),this._trigger("blur",t,{item:this.active}),this.active=null)},_startOpening:function (t){clearTimeout(this.timer),"true"===t.attr("aria-hidden")&&(this.timer=this._delay(function (){this._close(),this._open(t)},this.delay))},_open:function (e){var i=t.extend({of:this.active},this.options.position);clearTimeout(this.timer),this.element.find(".ui-menu").not(e.parents(".ui-menu")).hide().attr("aria-hidden","true"),e.show().removeAttr("aria-hidden").attr("aria-expanded","true").position(i)},collapseAll:function (e,i){clearTimeout(this.timer),this.timer=this._delay(function (){var s=i?this.element:t(e&&e.target).closest(this.element.find(".ui-menu"));s.length||(s=this.element),this._close(s),this.blur(e),this._removeClass(s.find(".ui-state-active"),null,"ui-state-active"),this.activeMenu=s},this.delay)},_close:function (t){t||(t=this.active?this.active.parent():this.element),t.find(".ui-menu").hide().attr("aria-hidden","true").attr("aria-expanded","false")},_closeOnDocumentClick:function (e){return!t(e.target).closest(".ui-menu").length},_isDivider:function (t){return!/[^\-\u2014\u2013\s]/.test(t.text())},collapse:function (t){var e=this.active&&this.active.parent().closest(".ui-menu-item",this.element);e&&e.length&&(this._close(),this.focus(t,e))},expand:function (t){var e=this.active&&this.active.children(".ui-menu ").find(this.options.items).first();e&&e.length&&(this._open(e.parent()),this._delay(function (){this.focus(t,e)}))},next:function (t){this._move("next","first",t)},previous:function (t){this._move("prev","last",t)},isFirstItem:function (){return this.active&&!this.active.prevAll(".ui-menu-item").length},isLastItem:function (){return this.active&&!this.active.nextAll(".ui-menu-item").length},_move:function (t,e,i){var s;this.active&&(s="first"===t||"last"===t?this.active["first"===t?"prevAll":"nextAll"](".ui-menu-item").eq(-1):this.active[t+"All"](".ui-menu-item").eq(0)),s&&s.length&&this.active||(s=this.activeMenu.find(this.options.items)[e]()),this.focus(i,s)},nextPage:function (e){var i,s,n;return this.active?(this.isLastItem()||(this._hasScroll()?(s=this.active.offset().top,n=this.element.height(),this.active.nextAll(".ui-menu-item").each(function (){return i=t(this),0>i.offset().top-s-n}),this.focus(e,i)):this.focus(e,this.activeMenu.find(this.options.items)[this.active?"last":"first"]())),void 0):(this.next(e),void 0)},previousPage:function (e){var i,s,n;return this.active?(this.isFirstItem()||(this._hasScroll()?(s=this.active.offset().top,n=this.element.height(),this.active.prevAll(".ui-menu-item").each(function (){return i=t(this),i.offset().top-s+n>0}),this.focus(e,i)):this.focus(e,this.activeMenu.find(this.options.items).first())),void 0):(this.next(e),void 0)},_hasScroll:function (){return this.element.outerHeight()<this.element.prop("scrollHeight")},select:function (e){this.active=this.active||t(e.target).closest(".ui-menu-item");var i={item:this.active};this.active.has(".ui-menu").length||this.collapseAll(e,!0),this._trigger("select",e,i)},_filterMenuItems:function (e){var i=e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&"),s=RegExp("^"+i,"i");return this.activeMenu.find(this.options.items).filter(".ui-menu-item").filter(function (){return s.test(t.trim(t(this).children(".ui-menu-item-wrapper").text()))})}}),t.widget("ui.autocomplete",{version:"1.12.1",defaultElement:"<input>",options:{appendTo:null,autoFocus:!1,delay:300,minLength:1,position:{my:"left top",at:"left bottom",collision:"none"},source:null,change:null,close:null,focus:null,open:null,response:null,search:null,select:null},requestIndex:0,pending:0,_create:function (){var e,i,s,n=this.element[0].nodeName.toLowerCase(),o="textarea"===n,a="input"===n;this.isMultiLine=o||!a&&this._isContentEditable(this.element),this.valueMethod=this.element[o||a?"val":"text"],this.isNewMenu=!0,this._addClass("ui-autocomplete-input"),this.element.attr("autocomplete","off"),this._on(this.element,{keydown:function (n){if(this.element.prop("readOnly"))return e=!0,s=!0,i=!0,void 0;e=!1,s=!1,i=!1;var o=t.ui.keyCode;switch(n.keyCode){case o.PAGE_UP:e=!0,this._move("previousPage",n);break;case o.PAGE_DOWN:e=!0,this._move("nextPage",n);break;case o.UP:e=!0,this._keyEvent("previous",n);break;case o.DOWN:e=!0,this._keyEvent("next",n);break;case o.ENTER:this.menu.active&&(e=!0,n.preventDefault(),this.menu.select(n));break;case o.TAB:this.menu.active&&this.menu.select(n);break;case o.ESCAPE:this.menu.element.is(":visible")&&(this.isMultiLine||this._value(this.term),this.close(n),n.preventDefault());break;default:i=!0,this._searchTimeout(n)}},keypress:function (s){if(e)return e=!1,(!this.isMultiLine||this.menu.element.is(":visible"))&&s.preventDefault(),void 0;if(!i){var n=t.ui.keyCode;switch(s.keyCode){case n.PAGE_UP:this._move("previousPage",s);break;case n.PAGE_DOWN:this._move("nextPage",s);break;case n.UP:this._keyEvent("previous",s);break;case n.DOWN:this._keyEvent("next",s)}}},input:function (t){return s?(s=!1,t.preventDefault(),void 0):(this._searchTimeout(t),void 0)},focus:function (){this.selectedItem=null,this.previous=this._value()},blur:function (t){return this.cancelBlur?(delete this.cancelBlur,void 0):(clearTimeout(this.searching),this.close(t),this._change(t),void 0)}}),this._initSource(),this.menu=t("<ul>").appendTo(this._appendTo()).menu({role:null}).hide().menu("instance"),this._addClass(this.menu.element,"ui-autocomplete","ui-front"),this._on(this.menu.element,{mousedown:function (e){e.preventDefault(),this.cancelBlur=!0,this._delay(function (){delete this.cancelBlur,this.element[0]!==t.ui.safeActiveElement(this.document[0])&&this.element.trigger("focus")})},menufocus:function (e,i){var s,n;return this.isNewMenu&&(this.isNewMenu=!1,e.originalEvent&&/^mouse/.test(e.originalEvent.type))?(this.menu.blur(),this.document.one("mousemove",function (){t(e.target).trigger(e.originalEvent)
}),void 0):(n=i.item.data("ui-autocomplete-item"),!1!==this._trigger("focus",e,{item:n})&&e.originalEvent&&/^key/.test(e.originalEvent.type)&&this._value(n.value),s=i.item.attr("aria-label")||n.value,s&&t.trim(s).length&&(this.liveRegion.children().hide(),t("<div>").text(s).appendTo(this.liveRegion)),void 0)},menuselect:function (e,i){var s=i.item.data("ui-autocomplete-item"),n=this.previous;this.element[0]!==t.ui.safeActiveElement(this.document[0])&&(this.element.trigger("focus"),this.previous=n,this._delay(function (){this.previous=n,this.selectedItem=s})),!1!==this._trigger("select",e,{item:s})&&this._value(s.value),this.term=this._value(),this.close(e),this.selectedItem=s}}),this.liveRegion=t("<div>",{role:"status","aria-live":"assertive","aria-relevant":"additions"}).appendTo(this.document[0].body),this._addClass(this.liveRegion,null,"ui-helper-hidden-accessible"),this._on(this.window,{beforeunload:function (){this.element.removeAttr("autocomplete")}})},_destroy:function (){clearTimeout(this.searching),this.element.removeAttr("autocomplete"),this.menu.element.remove(),this.liveRegion.remove()},_setOption:function (t,e){this._super(t,e),"source"===t&&this._initSource(),"appendTo"===t&&this.menu.element.appendTo(this._appendTo()),"disabled"===t&&e&&this.xhr&&this.xhr.abort()},_isEventTargetInWidget:function (e){var i=this.menu.element[0];return e.target===this.element[0]||e.target===i||t.contains(i,e.target)},_closeOnClickOutside:function (t){this._isEventTargetInWidget(t)||this.close()},_appendTo:function (){var e=this.options.appendTo;return e&&(e=e.jquery||e.nodeType?t(e):this.document.find(e).eq(0)),e&&e[0]||(e=this.element.closest(".ui-front, dialog")),e.length||(e=this.document[0].body),e},_initSource:function (){var e,i,s=this;t.isArray(this.options.source)?(e=this.options.source,this.source=function (i,s){s(t.ui.autocomplete.filter(e,i.term))}):"string"==typeof this.options.source?(i=this.options.source,this.source=function (e,n){s.xhr&&s.xhr.abort(),s.xhr=t.ajax({url:i,data:e,dataType:"json",success:function (t){n(t)},error:function (){n([])}})}):this.source=this.options.source},_searchTimeout:function (t){clearTimeout(this.searching),this.searching=this._delay(function (){var e=this.term===this._value(),i=this.menu.element.is(":visible"),s=t.altKey||t.ctrlKey||t.metaKey||t.shiftKey;(!e||e&&!i&&!s)&&(this.selectedItem=null,this.search(null,t))},this.options.delay)},search:function (t,e){return t=null!=t?t:this._value(),this.term=this._value(),t.length<this.options.minLength?this.close(e):this._trigger("search",e)!==!1?this._search(t):void 0},_search:function (t){this.pending++,this._addClass("ui-autocomplete-loading"),this.cancelSearch=!1,this.source({term:t},this._response())},_response:function (){var e=++this.requestIndex;return t.proxy(function (t){e===this.requestIndex&&this.__response(t),this.pending--,this.pending||this._removeClass("ui-autocomplete-loading")},this)},__response:function (t){t&&(t=this._normalize(t)),this._trigger("response",null,{content:t}),!this.options.disabled&&t&&t.length&&!this.cancelSearch?(this._suggest(t),this._trigger("open")):this._close()},close:function (t){this.cancelSearch=!0,this._close(t)},_close:function (t){this._off(this.document,"mousedown"),this.menu.element.is(":visible")&&(this.menu.element.hide(),this.menu.blur(),this.isNewMenu=!0,this._trigger("close",t))},_change:function (t){this.previous!==this._value()&&this._trigger("change",t,{item:this.selectedItem})},_normalize:function (e){return e.length&&e[0].label&&e[0].value?e:t.map(e,function (e){return"string"==typeof e?{label:e,value:e}:t.extend({},e,{label:e.label||e.value,value:e.value||e.label})})},_suggest:function (e){var i=this.menu.element.empty();this._renderMenu(i,e),this.isNewMenu=!0,this.menu.refresh(),i.show(),this._resizeMenu(),i.position(t.extend({of:this.element},this.options.position)),this.options.autoFocus&&this.menu.next(),this._on(this.document,{mousedown:"_closeOnClickOutside"})},_resizeMenu:function (){var t=this.menu.element;t.outerWidth(Math.max(t.width("").outerWidth()+1,this.element.outerWidth()))},_renderMenu:function (e,i){var s=this;t.each(i,function (t,i){s._renderItemData(e,i)})},_renderItemData:function (t,e){return this._renderItem(t,e).data("ui-autocomplete-item",e)},_renderItem:function (e,i){return t("<li>").append(t("<div>").text(i.label)).appendTo(e)},_move:function (t,e){return this.menu.element.is(":visible")?this.menu.isFirstItem()&&/^previous/.test(t)||this.menu.isLastItem()&&/^next/.test(t)?(this.isMultiLine||this._value(this.term),this.menu.blur(),void 0):(this.menu[t](e),void 0):(this.search(null,e),void 0)},widget:function (){return this.menu.element},_value:function (){return this.valueMethod.apply(this.element,arguments)},_keyEvent:function (t,e){(!this.isMultiLine||this.menu.element.is(":visible"))&&(this._move(t,e),e.preventDefault())},_isContentEditable:function (t){if(!t.length)return!1;var e=t.prop("contentEditable");return"inherit"===e?this._isContentEditable(t.parent()):"true"===e}}),t.extend(t.ui.autocomplete,{escapeRegex:function (t){return t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")},filter:function (e,i){var s=RegExp(t.ui.autocomplete.escapeRegex(i),"i");return t.grep(e,function (t){return s.test(t.label||t.value||t)})}}),t.widget("ui.autocomplete",t.ui.autocomplete,{options:{messages:{noResults:"No search results.",results:function (t){return t+(t>1?" results are":" result is")+" available, use up and down arrow keys to navigate."}}},__response:function (e){var i;this._superApply(arguments),this.options.disabled||this.cancelSearch||(i=e&&e.length?this.options.messages.results(e.length):this.options.messages.noResults,this.liveRegion.children().hide(),t("<div>").text(i).appendTo(this.liveRegion))}}),t.ui.autocomplete,t.widget("ui.checkboxradio",[t.ui.formResetMixin,{version:"1.12.1",options:{disabled:null,label:null,icon:!0,classes:{"ui-checkboxradio-label":"ui-corner-all","ui-checkboxradio-icon":"ui-corner-all"}},_getCreateOptions:function (){var e,i,s=this,n=this._super()||{};return this._readType(),i=this.element.labels(),this.label=t(i[i.length-1]),this.label.length||t.error("No label found for checkboxradio widget"),this.originalLabel="",this.label.contents().not(this.element[0]).each(function (){s.originalLabel+=3===this.nodeType?t(this).text():this.outerHTML}),this.originalLabel&&(n.label=this.originalLabel),e=this.element[0].disabled,null!=e&&(n.disabled=e),n},_create:function (){var t=this.element[0].checked;this._bindFormResetHandler(),null==this.options.disabled&&(this.options.disabled=this.element[0].disabled),this._setOption("disabled",this.options.disabled),this._addClass("ui-checkboxradio","ui-helper-hidden-accessible"),this._addClass(this.label,"ui-checkboxradio-label","ui-button ui-widget"),"radio"===this.type&&this._addClass(this.label,"ui-checkboxradio-radio-label"),this.options.label&&this.options.label!==this.originalLabel?this._updateLabel():this.originalLabel&&(this.options.label=this.originalLabel),this._enhance(),t&&(this._addClass(this.label,"ui-checkboxradio-checked","ui-state-active"),this.icon&&this._addClass(this.icon,null,"ui-state-hover")),this._on({change:"_toggleClasses",focus:function (){this._addClass(this.label,null,"ui-state-focus ui-visual-focus")},blur:function (){this._removeClass(this.label,null,"ui-state-focus ui-visual-focus")}})},_readType:function (){var e=this.element[0].nodeName.toLowerCase();this.type=this.element[0].type,"input"===e&&/radio|checkbox/.test(this.type)||t.error("Can't create checkboxradio on element.nodeName="+e+" and element.type="+this.type)},_enhance:function (){this._updateIcon(this.element[0].checked)},widget:function (){return this.label},_getRadioGroup:function (){var e,i=this.element[0].name,s="input[name='"+t.ui.escapeSelector(i)+"']";return i?(e=this.form.length?t(this.form[0].elements).filter(s):t(s).filter(function (){return 0===t(this).form().length}),e.not(this.element)):t([])},_toggleClasses:function (){var e=this.element[0].checked;this._toggleClass(this.label,"ui-checkboxradio-checked","ui-state-active",e),this.options.icon&&"checkbox"===this.type&&this._toggleClass(this.icon,null,"ui-icon-check ui-state-checked",e)._toggleClass(this.icon,null,"ui-icon-blank",!e),"radio"===this.type&&this._getRadioGroup().each(function (){var e=t(this).checkboxradio("instance");e&&e._removeClass(e.label,"ui-checkboxradio-checked","ui-state-active")})},_destroy:function (){this._unbindFormResetHandler(),this.icon&&(this.icon.remove(),this.iconSpace.remove())},_setOption:function (t,e){return"label"!==t||e?(this._super(t,e),"disabled"===t?(this._toggleClass(this.label,null,"ui-state-disabled",e),this.element[0].disabled=e,void 0):(this.refresh(),void 0)):void 0},_updateIcon:function (e){var i="ui-icon ui-icon-background ";this.options.icon?(this.icon||(this.icon=t("<span>"),this.iconSpace=t("<span> </span>"),this._addClass(this.iconSpace,"ui-checkboxradio-icon-space")),"checkbox"===this.type?(i+=e?"ui-icon-check ui-state-checked":"ui-icon-blank",this._removeClass(this.icon,null,e?"ui-icon-blank":"ui-icon-check")):i+="ui-icon-blank",this._addClass(this.icon,"ui-checkboxradio-icon",i),e||this._removeClass(this.icon,null,"ui-icon-check ui-state-checked"),this.icon.prependTo(this.label).after(this.iconSpace)):void 0!==this.icon&&(this.icon.remove(),this.iconSpace.remove(),delete this.icon)},_updateLabel:function (){var t=this.label.contents().not(this.element[0]);this.icon&&(t=t.not(this.icon[0])),this.iconSpace&&(t=t.not(this.iconSpace[0])),t.remove(),this.label.append(this.options.label)},refresh:function (){var t=this.element[0].checked,e=this.element[0].disabled;this._updateIcon(t),this._toggleClass(this.label,"ui-checkboxradio-checked","ui-state-active",t),null!==this.options.label&&this._updateLabel(),e!==this.options.disabled&&this._setOptions({disabled:e})}}]),t.ui.checkboxradio,t.extend(t.ui,{datepicker:{version:"1.12.1"}});var h;t.extend(s.prototype,{markerClassName:"hasDatepicker",maxRows:4,_widgetDatepicker:function (){return this.dpDiv},setDefaults:function (t){return a(this._defaults,t||{}),this},_attachDatepicker:function (e,i){var s,n,o;s=e.nodeName.toLowerCase(),n="div"===s||"span"===s,e.id||(this.uuid+=1,e.id="dp"+this.uuid),o=this._newInst(t(e),n),o.settings=t.extend({},i||{}),"input"===s?this._connectDatepicker(e,o):n&&this._inlineDatepicker(e,o)},_newInst:function (e,i){var s=e[0].id.replace(/([^A-Za-z0-9_\-])/g,"\\\\$1");return{id:s,input:e,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:i,dpDiv:i?n(t("<div class='"+this._inlineClass+" ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")):this.dpDiv}},_connectDatepicker:function (e,i){var s=t(e);i.append=t([]),i.trigger=t([]),s.hasClass(this.markerClassName)||(this._attachments(s,i),s.addClass(this.markerClassName).on("keydown",this._doKeyDown).on("keypress",this._doKeyPress).on("keyup",this._doKeyUp),this._autoSize(i),t.data(e,"datepicker",i),i.settings.disabled&&this._disableDatepicker(e))},_attachments:function (e,i){var s,n,o,a=this._get(i,"appendText"),r=this._get(i,"isRTL");i.append&&i.append.remove(),a&&(i.append=t("<span class='"+this._appendClass+"'>"+a+"</span>"),e[r?"before":"after"](i.append)),e.off("focus",this._showDatepicker),i.trigger&&i.trigger.remove(),s=this._get(i,"showOn"),("focus"===s||"both"===s)&&e.on("focus",this._showDatepicker),("button"===s||"both"===s)&&(n=this._get(i,"buttonText"),o=this._get(i,"buttonImage"),i.trigger=t(this._get(i,"buttonImageOnly")?t("<img/>").addClass(this._triggerClass).attr({src:o,alt:n,title:n}):t("<button type='button'></button>").addClass(this._triggerClass).html(o?t("<img/>").attr({src:o,alt:n,title:n}):n)),e[r?"before":"after"](i.trigger),i.trigger.on("click",function (){return t.datepicker._datepickerShowing&&t.datepicker._lastInput===e[0]?t.datepicker._hideDatepicker():t.datepicker._datepickerShowing&&t.datepicker._lastInput!==e[0]?(t.datepicker._hideDatepicker(),t.datepicker._showDatepicker(e[0])):t.datepicker._showDatepicker(e[0]),!1}))},_autoSize:function (t){if(this._get(t,"autoSize")&&!t.inline){var e,i,s,n,o=new Date(2009,11,20),a=this._get(t,"dateFormat");a.match(/[DM]/)&&(e=function (t){for(i=0,s=0,n=0;t.length>n;n++)t[n].length>i&&(i=t[n].length,s=n);return s},o.setMonth(e(this._get(t,a.match(/MM/)?"monthNames":"monthNamesShort"))),o.setDate(e(this._get(t,a.match(/DD/)?"dayNames":"dayNamesShort"))+20-o.getDay())),t.input.attr("size",this._formatDate(t,o).length)}},_inlineDatepicker:function (e,i){var s=t(e);s.hasClass(this.markerClassName)||(s.addClass(this.markerClassName).append(i.dpDiv),t.data(e,"datepicker",i),this._setDate(i,this._getDefaultDate(i),!0),this._updateDatepicker(i),this._updateAlternate(i),i.settings.disabled&&this._disableDatepicker(e),i.dpDiv.css("display","block"))},_dialogDatepicker:function (e,i,s,n,o){var r,l,h,c,u,d=this._dialogInst;return d||(this.uuid+=1,r="dp"+this.uuid,this._dialogInput=t("<input type='text' id='"+r+"' style='position: absolute; top: -100px; width: 0px;'/>"),this._dialogInput.on("keydown",this._doKeyDown),t("body").append(this._dialogInput),d=this._dialogInst=this._newInst(this._dialogInput,!1),d.settings={},t.data(this._dialogInput[0],"datepicker",d)),a(d.settings,n||{}),i=i&&i.constructor===Date?this._formatDate(d,i):i,this._dialogInput.val(i),this._pos=o?o.length?o:[o.pageX,o.pageY]:null,this._pos||(l=document.documentElement.clientWidth,h=document.documentElement.clientHeight,c=document.documentElement.scrollLeft||document.body.scrollLeft,u=document.documentElement.scrollTop||document.body.scrollTop,this._pos=[l/2-100+c,h/2-150+u]),this._dialogInput.css("left",this._pos[0]+20+"px").css("top",this._pos[1]+"px"),d.settings.onSelect=s,this._inDialog=!0,this.dpDiv.addClass(this._dialogClass),this._showDatepicker(this._dialogInput[0]),t.blockUI&&t.blockUI(this.dpDiv),t.data(this._dialogInput[0],"datepicker",d),this},_destroyDatepicker:function (e){var i,s=t(e),n=t.data(e,"datepicker");s.hasClass(this.markerClassName)&&(i=e.nodeName.toLowerCase(),t.removeData(e,"datepicker"),"input"===i?(n.append.remove(),n.trigger.remove(),s.removeClass(this.markerClassName).off("focus",this._showDatepicker).off("keydown",this._doKeyDown).off("keypress",this._doKeyPress).off("keyup",this._doKeyUp)):("div"===i||"span"===i)&&s.removeClass(this.markerClassName).empty(),h===n&&(h=null))},_enableDatepicker:function (e){var i,s,n=t(e),o=t.data(e,"datepicker");n.hasClass(this.markerClassName)&&(i=e.nodeName.toLowerCase(),"input"===i?(e.disabled=!1,o.trigger.filter("button").each(function (){this.disabled=!1}).end().filter("img").css({opacity:"1.0",cursor:""})):("div"===i||"span"===i)&&(s=n.children("."+this._inlineClass),s.children().removeClass("ui-state-disabled"),s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",!1)),this._disabledInputs=t.map(this._disabledInputs,function (t){return t===e?null:t}))},_disableDatepicker:function (e){var i,s,n=t(e),o=t.data(e,"datepicker");n.hasClass(this.markerClassName)&&(i=e.nodeName.toLowerCase(),"input"===i?(e.disabled=!0,o.trigger.filter("button").each(function (){this.disabled=!0}).end().filter("img").css({opacity:"0.5",cursor:"default"})):("div"===i||"span"===i)&&(s=n.children("."+this._inlineClass),s.children().addClass("ui-state-disabled"),s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",!0)),this._disabledInputs=t.map(this._disabledInputs,function (t){return t===e?null:t}),this._disabledInputs[this._disabledInputs.length]=e)},_isDisabledDatepicker:function (t){if(!t)return!1;for(var e=0;this._disabledInputs.length>e;e++)if(this._disabledInputs[e]===t)return!0;return!1},_getInst:function (e){try{return t.data(e,"datepicker")}catch(i){throw"Missing instance data for this datepicker"}},_optionDatepicker:function (e,i,s){var n,o,r,l,h=this._getInst(e);return 2===arguments.length&&"string"==typeof i?"defaults"===i?t.extend({},t.datepicker._defaults):h?"all"===i?t.extend({},h.settings):this._get(h,i):null:(n=i||{},"string"==typeof i&&(n={},n[i]=s),h&&(this._curInst===h&&this._hideDatepicker(),o=this._getDateDatepicker(e,!0),r=this._getMinMaxDate(h,"min"),l=this._getMinMaxDate(h,"max"),a(h.settings,n),null!==r&&void 0!==n.dateFormat&&void 0===n.minDate&&(h.settings.minDate=this._formatDate(h,r)),null!==l&&void 0!==n.dateFormat&&void 0===n.maxDate&&(h.settings.maxDate=this._formatDate(h,l)),"disabled"in n&&(n.disabled?this._disableDatepicker(e):this._enableDatepicker(e)),this._attachments(t(e),h),this._autoSize(h),this._setDate(h,o),this._updateAlternate(h),this._updateDatepicker(h)),void 0)},_changeDatepicker:function (t,e,i){this._optionDatepicker(t,e,i)},_refreshDatepicker:function (t){var e=this._getInst(t);e&&this._updateDatepicker(e)},_setDateDatepicker:function (t,e){var i=this._getInst(t);i&&(this._setDate(i,e),this._updateDatepicker(i),this._updateAlternate(i))},_getDateDatepicker:function (t,e){var i=this._getInst(t);return i&&!i.inline&&this._setDateFromField(i,e),i?this._getDate(i):null},_doKeyDown:function (e){var i,s,n,o=t.datepicker._getInst(e.target),a=!0,r=o.dpDiv.is(".ui-datepicker-rtl");if(o._keyEvent=!0,t.datepicker._datepickerShowing)switch(e.keyCode){case 9:t.datepicker._hideDatepicker(),a=!1;break;case 13:return n=t("td."+t.datepicker._dayOverClass+":not(."+t.datepicker._currentClass+")",o.dpDiv),n[0]&&t.datepicker._selectDay(e.target,o.selectedMonth,o.selectedYear,n[0]),i=t.datepicker._get(o,"onSelect"),i?(s=t.datepicker._formatDate(o),i.apply(o.input?o.input[0]:null,[s,o])):t.datepicker._hideDatepicker(),!1;case 27:t.datepicker._hideDatepicker();break;case 33:t.datepicker._adjustDate(e.target,e.ctrlKey?-t.datepicker._get(o,"stepBigMonths"):-t.datepicker._get(o,"stepMonths"),"M");break;case 34:t.datepicker._adjustDate(e.target,e.ctrlKey?+t.datepicker._get(o,"stepBigMonths"):+t.datepicker._get(o,"stepMonths"),"M");break;case 35:(e.ctrlKey||e.metaKey)&&t.datepicker._clearDate(e.target),a=e.ctrlKey||e.metaKey;break;case 36:(e.ctrlKey||e.metaKey)&&t.datepicker._gotoToday(e.target),a=e.ctrlKey||e.metaKey;break;case 37:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,r?1:-1,"D"),a=e.ctrlKey||e.metaKey,e.originalEvent.altKey&&t.datepicker._adjustDate(e.target,e.ctrlKey?-t.datepicker._get(o,"stepBigMonths"):-t.datepicker._get(o,"stepMonths"),"M");break;case 38:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,-7,"D"),a=e.ctrlKey||e.metaKey;break;case 39:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,r?-1:1,"D"),a=e.ctrlKey||e.metaKey,e.originalEvent.altKey&&t.datepicker._adjustDate(e.target,e.ctrlKey?+t.datepicker._get(o,"stepBigMonths"):+t.datepicker._get(o,"stepMonths"),"M");break;case 40:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,7,"D"),a=e.ctrlKey||e.metaKey;break;default:a=!1}else 36===e.keyCode&&e.ctrlKey?t.datepicker._showDatepicker(this):a=!1;a&&(e.preventDefault(),e.stopPropagation())},_doKeyPress:function (e){var i,s,n=t.datepicker._getInst(e.target);return t.datepicker._get(n,"constrainInput")?(i=t.datepicker._possibleChars(t.datepicker._get(n,"dateFormat")),s=String.fromCharCode(null==e.charCode?e.keyCode:e.charCode),e.ctrlKey||e.metaKey||" ">s||!i||i.indexOf(s)>-1):void 0},_doKeyUp:function (e){var i,s=t.datepicker._getInst(e.target);if(s.input.val()!==s.lastVal)try{i=t.datepicker.parseDate(t.datepicker._get(s,"dateFormat"),s.input?s.input.val():null,t.datepicker._getFormatConfig(s)),i&&(t.datepicker._setDateFromField(s),t.datepicker._updateAlternate(s),t.datepicker._updateDatepicker(s))}catch(n){}return!0},_showDatepicker:function (e){if(e=e.target||e,"input"!==e.nodeName.toLowerCase()&&(e=t("input",e.parentNode)[0]),!t.datepicker._isDisabledDatepicker(e)&&t.datepicker._lastInput!==e){var s,n,o,r,l,h,c;s=t.datepicker._getInst(e),t.datepicker._curInst&&t.datepicker._curInst!==s&&(t.datepicker._curInst.dpDiv.stop(!0,!0),s&&t.datepicker._datepickerShowing&&t.datepicker._hideDatepicker(t.datepicker._curInst.input[0])),n=t.datepicker._get(s,"beforeShow"),o=n?n.apply(e,[e,s]):{},o!==!1&&(a(s.settings,o),s.lastVal=null,t.datepicker._lastInput=e,t.datepicker._setDateFromField(s),t.datepicker._inDialog&&(e.value=""),t.datepicker._pos||(t.datepicker._pos=t.datepicker._findPos(e),t.datepicker._pos[1]+=e.offsetHeight),r=!1,t(e).parents().each(function (){return r|="fixed"===t(this).css("position"),!r}),l={left:t.datepicker._pos[0],top:t.datepicker._pos[1]},t.datepicker._pos=null,s.dpDiv.empty(),s.dpDiv.css({position:"absolute",display:"block",top:"-1000px"}),t.datepicker._updateDatepicker(s),l=t.datepicker._checkOffset(s,l,r),s.dpDiv.css({position:t.datepicker._inDialog&&t.blockUI?"static":r?"fixed":"absolute",display:"none",left:l.left+"px",top:l.top+"px"}),s.inline||(h=t.datepicker._get(s,"showAnim"),c=t.datepicker._get(s,"duration"),s.dpDiv.css("z-index",i(t(e))+1),t.datepicker._datepickerShowing=!0,t.effects&&t.effects.effect[h]?s.dpDiv.show(h,t.datepicker._get(s,"showOptions"),c):s.dpDiv[h||"show"](h?c:null),t.datepicker._shouldFocusInput(s)&&s.input.trigger("focus"),t.datepicker._curInst=s))}},_updateDatepicker:function (e){this.maxRows=4,h=e,e.dpDiv.empty().append(this._generateHTML(e)),this._attachHandlers(e);var i,s=this._getNumberOfMonths(e),n=s[1],a=17,r=e.dpDiv.find("."+this._dayOverClass+" a");r.length>0&&o.apply(r.get(0)),e.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width(""),n>1&&e.dpDiv.addClass("ui-datepicker-multi-"+n).css("width",a*n+"em"),e.dpDiv[(1!==s[0]||1!==s[1]?"add":"remove")+"Class"]("ui-datepicker-multi"),e.dpDiv[(this._get(e,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl"),e===t.datepicker._curInst&&t.datepicker._datepickerShowing&&t.datepicker._shouldFocusInput(e)&&e.input.trigger("focus"),e.yearshtml&&(i=e.yearshtml,setTimeout(function (){i===e.yearshtml&&e.yearshtml&&e.dpDiv.find("select.ui-datepicker-year:first").replaceWith(e.yearshtml),i=e.yearshtml=null},0))},_shouldFocusInput:function (t){return t.input&&t.input.is(":visible")&&!t.input.is(":disabled")&&!t.input.is(":focus")},_checkOffset:function (e,i,s){var n=e.dpDiv.outerWidth(),o=e.dpDiv.outerHeight(),a=e.input?e.input.outerWidth():0,r=e.input?e.input.outerHeight():0,l=document.documentElement.clientWidth+(s?0:t(document).scrollLeft()),h=document.documentElement.clientHeight+(s?0:t(document).scrollTop());return i.left-=this._get(e,"isRTL")?n-a:0,i.left-=s&&i.left===e.input.offset().left?t(document).scrollLeft():0,i.top-=s&&i.top===e.input.offset().top+r?t(document).scrollTop():0,i.left-=Math.min(i.left,i.left+n>l&&l>n?Math.abs(i.left+n-l):0),i.top-=Math.min(i.top,i.top+o>h&&h>o?Math.abs(o+r):0),i},_findPos:function (e){for(var i,s=this._getInst(e),n=this._get(s,"isRTL");e&&("hidden"===e.type||1!==e.nodeType||t.expr.filters.hidden(e));)e=e[n?"previousSibling":"nextSibling"];return i=t(e).offset(),[i.left,i.top]},_hideDatepicker:function (e){var i,s,n,o,a=this._curInst;!a||e&&a!==t.data(e,"datepicker")||this._datepickerShowing&&(i=this._get(a,"showAnim"),s=this._get(a,"duration"),n=function (){t.datepicker._tidyDialog(a)},t.effects&&(t.effects.effect[i]||t.effects[i])?a.dpDiv.hide(i,t.datepicker._get(a,"showOptions"),s,n):a.dpDiv["slideDown"===i?"slideUp":"fadeIn"===i?"fadeOut":"hide"](i?s:null,n),i||n(),this._datepickerShowing=!1,o=this._get(a,"onClose"),o&&o.apply(a.input?a.input[0]:null,[a.input?a.input.val():"",a]),this._lastInput=null,this._inDialog&&(this._dialogInput.css({position:"absolute",left:"0",top:"-100px"}),t.blockUI&&(t.unblockUI(),t("body").append(this.dpDiv))),this._inDialog=!1)},_tidyDialog:function (t){t.dpDiv.removeClass(this._dialogClass).off(".ui-datepicker-calendar")},_checkExternalClick:function (e){if(t.datepicker._curInst){var i=t(e.target),s=t.datepicker._getInst(i[0]);(i[0].id!==t.datepicker._mainDivId&&0===i.parents("#"+t.datepicker._mainDivId).length&&!i.hasClass(t.datepicker.markerClassName)&&!i.closest("."+t.datepicker._triggerClass).length&&t.datepicker._datepickerShowing&&(!t.datepicker._inDialog||!t.blockUI)||i.hasClass(t.datepicker.markerClassName)&&t.datepicker._curInst!==s)&&t.datepicker._hideDatepicker()}},_adjustDate:function (e,i,s){var n=t(e),o=this._getInst(n[0]);this._isDisabledDatepicker(n[0])||(this._adjustInstDate(o,i+("M"===s?this._get(o,"showCurrentAtPos"):0),s),this._updateDatepicker(o))},_gotoToday:function (e){var i,s=t(e),n=this._getInst(s[0]);this._get(n,"gotoCurrent")&&n.currentDay?(n.selectedDay=n.currentDay,n.drawMonth=n.selectedMonth=n.currentMonth,n.drawYear=n.selectedYear=n.currentYear):(i=new Date,n.selectedDay=i.getDate(),n.drawMonth=n.selectedMonth=i.getMonth(),n.drawYear=n.selectedYear=i.getFullYear()),this._notifyChange(n),this._adjustDate(s)},_selectMonthYear:function (e,i,s){var n=t(e),o=this._getInst(n[0]);o["selected"+("M"===s?"Month":"Year")]=o["draw"+("M"===s?"Month":"Year")]=parseInt(i.options[i.selectedIndex].value,10),this._notifyChange(o),this._adjustDate(n)},_selectDay:function (e,i,s,n){var o,a=t(e);t(n).hasClass(this._unselectableClass)||this._isDisabledDatepicker(a[0])||(o=this._getInst(a[0]),o.selectedDay=o.currentDay=t("a",n).html(),o.selectedMonth=o.currentMonth=i,o.selectedYear=o.currentYear=s,this._selectDate(e,this._formatDate(o,o.currentDay,o.currentMonth,o.currentYear)))},_clearDate:function (e){var i=t(e);this._selectDate(i,"")},_selectDate:function (e,i){var s,n=t(e),o=this._getInst(n[0]);i=null!=i?i:this._formatDate(o),o.input&&o.input.val(i),this._updateAlternate(o),s=this._get(o,"onSelect"),s?s.apply(o.input?o.input[0]:null,[i,o]):o.input&&o.input.trigger("change"),o.inline?this._updateDatepicker(o):(this._hideDatepicker(),this._lastInput=o.input[0],"object"!=typeof o.input[0]&&o.input.trigger("focus"),this._lastInput=null)},_updateAlternate:function (e){var i,s,n,o=this._get(e,"altField");o&&(i=this._get(e,"altFormat")||this._get(e,"dateFormat"),s=this._getDate(e),n=this.formatDate(i,s,this._getFormatConfig(e)),t(o).val(n))},noWeekends:function (t){var e=t.getDay();return[e>0&&6>e,""]},iso8601Week:function (t){var e,i=new Date(t.getTime());return i.setDate(i.getDate()+4-(i.getDay()||7)),e=i.getTime(),i.setMonth(0),i.setDate(1),Math.floor(Math.round((e-i)/864e5)/7)+1},parseDate:function (e,i,s){if(null==e||null==i)throw"Invalid arguments";if(i="object"==typeof i?""+i:i+"",""===i)return null;var n,o,a,r,l=0,h=(s?s.shortYearCutoff:null)||this._defaults.shortYearCutoff,c="string"!=typeof h?h:(new Date).getFullYear()%100+parseInt(h,10),u=(s?s.dayNamesShort:null)||this._defaults.dayNamesShort,d=(s?s.dayNames:null)||this._defaults.dayNames,p=(s?s.monthNamesShort:null)||this._defaults.monthNamesShort,f=(s?s.monthNames:null)||this._defaults.monthNames,g=-1,m=-1,_=-1,v=-1,b=!1,y=function (t){var i=e.length>n+1&&e.charAt(n+1)===t;return i&&n++,i},w=function (t){var e=y(t),s="@"===t?14:"!"===t?20:"y"===t&&e?4:"o"===t?3:2,n="y"===t?s:1,o=RegExp("^\\d{"+n+","+s+"}"),a=i.substring(l).match(o);if(!a)throw"Missing number at position "+l;return l+=a[0].length,parseInt(a[0],10)},k=function (e,s,n){var o=-1,a=t.map(y(e)?n:s,function (t,e){return[[e,t]]}).sort(function (t,e){return-(t[1].length-e[1].length)});if(t.each(a,function (t,e){var s=e[1];return i.substr(l,s.length).toLowerCase()===s.toLowerCase()?(o=e[0],l+=s.length,!1):void 0}),-1!==o)return o+1;throw"Unknown name at position "+l},x=function (){if(i.charAt(l)!==e.charAt(n))throw"Unexpected literal at position "+l;l++};for(n=0;e.length>n;n++)if(b)"'"!==e.charAt(n)||y("'")?x():b=!1;else switch(e.charAt(n)){case"d":_=w("d");break;case"D":k("D",u,d);break;case"o":v=w("o");break;case"m":m=w("m");break;case"M":m=k("M",p,f);break;case"y":g=w("y");break;case"@":r=new Date(w("@")),g=r.getFullYear(),m=r.getMonth()+1,_=r.getDate();break;case"!":r=new Date((w("!")-this._ticksTo1970)/1e4),g=r.getFullYear(),m=r.getMonth()+1,_=r.getDate();break;case"'":y("'")?x():b=!0;break;default:x()}if(i.length>l&&(a=i.substr(l),!/^\s+/.test(a)))throw"Extra/unparsed characters found in date: "+a;if(-1===g?g=(new Date).getFullYear():100>g&&(g+=(new Date).getFullYear()-(new Date).getFullYear()%100+(c>=g?0:-100)),v>-1)for(m=1,_=v;;){if(o=this._getDaysInMonth(g,m-1),o>=_)break;m++,_-=o}if(r=this._daylightSavingAdjust(new Date(g,m-1,_)),r.getFullYear()!==g||r.getMonth()+1!==m||r.getDate()!==_)throw"Invalid date";return r},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:1e7*60*60*24*(718685+Math.floor(492.5)-Math.floor(19.7)+Math.floor(4.925)),formatDate:function (t,e,i){if(!e)return"";var s,n=(i?i.dayNamesShort:null)||this._defaults.dayNamesShort,o=(i?i.dayNames:null)||this._defaults.dayNames,a=(i?i.monthNamesShort:null)||this._defaults.monthNamesShort,r=(i?i.monthNames:null)||this._defaults.monthNames,l=function (e){var i=t.length>s+1&&t.charAt(s+1)===e;return i&&s++,i},h=function (t,e,i){var s=""+e;if(l(t))for(;i>s.length;)s="0"+s;return s},c=function (t,e,i,s){return l(t)?s[e]:i[e]},u="",d=!1;if(e)for(s=0;t.length>s;s++)if(d)"'"!==t.charAt(s)||l("'")?u+=t.charAt(s):d=!1;else switch(t.charAt(s)){case"d":u+=h("d",e.getDate(),2);break;case"D":u+=c("D",e.getDay(),n,o);break;case"o":u+=h("o",Math.round((new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime()-new Date(e.getFullYear(),0,0).getTime())/864e5),3);break;case"m":u+=h("m",e.getMonth()+1,2);break;case"M":u+=c("M",e.getMonth(),a,r);break;case"y":u+=l("y")?e.getFullYear():(10>e.getFullYear()%100?"0":"")+e.getFullYear()%100;break;case"@":u+=e.getTime();break;case"!":u+=1e4*e.getTime()+this._ticksTo1970;break;case"'":l("'")?u+="'":d=!0;break;default:u+=t.charAt(s)}return u},_possibleChars:function (t){var e,i="",s=!1,n=function (i){var s=t.length>e+1&&t.charAt(e+1)===i;return s&&e++,s};for(e=0;t.length>e;e++)if(s)"'"!==t.charAt(e)||n("'")?i+=t.charAt(e):s=!1;else switch(t.charAt(e)){case"d":case"m":case"y":case"@":i+="0123456789";break;case"D":case"M":return null;case"'":n("'")?i+="'":s=!0;break;default:i+=t.charAt(e)}return i},_get:function (t,e){return void 0!==t.settings[e]?t.settings[e]:this._defaults[e]},_setDateFromField:function (t,e){if(t.input.val()!==t.lastVal){var i=this._get(t,"dateFormat"),s=t.lastVal=t.input?t.input.val():null,n=this._getDefaultDate(t),o=n,a=this._getFormatConfig(t);try{o=this.parseDate(i,s,a)||n}catch(r){s=e?"":s}t.selectedDay=o.getDate(),t.drawMonth=t.selectedMonth=o.getMonth(),t.drawYear=t.selectedYear=o.getFullYear(),t.currentDay=s?o.getDate():0,t.currentMonth=s?o.getMonth():0,t.currentYear=s?o.getFullYear():0,this._adjustInstDate(t)}},_getDefaultDate:function (t){return this._restrictMinMax(t,this._determineDate(t,this._get(t,"defaultDate"),new Date))},_determineDate:function (e,i,s){var n=function (t){var e=new Date;return e.setDate(e.getDate()+t),e},o=function (i){try{return t.datepicker.parseDate(t.datepicker._get(e,"dateFormat"),i,t.datepicker._getFormatConfig(e))}catch(s){}for(var n=(i.toLowerCase().match(/^c/)?t.datepicker._getDate(e):null)||new Date,o=n.getFullYear(),a=n.getMonth(),r=n.getDate(),l=/([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,h=l.exec(i);h;){switch(h[2]||"d"){case"d":case"D":r+=parseInt(h[1],10);break;case"w":case"W":r+=7*parseInt(h[1],10);break;case"m":case"M":a+=parseInt(h[1],10),r=Math.min(r,t.datepicker._getDaysInMonth(o,a));break;case"y":case"Y":o+=parseInt(h[1],10),r=Math.min(r,t.datepicker._getDaysInMonth(o,a))}h=l.exec(i)}return new Date(o,a,r)},a=null==i||""===i?s:"string"==typeof i?o(i):"number"==typeof i?isNaN(i)?s:n(i):new Date(i.getTime());return a=a&&"Invalid Date"==""+a?s:a,a&&(a.setHours(0),a.setMinutes(0),a.setSeconds(0),a.setMilliseconds(0)),this._daylightSavingAdjust(a)},_daylightSavingAdjust:function (t){return t?(t.setHours(t.getHours()>12?t.getHours()+2:0),t):null},_setDate:function (t,e,i){var s=!e,n=t.selectedMonth,o=t.selectedYear,a=this._restrictMinMax(t,this._determineDate(t,e,new Date));t.selectedDay=t.currentDay=a.getDate(),t.drawMonth=t.selectedMonth=t.currentMonth=a.getMonth(),t.drawYear=t.selectedYear=t.currentYear=a.getFullYear(),n===t.selectedMonth&&o===t.selectedYear||i||this._notifyChange(t),this._adjustInstDate(t),t.input&&t.input.val(s?"":this._formatDate(t))
			},_getDate:function (t){var e=!t.currentYear||t.input&&""===t.input.val()?null:this._daylightSavingAdjust(new Date(t.currentYear,t.currentMonth,t.currentDay));return e},_attachHandlers:function (e){var i=this._get(e,"stepMonths"),s="#"+e.id.replace(/\\\\/g,"\\");e.dpDiv.find("[data-handler]").map(function (){var e={prev:function (){t.datepicker._adjustDate(s,-i,"M")},next:function (){t.datepicker._adjustDate(s,+i,"M")},hide:function (){t.datepicker._hideDatepicker()},today:function (){t.datepicker._gotoToday(s)},selectDay:function (){return t.datepicker._selectDay(s,+this.getAttribute("data-month"),+this.getAttribute("data-year"),this),!1},selectMonth:function (){return t.datepicker._selectMonthYear(s,this,"M"),!1},selectYear:function (){return t.datepicker._selectMonthYear(s,this,"Y"),!1}};t(this).on(this.getAttribute("data-event"),e[this.getAttribute("data-handler")])})},_generateHTML:function (t){var e,i,s,n,o,a,r,l,h,c,u,d,p,f,g,m,_,v,b,y,w,k,x,C,D,T,I,M,P,S,N,H,A,z,O,E,W,F,L,R=new Date,Y=this._daylightSavingAdjust(new Date(R.getFullYear(),R.getMonth(),R.getDate())),B=this._get(t,"isRTL"),j=this._get(t,"showButtonPanel"),q=this._get(t,"hideIfNoPrevNext"),K=this._get(t,"navigationAsDateFormat"),U=this._getNumberOfMonths(t),V=this._get(t,"showCurrentAtPos"),X=this._get(t,"stepMonths"),$=1!==U[0]||1!==U[1],G=this._daylightSavingAdjust(t.currentDay?new Date(t.currentYear,t.currentMonth,t.currentDay):new Date(9999,9,9)),J=this._getMinMaxDate(t,"min"),Q=this._getMinMaxDate(t,"max"),Z=t.drawMonth-V,te=t.drawYear;if(0>Z&&(Z+=12,te--),Q)for(e=this._daylightSavingAdjust(new Date(Q.getFullYear(),Q.getMonth()-U[0]*U[1]+1,Q.getDate())),e=J&&J>e?J:e;this._daylightSavingAdjust(new Date(te,Z,1))>e;)Z--,0>Z&&(Z=11,te--);for(t.drawMonth=Z,t.drawYear=te,i=this._get(t,"prevText"),i=K?this.formatDate(i,this._daylightSavingAdjust(new Date(te,Z-X,1)),this._getFormatConfig(t)):i,s=this._canAdjustMonth(t,-1,te,Z)?"<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click' title='"+i+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"e":"w")+"'>"+i+"</span></a>":q?"":"<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='"+i+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"e":"w")+"'>"+i+"</span></a>",n=this._get(t,"nextText"),n=K?this.formatDate(n,this._daylightSavingAdjust(new Date(te,Z+X,1)),this._getFormatConfig(t)):n,o=this._canAdjustMonth(t,1,te,Z)?"<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click' title='"+n+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"w":"e")+"'>"+n+"</span></a>":q?"":"<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='"+n+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"w":"e")+"'>"+n+"</span></a>",a=this._get(t,"currentText"),r=this._get(t,"gotoCurrent")&&t.currentDay?G:Y,a=K?this.formatDate(a,r,this._getFormatConfig(t)):a,l=t.inline?"":"<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>"+this._get(t,"closeText")+"</button>",h=j?"<div class='ui-datepicker-buttonpane ui-widget-content'>"+(B?l:"")+(this._isInRange(t,r)?"<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'>"+a+"</button>":"")+(B?"":l)+"</div>":"",c=parseInt(this._get(t,"firstDay"),10),c=isNaN(c)?0:c,u=this._get(t,"showWeek"),d=this._get(t,"dayNames"),p=this._get(t,"dayNamesMin"),f=this._get(t,"monthNames"),g=this._get(t,"monthNamesShort"),m=this._get(t,"beforeShowDay"),_=this._get(t,"showOtherMonths"),v=this._get(t,"selectOtherMonths"),b=this._getDefaultDate(t),y="",k=0;U[0]>k;k++){for(x="",this.maxRows=4,C=0;U[1]>C;C++){if(D=this._daylightSavingAdjust(new Date(te,Z,t.selectedDay)),T=" ui-corner-all",I="",$){if(I+="<div class='ui-datepicker-group",U[1]>1)switch(C){case 0:I+=" ui-datepicker-group-first",T=" ui-corner-"+(B?"right":"left");break;case U[1]-1:I+=" ui-datepicker-group-last",T=" ui-corner-"+(B?"left":"right");break;default:I+=" ui-datepicker-group-middle",T=""}I+="'>"}for(I+="<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix"+T+"'>"+(/all|left/.test(T)&&0===k?B?o:s:"")+(/all|right/.test(T)&&0===k?B?s:o:"")+this._generateMonthYearHeader(t,Z,te,J,Q,k>0||C>0,f,g)+"</div><table class='ui-datepicker-calendar'><thead>"+"<tr>",M=u?"<th class='ui-datepicker-week-col'>"+this._get(t,"weekHeader")+"</th>":"",w=0;7>w;w++)P=(w+c)%7,M+="<th scope='col'"+((w+c+6)%7>=5?" class='ui-datepicker-week-end'":"")+">"+"<span title='"+d[P]+"'>"+p[P]+"</span></th>";for(I+=M+"</tr></thead><tbody>",S=this._getDaysInMonth(te,Z),te===t.selectedYear&&Z===t.selectedMonth&&(t.selectedDay=Math.min(t.selectedDay,S)),N=(this._getFirstDayOfMonth(te,Z)-c+7)%7,H=Math.ceil((N+S)/7),A=$?this.maxRows>H?this.maxRows:H:H,this.maxRows=A,z=this._daylightSavingAdjust(new Date(te,Z,1-N)),O=0;A>O;O++){for(I+="<tr>",E=u?"<td class='ui-datepicker-week-col'>"+this._get(t,"calculateWeek")(z)+"</td>":"",w=0;7>w;w++)W=m?m.apply(t.input?t.input[0]:null,[z]):[!0,""],F=z.getMonth()!==Z,L=F&&!v||!W[0]||J&&J>z||Q&&z>Q,E+="<td class='"+((w+c+6)%7>=5?" ui-datepicker-week-end":"")+(F?" ui-datepicker-other-month":"")+(z.getTime()===D.getTime()&&Z===t.selectedMonth&&t._keyEvent||b.getTime()===z.getTime()&&b.getTime()===D.getTime()?" "+this._dayOverClass:"")+(L?" "+this._unselectableClass+" ui-state-disabled":"")+(F&&!_?"":" "+W[1]+(z.getTime()===G.getTime()?" "+this._currentClass:"")+(z.getTime()===Y.getTime()?" ui-datepicker-today":""))+"'"+(F&&!_||!W[2]?"":" title='"+W[2].replace(/'/g,"&#39;")+"'")+(L?"":" data-handler='selectDay' data-event='click' data-month='"+z.getMonth()+"' data-year='"+z.getFullYear()+"'")+">"+(F&&!_?"&#xa0;":L?"<span class='ui-state-default'>"+z.getDate()+"</span>":"<a class='ui-state-default"+(z.getTime()===Y.getTime()?" ui-state-highlight":"")+(z.getTime()===G.getTime()?" ui-state-active":"")+(F?" ui-priority-secondary":"")+"' href='#'>"+z.getDate()+"</a>")+"</td>",z.setDate(z.getDate()+1),z=this._daylightSavingAdjust(z);I+=E+"</tr>"}Z++,Z>11&&(Z=0,te++),I+="</tbody></table>"+($?"</div>"+(U[0]>0&&C===U[1]-1?"<div class='ui-datepicker-row-break'></div>":""):""),x+=I}y+=x}return y+=h,t._keyEvent=!1,y},_generateMonthYearHeader:function (t,e,i,s,n,o,a,r){var l,h,c,u,d,p,f,g,m=this._get(t,"changeMonth"),_=this._get(t,"changeYear"),v=this._get(t,"showMonthAfterYear"),b="<div class='ui-datepicker-title'>",y="";if(o||!m)y+="<span class='ui-datepicker-month'>"+a[e]+"</span>";else{for(l=s&&s.getFullYear()===i,h=n&&n.getFullYear()===i,y+="<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>",c=0;12>c;c++)(!l||c>=s.getMonth())&&(!h||n.getMonth()>=c)&&(y+="<option value='"+c+"'"+(c===e?" selected='selected'":"")+">"+r[c]+"</option>");y+="</select>"}if(v||(b+=y+(!o&&m&&_?"":"&#xa0;")),!t.yearshtml)if(t.yearshtml="",o||!_)b+="<span class='ui-datepicker-year'>"+i+"</span>";else{for(u=this._get(t,"yearRange").split(":"),d=(new Date).getFullYear(),p=function (t){var e=t.match(/c[+\-].*/)?i+parseInt(t.substring(1),10):t.match(/[+\-].*/)?d+parseInt(t,10):parseInt(t,10);return isNaN(e)?d:e},f=p(u[0]),g=Math.max(f,p(u[1]||"")),f=s?Math.max(f,s.getFullYear()):f,g=n?Math.min(g,n.getFullYear()):g,t.yearshtml+="<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";g>=f;f++)t.yearshtml+="<option value='"+f+"'"+(f===i?" selected='selected'":"")+">"+f+"</option>";t.yearshtml+="</select>",b+=t.yearshtml,t.yearshtml=null}return b+=this._get(t,"yearSuffix"),v&&(b+=(!o&&m&&_?"":"&#xa0;")+y),b+="</div>"},_adjustInstDate:function (t,e,i){var s=t.selectedYear+("Y"===i?e:0),n=t.selectedMonth+("M"===i?e:0),o=Math.min(t.selectedDay,this._getDaysInMonth(s,n))+("D"===i?e:0),a=this._restrictMinMax(t,this._daylightSavingAdjust(new Date(s,n,o)));t.selectedDay=a.getDate(),t.drawMonth=t.selectedMonth=a.getMonth(),t.drawYear=t.selectedYear=a.getFullYear(),("M"===i||"Y"===i)&&this._notifyChange(t)},_restrictMinMax:function (t,e){var i=this._getMinMaxDate(t,"min"),s=this._getMinMaxDate(t,"max"),n=i&&i>e?i:e;return s&&n>s?s:n},_notifyChange:function (t){var e=this._get(t,"onChangeMonthYear");e&&e.apply(t.input?t.input[0]:null,[t.selectedYear,t.selectedMonth+1,t])},_getNumberOfMonths:function (t){var e=this._get(t,"numberOfMonths");return null==e?[1,1]:"number"==typeof e?[1,e]:e},_getMinMaxDate:function (t,e){return this._determineDate(t,this._get(t,e+"Date"),null)},_getDaysInMonth:function (t,e){return 32-this._daylightSavingAdjust(new Date(t,e,32)).getDate()},_getFirstDayOfMonth:function (t,e){return new Date(t,e,1).getDay()},_canAdjustMonth:function (t,e,i,s){var n=this._getNumberOfMonths(t),o=this._daylightSavingAdjust(new Date(i,s+(0>e?e:n[0]*n[1]),1));return 0>e&&o.setDate(this._getDaysInMonth(o.getFullYear(),o.getMonth())),this._isInRange(t,o)},_isInRange:function (t,e){var i,s,n=this._getMinMaxDate(t,"min"),o=this._getMinMaxDate(t,"max"),a=null,r=null,l=this._get(t,"yearRange");return l&&(i=l.split(":"),s=(new Date).getFullYear(),a=parseInt(i[0],10),r=parseInt(i[1],10),i[0].match(/[+\-].*/)&&(a+=s),i[1].match(/[+\-].*/)&&(r+=s)),(!n||e.getTime()>=n.getTime())&&(!o||e.getTime()<=o.getTime())&&(!a||e.getFullYear()>=a)&&(!r||r>=e.getFullYear())},_getFormatConfig:function (t){var e=this._get(t,"shortYearCutoff");return e="string"!=typeof e?e:(new Date).getFullYear()%100+parseInt(e,10),{shortYearCutoff:e,dayNamesShort:this._get(t,"dayNamesShort"),dayNames:this._get(t,"dayNames"),monthNamesShort:this._get(t,"monthNamesShort"),monthNames:this._get(t,"monthNames")}},_formatDate:function (t,e,i,s){e||(t.currentDay=t.selectedDay,t.currentMonth=t.selectedMonth,t.currentYear=t.selectedYear);var n=e?"object"==typeof e?e:this._daylightSavingAdjust(new Date(s,i,e)):this._daylightSavingAdjust(new Date(t.currentYear,t.currentMonth,t.currentDay));return this.formatDate(this._get(t,"dateFormat"),n,this._getFormatConfig(t))}}),t.fn.datepicker=function (e){if(!this.length)return this;t.datepicker.initialized||(t(document).on("mousedown",t.datepicker._checkExternalClick),t.datepicker.initialized=!0),0===t("#"+t.datepicker._mainDivId).length&&t("body").append(t.datepicker.dpDiv);var i=Array.prototype.slice.call(arguments,1);return"string"!=typeof e||"isDisabled"!==e&&"getDate"!==e&&"widget"!==e?"option"===e&&2===arguments.length&&"string"==typeof arguments[1]?t.datepicker["_"+e+"Datepicker"].apply(t.datepicker,[this[0]].concat(i)):this.each(function (){"string"==typeof e?t.datepicker["_"+e+"Datepicker"].apply(t.datepicker,[this].concat(i)):t.datepicker._attachDatepicker(this,e)}):t.datepicker["_"+e+"Datepicker"].apply(t.datepicker,[this[0]].concat(i))},t.datepicker=new s,t.datepicker.initialized=!1,t.datepicker.uuid=(new Date).getTime(),t.datepicker.version="1.12.1",t.datepicker,t.widget("ui.selectmenu",[t.ui.formResetMixin,{version:"1.12.1",defaultElement:"<select>",options:{appendTo:null,classes:{"ui-selectmenu-button-open":"ui-corner-top","ui-selectmenu-button-closed":"ui-corner-all"},disabled:null,icons:{button:"ui-icon-triangle-1-s"},position:{my:"left top",at:"left bottom",collision:"none"},width:!1,change:null,close:null,focus:null,open:null,select:null},_create:function (){var e=this.element.uniqueId().attr("id");this.ids={element:e,button:e+"-button",menu:e+"-menu"},this._drawButton(),this._drawMenu(),this._bindFormResetHandler(),this._rendered=!1,this.menuItems=t()},_drawButton:function (){var e,i=this,s=this._parseOption(this.element.find("option:selected"),this.element[0].selectedIndex);this.labels=this.element.labels().attr("for",this.ids.button),this._on(this.labels,{click:function (t){this.button.focus(),t.preventDefault()}}),this.element.hide(),this.button=t("<span>",{tabindex:this.options.disabled?-1:0,id:this.ids.button,role:"combobox","aria-expanded":"false","aria-autocomplete":"list","aria-owns":this.ids.menu,"aria-haspopup":"true",title:this.element.attr("title")}).insertAfter(this.element),this._addClass(this.button,"ui-selectmenu-button ui-selectmenu-button-closed","ui-button ui-widget"),e=t("<span>").appendTo(this.button),this._addClass(e,"ui-selectmenu-icon","ui-icon "+this.options.icons.button),this.buttonItem=this._renderButtonItem(s).appendTo(this.button),this.options.width!==!1&&this._resizeButton(),this._on(this.button,this._buttonEvents),this.button.one("focusin",function (){i._rendered||i._refreshMenu()})},_drawMenu:function (){var e=this;this.menu=t("<ul>",{"aria-hidden":"true","aria-labelledby":this.ids.button,id:this.ids.menu}),this.menuWrap=t("<div>").append(this.menu),this._addClass(this.menuWrap,"ui-selectmenu-menu","ui-front"),this.menuWrap.appendTo(this._appendTo()),this.menuInstance=this.menu.menu({classes:{"ui-menu":"ui-corner-bottom"},role:"listbox",select:function (t,i){t.preventDefault(),e._setSelection(),e._select(i.item.data("ui-selectmenu-item"),t)},focus:function (t,i){var s=i.item.data("ui-selectmenu-item");null!=e.focusIndex&&s.index!==e.focusIndex&&(e._trigger("focus",t,{item:s}),e.isOpen||e._select(s,t)),e.focusIndex=s.index,e.button.attr("aria-activedescendant",e.menuItems.eq(s.index).attr("id"))}}).menu("instance"),this.menuInstance._off(this.menu,"mouseleave"),this.menuInstance._closeOnDocumentClick=function (){return!1},this.menuInstance._isDivider=function (){return!1}},refresh:function (){this._refreshMenu(),this.buttonItem.replaceWith(this.buttonItem=this._renderButtonItem(this._getSelectedItem().data("ui-selectmenu-item")||{})),null===this.options.width&&this._resizeButton()},_refreshMenu:function (){var t,e=this.element.find("option");this.menu.empty(),this._parseOptions(e),this._renderMenu(this.menu,this.items),this.menuInstance.refresh(),this.menuItems=this.menu.find("li").not(".ui-selectmenu-optgroup").find(".ui-menu-item-wrapper"),this._rendered=!0,e.length&&(t=this._getSelectedItem(),this.menuInstance.focus(null,t),this._setAria(t.data("ui-selectmenu-item")),this._setOption("disabled",this.element.prop("disabled")))},open:function (t){this.options.disabled||(this._rendered?(this._removeClass(this.menu.find(".ui-state-active"),null,"ui-state-active"),this.menuInstance.focus(null,this._getSelectedItem())):this._refreshMenu(),this.menuItems.length&&(this.isOpen=!0,this._toggleAttr(),this._resizeMenu(),this._position(),this._on(this.document,this._documentClick),this._trigger("open",t)))},_position:function (){this.menuWrap.position(t.extend({of:this.button},this.options.position))},close:function (t){this.isOpen&&(this.isOpen=!1,this._toggleAttr(),this.range=null,this._off(this.document),this._trigger("close",t))},widget:function (){return this.button},menuWidget:function (){return this.menu},_renderButtonItem:function (e){var i=t("<span>");return this._setText(i,e.label),this._addClass(i,"ui-selectmenu-text"),i},_renderMenu:function (e,i){var s=this,n="";t.each(i,function (i,o){var a;o.optgroup!==n&&(a=t("<li>",{text:o.optgroup}),s._addClass(a,"ui-selectmenu-optgroup","ui-menu-divider"+(o.element.parent("optgroup").prop("disabled")?" ui-state-disabled":"")),a.appendTo(e),n=o.optgroup),s._renderItemData(e,o)})},_renderItemData:function (t,e){return this._renderItem(t,e).data("ui-selectmenu-item",e)},_renderItem:function (e,i){var s=t("<li>"),n=t("<div>",{title:i.element.attr("title")});return i.disabled&&this._addClass(s,null,"ui-state-disabled"),this._setText(n,i.label),s.append(n).appendTo(e)},_setText:function (t,e){e?t.text(e):t.html("&#160;")},_move:function (t,e){var i,s,n=".ui-menu-item";this.isOpen?i=this.menuItems.eq(this.focusIndex).parent("li"):(i=this.menuItems.eq(this.element[0].selectedIndex).parent("li"),n+=":not(.ui-state-disabled)"),s="first"===t||"last"===t?i["first"===t?"prevAll":"nextAll"](n).eq(-1):i[t+"All"](n).eq(0),s.length&&this.menuInstance.focus(e,s)},_getSelectedItem:function (){return this.menuItems.eq(this.element[0].selectedIndex).parent("li")},_toggle:function (t){this[this.isOpen?"close":"open"](t)},_setSelection:function (){var t;this.range&&(window.getSelection?(t=window.getSelection(),t.removeAllRanges(),t.addRange(this.range)):this.range.select(),this.button.focus())},_documentClick:{mousedown:function (e){this.isOpen&&(t(e.target).closest(".ui-selectmenu-menu, #"+t.ui.escapeSelector(this.ids.button)).length||this.close(e))}},_buttonEvents:{mousedown:function (){var t;window.getSelection?(t=window.getSelection(),t.rangeCount&&(this.range=t.getRangeAt(0))):this.range=document.selection.createRange()},click:function (t){this._setSelection(),this._toggle(t)},keydown:function (e){var i=!0;switch(e.keyCode){case t.ui.keyCode.TAB:case t.ui.keyCode.ESCAPE:this.close(e),i=!1;break;case t.ui.keyCode.ENTER:this.isOpen&&this._selectFocusedItem(e);break;case t.ui.keyCode.UP:e.altKey?this._toggle(e):this._move("prev",e);break;case t.ui.keyCode.DOWN:e.altKey?this._toggle(e):this._move("next",e);break;case t.ui.keyCode.SPACE:this.isOpen?this._selectFocusedItem(e):this._toggle(e);break;case t.ui.keyCode.LEFT:this._move("prev",e);break;case t.ui.keyCode.RIGHT:this._move("next",e);break;case t.ui.keyCode.HOME:case t.ui.keyCode.PAGE_UP:this._move("first",e);break;case t.ui.keyCode.END:case t.ui.keyCode.PAGE_DOWN:this._move("last",e);break;default:this.menu.trigger(e),i=!1}i&&e.preventDefault()}},_selectFocusedItem:function (t){var e=this.menuItems.eq(this.focusIndex).parent("li");e.hasClass("ui-state-disabled")||this._select(e.data("ui-selectmenu-item"),t)},_select:function (t,e){var i=this.element[0].selectedIndex;this.element[0].selectedIndex=t.index,this.buttonItem.replaceWith(this.buttonItem=this._renderButtonItem(t)),this._setAria(t),this._trigger("select",e,{item:t}),t.index!==i&&this._trigger("change",e,{item:t}),this.close(e)},_setAria:function (t){var e=this.menuItems.eq(t.index).attr("id");this.button.attr({"aria-labelledby":e,"aria-activedescendant":e}),this.menu.attr("aria-activedescendant",e)},_setOption:function (t,e){if("icons"===t){var i=this.button.find("span.ui-icon");this._removeClass(i,null,this.options.icons.button)._addClass(i,null,e.button)}this._super(t,e),"appendTo"===t&&this.menuWrap.appendTo(this._appendTo()),"width"===t&&this._resizeButton()},_setOptionDisabled:function (t){this._super(t),this.menuInstance.option("disabled",t),this.button.attr("aria-disabled",t),this._toggleClass(this.button,null,"ui-state-disabled",t),this.element.prop("disabled",t),t?(this.button.attr("tabindex",-1),this.close()):this.button.attr("tabindex",0)},_appendTo:function (){var e=this.options.appendTo;return e&&(e=e.jquery||e.nodeType?t(e):this.document.find(e).eq(0)),e&&e[0]||(e=this.element.closest(".ui-front, dialog")),e.length||(e=this.document[0].body),e},_toggleAttr:function (){this.button.attr("aria-expanded",this.isOpen),this._removeClass(this.button,"ui-selectmenu-button-"+(this.isOpen?"closed":"open"))._addClass(this.button,"ui-selectmenu-button-"+(this.isOpen?"open":"closed"))._toggleClass(this.menuWrap,"ui-selectmenu-open",null,this.isOpen),this.menu.attr("aria-hidden",!this.isOpen)},_resizeButton:function (){var t=this.options.width;return t===!1?(this.button.css("width",""),void 0):(null===t&&(t=this.element.show().outerWidth(),this.element.hide()),this.button.outerWidth(t),void 0)},_resizeMenu:function (){this.menu.outerWidth(Math.max(this.button.outerWidth(),this.menu.width("").outerWidth()+1))},_getCreateOptions:function (){var t=this._super();return t.disabled=this.element.prop("disabled"),t},_parseOptions:function (e){var i=this,s=[];e.each(function (e,n){s.push(i._parseOption(t(n),e))}),this.items=s},_parseOption:function (t,e){var i=t.parent("optgroup");return{element:t,index:e,value:t.val(),label:t.text(),optgroup:i.attr("label")||"",disabled:i.prop("disabled")||t.prop("disabled")}},_destroy:function (){this._unbindFormResetHandler(),this.menuWrap.remove(),this.button.remove(),this.element.show(),this.element.removeUniqueId(),this.labels.attr("for",this.ids.element)}}])});
		/* eslint-enable */

		/**
		 * jQuery UI 拡張
		 */
		(function ($) {
			// 表示は yyyy/mm/dd で内部形式は yyyymmdd
			$.datepicker.onSelectSuper = function (_text, _instance) {
				$(this).attr('data-value', _text.split('/').join('')).trigger('change');
				var hok = this.form && this.form.hooks && this.form.hooks.onChange;
				hok && hok($(this.form));
			};
			/**
			 * datepicker日本語化
			 */
			$.datepicker.regional.ja = {
				closeText: '閉じる',
				prevText: '&lt;前',
				nextText: '次&gt;',
				currentText: '今日',
				monthNames: [
					'1月', '2月', '3月', '4月', '5月', '6月',
					'7月', '8月', '9月', '10月', '11月', '12月'
				],
				monthNamesShort: [
					'1月', '2月', '3月', '4月', '5月', '6月',
					'7月', '8月', '9月', '10月', '11月', '12月'
				],
				dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
				dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
				dayNamesMin: ['日', '月', '火', '水', '木', '金', '土'],
				weekHeader: '週',
				dateFormat: 'yy/mm/dd',
				firstDay: 0,
				isRTL: false,
				showMonthAfterYear: true,
				yearSuffix: '年',
				onSelect: function (_text, _instance) {
					$.datepicker.onSelectSuper.call(this, _text, _instance);
				}
			};

			$.datepicker.setDefaults($.datepicker.regional.ja);

			/**
			 * autocompleteにてhtmlタグを使用できるようにする
			 */
			var proto = $.ui.autocomplete.prototype,
				initSource = proto._initSource;

			function filter(array, term) {
				var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), 'i');
				return $.grep(array, function (value) {
					return matcher.test($('<div>').html(value.label || value.value || value).text());
				});
			}
			$.extend(proto, {
				_initSource: function () {
					if (this.options.html && $.isArray(this.options.source)) {
						this.source = function (request, response) {
							response(filter(this.options.source, request.term));
						};
					} else {
						initSource.call(this);
					}
				},

				_renderItem: function (ul, item) {
					return $('<li></li>')
						.attr('data-item.autocomplete', item)
						.append($('<a></a>')[this.options.html ? 'html' : 'text'](item.label))
						.appendTo(ul);
				}
			});

			/**
			 * selectmenu placeholder
			 */
			$.widget('app.selectmenu', $.ui.selectmenu, {
				_drawButton: function () {
					this._super();

					var selected = this.element.find('[selected]').length;
					var placeholder = $(this).attr('data-placeholder');
					if (!selected && placeholder) {
						this.buttonText.text(placeholder);
					}
				}
			});
		})(jQuery);

		return jQuery;

	}(window, window.$1124))
));