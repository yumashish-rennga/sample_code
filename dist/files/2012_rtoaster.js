/*------------------------------------------------------------------+/
/|�q�g�[�X�^�[�v���X�N���v�g
/|�X�@�V�F2012/04/19 - T.Fujita(Octech)			�V�K�쐬
/|�@�@�@�F2012/05/10 - T.Fujita(Octech)			cookie �����@�\�ǉ�
/|�@�@�@�F2012/05/10 - T.Fujita(Octech)			addRecommend, removeRecommend ���������Ή�
/|�@�@�@�F2012/05/24 - T.Fujita(Octech)			addRecommend, removeRecommend �ŁAIE8 �ȑO�Ŕ�������s��C��
/|�@�@�@�F2013/02/04 - T.Fujita(Octech)			recommendNow �ďo���� eval ���g��Ȃ��悤�ɏC��
/|�@�@�@�F2013/02/04 - T.Fujita(Octech)			���O�C�����Ă�������͔ԍ��݂̂� R �g�[�X�^�[�ɒʒm����悤�ɏC��
/|�@�@�@�F2013/02/04 - T.Fujita(Octech)			���R�����h ID ���X�N���v�g�����Ɏw��ł���悤�ɂ���
/|�@�@�@�F2013/02/04 - T.Fujita(Octech)			���R�����h�̗L���ɂ�����炸�A�g���b�L���O�𖈉�s�Ȃ��悤�ɏC��
/|�@�@�@�F2013/02/07 - T.Fujita(Octech)			��{�ԍ��\�̍X�V
/|�@�@�@�F2013/02/28 - T.Fujita(Octech)			�R���\�[���T�|�[�g����̕s��C��
/|�@�@�@�F2013/10/19 - T.Fujita(Octech)			�J�e�S���t�B���^�@�\��ǉ�(category ����, setCategory �֐�)
/|�@�@�@�F2013/10/21 - T.Fujita(Octech)			���O�\����}���ł���悤�ɂ���
/|�@�@�@�F2016/10/20 - T.Fujita(OdysseyDesign)	�|�b�v�A�b�v���R�����h�Ή�(popup ����, setPopup �֐�)
/|�@�@�@�F2016/11/10 - H.Taniguchi(i.JTB)		R�g�[�X�^�[�z�X�g��ύX(236�s��)
/|�@�@�@�F2018/03/08 - T.Fujita(OdysseyDesign)	Popup �ŕ���{�^�����o���Ȃ��悤�ɂ���I�v�V�����ǉ�(popupClose=false, setPopup ������)
/+------------------------------------------------------------------*/
if (window.Rtoaster) {
	var rt_targeting = (function () {
		/*----------+/
		/| �萔��`
		/+----------*/
		// ���O�\����
		var log = false;
		// ���Z�n
		var commonCookie = 'LivePrefCode';
		// cookie ���
		var cookieName = commonCookie;
		var cookieValid = {};
		cookieValid.day = 30;
		var cookiePath = '/';
		var cookieDomain = '.jtb.co.jp';
		var cookieSecure = false;
		/*--------------------+/
		/| �R���\�[���T�|�[�g
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
		/| ���J���\�b�h��`
		/+------------------*/
		var self = {};
		// cookie �Ǎ�
		self.getCookie = function (_name) {
			var ret = '';
			var reg = new RegExp('(^|;\\s?)' + _name + '=([^;]+)(;|$)');
			var mat = document.cookie.match(reg);

			if (mat != null) {
				ret = unescape(mat[2]);
			}

			return ret;
		};
		// cookie ����
		// _valid �͓��t������Ŏw�肷��
		self.setCookie = function (_name, _value, _valid, _path, _domain, _secure) {
			var data = escape(_name) + "=" + escape(_value) +
				(_valid ? '; expires=' + _valid : '') +
				(_path ? '; path=' + _path : '') +
				(_domain ? '; domain=' + _domain : '') +
				(_secure ? '; secure' : '');

			// IE6 �ł� cookie �������ɂ�����̂ŁAsetTimeout ��ݒ肷��
			window.setTimeout(function () {
				document.cookie = data;
			}, 0);
		};
		// ���� cookie �Ǎ�
		self.getCommonCookie = function () {
			return self.getCookie(commonCookie);
		};
		// ���� cookie ����
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
		// �L�����Ԃ��v�Z���ē��t�������Ԃ�
		// �������\�b�h�̈����݊���
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
				// toGMTString �͔񐄏�
				ret = dt.toUTCString && dt.toUTCString() || dt.toGMTString();
			}
			return ret;
		};
		// �L�����Ԃ��v�Z���ē��t�������Ԃ�
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
				// toGMTString �͔񐄏�
				ret = dt.toUTCString && dt.toUTCString() || dt.toGMTString();
			}
			return ret;
		};
		// �J�e�S���� cookie �Ǎ�
		self.getCategoryCookie = function (_name) {
			// �������w�肳��Ȃ������ꍇ�́A�{�X�N���v�g�̈��� cookie ���g�p����
			var name = _name || categoryCookie;
			// �J�e�S���� cookie �����݂��Ȃ��ꍇ�́A���� cookie ���g�p����
			return self.getCookie(name) || self.getCommonCookie();
		};
		// ���R�����h ID ��o�^����
		self.addRecommend = function () {
			var args = arguments;
			for (var ind = 0, max = args.length; ind < max; ind++) {
				recommendList.push(args[ind]);
			}
		};
		// ���R�����h ID ����������
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
		// �J�e�S���t�B���^��ݒ肷��
		self.setCategory = function () {
			cat = arguments;
		};
		// Popup ���R�����h��ݒ肷��
		self.setPopup = function (_id, _noPopupClose) {
			if (!pop) {
				pop = _id;
				load();
				noPopupClose = !!_noPopupClose;
			}
		};
		/*----------+/
		/| �ϐ���`
		/+----------*/
		// �e���� cookie
		var categoryCookie;
		/*----------+/
		/| �������
		/+----------*/
		var scrs = document.getElementsByTagName('script');
		var args = function (_script) {
			var ret = {};
			var arg = _script.src.match(/(\w+\.js)(\?([^#]*))/);
			if (arg && arg[3]) {
				ret.source = arg[1];
				// �������n�b�V���Ŋi�[
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

		// �����ŁA�f�t�H���g�� cookie ����ۑ�����
		categoryCookie = args['cookie'];
		// ���R�����h���s�Ώ�
		var rec = args['recommendid'];
		var recommendList = rec ? rec.split(',') : [];
		// Rtoaster �R�[�h
		var rta = args['rta'];
		if (!rta) {
			// �����l�� RTA �R�[�h
			// JTB �T�C�g�{��
			var rta = 'RTA-b57d-17bd14861574';
			// JTB �e�X�g�n
			var rta_test = "RTA-92f9-15473e24b6c0";
			// �e�X�g�n�z�X�g���̐��K�\��(���p�c�_��؂�)
			var reg = /^(st\d?-|test\d?-|pre-|pl\d?-|d\d-|dev\d?)/;
			// �z�X�g�����擾
			var host = location.hostname;
			rta = reg.test(host) ? rta_test : rta;
		}
		log && console.log('RTA=' + rta);
		// RTA ID �̌��J
		self.id = rta;
		// ���Z�n�̃��R�����h�����s���邩�ǂ���
		if (!self.getCommonCookie()) {
			recommendList.push('live_pref_code');
		}
		// �J�e�S���̎擾
		var cat = args['category'];
		if (cat && cat.split) {
			cat = cat.split(',');
		}
		var pop = args['popup'];
		// �����^�̔���
		pop = pop && pop.split && pop;
		// Rtoaster.Popup �X�N���v�g�̓Ǎ�
		var load = function () {
			// Popup �X�N���v�g�Ǎ�
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
		/| �G���A�^�[�Q�e�B���O�v��
		/+--------------------------*/
		var onLoad = function () {
			//��2������ cookie(ANALYS) �ɃZ�b�g����Ă��郍�O�C���ς̉����͔ԍ���n��
			var ana = self.getCookie('ANALYS');
			var anaid = '';
			var reg = /^AnalysisNo=(M\w+)/;
			if (ana && reg.test(ana)) {
				anaid = reg.exec(ana)[1];
				self.analysisid = anaid;
			}
			log && console.log('analysisId=' + anaid);
			Rtoaster.init(rta, anaid);
			// �g���b�L���O
			Rtoaster.track();

			// �J�e�S���t�B���^�K�p
			if (cat) {
				Rtoaster.category.apply(this, cat);
			}
			// �|�b�v�A�b�v�K�p
			if (pop) {
				recommendList.push(pop);
			}
			// ���R�����h���s
			if (recommendList.length) {
				var rec = function () {
					log && console.log('recommendId=' + recommendList.join(','));
					// Rtoaster�ɃN�G���𑗐M
					Rtoaster.recommendNow.apply(this, recommendList);
				};
				if (pop) {
					(function () {
						// Rtoaster.Popup ���F�������܂őҋ@
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
		/| DOM �\�z��Ɏ��s����
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
