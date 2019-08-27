/*------------------------------------------------------------------+/
/|Ｒトースター要求スクリプト
/|更　新：2012/04/19 - T.Fujita(Octech)			新規作成
/|　　　：2012/05/10 - T.Fujita(Octech)			cookie 書込機能追加
/|　　　：2012/05/10 - T.Fujita(Octech)			addRecommend, removeRecommend 複数引数対応
/|　　　：2012/05/24 - T.Fujita(Octech)			addRecommend, removeRecommend で、IE8 以前で発生する不具合修正
/|　　　：2013/02/04 - T.Fujita(Octech)			recommendNow 呼出時に eval を使わないように修正
/|　　　：2013/02/04 - T.Fujita(Octech)			ログインしている会員解析番号のみを R トースターに通知するように修正
/|　　　：2013/02/04 - T.Fujita(Octech)			リコメンド ID をスクリプト引数に指定できるようにした
/|　　　：2013/02/04 - T.Fujita(Octech)			リコメンドの有無にかかわらず、トラッキングを毎回行なうように修正
/|　　　：2013/02/07 - T.Fujita(Octech)			基本番号表の更新
/|　　　：2013/02/28 - T.Fujita(Octech)			コンソールサポート判定の不具合修正
/|　　　：2013/10/19 - T.Fujita(Octech)			カテゴリフィルタ機能を追加(category 引数, setCategory 関数)
/|　　　：2013/10/21 - T.Fujita(Octech)			ログ表示を抑制できるようにした
/|　　　：2016/10/20 - T.Fujita(OdysseyDesign)	ポップアップレコメンド対応(popup 引数, setPopup 関数)
/|　　　：2016/11/10 - H.Taniguchi(i.JTB)		Rトースターホスト先変更(236行目)
/|　　　：2018/03/08 - T.Fujita(OdysseyDesign)	Popup で閉じるボタンを出さないようにするオプション追加(popupClose=false, setPopup 第二引数)
/+------------------------------------------------------------------*/
if (window.Rtoaster) {
	var rt_targeting = (function () {
		/*----------+/
		/| 定数定義
		/+----------*/
		// ログ表示可否
		var log = false;
		// 居住地
		var commonCookie = 'LivePrefCode';
		// cookie 情報
		var cookieName = commonCookie;
		var cookieValid = {};
		cookieValid.day = 30;
		var cookiePath = '/';
		var cookieDomain = '.jtb.co.jp';
		var cookieSecure = false;
		/*--------------------+/
		/| コンソールサポート
		/+--------------------*/
		var console = window.console;
		if (!console) {
			console = {
				log: function (_text) {
					//alert(_text);
				}
			};
		}
		/*------------------+/
		/| 公開メソッド定義
		/+------------------*/
		var self = {};
		// cookie 読込
		self.getCookie = function (_name) {
			var ret = '';
			var reg = new RegExp('(^|;\\s?)' + _name + '=([^;]+)(;|$)');
			var mat = document.cookie.match(reg);

			if (mat != null) {
				ret = unescape(mat[2]);
			}

			return ret;
		};
		// cookie 書込
		// _valid は日付文字列で指定する
		self.setCookie = function (_name, _value, _valid, _path, _domain, _secure) {
			var data = escape(_name) + "=" + escape(_value) +
				(_valid ? '; expires=' + _valid : '') +
				(_path ? '; path=' + _path : '') +
				(_domain ? '; domain=' + _domain : '') +
				(_secure ? '; secure' : '');

			// IE6 では cookie 書込時にちらつくので、setTimeout を設定する
			window.setTimeout(function () {
				document.cookie = data;
			}, 0);
		};
		// 共通 cookie 読込
		self.getCommonCookie = function () {
			return self.getCookie(commonCookie);
		};
		// 共通 cookie 書込
		self.setCommonCookie = function (_value) {
			self.setCookie(
				cookieName,
				_value,
				self.getExpDateByArray(cookieValid),
				cookiePath,
				cookieDomain,
				cookieSecure
			);
		};
		// 有効期間を計算して日付文字列を返す
		// 既存メソッドの引数互換版
		self.getExpDate = function (_days, _hours, _minutes) {
			var d = _days || 0;
			var h = _hours || 0;
			var m = _minutes || 0;
			var ret;

			if (!isNaN(d) && !isNaN(h) && !isNaN(m)) {
				var dt = new Date();
				dt.setDate(dt.getDate() + (d - 0));
				dt.setHours(dt.getHours() + (h - 0));
				dt.setMinutes(dt.getMinutes() + (m - 0));
				// toGMTString は非推奨
				ret = dt.toUTCString && dt.toUTCString() || dt.toGMTString();
			}
			return ret;
		};
		// 有効期間を計算して日付文字列を返す
		self.getExpDateByArray = function (_arr) {
			var ret;
			if (_arr) {
				var y = _arr.year || 0,
				    m = _arr.month || 0,
				    d = _arr.day || 0,
				    h = _arr.hour || 0,
				    n = _arr.minute || 0,
				    s = _arr.second || 0;
				var dt = new Date();
				dt.setYear(dt.getFullYear() + (y - 0));
				dt.setMonth(dt.getMonth() + (m - 0));
				dt.setDate(dt.getDate() + (d - 0));
				dt.setHours(dt.getHours() + (h - 0));
				dt.setMinutes(dt.getMinutes() + (n - 0));
				dt.setSeconds(dt.getSeconds() + (s - 0));
				// toGMTString は非推奨
				ret = dt.toUTCString && dt.toUTCString() || dt.toGMTString();
			}
			return ret;
		};
		// カテゴリ別 cookie 読込
		self.getCategoryCookie = function (_name) {
			// 引数が指定されなかった場合は、本スクリプトの引数 cookie を使用する
			var name = _name || categoryCookie;
			// カテゴリ別 cookie が存在しない場合は、共通 cookie を使用する
			return self.getCookie(name) || self.getCommonCookie();
		};
		// リコメンド ID を登録する
		self.addRecommend = function () {
			var args = arguments;
			for (var ind = 0, max = args.length; ind < max; ind++) {
				recommendList.push(args[ind]);
			}
		};
		// リコメンド ID を解除する
		self.removeRecommend = function () {
			var args = arguments;
			for (var ind = 0, max = args.length; ind < max; ind++) {
				var id = args[ind];
				for (var ind2 = recommendList.length; ind2 >= 0; ind2--) {
					if (recommendList[ind2] == id) {
						recommendList.splice(ind2, 1);
					}
				}
			}
		};
		// カテゴリフィルタを設定する
		self.setCategory = function () {
			cat = arguments;
		};
		// Popup リコメンドを設定する
		self.setPopup = function (_id, _noPopupClose) {
			if (!pop) {
				pop = _id;
				load();
				noPopupClose = !!_noPopupClose;
			}
		};
		/*----------+/
		/| 変数定義
		/+----------*/
		// 各商材 cookie
		var categoryCookie;
		/*----------+/
		/| 引数解析
		/+----------*/
		var scrs = document.getElementsByTagName('script');
		var args = function (_script) {
			var ret = {};
			var arg = _script.src.match(/(\w+\.js)(\?([^#]*))/);
			if (arg && arg[3]) {
				ret.source = arg[1];
				// 引数をハッシュで格納
				var prms = arg[3].split('&');
				for (var ind = 0, max = prms.length; ind < max; ind++) {
					var prm = prms[ind].split('=');
					if (prm[0]) {
						ret[decodeURIComponent(prm[0]).toLowerCase()] = prm[1] ? decodeURIComponent(prm[1]) : '';
					}
				}
			}
			return ret;
		} (scrs[scrs.length - 1]);

		// 引数で、デフォルトの cookie 名を保存する
		categoryCookie = args['cookie'];
		// リコメンド実行対象
		var rec = args['recommendid'];
		var recommendList = rec ? rec.split(',') : [];
		// Rtoaster コード
		var rta = args['rta'];
		if (!rta) {
			// 初期値の RTA コード
			// JTB サイト本番
			var rta = 'RTA-b57d-17bd14861574';
			// JTB テスト系
			var rta_test = "RTA-92f9-15473e24b6c0";
			// テスト系ホスト名の正規表現(半角縦棒区切り)
			var reg = /^(st\d?-|test\d?-|pre-|pl\d?-|d\d-|dev\d?)/;
			// ホスト名を取得
			var host = location.hostname;
			rta = reg.test(host) ? rta_test : rta;
		}
		log && console.log('RTA=' + rta);
		// RTA ID の公開
		self.id = rta;
		// 居住地のリコメンドを実行するかどうか
		if (!self.getCommonCookie()) {
			recommendList.push('live_pref_code');
		}
		// カテゴリの取得
		var cat = args['category'];
		if (cat && cat.split) {
			cat = cat.split(',');
		}
		var pop = args['popup'];
		// 文字型の判定
		pop = pop && pop.split && pop;
		// Rtoaster.Popup スクリプトの読込
		var load = function () {
			// Popup スクリプト読込
			if (!window.Rtoaster.Popup) {
				var scr = document.createElement('script');
				scr.src = '//js.rtoaster.jp/Rtoaster.Popup.js';
				var head = document.getElementsByTagName('head')[0];
				head.appendChild(scr);
			}
		}
		pop && load();
		var noPopupClose = ('nopopupclose' in args);
		/*--------------------------+/
		/| エリアターゲティング要求
		/+--------------------------*/
		var onLoad = function () {
			//第2引数は cookie(ANALYS) にセットされているログイン済の会員解析番号を渡す
			var ana = self.getCookie('ANALYS');
			var anaid = '';
			var reg = /^AnalysisNo=(M\w+)/;
			if (ana && reg.test(ana)) {
				anaid = reg.exec(ana)[1];
				self.analysisid = anaid;
			}
			log && console.log('analysisId=' + anaid);
			Rtoaster.init(rta, anaid);
			// トラッキング
			Rtoaster.track();

			// カテゴリフィルタ適用
			if (cat) {
				Rtoaster.category.apply(this, cat);
			}
			// ポップアップ適用
			if (pop) {
				recommendList.push(pop);
			}
			// リコメンド実行
			if (recommendList.length) {
				var rec = function () {
					log && console.log('recommendId=' + recommendList.join(','));
					// Rtoasterにクエリを送信
					Rtoaster.recommendNow.apply(this, recommendList);
				};
				if (pop) {
					(function () {
						// Rtoaster.Popup が認識されるまで待機
						if (window.Rtoaster.Popup) {
							window.Rtoaster.Popup.register(pop);
							if (noPopupClose) {
								window.Rtoaster.Popup.closeIconSrc = '';
							}
							rec();
						} else {
							setTimeout(arguments.callee, 10);
						}
					})();
				} else {
					rec();
				}
			}
		};
		/*----------------------+/
		/| DOM 構築後に実行する
		/+----------------------*/
		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', onLoad, false);
		} else if (document.attachEvent) {
			(function () {
				try {
					document.documentElement.doScroll('left');
				} catch (err) {
					setTimeout(arguments.callee, 0);
					return;
				}
				onLoad();
			})();
		}
		return self;
	})();
}
