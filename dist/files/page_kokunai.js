/*----------------------------------------------------------------------------------------------------------------+/
/: ���n�ؑ֐ݒ�(�����c�A�[)
/:
/: �g�p���@:
/: <script page_kokunai.js></script>
/:
/: ����:
/: �E���X�N���v�g�Ƌ��ʂŎg�p���邽�߁A�ȉ��̍L��I�u�W�F�N�g���g�p����B
/: �@$$Dept                 = ���ʏ����C���X�^���X�����p�B
/: �@$$Dept_Setting.Kokunai = ���ނ��Ƃ̐ݒ�B
/: �E�����Œ�`�����L��ϐ��� /common/js/2012_areaselector.js �ŏ��������B
/:
/: �X�V����:
/: 2012/02/13 T.Fujita(Octech)	�V�K�쐬
/: 2012/10/23 T.Fujita(Octech)	�\�[�X�𐮗����A���ނ��Ƃ̑��ᕔ���͈����w��ł���悤�ɏC��
/: 2012/11/26 T.Fujita(Octech)	�R�A���W�b�N�� /common/js/2012_areaselector.js �ɂ܂Ƃ߂�悤�ɏC��
/: 2013/05/24 T.Fujita(Octech)	������Ή��ɔ����C��
/+----------------------------------------------------------------------------------------------------------------*/

// �L��ϐ��̒�`
if (!window.$$Dept_Setting) {
	window.$$Dept_Setting = {};
}
// ���ޏ���
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
			// dept= �������������ꍇ�́A���̒l��D�悷��
			var mch = location.search.match(/(^|\?|&)dept=(\S+)(&|$)/);
			return mch && mch[2] ? this.settings.conversion['prefs'][unescape(mch[2])] : this.functions.getCookieA();
		}
	},
	'Element1': {
		// �N�C�b�N�����A���ׂẴc�A�[���n
		type: 'element',
		id: 'domtourForm_dept',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'Element2': {
		// �N�C�b�N�����AJR�E�q��+�h���n
		type: 'element',
		id: 'domdpForm_dept',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'Element3': {
		// ���ׂẴc�A�[���n
		// �G�[�X�u��������T���v���n
		type: 'element',
		id: 'domtourForm_dept1',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'Element4': {
		// �q��EJR+�h���n
		// �G�[�X�uJR�E�q��+�h��g�ݍ��킹�ĒT���v���n
		type: 'element',
		id: 'domtourForm_dept2',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'Element5': {
		// �p���t���b�g�̂������������n
		type: 'element',
		id: 'domtourForm_dept4',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'Element7': {
		// �����g�b�v�㕔���n
		type: 'element',
		id: 'domtour_deptlist',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'TabimonogatariElement': {
		// �����ꔭ�n
		type: 'element',
		id: 'domtourForm_dept3',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'AreaElement1': {
		// �G���A�㕔���n
		type: 'element',
		id: 'area_deptlist',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'AreaElement2': {
		// ���ׂẴc�A�[����T��
		type: 'element',
		id: 'area_tour01',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'AreaElement3': {
		// JR�E�q��+�h��g�ݍ��킹�ĒT��
		type: 'element',
		id: 'area_tour02',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'AreaElement4': {
		// �G���A�������߃c�A�[�����n
		type: 'element',
		id: 'area_tour03',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'KyotoElement1': {
		// ���s��p����(��s���ƒ����̏ꍇ�͌�ʎ�i����Ԃ݂̂ƂȂ�)
		type: 'element',
		id: 'area_deptlist_kyoto',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css'],
		onInit: function (_pref) {
			// ��s���ƒ����̏ꍇ�͗�ԂɃ`�F�b�N������
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
			// ��s���ƒ����̏ꍇ�͗�ԂɃ`�F�b�N������
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
			// ��s���ƒ����̏ꍇ�͗�ԂɃ`�F�b�N������
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
		// �G�[�X�㕔���n
		type: 'element',
		id: 'ace_deptlist',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	'SunElement1': {
		// �T��&�T���㕔���n
		type: 'element',
		id: 'sun_deptlist',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	// �X�}�z���������{�b�N�X���n
	'SPElement1': {
		type: 'element',
		id: 'search_dept',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO',
		syncTo: ['cookie', 'element', 'css']
	},
	// �X�}�z JTB �z�[�������{�b�N�X�B���^�O
	'SPElement2': {
		type: 'element',
		id: 'search_dept2',
		prefs: 'prefs',
		values: 'values',
		defaultValue: 'TYO'
	},
	// �X�}�z�����y�[�W�������߃c�A�[��
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
			'15': 'TYO', // �V���I�����͎�s����
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
