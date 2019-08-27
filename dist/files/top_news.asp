
(function(doc) {
	var Scripts = doc.getElementsByTagName('script');
	var warningArea = doc.querySelector('.js_waring_area');
	var warningAreaWrap = warningArea.parentNode;
	var warningList = warningArea.querySelector('.warning_list');

	if (Scripts) {
		if (Scripts[Scripts.length - 1].src) {
			Newses=new Array();
			for (var Index = 0; Index < Newses.length; Index++) {
				var TempElement = doc.createElement('li');
				var AnchorElement = doc.createElement('a');
				AnchorElement.target = 'otherwindow';
				if (Newses[Index].Path.match(/^https?\:\/\//))
					AnchorElement.href = Newses[Index].Path;
					AnchorElement.href = 'http://www.jtb.co.jp' + Newses[Index].Path;
				var InnerText = Newses[Index].Description;
				if (Newses[Index].Path.match(/\.pdf$/i))
					InnerText = '[PDF]' + InnerText;
				AnchorElement.innerHTML = InnerText;
				TempElement.appendChild(AnchorElement);
				warningList.appendChild(TempElement);
			}
		}
	}
	if (warningList.querySelectorAll('li').length === 0) {
		warningAreaWrap.parentNode.removeChild(warningAreaWrap);
	}
})(document);
