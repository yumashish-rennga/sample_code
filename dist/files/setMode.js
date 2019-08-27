function setPCMode() {
	document.cookie="smartphonecss=pc;path=/;" + addDomainRestriction();
}
function setSPMode() {
	document.cookie="smartphonecss=;path=/;expires=Thu, 1-Jan-1970 00:00:00 GMT;" + addDomainRestriction(); 
}

function addDomainRestriction() {
	return location.hostname.match(/\.jtb\.co\.jp$/) ? 'domain=.jtb.co.jp;' : '';
}