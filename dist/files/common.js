/*
* JTB 共通スクリプトファイル
* ログイン判定
*  会員のログイン状態(Cookie(NORMAL)有無)によって
*  BODY タグの class 属性に jtb__member--status_login を付加させ
*  CSS などで表示制御ができるようにする
* 居住地判定
*  2012_areaselector.js 2012_cookie.jsのページ制御をここに移動
*/
(function () {
	(function onInitialize(_callback) {
		var doc = document;
		var init = false;
		var main = function () {
			if (!init) {
				init = true;
				_callback();
				// イベントの解除は後処理にする
				if (doc.removeEventListener) {
					doc.removeEventListener('DOMContentLoaded', main, false);
					doc.removeEventListener('load', main, false);
				} else if (doc.detachEvent) {
					doc.detachEvent('onload', main);
				}
			}
		};
		if (doc.addEventListener) {
			doc.addEventListener('DOMContentLoaded', main, false);
			doc.addEventListener('load', main, false);
		} else if (doc.attachEvent) {
			doc.attachEvent('onload', main);
			(function () {
				if (!init) {
					try {
						doc.scrollLeft();
						init = true;
					} catch(_error) {}
					if (init) {
						main();
					} else {
						window.setTimeout(arguments.callee, 100);
					}
				}
			})();
		}
	})(function initialize() {
		(function applyLoginStatus(_cookie) {
			/*
			* ログイン判定
			* 会員のノーマル cookie を判定し、body のクラスに反映させる
			*/
			var class_login = 'jtb__member--status_login';
			var reg_cookie_normal = /\bNORMAL=/;
			var body = document.body;
			var arr = body.className.split(' ');
			var pos = arr.indexOf(class_login);
			if (reg_cookie_normal.exec(_cookie)) {
				(pos === -1) && arr.push(class_login);
			} else {
				(pos > -1) && arr.splice(pos, 0);
			}
			body.className = arr.join(' ');
		})(document.cookie);
		(function applyDeviceType(_ua) {
			/*
			* デバイスタイプ判別
			*/
			var cls;
			if (/\b(Android\b.+(?!\bSC-01C\b).+\bMobile|iPhone|Windows Phone|BlackBerry)\b/.test(_ua)) {
				cls = 'jtb__device--sp';
			} else if(/\b(Android|iPad)\b/.test(_ua)) {
				cls = 'jtb__device--tablet';
			}
			if (cls) {
				var body = document.body;
				var arr = body.className.split(' ');
				pos = arr.indexOf(cls);
				if (pos === -1) {
					arr.push(cls);
				} else {
					arr.splice(pos, 0);
				}
				body.className = arr.join(' ');
			}
		})(navigator.userAgent);
		(function applyLivingArea() {
			/*
			* 居住地判定
			*/
			if (!window.$$Dept) {
				window.$$Dept = function (_settings) {
					/*----------+/
					/: 変数定義
					/+----------*/
					// cookie A種設定情報、インスタンス
					var cookieASet = {
						name: 'LivePrefCode',
						path: '/',
						domain: '.jtb.co.jp',
						expires: { years: 5 },
						defaultValue: '13'
					};
					var cokA;
					// デバッグログモード
					var log = false;
					// コンソールサポート
					if (!window.console) {
						window.console = {
							log: function (_text) {
								//alert(_text);
							}
						};
					}

					var $Cookie = function (_settings) {
						/// <summary>cookie インスタンス定義。cookie 操作に関するインターフェースを提供する。DOM 構築後にインスタンス生成すること。</summary>
						/// <param name="_settings" type="Object" optional="false">cookie 設定オブジェクト</param>
						/// <returns type="Object">Cookie インスタンス</returns>

						var stt = _settings;
						var name = stt.name;
						var instance;
						if (!name) {
							console.log('Cookie name must be specified.');
						} else {
							instance = {
								type: 'cookie',
								name: name,
								expires: stt.expires,
								domain: stt.domain,
								path: stt.path,
								secure: stt.secure,
								options: []
							};
							instance.defaultValue = stt.defaultValue;
							instance.getDefaultValue = function () {
								/// <summary>既定値取得。defaultValue の型により、固定値か関数の結果を返す。</summary>
								/// <returns type="String">取得した値。</returns>
								var def = this.defaultValue;
								var ret;
								if (def) {
									if (def.replace) {
										// 文字列オブジェクトの場合はそのまま設定。
										ret = def;
									} else if (def instanceof Function) {
										// 関数の場合は毎回呼出す。
										ret = def.apply(instance);
									}
								}
								return ret;
							};
							instance.getValue = function (_default) {
								/// <summary>設定値取得。</summary>
								/// <param name="_default" type="Boolean">値が取得できなかった場合に、既定値を返すかどうか(省略時は true)。</param>
								/// <returns type="String">取得した値。</returns>
								var def = _default || (_default === undefined);
								var reg = new RegExp('(^|\\s)' + encodeURIComponent(this.name) + '=([^;]*)(;|$)');
								var mch = reg.exec(document.cookie);
								return (mch && mch[2] ? decodeURIComponent(mch[2]) : undefined) || (def ? this.getDefaultValue() : undefined);
							};
							instance.setValue = function (_value, _trigger) {
								/// <summary>cookie 値設定。</summary>
								/// <para name="_value" type="String">設定値。</param>
								/// <param name="_trigger" type="Boolean">onChange イベントを起動する(省略時は true)。</param>
								// 配列の場合は先頭の項目を採用する
								var val = _value instanceof Array ? _value[0] : _value;
								var trg = _trigger || (_trigger === undefined);
								var data = [];
								log && console.log('Cookie[' + instance.name + '] setValue value=' + _value + ' trigger=' + _trigger);
								data.push(encodeURIComponent(this.name) + '=' + encodeURIComponent(val));
								if (val) {
									if (this.expires) {
										var exp = this.getExpires(this.expires);
										exp && data.push('expires=' + exp.toGMTString());
									}
								} else {
									// 無効な値の場合は削除
									var exp = this.getExpires({ days: -1 });
									data.push('expires=' + exp.toGMTString());
								}
								var dom = this.domain;
								if (dom) {
									if (dom.replace) {
										data.push('domain=' + dom);
									} else if (dom instanceof Function) {
										data.push('domain=' + dom());
									}
								}
								var path = this.path;
								if (path) {
									if (path.replace) {
										data.push('path=' + path);
									} else if (path instanceof Function) {
										data.push('path=' + path());
									}
								}
								var sec = this.secure;
								if (sec) {
									data.push('secure');
								}
								// 連動しない場合は比較値を更新
								disable = true;
								trg && onChange(val, org);
								org = val;
								document.cookie = data.join(';');
								disable = false;
							};
							instance.getExpires = function (_expireset) {
								/// <summary>有効期限日時を取得</summary>
								/// <param name="_expireset" type="Object">日付情報(date:絶対日時, years:現在からの年数, months:現在からの月数, days:現在からの日数, hours:現在からの時間数, minutes:現在からの分数, seconds:現在からの秒数)</param>
								/// <returns type="Date">算出した日時</returns>
								var exp = _expireset;
								var dt;
								if (exp) {
									if (exp.date) {
										dt = new Date(exp.date);
									} else {
										dt = new Date();
										var v = exp.years;
										(v && !isNaN(v)) && dt.setFullYear(dt.getFullYear() + (v - 0));
										v = exp.months;
										(v && !isNaN(v)) && dt.setMonth(dt.getMonth() + (v - 0));
										v = exp.days;
										(v && !isNaN(v)) && dt.setDate(dt.getDate() + (v - 0));
										v = exp.hours;
										(v && !isNaN(v)) && dt.setHours(dt.getHour() + (v - 0));
										v = exp.minutes;
										(v && !isNaN(v)) && dt.setMinutes(dt.getMinute() + (v - 0));
										v = exp.seconds;
										(v && !isNaN(v)) && dt.setSeconds(dt.getSecond() + (v - 0));
									}
								}
								return dt;
							};
							// 変更イベント定義
							var changes = []
							instance.onchanges = changes;
							(stt.onChange instanceof Function) && changes.push(stt.onChange);
							var onChange = function (_new, _old) {
								var val = _new;
								var org = _old;
								log && console.log('Cookie[' + this.name + '] has changed ' + org + ' -> ' + val);
								for (var ind = 0, max = changes.length; ind < max; ind++) {
									var func = changes[ind];
									(func instanceof Function)  && func.apply(instance, [val, org]);
								}
							};

							// リカバリ処理:path 未設定で定義されている cookie 除去
							var data = [instance.name + '='];
							var dom = instance.domain;
							if (dom instanceof Function) {
								dom = dom();
							}
							if (dom) {
								data.push('domain=' + dom);
							}
							data.push('expires=Thu, 01 Jan 1970 00:00:00 GMT');
							document.cookie = data.join(';');

							// 初期化
							var org = instance.getValue(false);
							// 初期化は何もしない
							instance.init = function () { };
							// 変更イベント監視(setTimeout)
							var disable = false;
							if (stt.syncTo) {
								(function () {
									if (!disable) {
										var v = instance.getValue(false);
										(v != org) && onChange.apply(instance, [v, org]);
									}
									org = v;
									window.setTimeout(arguments.callee, 100);
								})();
							}
						}
						return instance;
					};
					var $Element = function (_settings) {
						/// <summary>要素インスタンス。値取得、設定、イベント起動などの機能をサポートする。DOM 構築後にインスタンスを生成すること。</summary>
						/// <param name="_settings" type="Object" optional="false">要素設定オブジェクト</param>
						/// <returns type="Object">要素インスタンス</returns>
						var instance;
						var stt = _settings;
						var elm = stt.id ? document.getElementById(stt.id) : undefined;
						if (elm) {
							instance = {
								type: 'element',
								id: stt.id,
								defaultValue: stt.defaultValue,
								options: elm.options || []
							};
							instance.getDefaultValue = function () {
								/// <summary>既定値取得。defaultValue の型により、固定値か関数の結果を返す。</summary>
								/// <returns type="String">取得した値。</returns>
								var def = this.defaultValue;
								var ret;
								if (def) {
									if (def.replace) {
										// 文字列オブジェクトの場合はそのまま設定。
										ret = def;
									} else if (def instanceof Function) {
										// 関数の場合は毎回呼出す。
										ret = def.apply(instance);
									}
								}
								return ret;
							};
							instance.getValue = function (_default) {
								/// <summary>値取得</summary>
								/// <param name="_default" type="Boolean">値が取得できなかった場合に、既定値を返すかどうか(省略時は true)。</param>
								/// <returns type="String">取得した値</returns>
								var ret;
								var def = _default || (_default === undefined);
								if (elm.type && elm.type.toLowerCase() === 'radio') {
									var rdos = elm.form[elm.name];
									for (var ind = 0, max = rdos.length; ind < max; ind++) {
										var rdo = rdos[ind];
										if (rdo.checked) {
											ret = rdo.value;
											break;
										}
									}
								} else {
									ret = elm.value;
								}
								return ret || (def ? this.getDefaultValue() : undefined);
							};
							instance.setValue = function (_value, _trigger) {
								/// <summary>値設定</summary>
								/// <param name="_value" type="String">設定値</param>
								/// <param name="_trigger" type="Boolean">onChange イベントを起動する(省略時は true)</param>
								var val = _value;
								var trg = _trigger || (_trigger === undefined);
								var reg = new RegExp('(^|\\s+)' + val + '(\\s+|$)');
								log && console.log('Element[' + this.id + '] setValue value=' + _value + ' trigger=' + _trigger);
								if (val != org) {
									if (elm.type && elm.type.toLowerCase() === 'radio') {
										// ラジオボタンの処理
										var rdos = elm.form[elm.name];
										for (var ind = 0, max = rdos.length; ind < max; ind++) {
											rdo = rdo[ind];
											if (rdo.value == val) {
												if (!rdo.checked) {
													disable = true;
													rdo.checked = true;
													this.fireEvent();
													disable = false;
												}
												break;
											}
										}
									} else if (elm.selectedIndex !== undefined && elm.options !== undefined) {
										// 配列の場合は、先頭から該当する項目を検索
										if (val instanceof Array) {
											disable = true;
											for (var ind = 0, max = val.length; ind < max; ind++) {
												var itm = val[ind];
												elm.value = itm;
												if (elm.value == itm) {
													this.fireEvent();
													break;
												}
											}
											disable = false;
										} else {
											if (elm.value != val) {
												// 通常の項目の場合は、そのまま代入
												disable = true;
												elm.value = val;
												if (elm.value == val) {
													this.fireEvent();
												}
												disable = false;
											}
										}
									} else {
										// options 属性は、許可する値の一覧を空白区切りで指定できる
										var opts = elm.options || elm.getAttribute('options');
										// 許可する値一覧が指定されていない場合は、先頭の項目を設定値として採用する。
										if (!opts && val instanceof Array) {
											val = val[0];
										}
										// 配列の場合は、先頭から該当する項目を検索
										if (val instanceof Array) {
											var reg = new RegExp('(' + opts.replace(/[\b\s]+/g, '|') + ')');
											for (var ind = 0, max = val.length; ind < max; ind++) {
												var v = reg.exec(val[ind]);
												if (v && v[0]) {
													if (elm.value != v[0]) {
														disable = true;
														elm.value = v[0];
														this.fireEvent();
														disable = false;
													}
													break;
												}
											}
										} else {
											if (elm.value != val) {
												// 通常の項目の場合は、そのまま代入
												disable = true;
												elm.value = val;
												this.fireEvent();
												org = val;
												disable = false;
											}
										}
									}
									org = val;
								}
							};
							// イベント起動
							instance.fireEvent = function () {
								/// <summary>イベント起動。ラジオボタンは onclick、それ以外は onChange を起動する。</summary>
								if (elm.type && elm.type.toLowerCase() === 'radio') {
									var opts = elm.form[elm.name];
									for (var ind = 0, max = opts.length; ind < max; ind++) {
										var opt = opts[ind];
										if (opt.checked) {
											// イベント起動
											if (opt.fireEvent) {
												opt.fireEvent('onclick');
											} else {
												var evt = document.createEvent('MouseEvent');
												evt.initEvent('click', false, true);
												opt.dispatchEvent(evt);
											}
											break;
										}
									}
								} else {
									if (elm.fireEvent) {
										elm.fireEvent('onchange');
									} else {
										var evt = document.createEvent('HTMLEvents');
										evt.initEvent('change', false, true);
										elm.dispatchEvent(evt);
									}
								}
							}
							// 変更イベント定義
							var changes = []
							instance.onchanges = changes;
							if (stt.onChange instanceof Function) {
								changes.push(stt.onChange);
							}
							var org = instance.getValue(false);
							instance.init = function () {
								// 設定値が無くて初期値が有効な場合は初期化する
								var def = this.getDefaultValue();
								(!org && def) && this.setValue(def, false);
							};
							// 変更イベント監視
							var disable = false;
							var onChange = function (_event) {
								if (!disable) {
									var elm = _event.target || _event.srcElement;
									var v = instance.getValue(false);
									if (v != org) {
										log && console.log('Element[' + elm.id + '] has changed ' + org + ' -> ' + v);
										for (var ind = 0, max = changes.length; ind < max; ind++) {
											var func = changes[ind];
											(func instanceof Function) && func.apply(instance, [v, org]);
										}
									}
								}
								org = v;
							};
							if (elm.type && elm.type.toLowerCase() === 'radio') {
								// ラジオボタンの処理
								var rdos = elm.form[elm.name];
								for (var ind = 0, max = rdos.length; ind < max; ind++) {
									var rdo = rdos[ind];
									// click イベントを適用
									if (rdo.attachEvent) {
										rdo.attachEvent('onclick', onChange);
									} else if (rdo.addEventListener) {
										rdo.addEventListener('click', onChange, false);
									}
								}
							} else {
								// イベント適用
								if (elm.attachEvent) {
									elm.attachEvent('onchange', onChange);
								} else if (elm.addEventListener) {
									elm.addEventListener('change', onChange, false);
								}
							}
						}
						return instance;
					};
					var $CSS = function (_settings) {
						/// <summary>CSS インスタンス定義。DOM 構築後にインスタンス生成すること。</summary>
						/// <param name="_settings" type="Object">CSS 設定オブジェクト</settings>
						/// <returns type="Object">CSS インスタンス</returns>
						var instance;
						var stt = _settings;
						// ルート要素の取得(class の反映先)
						var rootid = stt.root;
						var root = rootid ? document.getElementById(rootid) : document.body;
						if (root) {
							instance = {
								type: 'css',
								options: []
							};
							var opts = root.options || root.getAttribute('options');
							opts && (instance.options = opts.split('\\s'));
							// class 接頭辞と正規表現
							instance.prefix = stt.prefix;
							var reg = new RegExp('(^|\\s)+' + instance.prefix + '_(\\S+)');
							// 設定値関数
							instance.defaultValue = stt.defaultValue;
							instance.getDefaultValue = function () {
								/// <summary>既定値取得。defaultValue の型により、固定値か関数の結果を返す。</summary>
								/// <returns type="String">取得した値。</returns>
								var def = this.defaultValue;
								var ret;
								if (def) {
									if (def.replace) {
										// 文字列オブジェクトの場合はそのまま設定。
										ret = def;
									} else if (def instanceof Function) {
										// 関数の場合は毎回呼出す。
										ret = def.apply(instance);
									}
								}
								return ret;
							};
							instance.getValue = function (_default) {
								/// <summary>値取得</summary>
								/// <param name="_default" type="Boolean">値が取得できなかった場合に、既定値を返すかどうか(省略時は true)。</param>
								/// <returns type="String">取得した値</returns>
								var def = _default || (_default === undefined);
								var mch = root.className.match(reg);
								return (mch && mch[2] ? mch[2] : undefined) || (def ? this.getDefaultValue() : undefined);
							};
							instance.setValue = function (_value, _trigger) {
								/// <summary>class 属性値を設定する。複数同じ接頭辞が使われていた場合は除去する。</summary>
								/// <param name="_value" type="String">設定値。</param>
								/// <param name="_trigger" type="Boolean">onChange イベントを起動する(省略時は true)</param>

								var val = _value;
								var trg = _trigger || (_trigger === undefined);

								log && console.log('CSS[' + this.prefix + '] setValue value=' + _value + ' trigger=' + _trigger);

								if (val !== org) {
									// options 属性は、許可する値の一覧を空白区切りで指定できる
									var opts = root.options || root.getAttribute('options');
									// 許可する値一覧が指定されていない場合は、先頭の項目を設定値として採用する。
									if (!opts && val instanceof Array) {
										val = val[0];
									}
									// 配列の場合は、先頭から該当する項目を検索
									if (val instanceof Array) {
										var reg2 = new RegExp('(' + opts.replace(/[\b\s]+/g, '|') + ')');
										for (var ind = 0, max = val.length; ind < max; ind++) {
											var v = reg2.exec(val[ind]);
											if (v && v[0]) {
												disable = true;
												root.className = root.className.replace(reg, '') + ' ' + this.prefix + '_' + v[0];
												// 連動処理
												if (trg) {
													onChange(v[0], org);
												}
												disable = false;
												break;
											}
										}
									} else {
										// 通常の項目の場合は、そのまま代入
										disable = true;
										root.className = root.className.replace(reg, '') + ' ' + this.prefix + '_' + val;
										// 連動処理
										trg && onChange(val, org);
										disable = false;
									}
									org = val;
								}

							};
							// 変更イベント定義
							var changes = [];
							instance.onchanges = changes;
							if (stt.onChange instanceof Function) {
								changes.push(stt.onChange);
							}
							var onChange = function (_new, _old) {
								var val = _new;
								var org = _old;
								log && console.log('CSS[' + this.prefix + '] has changed ' + org + ' -> ' + val);
								for (var ind = 0, max = changes.length; ind < max; ind++) {
									var func = changes[ind];
									if (func instanceof Function) {
										func.apply(instance, [val, org]);
									}
								}
							};
							var org = instance.getValue(false);
							instance.init = function () {
								// 設定値が無くて初期値が有効な場合は初期化する
								var def = this.getDefaultValue();
								if (!org && def) {
									this.setValue(def, false);
								}
							};
							// 変更イベント監視(setTimeout)
							var disable = false;
							if (stt.syncTo) {
								(function () {
									if (!disable) {
										var v = instance.getValue(false);
										if (v != org) {
											onChange.apply(instance, [v, org]);
										}
									}
									org = v;
									window.setTimeout(arguments.callee, 100);
								})();
							}
						}
						return instance;
					};

					// スクリプト引数取得
					var scrs = document.getElementsByTagName('script');
					var args = function (_script) {
						var ret = {};
						var arg = _script.src.match(/(\w+\.js)\??(.*)?/);
						if (arg && arg[2]) {
							ret.source = arg[1];
							// 引数をハッシュで格納
							var prms = arg[2].split('&');
							for (var ind = 0, max = prms.length; ind < max; ind++) {
								var prm = prms[ind].split('=');
								ret[prm[0].toLowerCase()] = prm[1];
							}
						}
						return ret;
					} (scrs[scrs.length - 1]);

					/*--------------+/
					/: 初期化
					/+--------------*/
					(function onInit() {
						// 設定情報の取得(存在しないときは引数から取得)
						var settings = _settings;
						var setname = args['settings'];
						if (setname) {
							if (!window[setname]) {
								console.log('Settings not found name=' + setname);
							} else if (!(window[setname] instanceof Object)) {
								console.log('Illegal settings name=' + setname);
							} else {
								settings = window[setname];
							}
						}

						var instances = {};
						var init;
						var cnv = settings.conversion;

						cokA = new $Cookie(cookieASet);

						for (var name in settings) {
							var stt = settings[name];
							// ログモード設定
							if (name === 'log') {
								log = stt;
							} else if (stt.type) {
								var ins = null;
								switch (stt.type) {
									case 'cookie':
										if (!stt.name) {
											stt.name = name;
										}
										ins = new $Cookie(stt);
										break;
									case 'element':
										if (!stt.id) {
											stt.id = name;
										}
										ins = new $Element(stt);
										break;
									case 'css':
										if (!stt.prefix) {
											stt.prefix = name;
										}
										ins = new $CSS(stt);
										break;
								}
								if (ins && ins.type) {
									ins.settingid = name;
									ins.settings = settings;
									// 設定値←→都道府県変換
									if (stt.values) {
										ins.values = cnv[stt.values];
										if (!ins.values) {
											console.log('Conversion values data not found setting=' + name + ' data=' + stt.values);
										}
									}
									if (stt.prefs) {
										ins.prefs = cnv[stt.prefs];
										if (!ins.prefs) {
											console.log('Conversion prefs data not found setting=' + name + ' data=' + stt.prefs);
										}
									}
									ins.getPref = function (_default) {
										/// <summary>都道府県コードを取得。</summary>
										/// <param name="_default" type="Boolean">値の設定が無い場合は初期値を取得する。</param>
										/// <returns type="String">都道府県コード。</returns>

										var val = this.getValue(_default);
										var ret = val;
										if (this.prefs) {
											ret = this.prefs[val];
											if (ret === undefined) {
												console.log('Conversion ' + this.type + '[' + (this.name || this.id || this.prefix) + '] to pref no matched value=' + val);
											}
										}
										return ret;
									};
									ins.setPref = function (_pref, _trigger) {
										/// <summary>都道府県コードを設定。各要素は値に変換してから設定される。</summary>
										/// <param name="_pref" type="String">設定する都道府県コード</param>
										/// <param name="_trigger" type="Boolean">連動可否フラグ。無指定は true。</param>

										var pref = _pref;
										var trg = _trigger || (_trigger === undefined);
										var val = pref;
										if (this.values) {
											val = this.values[pref];
											if (val === undefined) {
												console.log('Conversion ' + this.type + '[' + (this.name || this.id || this.prefix) + '] to value no matched pref=' + pref);
											} else {
												this.setValue(val, trg);
											}
										} else {
											this.setValue(val, trg);
										}
									};
									// 個別関数の実装
									ins.functions = {
										getCookieA: function () {
											/// <summary>cookie A種を取得。</summary>
											/// <returns type="String">取得した値。</returns>
											return cokA && cokA.getValue();
										}
									};
									// 連動処理の初期化
									if (stt.syncTo) {
										ins.syncTo = stt.syncTo;
										ins.onInit = stt.onInit;
										ins.onSync = stt.onSync;
										ins.sync = function (_syncs, _init) {
											/// <summary>初期化処理</summary>
											/// <param name="_syncs" type="Array">連動対象の設定 ID 配列。</param>
											/// <param name="_init" type="Boolean">初期化処理かどうか。無指定では false。</param>
											// 変更イベントで _new, _old 引数が来る場合は syncTo 属性を使用する
											var syncs = _syncs instanceof Array ? _syncs : this.syncTo;
											if (syncs) {
												var init = (_syncs instanceof Array) && _init;
												var val = this.getValue();
												var pref = this.getPref();

												for (var ind = 0, max = syncs.length; ind < max; ind++) {
													var syn = instances[syncs[ind]];
													// 個別処理がある場合は実行する(関数が false を返した場合は連動しない)
													var evt = init ? syn.onInit : syn.onSync;
													if (!evt || evt.apply(syn, [pref])) {
														if (this.options.length === syn.options.length && this.prefs === syn.prefs && this.values === syn.values) {
															// 同じ選択肢の数で同じコード定義を使用しているものは、setVaue で直接書込む
															syn.setValue(val, false);
														} else {
															syn.setPref(pref, false);
														}
													}
												}
											} else {
												console.log('Property syncTo not found setting=' + ins.settingid);
											}
										};
										ins.onchanges.push(ins.sync);
									}
									instances[name] = ins;
									// 連動の初期化
									if (stt.initTo) {
										ins.initTo = stt.initTo;
										init = ins;
									}
								}
							}
						}
						// 連動要素を有効なものだけに限定する
						var extractSyncs = function (_id, _syncs) {
							var ret = [];
							var self = _id;
							var syncs = _syncs;
							for (var ind = 0, max = syncs.length; ind < max; ind++) {
								var name = syncs[ind];
								switch (name) {
									case 'element':
										for (var item in instances) {
											if (item != self) {
												var sync = instances[item];
												if (sync.type === 'element') {
													ret.push(item);
												}
											}
										}
										break;
									case 'cookie':
										for (var item in instances) {
											if (item != self) {
												var sync = instances[item];
												if (sync.type === 'cookie') {
													ret.push(item);
												}
											}
										}
										break;
									case 'css':
										for (var item in instances) {
											if (item != self) {
												var sync = instances[item];
												if (sync.type === 'css') {
													ret.push(item);
												}
											}
										}
										break;
									default:
										(name in instances && self != name) && ret.push(name);
										break;
								}
							}
							return ret;
						};
						for (var name in instances) {
							var ins = instances[name];
							if (ins.initTo) {
								ins.initTo = extractSyncs(ins.settingid, ins.initTo);
							}
							if (ins.syncTo) {
								ins.syncTo = extractSyncs(ins.settingid, ins.syncTo);
							}
						}
						// インスタンス毎の初期化を先に実行すると、初期値の設定が2回行なわれてしまうため
						// 先に初期連動処理を行なう
						if (init) {
							init.init();
							init.sync(init.initTo, true);
						}
						// 連動処理で初期値が入らなかったものは、インスタンス毎の初期化
						for (var name in instances) {
							var ins = instances[name];
							if (ins !== init) {
								ins.init();
							}
						}
					})();
				};
			}
			// 設定の定義
			if (!window.$$Dept_Setting) {
				window.$$Dept_Setting = {};
			}
			// インスタンスの定義
			if (!window.$$Dept_Instance) {
				window.$$Dept_Instance = {};
			}

			window.$$Dept_Setting.Live = {
				log: true,
				'Cookie1': {
					type: 'cookie',
					name: 'LivePrefCode',
					path: '/',
					domain: '.jtb.co.jp',
					expires: { years: 5 },
					syncTo: ['cookie', 'css'],
					defaultValue: '13'
				},
				'Cookie2': {
					type: 'cookie',
					name: 'PrefCode',
					path: '/',
					domain: '.jtb.co.jp',
					expires: { years: 5 }
				},
				'Cookie3': {
					type: 'cookie',
					name: 'PrefCodeBus',
					path: '/',
					domain: '.jtb.co.jp',
					expires: { years: 5 }
				},
				'Cookie4': {
					type: 'cookie',
					name: 'PrefCodeKaigai',
					path: '/',
					domain: '.jtb.co.jp',
					expires: { years: 5 }
				},
				'Cookie5': {
					type: 'cookie',
					name: 'PrefCodeTornos',
					path: '/',
					domain: '.jtb.co.jp',
					expires: { years: 5 }
				},
				'Cookie6': {
					type: 'cookie',
					name: 'PrefCodeOvsDP',
					path: '/',
					domain: '.jtb.co.jp',
					expires: { years: 5 }
				},
				'CSS1': {
					type: 'css',
					prefix: 'target_live',
					prefs: 'prefs_css',
					values: 'values_css',
					defaultValue: function () {
						var ret = this.functions.getCookieA();
						if (this.values) {
							ret = this.values[ret];
						}
						return ret;
					}
				},
				conversion: {
					'prefs_css': {
						'SPK': '1',
						'SDJ': '4',
						'TYO': '13',
						'NGO': '23',
						'HKJ': '17',
						'OSA': '27',
						'HIJ': '37',
						'TMT': '34',
						'FUK': '40'
					},
					'values_css': {
						'1': 'SPK',
						'2': 'SDJ',
						'3': 'SDJ',
						'4': 'SDJ',
						'5': 'SDJ',
						'6': 'SDJ',
						'7': 'SDJ',
						'8': 'TYO',
						'9': 'TYO',
						'10': 'TYO',
						'11': 'TYO',
						'12': 'TYO',
						'13': 'TYO',
						'14': 'TYO',
						'15': 'TYO',
						'16': 'HKJ',
						'17': 'HKJ',
						'18': 'HKJ',
						'19': 'TYO',
						'20': 'NGO',
						'21': 'NGO',
						'22': 'NGO',
						'23': 'NGO',
						'24': 'NGO',
						'25': 'OSA',
						'26': 'OSA',
						'27': 'OSA',
						'28': 'OSA',
						'29': 'OSA',
						'30': 'OSA',
						'31': 'HIJ',
						'32': 'HIJ',
						'33': 'HIJ',
						'34': 'HIJ',
						'35': 'HIJ',
						'36': 'HIJ',
						'37': 'HIJ',
						'38': 'HIJ',
						'39': 'HIJ',
						'40': 'FUK',
						'41': 'FUK',
						'42': 'FUK',
						'43': 'FUK',
						'44': 'FUK',
						'45': 'FUK',
						'46': 'FUK',
						'47': 'FUK'
					}
				}
			};

			// 商材ごとのインスタンス生成
			(function () {
				for (var s in window.$$Dept_Setting) {
					if (!window.$$Dept_Instance[s]) {
						window.$$Dept_Instance[s] = new $$Dept(window.$$Dept_Setting[s]);
					}
				}
			})();
		})();
		(function defineDegradedFunctions() {
			window.getExpDate_2012 = function (_days, _hours, _minutes) {
				var expDate = new Date();
				if (typeof _days == 'number' &&
					typeof _hours == 'number' &&
					typeof _minutes == 'number') {
						expDate.setDate(expDate.getDate() + parseInt(_days));
						expDate.setHours(expDate.getHours() + parseInt(_hours));
						expDate.setMinutes(expDate.getMinutes() + parseInt(_minutes));
						return expDate.toGMTString();
				}
			};
			// getCookie()から呼び出されるユーティリティ関数
			window.getCookieVal_2012 = function (_offset) {
				var endstr = document.cookie.indexOf(';', _offset);
				if (endstr === -1) {
					endstr = document.cookie.length;
				}
				return unescape(document.cookie.substring(_offset, endstr));
			};
			// 名前からクッキーを取得する主関数
			window.getCookie_2012 = function (_name) {
				var arg = _name + '=';
				var alen = arg.length;
				var clen = document.cookie.length;
				var i = 0;
				while (i < clen) {
					var j = i + alen;
					if (document.cookie.substring(i, j) === arg) {
						return getCookieVal_2012(j);
					}
					i = document.cookie.indexOf(' ', i) + 1;
					if (i === 0) break;
				}
			};
			// クッキーの値を保存する。必要に応じて様々な属性も設定可能
			window.setCookie_2012 = function (_name, _value, _expires, _path, _domain, _secure) {
				document.cookie = _name + '=' + escape(_value) + 
					(_expires? '; expires=' + _expires: '') + 
					(_path ? '; path=' + _path: '') + 
					(_domain ? '; domain=' + _domain: '') + 
					(_secure ? '; secure': '');
			};
			// 有効期限として過去の日時を設定することでクッキーを削除する
			window.deleteCookie_2012 = function (_name, _path, _domain) {
				if (getCookie_2012(_name)) {
					document.cookie = _name + '=' + 
						(_path ? '; path=' + _path : '') + 
						(_domain ? '; domain=' + _domain: '') + 
						'; expires=Thu, 01-Jan-70 00:00:01 GMT';
				}
			};
		})();
	});
})();
