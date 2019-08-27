/*----------------------------------------------------------------------------------------------------------------+/
/: 発地切替設定(国内ツアー)
/:
/: 使用方法:
/: <script page_kokunai.js></script>
/:
/: 注意:
/: ・他スクリプトと共通で使用するため、以下の広域オブジェクトを使用する。
/: 　$$Dept                 = 共通処理インスタンス生成用。
/: 　$$Dept_Setting.Kokunai = 商材ごとの設定。
/: ・ここで定義される広域変数は /common/js/2012_areaselector.js で処理される。
/:
/: 更新履歴:
/: 2012/02/13 T.Fujita(Octech)	新規作成
/: 2012/10/23 T.Fujita(Octech)	ソースを整理し、商材ごとの相違部分は引数指定できるように修正
/: 2012/11/26 T.Fujita(Octech)	コアロジックを /common/js/2012_areaselector.js にまとめるように修正
/: 2013/05/24 T.Fujita(Octech)	旅物語対応に伴う修正
/+----------------------------------------------------------------------------------------------------------------*/

// 広域変数の定義
if (!window.$$Dept_Setting) {
	window.$$Dept_Setting = {};
}
// 商材処理
$$Dept_Setting.Kokunai = {
	log: false,
	'Cookie1': {
		type: 'cookie',
		name: 'PrefCode',
		path: '/',
		domain: '.jtb.co.jp',
		expires: { years: 5 },
		syncTo: ['element', 'css'],
		initTo: ['element', 'css'],
		defaultValue: function () {
			// dept= 引数があった場合は、その値を優先する
			var mch = location.search.match(/(^|\?|&)dept=(\S+)(&|$)/);
			return mch && mch[2] ? this.settings.conversion['prefs'][unescape(mch[2])] : this.functions.getCookieA();
		}
	},
	'Element1': {
		// クイック検索、すべてのツアー発地
		type: 'element',
		id: 'domtourForm_dept',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'Element2': {
		// クイック検索、JR・航空+宿発地
		type: 'element',
		id: 'domdpForm_dept',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'Element3': {
		// すべてのツアー発地
		// エース「条件から探す」発地
		type: 'element',
		id: 'domtourForm_dept1',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'Element4': {
		// 航空・JR+宿発地
		// エース「JR・航空+宿を組み合わせて探す」発地
		type: 'element',
		id: 'domtourForm_dept2',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'Element5': {
		// パンフレットのこだわり条件発地
		type: 'element',
		id: 'domtourForm_dept4',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'Element7': {
		// 国内トップ上部発地
		type: 'element',
		id: 'domtour_deptlist',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'TabimonogatariElement': {
		// 旅物語発地
		type: 'element',
		id: 'domtourForm_dept3',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'AreaElement1': {
		// エリア上部発地
		type: 'element',
		id: 'area_deptlist',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'AreaElement2': {
		// すべてのツアーから探す
		type: 'element',
		id: 'area_tour01',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'AreaElement3': {
		// JR・航空券+宿を組み合わせて探す
		type: 'element',
		id: 'area_tour02',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'AreaElement4': {
		// エリアおすすめツアー部発地
		type: 'element',
		id: 'area_tour03',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'KyotoElement1': {
		// 京都専用処理(首都圏と中部の場合は交通手段が列車のみとなる)
		type: 'element',
		id: 'area_deptlist_kyoto',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css'],
		onInit: function (_pref) {
			// 首都圏と中部の場合は列車にチェックを入れる
			switch (this.values[_pref]) {
				case 'TYO':
				case 'NGO':
					var elm1 = document.getElementById('search_tour_train');
					if (elm1) {
						elm1.click();
					}
					var elm2 = document.getElementById('search_tour_train_2');
					if (elm2) {
						elm2.click();
					}
					var elm3 = document.getElementById('domtourForm2_traffic');
					if (elm3) {
						elm3.value = elm1.value;
					}
					break;
			}
			return true;
		},
		onSync: function (_pref) {
			// 首都圏と中部の場合は列車にチェックを入れる
			switch (this.values[_pref]) {
				case 'TYO':
				case 'NGO':
					var elm1 = document.getElementById('search_tour_train');
					if (elm1) {
						elm1.click();
					}
					var elm2 = document.getElementById('search_tour_train_2');
					if (elm2) {
						elm2.click();
					}
					var elm3 = document.getElementById('domtourForm2_traffic');
					if (elm3) {
						elm3.value = elm1.value;
					}
					break;
			}
			return true;
		},
		onChange: function (_new, _old) {
			// 首都圏と中部の場合は列車にチェックを入れる
			switch (_new) {
				case 'TYO':
				case 'NGO':
					var elm1 = document.getElementById('search_tour_train');
					if (elm1) {
						elm1.click();
					}
					var elm2 = document.getElementById('search_tour_train_2');
					if (elm2) {
						elm2.click();
					}
					var elm3 = document.getElementById('domtourForm2_traffic');
					if (elm3) {
						elm3.value = elm1.value;
					}
					break;
			}
			return true;
		}
	},
	'AceElement1': {
		// エース上部発地
		type: 'element',
		id: 'ace_deptlist',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'SunElement1': {
		// サン&サン上部発地
		type: 'element',
		id: 'sun_deptlist',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	// スマホ検索検索ボックス発地
	'SPElement1': {
		type: 'element',
		id: 'search_dept',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	// スマホ JTB ホーム検索ボックス隠しタグ
	'SPElement2': {
		type: 'element',
		id: 'search_dept2',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO'
	},
	// スマホ国内ページおすすめツアー部
	'SPElement3': {
		type: 'element',
		id: 'area_dept',
		prefs: 'prefs_dept5',
		values: 'values_dept5',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'CSS1': {
		type: 'css',
		prefix: 'target_dept_kokunai',
		prefs: 'prefs_css',
		values: 'values_css',
		defaultValue: 'TYO'
	},
	conversion: {
		'prefs': {
			'SPK': '1',
			'SDJ': '4',
			'KIJ': '15',
			'TYO': '13',
			'NGO': '23',
			'HKJ': '17',
			'OSA': '27',
			'HIJ': '37',
			'FUK': '40'
		},
		'values': {
			'1': ['SPK', 'SDJ', 'TYO'],
			'01': ['SPK', 'SDJ', 'TYO'],
			'2': ['SDJ', 'TYO'],
			'02': ['SDJ', 'TYO'],
			'3': ['SDJ', 'TYO'],
			'03': ['SDJ', 'TYO'],
			'4': ['SDJ', 'TYO'],
			'04': ['SDJ', 'TYO'],
			'5': ['SDJ', 'TYO'],
			'05': ['SDJ', 'TYO'],
			'6': ['SDJ', 'TYO'],
			'06': ['SDJ', 'TYO'],
			'7': ['SDJ', 'TYO'],
			'07': ['SDJ', 'TYO'],
			'8': 'TYO',
			'08': 'TYO',
			'9': 'TYO',
			'09': 'TYO',
			'10': 'TYO',
			'11': 'TYO',
			'12': 'TYO',
			'13': 'TYO',
			'14': 'TYO',
			'15': ['KIJ', 'TYO'],
			'16': ['HKJ', 'NGO'],
			'17': ['HKJ', 'NGO'],
			'18': ['HKJ', 'NGO'],
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
			'31': ['HIJ', 'OSA'],
			'32': ['HIJ', 'OSA'],
			'33': ['HIJ', 'OSA'],
			'34': ['HIJ', 'OSA'],
			'35': ['HIJ', 'OSA'],
			'36': ['HIJ', 'OSA'],
			'37': ['HIJ', 'OSA'],
			'38': ['HIJ', 'OSA'],
			'39': ['HIJ', 'OSA'],
			'40': ['FUK', 'OSA'],
			'41': ['FUK', 'OSA'],
			'42': ['FUK', 'OSA'],
			'43': ['FUK', 'OSA'],
			'44': ['FUK', 'OSA'],
			'45': ['FUK', 'OSA'],
			'46': ['FUK', 'OSA'],
			'47': ['FUK', 'OSA']
		},
		'prefs_dept5': {
			'TYO': '13',
			'NGO': '23',
			'OSA': '27',
			'HIJ': '37',
			'FUK': '40'
		},
		'values_dept5': {
			'1': 'TYO',
			'2': 'TYO',
			'3': 'TYO',
			'4': 'TYO',
			'5': 'TYO',
			'6': 'TYO',
			'7': 'TYO',
			'8': 'TYO',
			'9': 'TYO',
			'10': 'TYO',
			'11': 'TYO',
			'12': 'TYO',
			'13': 'TYO',
			'14': 'TYO',
			'15': 'TYO',
			'16': 'NGO',
			'17': 'NGO',
			'18': 'NGO',
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
			'31': ['HIJ', 'OSA'],
			'32': ['HIJ', 'OSA'],
			'33': ['HIJ', 'OSA'],
			'34': ['HIJ', 'OSA'],
			'35': ['HIJ', 'OSA'],
			'36': ['HIJ', 'OSA'],
			'37': ['HIJ', 'OSA'],
			'38': ['HIJ', 'OSA'],
			'39': ['HIJ', 'OSA'],
			'40': ['FUK', 'OSA'],
			'41': ['FUK', 'OSA'],
			'42': ['FUK', 'OSA'],
			'43': ['FUK', 'OSA'],
			'44': ['FUK', 'OSA'],
			'45': ['FUK', 'OSA'],
			'46': ['FUK', 'OSA'],
			'47': ['FUK', 'OSA']
		},
		'prefs_css': {
			'SPK': '1',
			'SDJ': '4',
			'KIJ': '15',
			'TYO': '13',
			'NGO': '23',
			'HKJ': '17',
			'OSA': '27',
			'HIJ': '37',
			'FUK': '40'
		},
		'values_css': {
			'1': ['SPK', 'SDJ', 'TYO'],
			'01': ['SPK', 'SDJ', 'TYO'],
			'2': ['SDJ', 'TYO'],
			'02': ['SDJ', 'TYO'],
			'3': ['SDJ', 'TYO'],
			'03': ['SDJ', 'TYO'],
			'4': ['SDJ', 'TYO'],
			'04': ['SDJ', 'TYO'],
			'5': ['SDJ', 'TYO'],
			'05': ['SDJ', 'TYO'],
			'6': ['SDJ', 'TYO'],
			'06': ['SDJ', 'TYO'],
			'7': ['SDJ', 'TYO'],
			'07': ['SDJ', 'TYO'],
			'8': 'TYO',
			'08': 'TYO',
			'9': 'TYO',
			'09': 'TYO',
			'10': 'TYO',
			'11': 'TYO',
			'12': 'TYO',
			'13': 'TYO',
			'14': 'TYO',
			'15': 'TYO', // 新潟選択時は首都圏発
			'16': ['HKJ', 'NGO'],
			'17': ['HKJ', 'NGO'],
			'18': ['HKJ', 'NGO'],
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
			'31': ['HIJ', 'OSA'],
			'32': ['HIJ', 'OSA'],
			'33': ['HIJ', 'OSA'],
			'34': ['HIJ', 'OSA'],
			'35': ['HIJ', 'OSA'],
			'36': ['HIJ', 'OSA'],
			'37': ['HIJ', 'OSA'],
			'38': ['HIJ', 'OSA'],
			'39': ['HIJ', 'OSA'],
			'40': ['FUK', 'OSA'],
			'41': ['FUK', 'OSA'],
			'42': ['FUK', 'OSA'],
			'43': ['FUK', 'OSA'],
			'44': ['FUK', 'OSA'],
			'45': ['FUK', 'OSA'],
			'46': ['FUK', 'OSA'],
			'47': ['FUK', 'OSA']
		}
	}
};
